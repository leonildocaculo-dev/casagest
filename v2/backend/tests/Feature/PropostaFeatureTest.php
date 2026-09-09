<?php

use App\Models\Imovel;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\postJson;
use function Pest\Laravel\actingAs;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('allows a client to submit a proposal', function () {
    $cliente = User::factory()->create(['role' => 'cliente']);
    $imovel = Imovel::factory()->create(['modalidade' => 'venda']);

    actingAs($cliente);

    $response = postJson('/api/propostas', [
        'imovel_id' => $imovel->id,
        'valor_proposto' => 5000000,
        'mensagem' => 'Tenho interesse na compra',
        'tipo' => 'venda',
    ]);

    $response->assertStatus(201);
    
    $this->assertDatabaseHas('propostas', [
        'imovel_id' => $imovel->id,
        'cliente_id' => $cliente->id,
        'valor_proposto' => 5000000,
    ]);
});

it('prevents non-clients from submitting proposals', function () {
    $proprietario = User::factory()->create(['role' => 'proprietario']);
    $imovel = Imovel::factory()->create(['modalidade' => 'venda']);

    actingAs($proprietario);

    $response = postJson('/api/propostas', [
        'imovel_id' => $imovel->id,
        'valor_proposto' => 5000000,
        'mensagem' => 'Tentativa falha',
        'tipo' => 'venda',
    ]);

    $response->assertStatus(403);
});
