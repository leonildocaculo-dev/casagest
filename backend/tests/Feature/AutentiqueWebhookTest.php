<?php

use App\Models\Contrato;
use App\Models\Proposta;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\postJson;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('updates contrato to assinado via webhook', function () {
    $proposta = Proposta::factory()->create(['estado' => 'aceite']);
    $contrato = Contrato::create([
        'proposta_id' => $proposta->id,
        'imovel_id' => $proposta->imovel_id,
        'cliente_id' => $proposta->cliente_id,
        'proprietario_id' => $proposta->imovel->proprietario_id,
        'tipo_contrato' => 'arrendamento',
        'valor_acordado' => 200000,
        'data_inicio' => now()->toDateString(),
        'data_fim' => now()->addYear()->toDateString(),
        'estado' => 'pendente_assinatura',
        'document_id' => '1234567890',
    ]);

    // Simulate Autentique webhook payload for signed document
    $response = postJson('/api/webhooks/autentique', [
        'event' => 'document.signed',
        'document' => [
            'id' => '1234567890',
            'name' => "Contrato_{$contrato->id}.pdf"
        ]
    ]);

    $response->assertStatus(200);

    $this->assertDatabaseHas('contratos', [
        'id' => $contrato->id,
        'estado' => 'assinado',
    ]);
});
