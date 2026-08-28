<?php

namespace App\Notifications;

use App\Models\Proposta;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NovaPropostaNotification extends Notification implements ShouldBroadcastNow
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

        return (new MailMessage)
            ->subject('Nova proposta recebida: ' . $this->proposta->imovel->titulo)
            ->greeting('Olá ' . $notifiable->name . '!')
            ->line('O cliente ' . $this->proposta->cliente->name . ' fez uma nova proposta para o seu imóvel: ' . $this->proposta->imovel->titulo . '.')
            ->line('Valor proposto: ' . number_format($this->proposta->valor_proposto, 2, ',', '.') . ' AOA')
            ->action('Ver Proposta', $url)
            ->line('Aceda ao seu painel para aceitar, recusar ou fazer uma contra-proposta.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'proposta_id' => $this->proposta->id,
            'imovel_titulo' => $this->proposta->imovel->titulo,
            'cliente_nome' => $this->proposta->cliente->name,
            'mensagem' => "Nova proposta de {$this->proposta->cliente->name} para o imóvel {$this->proposta->imovel->titulo}",
            'url' => "/propostas/{$this->proposta->id}",
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'proposta_id' => $this->proposta->id,
            'mensagem' => "Nova proposta recebida para {$this->proposta->imovel->titulo}",
        ]);
    }
}
