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
        Schema::create('imoveis', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proprietario_id')->constrained('users')->cascadeOnDelete();
            $table->string('titulo');
            $table->text('descricao');
            $table->decimal('preco', 15, 2);
            $table->string('localizacao');
            $table->enum('tipo', ['apartamento', 'vivenda', 'escritorio', 'terreno', 'loja'])->default('apartamento');
            $table->enum('estado', ['pendente', 'publicado', 'reservado', 'vendido', 'inativo'])->default('pendente');
            $table->unsignedSmallInteger('quartos')->default(0);
            $table->unsignedSmallInteger('casas_banho')->default(0);
            $table->decimal('area_m2', 10, 2)->nullable();
            $table->string('endereco')->nullable();
            $table->timestamps();

            $table->index('estado');
            $table->index('tipo');
            $table->index('localizacao');
            $table->index('preco');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('imoveis');
    }
};
