<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Proposta;
use App\Models\Mensagem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MensagemController extends Controller
{
    /**
     * Listar mensagens de uma proposta
     */
    public function index(Request $request, $propostaId): JsonResponse
    {
        $proposta = Proposta::findOrFail($propostaId);
        $user = $request->user();

        // Só o cliente da proposta ou o proprietário do imóvel (ou admin) podem ver o chat
        if ($user->role !== 'admin' && $user->id !== $proposta->cliente_id && $user->id !== $proposta->imovel->proprietario_id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $mensagens = Mensagem::with('sender:id,name,role')->where('proposta_id', $propostaId)->orderBy('created_at', 'asc')->get();

        // Marcar mensagens do outro lado como lidas
        Mensagem::where('proposta_id', $propostaId)
            ->where('sender_id', '!=', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['mensagens' => $mensagens]);
    }

    /**
     * Enviar nova mensagem
     */
    public function store(Request $request, $propostaId): JsonResponse
    {
        $proposta = Proposta::findOrFail($propostaId);
        $user = $request->user();

        if ($user->role !== 'admin' && $user->id !== $proposta->cliente_id && $user->id !== $proposta->imovel->proprietario_id) {
            return response()->json(['message' => 'Não autorizado.'], 403);
        }

        $validated = $request->validate([
            'conteudo' => ['required', 'string', 'max:2000'],
        ]);

        $mensagem = Mensagem::create([
            'proposta_id' => $proposta->id,
            'sender_id' => $user->id,
            'conteudo' => $validated['conteudo'],
        ]);

        $mensagem->load('sender:id,name,role');

        \App\Events\NovaMensagemChat::dispatch($mensagem);

        return response()->json(['mensagem' => $mensagem], 201);
    }
}
