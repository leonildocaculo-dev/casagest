<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contrato;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookAutentiqueController extends Controller
{
    /**
     * Handle incoming webhook from Autentique.
     */
    public function handle(Request $request)
    {
        $signature = $request->header('X-Autentique-Token');
        $expectedSignature = config('app.webhook_autentique_secret', env('WEBHOOK_AUTENTIQUE_SECRET'));

        if (!$signature || !hash_equals((string) $expectedSignature, (string) $signature)) {
            Log::warning('Webhook Autentique recebido com token inválido ou ausente.', ['ip' => $request->ip()]);
            return response()->json(['message' => 'Não autorizado.'], 401);
        }

        $payload = $request->all();

        // Autentique envia o document no payload de webhook
        $document = $payload['document'] ?? null;

        if (!$document || !isset($document['id'])) {
            return response()->json(['message' => 'Payload inválido.'], 400);
        }

        $documentId = $document['id'];
        
        $contrato = Contrato::where('document_id', $documentId)->first();

        if (!$contrato) {
            Log::warning("Contrato com document_id {$documentId} não encontrado.");
            return response()->json(['message' => 'Contrato não encontrado.'], 404);
        }

        $novoEstado = $contrato->estado;

        // Mapear eventos do Autentique para os estados do nosso contrato
        $event = $payload['event'] ?? '';
        switch ($event) {
            case 'document.signed':
                // Todos assinaram
                $novoEstado = 'assinado';
                break;
            case 'document.rejected':
                // Alguém recusou
                $novoEstado = 'cancelado';
                break;
        }

        if ($novoEstado !== $contrato->estado) {
            $contrato->update(['estado' => $novoEstado]);
            
            if ($novoEstado === 'assinado') {
                \App\Events\ContratoAssinado::dispatch($contrato->load('proposta.imovel', 'proposta.cliente'));
            }
        }

        return response()->json(['message' => 'Webhook processado com sucesso.']);
    }
}
