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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->string('acao'); // ex: 'login', 'imovel_criado', 'imovel_aprovado', 'proposta_aceite', 'contrato_gerado', 'pagamento_validado'
            $table->string('modelo')->nullable(); // ex: 'Imovel', 'Proposta', 'Contrato', 'Pagamento'
            $table->unsignedBigInteger('modelo_id')->nullable();
            $table->json('detalhes')->nullable();
            $table->string('ip_address')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
