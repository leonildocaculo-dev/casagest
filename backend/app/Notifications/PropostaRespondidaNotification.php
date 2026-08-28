<?php

namespace App\Notifications;

use App\Models\Proposta;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PropostaRespondidaNotification extends Notification implements ShouldBroadcastNow
{
    use Queueable;

    public function __construct(public Proposta $proposta)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $url = $frontendUrl . '/propostas/' . $this->proposta->id;
        $estado = strtoupper($this->proposta->estado);

        return (new MailMessage)
            ->subject('A sua proposta foi ' . $estado)
            ->greeting('Olá ' . $notifiable->name . '!')
            ->line('O proprietário do imóvel "' . $this->proposta->imovel->titulo . '" avaliou a sua proposta.')
            ->line('O estado atual da sua proposta é: **' . $estado . '**')
            ->action('Ver Detalhes da Resposta', $url)
            ->line('Pode ver a resposta completa e dar continuidade à negociação acedendo ao link.');
    }

    public function toDatabase(object $notifiable): array
    {
        $estado = strtoupper($this->proposta->estado);
        return [
            'proposta_id' => $this->proposta->id,
            'imovel_titulo' => $this->proposta->imovel->titulo,
            'estado' => $this->proposta->estado,
            'mensagem' => "A sua proposta para {$this->proposta->imovel->titulo} foi {$estado}.",
            'url' => "/propostas/{$this->proposta->id}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $estado = strtoupper($this->proposta->estado);
        return new BroadcastMessage([
            'proposta_id' => $this->proposta->id,
            'mensagem' => "A proposta para {$this->proposta->imovel->titulo} foi {$estado}.",
        ]);
    }
}
