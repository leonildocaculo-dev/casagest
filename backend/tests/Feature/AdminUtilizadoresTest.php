<?php

namespace Tests\Feature;

use App\Models\Imovel;
use App\Models\Proposta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUtilizadoresTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_pode_eliminar_utilizador_sem_historico(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $alvo = User::factory()->create(['role' => 'proprietario']);
        $alvo->createToken('auth_token');

        Imovel::create([
            'proprietario_id' => $alvo->id,
            'titulo' => 'Apartamento Talatona',
            'descricao' => 'Descrição do imóvel',
            'preco' => 500000.00,
            'localizacao' => 'Talatona',
            'tipo' => 'apartamento',
            'estado' => 'publicado',
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/utilizadores/{$alvo->id}")
            ->assertOk();

        $this->assertDatabaseMissing('users', ['id' => $alvo->id]);
        $this->assertDatabaseMissing('imoveis', ['proprietario_id' => $alvo->id]);
        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $alvo->id]);
        $this->assertDatabaseHas('audit_logs', ['acao' => 'eliminacao_utilizador', 'modelo_id' => $alvo->id]);
    }

    public function test_nao_admin_nao_pode_eliminar(): void
    {
        $cliente = User::factory()->create(['role' => 'cliente']);
        $alvo = User::factory()->create(['role' => 'cliente']);

        $this->actingAs($cliente, 'sanctum')
            ->deleteJson("/api/admin/utilizadores/{$alvo->id}")
            ->assertForbidden();

        $this->assertDatabaseHas('users', ['id' => $alvo->id]);
    }

    public function test_admin_nao_pode_eliminar_a_propria_conta(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/utilizadores/{$admin->id}")
            ->assertStatus(422);
    }

    public function test_utilizador_com_contrato_nao_pode_ser_eliminado(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
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

        $this->actingAs($proprietario, 'sanctum')
            ->postJson('/api/contratos', [
                'proposta_id' => $proposta->id,
                'tipo_contrato' => 'arrendamento',
                'data_inicio' => '2026-08-01',
                'data_fim' => '2027-08-01',
            ])
            ->assertStatus(201);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/utilizadores/{$cliente->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('users', ['id' => $cliente->id]);
        $this->assertDatabaseHas('contratos', ['cliente_id' => $cliente->id]);
    }
}
