<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuditLogTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_gera_audit_log(): void
    {
        $user = User::factory()->create([
            'password' => bcrypt('password123'),
            'status' => 'ativo',
        ]);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123',
        ])->assertStatus(200);

        $this->assertDatabaseHas('audit_logs', [
            'user_id' => $user->id,
            'acao' => 'login',
        ]);
    }

    public function test_admin_pode_consultar_audit_logs(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        \App\Services\AuditLogService::log('teste_acao', $admin->id);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/audit-logs');

        $response->assertStatus(200)
            ->assertJsonStructure(['data', 'total']);
    }
}
