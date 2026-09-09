<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Pagamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PagamentoController extends Controller
{
    /**
     * Listar os pagamentos do utilizador autenticado.
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $query = Pagamento::with([
            'contrato.imovel:id,titulo,localizacao',
            'contrato.proprietario:id,name,email',
            'cliente:id,name,email,phone',
        ]);

        if ($user->isCliente()) {
            $query->where('cliente_id', $user->id);
        } elseif ($user->isProprietario()) {
            $query->whereHas('contrato', function ($q) use ($user) {
                $q->where('proprietario_id', $user->id);
            });
        }
        // Admin vê tudo.

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $pagamentos = $query->orderByDesc('created_at')->paginate($request->input('por_pagina', 15));

        return response()->json($pagamentos);
    }

    /**
     * Iniciar processo de pagamento de um contrato.
     * Regra:
     * - Até 10.000.000 AOA: Pagamento por Referência Multicaixa.
     * - Acima de 10.000.000 AOA: Transferência Bancária com anexo obrigatório de comprovativo (PDF ou Imagem <= 2MB).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'contrato_id' => ['required', 'exists:contratos,id'],
            'comprovativo' => ['nullable', 'file', 'mimes:pdf,png,jpg,jpeg,webp', 'max:2048'], // Máx 2MB (2048 KB)
            'notas' => ['nullable', 'string', 'max:1000'],
        ]);

        $contrato = Contrato::with('imovel')->findOrFail($validated['contrato_id']);
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin() && $user->id !== $contrato->cliente_id) {
            return response()->json(['message' => 'Apenas o cliente contratante ou o administrador pode efetuar o pagamento.'], 403);
        }

        $valor = (float) $contrato->valor_acordado;
        $limiteReferencia = 10000000.00; // 10 Milhões de AOA

        if ($valor <= $limiteReferencia) {
            // Pagamento por Referência Multicaixa
            // Gerar Entidade de 5 dígitos e Referência de 9 dígitos
            $entidade = '10555';
            $referencia = '9' . str_pad((string) mt_rand(10000000, 99999999), 8, '0', STR_PAD_LEFT);

            /** @var Pagamento $pagamento */
            $pagamento = Pagamento::create([
                'contrato_id' => $contrato->id,
                'cliente_id' => $user->id,
                'valor' => $valor,
                'metodo' => 'referencia',
                'entidade' => $entidade,
                'referencia' => $referencia,
                'data_limite' => now()->addHours(48),
                'estado' => 'pendente',
            ]);

            \App\Services\AuditLogService::log('pagamento_iniciado', $user->id, 'Pagamento', $pagamento->id, ['metodo' => 'referencia', 'valor' => $valor]);

            return response()->json([
                'message' => 'Referência de pagamento Multicaixa gerada com sucesso.',
                'tipo_pagamento' => 'referencia',
                'pagamento' => $pagamento->load(['contrato.imovel', 'cliente']),
            ], 201);
        } else {
            // Pagamento por Transferência Bancária (> 10M AOA) — Requer Comprovativo <= 2MB
            if (! $request->hasFile('comprovativo')) {
                return response()->json([
                    'message' => 'Para valores superiores a 10.000.000 AOA, é obrigatório anexar o comprovativo de transferência bancária em PDF ou Imagem (máx. 2MB).',
                    'requer_comprovativo' => true,
                ], 422);
            }

            $file = $request->file('comprovativo');

            // Verificar tamanho rigorosamente (<= 2MB = 2097152 bytes)
            if ($file->getSize() > 2097152) {
                return response()->json(['message' => 'O ficheiro de comprovativo não pode ser superior a 2MB.'], 422);
            }

            $path = $file->store('comprovativos', 'public');

            /** @var Pagamento $pagamento */
            $pagamento = Pagamento::create([
                'contrato_id' => $contrato->id,
                'cliente_id' => $user->id,
                'valor' => $valor,
                'metodo' => 'transferencia_bancaria',
                'comprovativo_caminho' => $path,
                'comprovativo_nome_original' => $file->getClientOriginalName(),
                'estado' => 'em_analise',
            ]);

            \App\Services\AuditLogService::log('pagamento_iniciado', $user->id, 'Pagamento', $pagamento->id, ['metodo' => 'transferencia_bancaria', 'valor' => $valor]);

            return response()->json([
                'message' => 'Comprovativo enviado com sucesso! O pagamento está em análise pela nossa equipa.',
                'tipo_pagamento' => 'transferencia_bancaria',
                'pagamento' => $pagamento->load(['contrato.imovel', 'cliente']),
            ], 201);
        }
    }

    /**
     * Anexar ou atualizar comprovativo de transferência bancária a um pagamento existente.
     */
    public function uploadComprovativo(Request $request, Pagamento $pagamento): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin() && $user->id !== $pagamento->cliente_id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $request->validate([
            'comprovativo' => ['required', 'file', 'mimes:pdf,png,jpg,jpeg,webp', 'max:2048'],
        ]);

        $file = $request->file('comprovativo');

        if ($file->getSize() > 2097152) {
            return response()->json(['message' => 'O comprovativo não pode exceder 2MB.'], 422);
        }

        $path = $file->store('comprovativos', 'public');

        $pagamento->update([
            'comprovativo_caminho' => $path,
            'comprovativo_nome_original' => $file->getClientOriginalName(),
            'estado' => 'em_analise',
        ]);

        \App\Services\AuditLogService::log('comprovativo_enviado', $user->id, 'Pagamento', $pagamento->id);

        return response()->json([
            'message' => 'Comprovativo submetido para validação.',
            'pagamento' => $pagamento->fresh(['contrato', 'cliente']),
        ]);
    }

    /**
     * Admin aprova ou rejeita comprovativo de transferência bancária.
     */
    public function validarComprovativo(Request $request, Pagamento $pagamento): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Apenas o administrador pode validar pagamentos.'], 403);
        }

        $validated = $request->validate([
            'acao' => ['required', 'in:aprovar,rejeitar'],
            'notas_admin' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($validated['acao'] === 'aprovar') {
            $pagamento->update([
                'estado' => 'pago',
                'data_pagamento' => now(),
                'notas_admin' => $validated['notas_admin'] ?? 'Aprovado manualmente pelo administrador.',
            ]);

            // Atualizar contrato
            $pagamento->contrato->update(['estado' => 'assinado']);
            \App\Services\AuditLogService::log('pagamento_validado', $user->id, 'Pagamento', $pagamento->id, ['acao' => 'aprovar']);
        } else {
            $pagamento->update([
                'estado' => 'rejeitado',
                'notas_admin' => $validated['notas_admin'] ?? 'Comprovativo de transferência rejeitado.',
            ]);
            \App\Services\AuditLogService::log('pagamento_validado', $user->id, 'Pagamento', $pagamento->id, ['acao' => 'rejeitar']);
        }

        return response()->json([
            'message' => "Pagamento " . ($validated['acao'] === 'aprovar' ? 'aprovado' : 'rejeitado') . " com sucesso.",
            'pagamento' => $pagamento->fresh(['contrato', 'cliente']),
        ]);
    }
}
