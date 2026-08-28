<?php

namespace App\Events;

use App\Models\Contrato;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ContratoAssinado implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Contrato $contrato)
    {
    }

    public function broadcastOn(): array
    {
        // Broadcast for both cliente and proprietario
        return [
            new Channel('user.' . $this->contrato->proposta->cliente_id),
            new Channel('user.' . $this->contrato->proposta->imovel->proprietario_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'contrato.assinado';
    }

    public function broadcastWith(): array
    {
        return [
            'contrato_id' => $this->contrato->id,
            'estado' => $this->contrato->estado,
            'mensagem' => 'O contrato para o imóvel ' . $this->contrato->proposta->imovel->titulo . ' foi assinado com sucesso por ambas as partes.',
        ];
    }
}
