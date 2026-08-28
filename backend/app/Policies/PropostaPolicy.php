<?php

namespace App\Policies;

use App\Models\Proposta;
use App\Models\User;

class PropostaPolicy
{
    /**
     * Qualquer utilizador autenticado pode ver as suas propostas ou propostas dos seus imóveis.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * O cliente que fez a proposta, o proprietário do imóvel ou admin pode visualizar.
     */
    public function view(User $user, Proposta $proposta): bool
    {
        return $user->isAdmin() ||
            $user->id === $proposta->cliente_id ||
            $user->id === $proposta->imovel->proprietario_id;
    }

    /**
     * Apenas clientes e admins podem submeter propostas.
     */
    public function create(User $user): bool
    {
        return $user->isCliente() || $user->isAdmin();
    }

    /**
     * Apenas o proprietário do imóvel ou admin pode responder (aceitar/recusar/contrapropor).
     */
    public function responder(User $user, Proposta $proposta): bool
    {
        return $user->isAdmin() || $user->id === $proposta->imovel->proprietario_id;
    }
}
