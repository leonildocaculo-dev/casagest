<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MensagemContacto;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactoController extends Controller
{
    /**
     * Enviar mensagem de contacto/dúvida a partir do formulário público.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'nome' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'telefone' => ['nullable', 'string', 'max:50'],
            'mensagem' => ['required', 'string', 'max:3000'],
            'assunto' => ['nullable', 'string', 'max:255'],
        ]);

        $mensagem = MensagemContacto::create([
            ...$validated,
            'assunto' => $validated['assunto'] ?? 'Dúvidas / Informações',
        ]);

        \Illuminate\Support\Facades\Notification::route('mail', 'geral@casagest.com')
            ->notify(new \App\Notifications\ContactoNotification($mensagem));

        return response()->json([
            'message' => 'A sua mensagem foi enviada com sucesso! A nossa equipa entrará em contacto brevemente.',
            'contacto' => $mensagem,
        ], 201);
    }

    /**
     * Listar mensagens de contacto (Apenas Admin).
     */
    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Acesso não autorizado.'], 403);
        }

        $mensagens = MensagemContacto::orderByDesc('created_at')->paginate($request->input('por_pagina', 20));

        return response()->json($mensagens);
    }
}
