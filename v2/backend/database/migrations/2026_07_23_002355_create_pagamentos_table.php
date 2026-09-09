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
        Schema::create('pagamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contrato_id')->constrained('contratos')->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('valor', 15, 2);
            $table->enum('metodo', ['referencia', 'transferencia_bancaria']);
            
            // Dados de Pagamento por Referência (Multicaixa)
            $table->string('entidade', 10)->nullable();
            $table->string('referencia', 15)->nullable();
            $table->timestamp('data_limite')->nullable();

            // Dados de Transferência Bancária
            $table->string('comprovativo_caminho')->nullable();
            $table->string('comprovativo_nome_original')->nullable();

            // Estado e Auditoria
            $table->enum('estado', ['pendente', 'em_analise', 'pago', 'rejeitado', 'expirado'])->default('pendente');
            $table->timestamp('data_pagamento')->nullable();
            $table->json('resposta_webhook')->nullable();
            $table->text('notas_admin')->nullable();
            $table->timestamps();

            $table->index('contrato_id');
            $table->index('cliente_id');
            $table->index(['entidade', 'referencia']);
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pagamentos');
    }
};
