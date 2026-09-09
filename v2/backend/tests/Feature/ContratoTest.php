<?php

namespace Tests\Feature;

use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContratoTest extends TestCase
{
    use RefreshDatabase;

    public function test_proprietario_pode_gerar_contrato_de_proposta_aceite(): void
    {
        $proprietario = User::factory()->create(['role' => 'proprietario']);
        $cliente = User::factory()->create(['role' => 'cliente']);

        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Apartamento Talatona',
            'descricao' => 'Descrição do imóvel',
            'preco' => 500000.00,
            'localizacao' => 'Talatona',
            'tipo' => 'apartamento',
            'estado' => 'publicado',
        ]);

        $proposta = Proposta::create([
            'imovel_id' => $imovel->id,
            'cliente_id' => $cliente->id,
            'valor_proposto' => 500000.00,
            'estado' => 'aceite',
        ]);

        $response = $this->actingAs($proprietario, 'sanctum')
            ->postJson('/api/contratos', [
                'proposta_id' => $proposta->id,
                'tipo_contrato' => 'arrendamento',
                'data_inicio' => '2026-08-01',
                'data_fim' => '2027-08-01',
                'termos_adicionais' => 'Pagamento até dia 5 de cada mês.',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('contrato.proposta_id', $proposta->id)
            ->assertJsonPath('contrato.tipo_contrato', 'arrendamento');

        $this->assertDatabaseHas('contratos', [
            'proposta_id' => $proposta->id,
            'valor_acordado' => 500000.00,
        ]);
    }

    public function test_nao_pode_gerar_contrato_de_proposta_pendente(): void
    {
        $proprietario = User::factory()->create(['role' => 'proprietario']);
        $cliente = User::factory()->create(['role' => 'cliente']);

        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Apartamento Maianga',
            'descricao' => 'Descrição do imóvel',
            'preco' => 500000.00,
            'localizacao' => 'Maianga',
            'tipo' => 'apartamento',
            'estado' => 'publicado',
        ]);

        $proposta = Proposta::create([
            'imovel_id' => $imovel->id,
            'cliente_id' => $cliente->id,
            'valor_proposto' => 500000.00,
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($proprietario, 'sanctum')
            ->postJson('/api/contratos', [
                'proposta_id' => $proposta->id,
            ]);

        $response->assertStatus(422);
    }
}
