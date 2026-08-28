<?php

use App\Models\Imovel;
use Illuminate\Foundation\Testing\RefreshDatabase;
use function Pest\Laravel\getJson;

uses(Tests\TestCase::class, RefreshDatabase::class);

it('lists imoveis with pagination', function () {
    Imovel::factory()->count(15)->create();

    $response = getJson('/api/imoveis');

    $response->assertStatus(200)
             ->assertJsonStructure([
                 'data',
                 'current_page',
                 'last_page',
                 'total',
             ]);
    
    expect(count($response->json('data')))->toBe(12);
    expect($response->json('total'))->toBe(15);
});

it('filters imoveis by keyword', function () {
    Imovel::factory()->create(['titulo' => 'Apartamento Luanda', 'descricao' => 'Lindo']);
    Imovel::factory()->create(['titulo' => 'Vivenda Talatona', 'descricao' => 'Espaçoso']);

    $response = getJson('/api/imoveis?pesquisa=Luanda');

    $response->assertStatus(200);
    expect(count($response->json('data')))->toBe(1);
    expect($response->json('data.0.titulo'))->toBe('Apartamento Luanda');
});

it('filters imoveis by type', function () {
    Imovel::factory()->create(['tipo' => 'apartamento']);
    Imovel::factory()->create(['tipo' => 'vivenda']);

    $response = getJson('/api/imoveis?tipo=apartamento');

    $response->assertStatus(200);
    expect(count($response->json('data')))->toBe(1);
    expect($response->json('data.0.tipo'))->toBe('apartamento');
});

it('filters imoveis by geographic radius', function () {
    // Luanda Coordinates ~ -8.8147, 13.2302
    Imovel::factory()->create([
        'titulo' => 'Centro de Luanda',
        'latitude' => -8.8147,
        'longitude' => 13.2302,
    ]);
    
    // Benguela Coordinates ~ -12.5783, 13.4072 (far away)
    Imovel::factory()->create([
        'titulo' => 'Benguela Longe',
        'latitude' => -12.5783,
        'longitude' => 13.4072,
    ]);

    // Search 10km around Luanda
    $response = getJson('/api/imoveis?lat=-8.8147&lng=13.2302&raio=10');

    $response->assertStatus(200);
    expect(count($response->json('data')))->toBe(1);
    expect($response->json('data.0.titulo'))->toBe('Centro de Luanda');
});
