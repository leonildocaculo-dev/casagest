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
        Schema::create('contratos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('proposta_id')->constrained('propostas')->cascadeOnDelete();
            $table->foreignId('imovel_id')->constrained('imoveis')->cascadeOnDelete();
            $table->foreignId('cliente_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('proprietario_id')->constrained('users')->cascadeOnDelete();
            $table->enum('tipo_contrato', ['arrendamento', 'compra_venda'])->default('arrendamento');
            $table->decimal('valor_acordado', 15, 2);
            $table->date('data_inicio')->nullable();
            $table->date('data_fim')->nullable();
            $table->text('termos_adicionais')->nullable();
            $table->enum('estado', ['rascunho', 'pendente_assinatura', 'assinado', 'cancelado'])->default('rascunho');
            $table->string('caminho_pdf')->nullable();
            $table->timestamps();

            $table->index('proposta_id');
            $table->index('cliente_id');
            $table->index('proprietario_id');
            $table->index('estado');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contratos');
    }
};
