<?php

namespace Tests\Feature;

use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SistemaImobiliarioTest extends TestCase
{
    use RefreshDatabase;

    public function test_proprietario_pode_criar_imovel(): void
    {
        /** @var User $proprietario */
        $proprietario = User::factory()->create(['role' => 'proprietario']);

        $response = $this->actingAs($proprietario)->postJson('/api/imoveis', [
            'titulo' => 'Apartamento T2 em Luanda',
            'descricao' => 'Apartamento acolhedor com vista panorâmica.',
            'preco' => 150000.00,
            'localizacao' => 'Luanda',
            'tipo' => 'apartamento',
            'quartos' => 2,
            'casas_banho' => 1,
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('imovel.estado', 'pendente');

        $this->assertDatabaseHas('imoveis', [
            'titulo' => 'Apartamento T2 em Luanda',
            'proprietario_id' => $proprietario->id,
        ]);
    }

    public function test_admin_pode_aprovar_imovel(): void
    {
        /** @var User $admin */
        $admin = User::factory()->create(['role' => 'admin']);
        /** @var User $proprietario */
        $proprietario = User::factory()->create(['role' => 'proprietario']);

        /** @var Imovel $imovel */
        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Vivenda Pendente',
            'descricao' => 'Vivenda para aprovação',
            'preco' => 300000.00,
            'localizacao' => 'Talatona',
            'tipo' => 'vivenda',
            'estado' => 'pendente',
        ]);

        $response = $this->actingAs($admin)->postJson("/api/imoveis/{$imovel->id}/aprovar", [
            'acao' => 'aprovar',
        ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('imoveis', [
            'id' => $imovel->id,
            'estado' => 'publicado',
        ]);
    }

    public function test_cliente_pode_submeter_proposta(): void
    {
        /** @var User $cliente */
        $cliente = User::factory()->create(['role' => 'cliente']);
        /** @var User $proprietario */
        $proprietario = User::factory()->create(['role' => 'proprietario']);

        /** @var Imovel $imovel */
        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Imóvel Publicado',
            'descricao' => 'Descrição',
            'preco' => 200000.00,
            'localizacao' => 'Kilamba',
            'tipo' => 'apartamento',
            'modalidade' => 'venda',
            'estado' => 'publicado',
        ]);

        $response = $this->actingAs($cliente)->postJson('/api/propostas', [
            'imovel_id' => $imovel->id,
            'valor_proposto' => 190000.00,
            'mensagem' => 'Tenho interesse no imóvel.',
            'tipo' => 'venda',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('proposta.estado', 'pendente');

        $this->assertDatabaseHas('propostas', [
            'imovel_id' => $imovel->id,
            'cliente_id' => $cliente->id,
            'valor_proposto' => 190000.00,
        ]);
    }

    public function test_proprietario_pode_aceitar_proposta_e_gerar_contrato(): void
    {
        /** @var User $cliente */
        $cliente = User::factory()->create(['role' => 'cliente']);
        /** @var User $proprietario */
        $proprietario = User::factory()->create(['role' => 'proprietario']);

        /** @var Imovel $imovel */
        $imovel = Imovel::create([
            'proprietario_id' => $proprietario->id,
            'titulo' => 'Imóvel Negociação',
            'descricao' => 'Descrição',
            'preco' => 200000.00,
            'localizacao' => 'Talatona',
            'tipo' => 'vivenda',
            'modalidade' => 'arrendamento',
            'estado' => 'publicado',
        ]);

        /** @var Proposta $proposta */
        $proposta = Proposta::create([
            'imovel_id' => $imovel->id,
            'cliente_id' => $cliente->id,
            'valor_proposto' => 200000.00,
            'estado' => 'pendente',
        ]);

        // Aceitar proposta
        $respRes = $this->actingAs($proprietario)->postJson("/api/propostas/{$proposta->id}/responder", [
            'estado' => 'aceite',
            'resposta_proprietario' => 'Proposta aceite com sucesso.',
        ]);
        $respRes->assertStatus(200);

        // Gerar contrato
        $contratoRes = $this->actingAs($proprietario)->postJson('/api/contratos', [
            'proposta_id' => $proposta->id,
            'tipo_contrato' => 'arrendamento',
        ]);

        $contratoRes->assertStatus(201);

        $this->assertDatabaseHas('contratos', [
            'proposta_id' => $proposta->id,
            'valor_acordado' => 200000.00,
            'estado' => 'pendente_assinatura',
        ]);
    }
}
