<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pagamento extends Model
{
    use HasFactory;

    protected $table = 'pagamentos';

    protected $fillable = [
        'contrato_id',
        'cliente_id',
        'valor',
        'metodo',
        'entidade',
        'referencia',
        'data_limite',
        'comprovativo_caminho',
        'comprovativo_nome_original',
        'estado',
        'data_pagamento',
        'resposta_webhook',
        'notas_admin',
    ];

    protected function casts(): array
    {
        return [
            'valor' => 'decimal:2',
            'data_limite' => 'datetime',
            'data_pagamento' => 'datetime',
            'resposta_webhook' => 'array',
        ];
    }

    public function contrato(): BelongsTo
    {
        return $this->belongsTo(Contrato::class, 'contrato_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function scopePendente(Builder $query): Builder
    {
        return $query->where('estado', 'pendente');
    }

    public function scopeEmAnalise(Builder $query): Builder
    {
        return $query->where('estado', 'em_analise');
    }

    public function scopePago(Builder $query): Builder
    {
        return $query->where('estado', 'pago');
    }
}
