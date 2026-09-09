<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('imoveis', function (Blueprint $table) {
            $table->string('modalidade_new')->default('arrendamento')->after('destaque');
            $table->decimal('preco_venda', 15, 2)->nullable()->after('preco');
            $table->decimal('preco_arrendamento', 15, 2)->nullable()->after('preco_venda');
        });

        // Update values
        DB::table('imoveis')->update([
            'modalidade_new' => DB::raw('modalidade'),
            'preco_venda' => DB::raw("CASE WHEN modalidade = 'venda' THEN preco ELSE NULL END"),
            'preco_arrendamento' => DB::raw("CASE WHEN modalidade = 'arrendamento' THEN preco ELSE NULL END"),
        ]);

        Schema::table('imoveis', function (Blueprint $table) {
            $table->dropColumn('modalidade');
        });

        Schema::table('imoveis', function (Blueprint $table) {
            $table->renameColumn('modalidade_new', 'modalidade');
            $table->decimal('preco', 15, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('imoveis', function (Blueprint $table) {
            $table->enum('modalidade_old', ['arrendamento', 'venda'])->default('arrendamento');
        });
        
        DB::table('imoveis')->update([
            'modalidade_old' => DB::raw("CASE WHEN modalidade = 'ambos' THEN 'venda' ELSE modalidade END"),
        ]);

        Schema::table('imoveis', function (Blueprint $table) {
            $table->dropColumn(['modalidade', 'preco_venda', 'preco_arrendamento']);
            $table->renameColumn('modalidade_old', 'modalidade');
            $table->decimal('preco', 15, 2)->nullable(false)->change();
        });
    }
};
