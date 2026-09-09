<?php

namespace Database\Seeders;

use App\Models\Imovel;
use App\Models\User;
use Illuminate\Database\Seeder;

class ImovelSeeder extends Seeder
{
    /**
     * Seed de imóveis de teste com categorias e imagens para demonstração.
     */
    public function run(): void
    {
        /** @var User $proprietario */
        $proprietario = User::where('role', 'proprietario')->first();

        if (! $proprietario) {
            return;
        }

        $imoveis = [
            [
                'titulo' => 'Apartamento T3 Deluxe em Talatona',
                'descricao' => 'Excelente apartamento T3, com varanda e vista para o mar, localizado no condomínio fechado de Talatona. Cozinha equipada com eletrodomésticos topo de gama, 2 casas de banho, sala ampla com luz natural, garagem privativa para 2 viaturas e piscina comunitária.',
                'preco' => 250000000.00,
                'localizacao' => 'Talatona, Luanda',
                'tipo' => 'apartamento',
                'modalidade' => 'arrendamento',
                'destaque' => true,
                'categoria_especial' => 'Urban Oasis Apartments',
                'estado' => 'publicado',
                'quartos' => 3,
                'casas_banho' => 2,
                'area_m2' => 140.00,
                'endereco' => 'Rua da Paz, Condomínio Atlântico, Bloco B, 4º Andar',
                'latitude' => -8.9248, // Talatona
                'longitude' => 13.1895,
            ],
            [
                'titulo' => 'Vivenda V4 de Luxo no Campo de Golfe',
                'descricao' => 'Vivenda magnífica com 4 suítes, jardim privativo, piscina aquecida e garagem para 4 viaturas. Localizada no prestigiado resort de golfe, próxima de colégios internacionais e áreas de lazer de topo.',
                'preco' => 650000000.00,
                'localizacao' => 'Talatona Golfe, Luanda',
                'tipo' => 'vivenda',
                'modalidade' => 'venda',
                'destaque' => true,
                'categoria_especial' => 'Golf Course Estates',
                'estado' => 'publicado',
                'quartos' => 4,
                'casas_banho' => 5,
                'area_m2' => 420.00,
                'endereco' => 'Alameda dos Coqueiros, Lote 12',
                'latitude' => -8.9321,
                'longitude' => 13.1902,
            ],
            [
                'titulo' => 'Resort & Villa na Baía das Mulheres',
                'descricao' => 'Propriedade exclusiva em resort de luxo com vista direta para a baía. Suítes master com hidromassagem, terraço panorâmico, cais privado e acabamentos em pedra natural.',
                'preco' => 890000000.00,
                'localizacao' => 'Mussulo, Luanda',
                'tipo' => 'vivenda',
                'modalidade' => 'venda',
                'destaque' => true,
                'categoria_especial' => 'Properties in Luxury Resorts',
                'estado' => 'publicado',
                'quartos' => 5,
                'casas_banho' => 6,
                'area_m2' => 550.00,
                'endereco' => 'Faixa de Areia Principal, Setor A',
                'latitude' => -8.9416, // Mussulo
                'longitude' => 13.1368,
            ],
            [
                'titulo' => 'Chálet com Vista Mar e Praia Privada',
                'descricao' => 'Encantador chálet à beira-mar, perfeito para refúgio de fim de semana ou investimento turístico. Totalmente mobilado, deck em madeira nobre e acesso direto à praia.',
                'preco' => 180000000.00,
                'localizacao' => 'Cabo Ledo, Luanda',
                'tipo' => 'vivenda',
                'modalidade' => 'arrendamento',
                'destaque' => true,
                'categoria_especial' => 'Modern Beach Chalets',
                'estado' => 'publicado',
                'quartos' => 3,
                'casas_banho' => 2,
                'area_m2' => 210.00,
                'endereco' => 'Estrada da Costa, Km 45',
                'latitude' => -9.6705, // Cabo Ledo
                'longitude' => 13.2052,
            ],
            [
                'titulo' => 'Quinta / Refúgio no Campo em Calandula',
                'descricao' => 'Propriedade rural expansiva cercada por natureza intocada. Casa principal com arquitetura tradicional, pomares, lago privado e infraestrutura solar completa.',
                'preco' => 320000000.00,
                'localizacao' => 'Calandula, Malanje',
                'tipo' => 'vivenda',
                'modalidade' => 'venda',
                'destaque' => false,
                'categoria_especial' => 'Countryside Retreats',
                'estado' => 'publicado',
                'quartos' => 4,
                'casas_banho' => 3,
                'area_m2' => 850.00,
                'endereco' => 'Vale Verde, Quinta nº 8',
                'latitude' => -9.0722, // Calandula
                'longitude' => 16.0028,
            ],
            [
                'titulo' => 'Escritório Corporativo no Edifício Sky Tower',
                'descricao' => 'Escritório de alto padrão no centro financeiro de Luanda. Open space com divisórias em vidro acústico, recepção imponente, 2 salas de reunião e copa executiva.',
                'preco' => 120000000.00,
                'localizacao' => 'Ingombota, Luanda',
                'tipo' => 'escritorio',
                'modalidade' => 'arrendamento',
                'destaque' => false,
                'categoria_especial' => 'Urban Oasis Apartments',
                'estado' => 'publicado',
                'quartos' => 0,
                'casas_banho' => 3,
                'area_m2' => 280.00,
                'endereco' => 'Av. 4 de Fevereiro, Sky Tower, 15º Andar',
                'latitude' => -8.8147, // Ingombota
                'longitude' => 13.2302,
            ],
        ];

        foreach ($imoveis as $data) {
            Imovel::firstOrCreate(
                ['titulo' => $data['titulo']],
                [...$data, 'proprietario_id' => $proprietario->id]
            );
        }
    }
}
