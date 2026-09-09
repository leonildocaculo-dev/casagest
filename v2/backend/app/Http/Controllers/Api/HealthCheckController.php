<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class HealthCheckController extends Controller
{
    /**
     * Verificar o estado de saúde da API, Base de Dados e Storage.
     */
    public function check(): JsonResponse
    {
        $dbStatus = 'ok';
        $storageStatus = 'ok';

        try {
            DB::connection()->getPdo();
        } catch (\Throwable $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        try {
            Storage::disk('public')->exists('.health_check');
        } catch (\Throwable $e) {
            $storageStatus = 'error: ' . $e->getMessage();
        }

        $healthy = $dbStatus === 'ok' && $storageStatus === 'ok';

        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'environment' => config('app.env'),
            'checks' => [
                'database' => $dbStatus,
                'storage' => $storageStatus,
            ],
        ], $healthy ? 200 : 500);
    }
}
