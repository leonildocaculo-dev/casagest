<?php

namespace Tests\Feature;

use App\Models\Contrato;
use App\Models\Imovel;
use App\Models\Pagamento;
use App\Models\Proposta;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PagamentoTest extends TestCase
{
    use RefreshDatabase;

    protected User $cliente;
    protected User $proprietario;
    protected User $admin;
    protected Contrato $contratoAte10M;
    protected Contrato $contratoAcima10M;

    protected function setUp(): void
    {
        parent::setUp();

        $this->cliente = User::factory()->create(['role' => 'cliente']);
        $this->proprietario = User::factory()->create(['role' => 'proprietario']);
        $this->admin = User::factory()->create(['role' => 'admin']);

        $imovel1 = Imovel::create([
            'proprietario_id' => $this->proprietario->id,
            'titulo' => 'Vivenda de Luxo em Talatona',
            'descricao' => 'Descrição do imóvel',
            'preco' => 500000.00,
            'localizacao' => 'Luanda, Talatona',
            'tipo' => 'vivenda',
            'estado' => 'publicado',
            'quartos' => 3,
            'casas_banho' => 2,
        ]);

        $proposta1 = Proposta::create([
            'imovel_id' => $imovel1->id,
            'cliente_id' => $this->cliente->id,
            'valor_proposto' => 500000.00, // 500 Mil AOA (<= 10M)
            'mensagem' => 'Proposta inicial',
            'estado' => 'aceite',
        ]);

        $this->contratoAte10M = Contrato::create([
            'proposta_id' => $proposta1->id,
            'cliente_id' => $this->cliente->id,
            'proprietario_id' => $this->proprietario->id,
            'imovel_id' => $imovel1->id,
            'tipo_contrato' => 'arrendamento',
            'valor_acordado' => 500000.00,
            'estado' => 'rascunho',
        ]);

        $proposta2 = Proposta::create([
            'imovel_id' => $imovel1->id,
            'cliente_id' => $this->cliente->id,
            'valor_proposto' => 25000000.00, // 25 Milhões AOA (> 10M)
            'mensagem' => 'Proposta compra',
            'estado' => 'aceite',
        ]);

        $this->contratoAcima10M = Contrato::create([
            'proposta_id' => $proposta2->id,
            'cliente_id' => $this->cliente->id,
            'proprietario_id' => $this->proprietario->id,
            'imovel_id' => $imovel1->id,
            'tipo_contrato' => 'compra_venda',
            'valor_acordado' => 25000000.00,
            'estado' => 'rascunho',
        ]);

        Storage::fake('public');
    }

    public function test_cliente_pode_gerar_referencia_multicaixa_para_valor_ate_10M(): void
    {
        $response = $this->actingAs($this->cliente)
            ->postJson('/api/pagamentos', [
                'contrato_id' => $this->contratoAte10M->id,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('tipo_pagamento', 'referencia')
            ->assertJsonPath('pagamento.entidade', '10555');

        $this->assertDatabaseHas('pagamentos', [
            'contrato_id' => $this->contratoAte10M->id,
            'metodo' => 'referencia',
            'estado' => 'pendente',
        ]);
    }

    public function test_cliente_deve_anexar_comprovativo_para_valor_superior_a_10M(): void
    {
        // Sem comprovativo -> Falha 422
        $responseSemFile = $this->actingAs($this->cliente)
            ->postJson('/api/pagamentos', [
                'contrato_id' => $this->contratoAcima10M->id,
            ]);

        $responseSemFile->assertStatus(422);

        // Com comprovativo PDF <= 2MB -> Sucesso
        $file = UploadedFile::fake()->create('comprovativo.pdf', 1024); // 1MB

        $responseComFile = $this->actingAs($this->cliente)
            ->postJson('/api/pagamentos', [
                'contrato_id' => $this->contratoAcima10M->id,
                'comprovativo' => $file,
            ]);

        $responseComFile->assertStatus(201)
            ->assertJsonPath('tipo_pagamento', 'transferencia_bancaria')
            ->assertJsonPath('pagamento.estado', 'em_analise');

        $this->assertDatabaseHas('pagamentos', [
            'contrato_id' => $this->contratoAcima10M->id,
            'metodo' => 'transferencia_bancaria',
            'estado' => 'em_analise',
        ]);
    }

    public function test_rejeita_comprovativo_superior_a_2MB(): void
    {
        $fileBig = UploadedFile::fake()->create('comprovativo_grande.pdf', 3000); // 3MB (> 2MB)

        $response = $this->actingAs($this->cliente)
            ->postJson('/api/pagamentos', [
                'contrato_id' => $this->contratoAcima10M->id,
                'comprovativo' => $fileBig,
            ]);

        $response->assertStatus(422);
    }

    public function test_webhook_multicaixa_confirma_pagamento_automaticamente(): void
    {
        // Criar pagamento por referência
        $pagamento = Pagamento::create([
            'contrato_id' => $this->contratoAte10M->id,
            'cliente_id' => $this->cliente->id,
            'valor' => 500000.00,
            'metodo' => 'referencia',
            'entidade' => '10555',
            'referencia' => '912345678',
            'estado' => 'pendente',
        ]);

        config(['app.webhook_pagamentos_secret' => 'test-secret-pagamento']);

        // Simular callback do webhook
        $response = $this->postJson('/api/webhooks/pagamentos/referencia', [
            'entidade' => '10555',
            'referencia' => '912345678',
            'valor' => 500000.00,
            'status' => 'PAID',
        ], [
            'X-Webhook-Secret' => 'test-secret-pagamento'
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('status', 'success');

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'estado' => 'pago',
        ]);

        $this->assertDatabaseHas('contratos', [
            'id' => $this->contratoAte10M->id,
            'estado' => 'assinado',
        ]);
    }

    public function test_admin_pode_aprovar_comprovativo_de_transferencia(): void
    {
        $pagamento = Pagamento::create([
            'contrato_id' => $this->contratoAcima10M->id,
            'cliente_id' => $this->cliente->id,
            'valor' => 25000000.00,
            'metodo' => 'transferencia_bancaria',
            'comprovativo_caminho' => 'comprovativos/fake.pdf',
            'estado' => 'em_analise',
        ]);

        $response = $this->actingAs($this->admin)
            ->postJson("/api/pagamentos/{$pagamento->id}/validar", [
                'acao' => 'aprovar',
                'notas_admin' => 'Transferência confirmada no extrato bancário.',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('pagamentos', [
            'id' => $pagamento->id,
            'estado' => 'pago',
        ]);
    }
}
