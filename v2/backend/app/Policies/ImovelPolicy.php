<?php

namespace App\Policies;

use App\Models\Imovel;
use App\Models\User;

class ImovelPolicy
{
    /**
     * Qualquer utilizador autenticado pode ver a listagem pública.
     */
    public function viewAny(?User $user): bool
    {
        return true;
    }

    /**
     * Qualquer utilizador pode ver um imóvel publicado.
     * Proprietário pode ver os seus imóveis em qualquer estado.
     * Admin pode ver tudo.
     */
    public function view(?User $user, Imovel $imovel): bool
    {
        if ($imovel->estado === 'publicado') {
            return true;
        }

        if (! $user) {
            return false;
        }

        return $user->isAdmin() || $user->id === $imovel->proprietario_id;
    }

    /**
     * Apenas proprietários e admins podem criar imóveis.
     */
    public function create(User $user): bool
    {
        return $user->isProprietario() || $user->isAdmin();
    }

    /**
     * Apenas o proprietário do imóvel ou admin pode editar.
     */
    public function update(User $user, Imovel $imovel): bool
    {
        return $user->isAdmin() || $user->id === $imovel->proprietario_id;
    }

    /**
     * Apenas o proprietário do imóvel ou admin pode apagar.
     */
    public function delete(User $user, Imovel $imovel): bool
    {
        return $user->isAdmin() || $user->id === $imovel->proprietario_id;
    }

    /**
     * Apenas admins podem aprovar imóveis.
     */
    public function aprovar(User $user, Imovel $imovel): bool
    {
        return $user->isAdmin();
    }
}
