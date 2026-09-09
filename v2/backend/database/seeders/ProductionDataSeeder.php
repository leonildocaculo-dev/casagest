<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Imovel;
use App\Models\ImovelImagem;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class ProductionDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Criar Utilizadores
        $admin1 = User::firstOrCreate(
            ['email' => 'admin1@casagest.ao'],
            [
                'name' => 'Admin Principal',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '923000001'
            ]
        );

        $admin2 = User::firstOrCreate(
            ['email' => 'admin2@casagest.ao'],
            [
                'name' => 'Admin Secundário',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '923000002'
            ]
        );

        $proprietario = User::firstOrCreate(
            ['email' => 'proprietario@casagest.ao'],
            [
                'name' => 'João Senhorio',
                'password' => Hash::make('senha123'),
                'role' => 'proprietario',
                'phone' => '923000003'
            ]
        );

        $cliente = User::firstOrCreate(
            ['email' => 'cliente@casagest.ao'],
            [
                'name' => 'Maria Cliente',
                'password' => Hash::make('senha123'),
                'role' => 'cliente',
                'phone' => '923000004'
            ]
        );

        // Imagens Reais do Unsplash (Arquitetura/Casas)
        $imagensCasas = [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1600585154526-990dced4ea0d?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1592595896616-c37162298647?auto=format&fit=crop&w=1200&q=80',
            'https://images.unsplash.com/photo-1576941089067-2de3c901e126?auto=format&fit=crop&w=1200&q=80'
        ];

        // 2. Criar 5 Imóveis para Venda
        $vendas = [
            ['titulo' => 'Vivenda V4 de Luxo em Talatona', 'preco' => 150000000, 'localizacao' => 'Talatona, Luanda', 'descricao' => 'Excelente vivenda com piscina, jardim e garagem para 3 carros.', 'tipo' => 'vivenda'],
            ['titulo' => 'Apartamento T3 no Condomínio Belas', 'preco' => 85000000, 'localizacao' => 'Belas, Luanda', 'descricao' => 'Apartamento moderno, segurança 24h e área de lazer.', 'tipo' => 'apartamento'],
            ['titulo' => 'Casa V3 no Benfica', 'preco' => 60000000, 'localizacao' => 'Benfica, Luanda', 'descricao' => 'Casa espaçosa, perto da praia e de supermercados.', 'tipo' => 'vivenda'],
            ['titulo' => 'Apartamento T2 na Mutamba', 'preco' => 45000000, 'localizacao' => 'Mutamba, Luanda (Centro)', 'descricao' => 'Ideal para quem trabalha no centro. Vista para a baía.', 'tipo' => 'apartamento'],
            ['titulo' => 'Vivenda V5 no Patriota', 'preco' => 120000000, 'localizacao' => 'Patriota, Luanda', 'descricao' => 'Alto padrão, acabamentos de luxo e anexo espaçoso.', 'tipo' => 'vivenda']
        ];

        foreach ($vendas as $index => $venda) {
            $imovel = Imovel::create([
                'proprietario_id' => $proprietario->id,
                'titulo' => $venda['titulo'],
                'descricao' => $venda['descricao'],
                'tipo' => $venda['tipo'],
                'modalidade' => 'venda',
                'preco' => $venda['preco'],
                'preco_venda' => $venda['preco'],
                'localizacao' => $venda['localizacao'],
                'quartos' => rand(2, 5),
                'casas_banho' => rand(1, 4),
                'area_m2' => rand(80, 400),
                'estado' => 'publicado'
            ]);
            ImovelImagem::create([
                'imovel_id' => $imovel->id,
                'caminho' => $imagensCasas[$index]
            ]);
        }

        // 3. Criar 5 Imóveis para Arrendamento
        $arrendamentos = [
            ['titulo' => 'Apartamento T1 Mobilado em Talatona', 'preco' => 400000, 'localizacao' => 'Talatona, Luanda', 'descricao' => 'Pronto a habitar, despesas de condomínio incluídas.', 'tipo' => 'apartamento'],
            ['titulo' => 'Vivenda V3 no Kilamba', 'preco' => 250000, 'localizacao' => 'Cidade do Kilamba', 'descricao' => 'Excelente localização, perto de escolas e hospitais.', 'tipo' => 'vivenda'],
            ['titulo' => 'Apartamento T2 no Zango 0', 'preco' => 150000, 'localizacao' => 'Zango, Viana', 'descricao' => 'Condomínio fechado, água e luz 24h.', 'tipo' => 'apartamento'],
            ['titulo' => 'Casa V2 no Nova Vida', 'preco' => 300000, 'localizacao' => 'Projeto Nova Vida', 'descricao' => 'Casa térrea, quintal vasto e anexo.', 'tipo' => 'vivenda'],
            ['titulo' => 'Apartamento T3 de Luxo na Ilha do Cabo', 'preco' => 800000, 'localizacao' => 'Ilha de Luanda', 'descricao' => 'Vista mar deslumbrante, varanda espaçosa.', 'tipo' => 'apartamento']
        ];

        foreach ($arrendamentos as $index => $arrendamento) {
            $imovel = Imovel::create([
                'proprietario_id' => $proprietario->id,
                'titulo' => $arrendamento['titulo'],
                'descricao' => $arrendamento['descricao'],
                'tipo' => $arrendamento['tipo'],
                'modalidade' => 'arrendamento',
                'preco' => $arrendamento['preco'],
                'preco_arrendamento' => $arrendamento['preco'],
                'localizacao' => $arrendamento['localizacao'],
                'quartos' => rand(1, 3),
                'casas_banho' => rand(1, 2),
                'area_m2' => rand(50, 150),
                'estado' => 'publicado'
            ]);
            ImovelImagem::create([
                'imovel_id' => $imovel->id,
                'caminho' => $imagensCasas[$index + 5] // Usar as restantes 5 imagens
            ]);
        }
    }
}
