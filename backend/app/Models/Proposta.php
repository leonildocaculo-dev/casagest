<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Proposta extends Model
{
    use HasFactory;

    protected $table = 'propostas';

    protected $fillable = [
        'imovel_id',
        'cliente_id',
        'valor_proposto',
        'tipo',
        'mensagem',
        'estado',
        'valor_contra_proposta',
        'resposta_proprietario',
    ];

    protected function casts(): array
    {
        return [
            'valor_proposto' => 'decimal:2',
            'valor_contra_proposta' => 'decimal:2',
        ];
    }

    public function imovel(): BelongsTo
    {
        return $this->belongsTo(Imovel::class, 'imovel_id');
    }

    public function cliente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'cliente_id');
    }

    public function contrato(): HasOne
    {
        return $this->hasOne(Contrato::class, 'proposta_id');
    }
}
