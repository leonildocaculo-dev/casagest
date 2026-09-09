<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Imovel;
use App\Models\Proposta;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class PropostaController extends Controller
{
    /**
     * Listar propostas do utilizador autenticado.
     * - Cliente: propostas que enviou
     * - Proprietário: propostas recebidas nos seus imóveis
     * - Admin: todas as propostas
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $query = Proposta::with(['imovel.imagens', 'cliente:id,name,email,phone', 'imovel.proprietario:id,name']);

        if ($user->isCliente()) {
            $query->where('cliente_id', $user->id);
        } elseif ($user->isProprietario()) {
            $query->whereHas('imovel', function ($q) use ($user) {
                $q->where('proprietario_id', $user->id);
            });
        }
        // Admin não filtra por utilizador, vê tudo.

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $propostas = $query->orderByDesc('created_at')->paginate($request->input('por_pagina', 15));

        return response()->json($propostas);
    }

    /**
     * Criar uma nova proposta para um imóvel.
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Proposta::class);

        $validated = $request->validate([
            'imovel_id' => ['required', 'exists:imoveis,id'],
            'valor_proposto' => ['required', 'numeric', 'min:1'],
            'mensagem' => ['nullable', 'string', 'max:2000'],
            'tipo' => ['required', Rule::in(['arrendamento', 'venda'])],
            'duracao_meses' => ['nullable', 'integer', Rule::in([6, 12])],
        ]);

        $imovel = Imovel::findOrFail($validated['imovel_id']);

        if ($imovel->estado !== 'publicado') {
            return response()->json(['message' => 'Não é possível fazer propostas para um imóvel que não esteja publicado.'], 422);
        }

        if ($imovel->modalidade !== 'ambos' && $imovel->modalidade !== $validated['tipo']) {
            return response()->json(['message' => 'Este imóvel não está disponível para ' . $validated['tipo'] . '.'], 422);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Evitar que o proprietário faça proposta ao próprio imóvel
        if ($imovel->proprietario_id === $user->id) {
            return response()->json(['message' => 'Não pode fazer uma proposta para o seu próprio imóvel.'], 422);
        }

        /** @var Proposta $proposta */
        $proposta = Proposta::create([
            'imovel_id' => $imovel->id,
            'cliente_id' => $user->id,
            'valor_proposto' => $validated['valor_proposto'],
            'tipo' => $validated['tipo'],
            'mensagem' => $validated['mensagem'] ?? null,
            'estado' => 'pendente',
        ]);

        \App\Services\AuditLogService::log('proposta_enviada', $user->id, 'Proposta', $proposta->id, ['valor' => $proposta->valor_proposto, 'imovel_id' => $imovel->id]);

        \App\Events\NovaProposta::dispatch($proposta);

        $imovel->proprietario->notify(new \App\Notifications\NovaPropostaNotification($proposta));

        return response()->json([
            'message' => 'Proposta enviada com sucesso ao proprietário.',
            'proposta' => $proposta->load(['imovel', 'cliente']),
        ], 201);
    }

    /**
     * Ver detalhes de uma proposta específica.
     */
    public function show(Proposta $proposta): JsonResponse
    {
        Gate::authorize('view', $proposta);

        return response()->json([
            'proposta' => $proposta->load(['imovel.imagens', 'cliente:id,name,email,phone', 'imovel.proprietario:id,name,email,phone']),
        ]);
    }

    /**
     * Proprietário responde a uma proposta (aceitar, recusar ou contrapropor).
     */
    public function responder(Request $request, Proposta $proposta): JsonResponse
    {
        Gate::authorize('responder', $proposta);

        $validated = $request->validate([
            'estado' => ['required', Rule::in(['aceite', 'recusada', 'contra_proposta'])],
            'resposta_proprietario' => ['nullable', 'string', 'max:2000'],
            'valor_contra_proposta' => ['required_if:estado,contra_proposta', 'nullable', 'numeric', 'min:1'],
        ]);

        $proposta->update([
            'estado' => $validated['estado'],
            'resposta_proprietario' => $validated['resposta_proprietario'] ?? null,
            'valor_contra_proposta' => $validated['estado'] === 'contra_proposta' ? $validated['valor_contra_proposta'] : null,
        ]);

        // Se aceite, podemos opcionalmente mudar o estado do imóvel para 'reservado'
        if ($validated['estado'] === 'aceite') {
            $proposta->imovel->update(['estado' => 'reservado']);
        }

        /** @var \App\Models\User $user */
        $user = $request->user();
        \App\Services\AuditLogService::log('proposta_respondida', $user->id, 'Proposta', $proposta->id, ['estado' => $validated['estado']]);

        \App\Events\PropostaRespondida::dispatch($proposta);

        $proposta->cliente->notify(new \App\Notifications\PropostaRespondidaNotification($proposta));

        return response()->json([
            'message' => 'Resposta à proposta registada com sucesso.',
            'proposta' => $proposta->fresh(['imovel', 'cliente']),
        ]);
    }
}
