<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('chat.proposta.{propostaId}', function ($user, $propostaId) {
    $proposta = \App\Models\Proposta::find($propostaId);
    if (!$proposta) return false;

    return (int) $user->id === (int) $proposta->cliente_id || (int) $user->id === (int) $proposta->imovel->proprietario_id || $user->role === 'admin';
});
