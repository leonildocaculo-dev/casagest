<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('imoveis', function (Blueprint $table) {
            $table->boolean('destaque')->default(false)->after('estado');
            $table->enum('modalidade', ['arrendamento', 'venda'])->default('arrendamento')->after('destaque');
            $table->string('categoria_especial')->nullable()->after('modalidade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('imoveis', function (Blueprint $table) {
            $table->dropColumn(['destaque', 'modalidade', 'categoria_especial']);
        });
    }
};
