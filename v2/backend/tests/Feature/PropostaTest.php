<?php

namespace Tests\Feature;

use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropostaTest extends TestCase
{
    use RefreshDatabase;

    public function test_cliente_pode_enviar_proposta(): void
    {
        $proprietario = User::factory()->create(['role' => 'proprietario']);
        $cliente = User::factory()->create(['role' => 'cliente']);

        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Vivenda Talatona',
            'descricao' => 'Vivenda de luxo',
            'preco' => 300000.00,
            'localizacao' => 'Talatona',
            'tipo' => 'vivenda',
            'modalidade' => 'venda',
            'estado' => 'publicado',
        ]);

        $response = $this->actingAs($cliente, 'sanctum')
            ->postJson('/api/propostas', [
                'imovel_id' => $imovel->id,
                'valor_proposto' => 280000,
                'mensagem' => 'Tenho interesse imediato.',
                'tipo' => 'venda',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('proposta.valor_proposto', '280000.00');
    }

    public function test_proprietario_pode_aceitar_proposta(): void
    {
        $proprietario = User::factory()->create(['role' => 'proprietario']);
        $cliente = User::factory()->create(['role' => 'cliente']);

        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Apartamento Kilamba',
            'descricao' => 'Apartamento T3',
            'preco' => 250000.00,
            'localizacao' => 'Kilamba',
            'tipo' => 'apartamento',
            'estado' => 'publicado',
        ]);

        $proposta = Proposta::create([
            'imovel_id' => $imovel->id,
            'cliente_id' => $cliente->id,
            'valor_proposto' => 280000,
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($proprietario, 'sanctum')
            ->postJson("/api/propostas/{$proposta->id}/responder", [
                'estado' => 'aceite',
                'resposta_proprietario' => 'Proposta aceite!',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('proposta.estado', 'aceite');
    }
}
