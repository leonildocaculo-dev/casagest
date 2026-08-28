<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('propostas', function (Blueprint $table) {
            $table->string('tipo')->default('arrendamento')->after('valor_proposto');
        });

        // Tentar inferir o tipo da proposta baseado no imóvel, caso existam propostas
        DB::statement("
            UPDATE propostas 
            SET tipo = (SELECT modalidade FROM imoveis WHERE imoveis.id = propostas.imovel_id)
            WHERE EXISTS (SELECT 1 FROM imoveis WHERE imoveis.id = propostas.imovel_id AND modalidade != 'ambos')
        ");
    }

    public function down(): void
    {
        Schema::table('propostas', function (Blueprint $table) {
            $table->dropColumn('tipo');
        });
    }
};
