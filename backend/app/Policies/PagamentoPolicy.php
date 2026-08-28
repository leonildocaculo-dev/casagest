<?php

namespace App\Policies;

use App\Models\Pagamento;
use App\Models\User;

class PagamentoPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Pagamento $pagamento): bool
    {
        return $user->isAdmin() ||
            $user->id === $pagamento->cliente_id ||
            $user->id === $pagamento->contrato->proprietario_id;
    }

    public function create(User $user): bool
    {
        return $user->isCliente() || $user->isAdmin();
    }

    public function validar(User $user): bool
    {
        return $user->isAdmin();
    }
}
