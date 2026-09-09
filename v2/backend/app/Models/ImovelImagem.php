<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImovelImagem extends Model
{
    protected $table = 'imovel_imagens';

    protected $fillable = [
        'imovel_id',
        'caminho',
        'ordem',
    ];

    protected function casts(): array
    {
        return [
            'ordem' => 'integer',
        ];
    }

    public function imovel(): BelongsTo
    {
        return $this->belongsTo(Imovel::class);
    }

    /**
     * URL completa da imagem via Storage
     */
    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->caminho);
    }
}
