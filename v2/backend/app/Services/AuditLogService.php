<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Request;

class AuditLogService
{
    /**
     * Regista uma ação no log de auditoria.
     */
    public static function log(
        string $acao,
        ?int $userId = null,
        ?string $modelo = null,
        ?int $modeloId = null,
        ?array $detalhes = null
    ): AuditLog {
        $effectiveUserId = $userId ?? auth('sanctum')->id() ?? auth()->id();

        return AuditLog::create([
            'user_id' => $effectiveUserId,
            'acao' => $acao,
            'modelo' => $modelo,
            'modelo_id' => $modeloId,
            'detalhes' => $detalhes,
            'ip_address' => Request::ip(),
            'created_at' => now(),
        ]);
    }
}
