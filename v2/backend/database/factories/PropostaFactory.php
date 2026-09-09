<?php

namespace Database\Factories;

use App\Models\Proposta;
use App\Models\Imovel;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Proposta>
 */
class PropostaFactory extends Factory
{
    protected $model = Proposta::class;

    public function definition(): array
    {
        return [
            'imovel_id' => Imovel::factory(),
            'cliente_id' => User::factory()->create(['role' => 'cliente'])->id,
            'valor_proposto' => fake()->randomFloat(2, 100000, 50000000),
            'mensagem' => fake()->sentence(),
            'estado' => 'pendente',
        ];
    }
}
