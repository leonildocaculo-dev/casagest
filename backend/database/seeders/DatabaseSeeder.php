<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Contas .ao
        User::firstOrCreate(
            ['email' => 'admin@casagest.ao'],
            [
                'name' => 'Administrador CasaGest',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+244 923 000 001',
                'status' => 'ativo',
            ]
        );

        User::firstOrCreate(
            ['email' => 'proprietario@casagest.ao'],
            [
                'name' => 'João Proprietário',
                'password' => Hash::make('password'),
                'role' => 'proprietario',
                'phone' => '+244 923 000 002',
                'status' => 'ativo',
            ]
        );

        User::firstOrCreate(
            ['email' => 'cliente@casagest.ao'],
            [
                'name' => 'Maria Cliente',
                'password' => Hash::make('password'),
                'role' => 'cliente',
                'phone' => '+244 923 000 003',
                'status' => 'ativo',
            ]
        );

        // Contas .com
        User::firstOrCreate(
            ['email' => 'admin@casagest.com'],
            [
                'name' => 'Administrador CasaGest',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'phone' => '+244 923 000 001',
                'status' => 'ativo',
            ]
        );

        User::firstOrCreate(
            ['email' => 'proprietario@casagest.com'],
            [
                'name' => 'João Proprietário',
                'password' => Hash::make('password'),
                'role' => 'proprietario',
                'phone' => '+244 923 000 002',
                'status' => 'ativo',
            ]
        );

        User::firstOrCreate(
            ['email' => 'cliente@casagest.com'],
            [
                'name' => 'Maria Cliente',
                'password' => Hash::make('password'),
                'role' => 'cliente',
                'phone' => '+244 923 000 003',
                'status' => 'ativo',
            ]
        );

        $this->call(ImovelSeeder::class);
    }
}
