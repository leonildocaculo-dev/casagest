<?php

namespace App\Notifications;

use App\Models\MensagemContacto;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ContactoNotification extends Notification
{
    use Queueable;

    public function __construct(public MensagemContacto $mensagem)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nova Mensagem de Contacto: ' . $this->mensagem->assunto)
            ->greeting('Olá Admin,')
            ->line('Recebeu uma nova mensagem de contacto no portal CasaGest.')
            ->line('**Nome:** ' . $this->mensagem->nome)
            ->line('**Email:** ' . $this->mensagem->email)
            ->line('**Telefone:** ' . ($this->mensagem->telefone ?? 'Não fornecido'))
            ->line('**Mensagem:**')
            ->line($this->mensagem->mensagem)
            ->action('Ver no Painel', env('FRONTEND_URL', 'http://localhost:3000') . '/admin/contactos');
    }
}
