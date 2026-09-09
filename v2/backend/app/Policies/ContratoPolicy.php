<?php

namespace App\Policies;

use App\Models\Contrato;
use App\Models\User;

class ContratoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Contrato $contrato): bool
    {
        return $user->isAdmin() ||
            $user->id === $contrato->cliente_id ||
            $user->id === $contrato->proprietario_id;
    }

    public function create(User $user): bool
    {
        return $user->isProprietario() || $user->isAdmin();
    }

    public function download(User $user, Contrato $contrato): bool
    {
        return $user->isAdmin() ||
            $user->id === $contrato->cliente_id ||
            $user->id === $contrato->proprietario_id;
    }
}
