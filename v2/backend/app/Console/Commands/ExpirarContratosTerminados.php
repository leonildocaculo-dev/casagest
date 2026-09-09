<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Contrato;

class ExpirarContratosTerminados extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'contratos:expirar';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Expira contratos de arrendamento cuja data fim já foi ultrapassada.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $hoje = now()->toDateString();

        $contratosExpirados = Contrato::where('tipo_contrato', 'arrendamento')
            ->whereIn('estado', ['pendente_assinatura', 'assinado'])
            ->whereNotNull('data_fim')
            ->where('data_fim', '<', $hoje)
            ->get();

        foreach ($contratosExpirados as $contrato) {
            $contrato->update(['estado' => 'terminado']);
            $this->info("Contrato ID {$contrato->id} marcado como terminado.");
        }

        $this->info("Concluído. Foram expirados " . $contratosExpirados->count() . " contratos.");
    }
}
