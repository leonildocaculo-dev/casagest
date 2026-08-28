<?php

namespace Database\Factories;

use App\Models\Imovel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Imovel>
 */
class ImovelFactory extends Factory
{
    protected $model = Imovel::class;

    public function definition(): array
    {
        return [
            'proprietario_id' => User::factory()->create(['role' => 'proprietario'])->id,
            'titulo' => fake()->sentence(4),
            'descricao' => fake()->paragraph(),
            'preco' => fake()->randomFloat(2, 100000, 50000000),
            'localizacao' => fake()->city(),
            'tipo' => fake()->randomElement(['apartamento', 'vivenda', 'escritorio', 'terreno', 'loja']),
            'modalidade' => fake()->randomElement(['venda', 'arrendamento']),
            'estado' => 'publicado',
            'quartos' => fake()->numberBetween(1, 5),
            'casas_banho' => fake()->numberBetween(1, 4),
            'area_m2' => fake()->randomFloat(2, 50, 500),
            'latitude' => fake()->latitude(-10, -8),
            'longitude' => fake()->longitude(13, 15),
            'destaque' => fake()->boolean(20),
        ];
    }
}
