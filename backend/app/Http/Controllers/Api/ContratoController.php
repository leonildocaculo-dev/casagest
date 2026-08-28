<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Proposta;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContratoController extends Controller
{
    /**
     * Listar contratos do utilizador (cliente, proprietário ou admin).
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $query = Contrato::with(['imovel.imagens', 'cliente:id,name,email', 'proprietario:id,name,email']);

        if ($user->isCliente()) {
            $query->where('cliente_id', $user->id);
        } elseif ($user->isProprietario()) {
            $query->where('proprietario_id', $user->id);
        }

        $contratos = $query->orderByDesc('created_at')->paginate($request->input('por_pagina', 15));

        return response()->json($contratos);
    }

    /**
     * Gerar contrato a partir de uma proposta aceite.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'proposta_id' => ['required', 'exists:propostas,id'],
            'tipo_contrato' => ['nullable', 'in:arrendamento,compra_venda'],
            'data_inicio' => ['nullable', 'date'],
            'data_fim' => ['nullable', 'date', 'after_or_equal:data_inicio'],
            'termos_adicionais' => ['nullable', 'string', 'max:5000'],
        ]);

        $proposta = Proposta::with(['imovel', 'cliente'])->findOrFail($validated['proposta_id']);

        if ($proposta->estado !== 'aceite') {
            return response()->json(['message' => 'Apenas propostas com estado "aceite" podem gerar um contrato.'], 422);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Verificar se quem está a gerar é o proprietário ou admin
        if (! $user->isAdmin() && $user->id !== $proposta->imovel->proprietario_id) {
            return response()->json(['message' => 'Apenas o proprietário do imóvel ou o administrador pode gerar o contrato.'], 403);
        }

        $tipoContrato = $proposta->tipo === 'venda' ? 'compra_venda' : 'arrendamento';

        $dataInicio = $validated['data_inicio'] ?? now()->addDays(7);
        $dataFim = $validated['data_fim'] ?? null;
        
        if (!$dataFim && $tipoContrato === 'arrendamento' && $proposta->duracao_meses) {
            $dataFim = \Carbon\Carbon::parse($dataInicio)->addMonths($proposta->duracao_meses);
        } else if (!$dataFim) {
            $dataFim = \Carbon\Carbon::parse($dataInicio)->addYear();
        }

        // Criar ou obter contrato existente
        $contrato = Contrato::firstOrCreate(
            ['proposta_id' => $proposta->id],
            [
                'imovel_id' => $proposta->imovel_id,
                'cliente_id' => $proposta->cliente_id,
                'proprietario_id' => $proposta->imovel->proprietario_id,
                'tipo_contrato' => $validated['tipo_contrato'] ?? $tipoContrato,
                'valor_acordado' => $proposta->valor_proposto,
                'data_inicio' => $dataInicio,
                'data_fim' => $dataFim,
                'termos_adicionais' => $validated['termos_adicionais'] ?? null,
                'estado' => 'pendente_assinatura',
            ]
        );

        $contrato->load(['imovel', 'cliente', 'proprietario']);

        try {
            $pdf = Pdf::loadView('pdf.contrato', ['contrato' => $contrato]);
            $base64Content = base64_encode($pdf->output());

            $autentique = new \App\Services\AutentiqueService();
            $response = $autentique->createDocument(
                "Contrato_CasaGest_#{$contrato->id}.pdf",
                $base64Content,
                [
                    [
                        'email' => $contrato->cliente->email,
                        'action' => 'SIGN'
                    ],
                    [
                        'email' => $contrato->proprietario->email,
                        'action' => 'SIGN'
                    ]
                ]
            );

            if (isset($response['data']['createDocument']['id'])) {
                $contrato->update([
                    'document_id' => $response['data']['createDocument']['id']
                ]);
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Erro ao enviar contrato para Autentique: ' . $e->getMessage());
        }

        \App\Services\AuditLogService::log('contrato_gerado', $user->id, 'Contrato', $contrato->id, ['imovel_id' => $contrato->imovel_id, 'valor' => $contrato->valor_acordado]);

        return response()->json([
            'message' => 'Contrato gerado com sucesso.',
            'contrato' => $contrato->load(['imovel', 'cliente', 'proprietario']),
        ], 201);
    }

    /**
     * Obter detalhes de um contrato.
     */
    public function show(Request $request, Contrato $contrato): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin() && $user->id !== $contrato->cliente_id && $user->id !== $contrato->proprietario_id) {
            return response()->json(['message' => 'Acesso não autorizado a este contrato.'], 403);
        }

        return response()->json([
            'contrato' => $contrato->load(['imovel.imagens', 'cliente', 'proprietario', 'proposta']),
        ]);
    }

    /**
     * Descarregar PDF do contrato.
     */
    public function downloadPdf(Request $request, Contrato $contrato)
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin() && $user->id !== $contrato->cliente_id && $user->id !== $contrato->proprietario_id) {
            return response()->json(['message' => 'Acesso não autorizado a este contrato.'], 403);
        }

        $contrato->load(['imovel', 'cliente', 'proprietario']);

        $pdf = Pdf::loadView('pdf.contrato', ['contrato' => $contrato]);

        return $pdf->download("Contrato_CasaGest_#{$contrato->id}.pdf");
    }

    /**
     * Atualizar estado do contrato (rescindido, terminado, cancelado)
     */
    public function updateEstado(Request $request, Contrato $contrato): JsonResponse
    {
        $validated = $request->validate([
            'estado' => ['required', \Illuminate\Validation\Rule::in(['rescindido', 'terminado', 'cancelado'])]
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin() && $user->id !== $contrato->proprietario_id) {
            return response()->json(['message' => 'Apenas o proprietário ou administrador pode atualizar o estado deste contrato.'], 403);
        }

        $contrato->update(['estado' => $validated['estado']]);

        \App\Services\AuditLogService::log('contrato_estado_atualizado', $user->id, 'Contrato', $contrato->id, ['novo_estado' => $validated['estado']]);

        return response()->json([
            'message' => 'Estado do contrato atualizado com sucesso.',
            'contrato' => $contrato->fresh(['imovel', 'cliente', 'proprietario', 'proposta']),
        ]);
    }
}
