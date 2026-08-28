<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pagamento;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookPagamentoController extends Controller
{
    /**
     * Webhook para receber confirmações automáticas de pagamento por Referência Multicaixa.
     * Exemplo de Payload recebido da gateway:
     * {
     *    "entidade": "10555",
     *    "referencia": "912345678",
     *    "valor": 250000.00,
     *    "status": "PAID",
     *    "transaction_id": "TX_998811"
     * }
     */
    public function processarReferencia(Request $request): JsonResponse
    {
        $signature = $request->header('X-Webhook-Secret');
        $expectedSignature = config('app.webhook_pagamentos_secret', env('WEBHOOK_PAGAMENTOS_SECRET'));

        if (!$signature || !hash_equals((string) $expectedSignature, (string) $signature)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Assinatura do Webhook inválida ou ausente.',
            ], 401);
        }

        $validated = $request->validate([
            'entidade' => ['required', 'string'],
            'referencia' => ['required', 'string'],
            'valor' => ['nullable', 'numeric'],
            'status' => ['nullable', 'string'],
        ]);

        /** @var Pagamento $pagamento */
        $pagamento = Pagamento::where('entidade', $validated['entidade'])
            ->where('referencia', $validated['referencia'])
            ->first();

        if (! $pagamento) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pagamento por referência não encontrado.',
            ], 404);
        }

        if ($pagamento->estado === 'pago') {
            return response()->json([
                'status' => 'already_processed',
                'message' => 'Este pagamento já foi processado anteriormente.',
                'pagamento' => $pagamento,
            ]);
        }

        // Marcar como pago
        $pagamento->update([
            'estado' => 'pago',
            'data_pagamento' => now(),
            'resposta_webhook' => $request->all(),
        ]);

        // Atualizar contrato
        if ($pagamento->contrato) {
            $pagamento->contrato->update(['estado' => 'assinado']);
        }

        // Enviar recibo ao cliente
        if ($pagamento->cliente) {
            $pagamento->cliente->notify(new \App\Notifications\PagamentoRecebidoNotification($pagamento));
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Pagamento por referência confirmado e sincronizado com sucesso!',
            'pagamento' => $pagamento->fresh(['contrato', 'cliente']),
        ]);
    }
}
