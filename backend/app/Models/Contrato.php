<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contrato extends Model
{
    use HasFactory;

    protected $table = 'contratos';

    protected $fillable = [
        'proposta_id',
        'imovel_id',
        'cliente_id',
        'proprietario_id',
        'tipo_contrato',
        'valor_acordado',
        'data_inicio',
        'data_fim',
        'termos_adicionais',
        'estado',
        'caminho_pdf',
        'document_id',
        'assinatura_url',
    ];

    protected function casts(): array
    {
        return [
            'valor_acordado' => 'decimal:2',
            'data_inicio' => 'date',
            'data_fim' => 'date',
        ];
    }

    public function proposta(): BelongsTo
    {
        return $this->belongsTo(Proposta::class, 'proposta_id');
    }

    public function imovel(): BelongsTo
    {
        return $this->belongsTo(Imovel::class, 'imovel_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function proprietario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietario_id');
    }

    public function pagamentos()
    {
        return $this->hasMany(Pagamento::class, 'contrato_id');
    }
}
