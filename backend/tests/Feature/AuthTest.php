<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_as_cliente(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Novo Cliente',
            'email' => 'novocliente@exemplo.com',
            'phone' => '+244 923 111 222',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'cliente',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('users', [
            'email' => 'novocliente@exemplo.com',
            'role' => 'cliente',
        ]);
    }

    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'usuario@exemplo.com',
            'password' => bcrypt('password123'),
            'role' => 'proprietario',
            'status' => 'ativo',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'usuario@exemplo.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_user_cannot_login_with_invalid_password(): void
    {
        $user = User::factory()->create([
            'email' => 'usuario@exemplo.com',
            'password' => bcrypt('password123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'usuario@exemplo.com',
            'password' => 'errada',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/me');

        $response->assertStatus(200)
            ->assertJsonPath('user.email', $user->email)
            ->assertJsonPath('user.role', 'admin');
    }
}
