<?php

namespace App\Notifications;

use App\Models\Pagamento;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PagamentoRecebidoNotification extends Notification
{
    use Queueable;

    public function __construct(public Pagamento $pagamento)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'pagamento_id' => $this->pagamento->id,
            'mensagem' => 'O seu pagamento por referência Multicaixa no valor de ' . number_format($this->pagamento->valor, 2, ',', '.') . ' AOA foi confirmado com sucesso.',
            'url' => '/pagamentos',
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:3000');
        $url = $frontendUrl . '/pagamentos';

        return (new MailMessage)
            ->subject('Recibo de Pagamento - CasaGest')
            ->greeting('Olá ' . $notifiable->name . ',')
            ->line('Confirmamos a receção do seu pagamento por referência Multicaixa.')
            ->line('**Detalhes do Pagamento:**')
            ->line('- Entidade: ' . $this->pagamento->entidade)
            ->line('- Referência: ' . $this->pagamento->referencia)
            ->line('- Valor Pago: ' . number_format($this->pagamento->valor, 2, ',', '.') . ' AOA')
            ->line('- Data: ' . now()->format('d/m/Y H:i:s'))
            ->action('Ver os Meus Pagamentos', $url)
            ->line('Obrigado por utilizar o CasaGest!');
    }
}
