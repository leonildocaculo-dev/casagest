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
        Schema::create('propostas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('imovel_id')->constrained('imoveis')->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('valor_proposto', 15, 2);
            $table->text('mensagem')->nullable();
            $table->enum('estado', ['pendente', 'aceite', 'recusada', 'contra_proposta'])->default('pendente');
            $table->decimal('valor_contra_proposta', 15, 2)->nullable();
            $table->text('resposta_proprietario')->nullable();
            $table->timestamps();

            $table->index('imovel_id');
            $table->index('cliente_id');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('propostas');
    }
};
