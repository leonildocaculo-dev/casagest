<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\User;
use App\Exports\ImoveisExport;
use App\Exports\PagamentosExport;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    /**
     * Dashboard com métricas gerais do sistema.
     */
    public function dashboard(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado ao painel administrativo.'], 403);
        }

        $stats = [
            'total_imoveis' => Imovel::count(),
            'imoveis_publicados' => Imovel::where('estado', 'publicado')->count(),
            'imoveis_pendentes' => Imovel::where('estado', 'pendente')->count(),
            'imoveis_reservados' => Imovel::where('estado', 'reservado')->count(),
            'total_propostas' => Proposta::count(),
            'propostas_aceites' => Proposta::where('estado', 'aceite')->count(),
            'propostas_pendentes' => Proposta::where('estado', 'pendente')->count(),
            'total_contratos' => Contrato::count(),
            'valor_total_contratos' => (float) Contrato::sum('valor_acordado'),
            'total_utilizadores' => User::count(),
            'utilizadores_por_role' => [
                'admin' => User::where('role', 'admin')->count(),
                'proprietario' => User::where('role', 'proprietario')->count(),
                'cliente' => User::where('role', 'cliente')->count(),
            ],
            'imoveis_recentes' => Imovel::with('proprietario:id,name')->orderByDesc('created_at')->limit(5)->get(),
            'propostas_recentes' => Proposta::with(['imovel:id,titulo', 'cliente:id,name'])->orderByDesc('created_at')->limit(5)->get(),
        ];

        return response()->json($stats);
    }

    /**
     * Listar utilizadores para gestão do admin.
     */
    public function utilizadores(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $query = User::query();

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }
        if ($request->filled('pesquisa')) {
            $termo = $request->input('pesquisa');
            $query->where(function ($q) use ($termo) {
                $q->where('name', 'ILIKE', "%{$termo}%")
                  ->orWhere('email', 'ILIKE', "%{$termo}%")
                  ->orWhere('phone', 'ILIKE', "%{$termo}%");
            });
        }

        $utilizadores = $query->orderByDesc('created_at')->paginate($request->input('por_pagina', 15));

        return response()->json($utilizadores);
    }

    /**
     * Alternar estado ativo/inativo de um utilizador.
     */
    public function toggleStatus(Request $request, User $targetUser): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        if ($targetUser->id === $user->id) {
            return response()->json(['message' => 'Não pode alterar o seu próprio estado de administrador.'], 422);
        }

        $novoEstado = $targetUser->status === 'ativo' ? 'inativo' : 'ativo';
        $targetUser->update(['status' => $novoEstado]);

        return response()->json([
            'message' => "Estado do utilizador {$targetUser->name} alterado para {$novoEstado}.",
            'user' => $targetUser,
        ]);
    }

    /**
     * Listar Logs de Auditoria do Sistema.
     */
    public function auditLogs(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $query = \App\Models\AuditLog::with('user:id,name,email,role');

        if ($request->filled('acao')) {
            $query->where('acao', $request->input('acao'));
        }

        if ($request->filled('pesquisa')) {
            $termo = $request->input('pesquisa');
            $query->where(function ($q) use ($termo) {
                $q->where('acao', 'LIKE', "%{$termo}%")
                  ->orWhere('modelo', 'LIKE', "%{$termo}%")
                  ->orWhere('ip_address', 'LIKE', "%{$termo}%");
            });
        }

        $logs = $query->orderByDesc('created_at')->paginate($request->input('por_pagina', 20));

        return response()->json($logs);
    }

    /**
     * Exportar lista de imóveis em formato Excel.
     */
    public function exportImoveis(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        return Excel::download(new ImoveisExport, 'Relatorio_Imoveis_CasaGest.xlsx');
    }

    /**
     * Exportar lista de imóveis em formato PDF.
     */
    public function exportImoveisPdf(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $imoveis = Imovel::with('proprietario:id,name,email')->orderByDesc('created_at')->get();

        $pdf = Pdf::loadView('pdf.relatorio_imoveis', ['imoveis' => $imoveis]);

        return $pdf->download('Relatorio_Imoveis_CasaGest.pdf');
    }

    /**
     * Exportar relatorio de pagamentos em Excel.
     */
    public function exportPagamentos(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        return Excel::download(new PagamentosExport, 'Relatorio_Pagamentos_CasaGest.xlsx');
    }

    /**
     * Exportar relatorio de pagamentos em PDF.
     */
    public function exportPagamentosPdf(Request $request)
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $pagamentos = \App\Models\Pagamento::with(['cliente:id,name,email', 'contrato'])->orderByDesc('created_at')->get();

        $pdf = Pdf::loadView('pdf.relatorio_pagamentos', ['pagamentos' => $pagamentos]);

        return $pdf->download('Relatorio_Pagamentos_CasaGest.pdf');
    }
}
