<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE contratos DROP CONSTRAINT IF EXISTS contratos_estado_check");
        DB::statement("ALTER TABLE contratos ADD CONSTRAINT contratos_estado_check CHECK (estado::text = ANY (ARRAY['rascunho'::character varying, 'pendente_assinatura'::character varying, 'assinado'::character varying, 'cancelado'::character varying, 'rescindido'::character varying, 'terminado'::character varying]::text[]))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE contratos DROP CONSTRAINT IF EXISTS contratos_estado_check");
        DB::statement("ALTER TABLE contratos ADD CONSTRAINT contratos_estado_check CHECK (estado::text = ANY (ARRAY['rascunho'::character varying, 'pendente_assinatura'::character varying, 'assinado'::character varying, 'cancelado'::character varying]::text[]))");
    }


};
