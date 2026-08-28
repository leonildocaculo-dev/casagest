<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\Contrato;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ProprietarioController extends Controller
{
    /**
     * Dashboard de Estatísticas para Proprietários
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->role !== 'proprietario' && $user->role !== 'admin') {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        // Estatísticas Globais
        $totalImoveis = Imovel::where('proprietario_id', $user->id)->count();
        
        $totalPropostas = Proposta::whereHas('imovel', function ($q) use ($user) {
            $q->where('proprietario_id', $user->id);
        })->count();

        $imoveisAtivos = Imovel::where('proprietario_id', $user->id)->where('estado', 'publicado')->count();
        $imoveisArrendadosVendido = Imovel::where('proprietario_id', $user->id)->whereIn('estado', ['vendido', 'arrendado'])->count();

        // Receita Estimada (Propostas Aceites)
        $receitaPotencial = Proposta::whereHas('imovel', function ($q) use ($user) {
                $q->where('proprietario_id', $user->id);
            })
            ->where('estado', 'aceite')
            ->sum('valor_proposto');

        // Evolução de Propostas (Últimos 6 meses)
        $seisMesesAtras = Carbon::now()->subMonths(5)->startOfMonth();
        
        $propostasPorMes = Proposta::whereHas('imovel', function ($q) use ($user) {
                $q->where('proprietario_id', $user->id);
            })
            ->where('created_at', '>=', $seisMesesAtras)
            ->select(
                DB::raw("to_char(created_at, 'MM/YYYY') as mes"),
                DB::raw("COUNT(*) as total")
            )
            ->groupBy('mes')
            ->orderBy('mes')
            ->get();

        // Formatar para Recharts
        $chartData = [];
        for ($i = 5; $i >= 0; $i--) {
            $data = Carbon::now()->subMonths($i);
            $mes = $data->format('m/Y');
            $mesNome = $data->translatedFormat('M'); // ex: Jan, Fev

            $row = $propostasPorMes->firstWhere('mes', $mes);

            $chartData[] = [
                'name' => $mesNome,
                'propostas' => $row ? $row->total : 0,
            ];
        }

        return response()->json([
            'metrics' => [
                'total_imoveis' => $totalImoveis,
                'imoveis_ativos' => $imoveisAtivos,
                'imoveis_vendidos' => $imoveisArrendadosVendido,
                'total_propostas' => $totalPropostas,
                'receita_potencial' => $receitaPotencial,
            ],
            'chart_data' => $chartData,
        ]);
    }
}
