<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MensagemContacto extends Model
{
    use HasFactory;

    protected $table = 'mensagens_contacto';

    protected $fillable = [
        'nome',
        'email',
        'telefone',
        'mensagem',
        'assunto',
        'lida',
    ];

    protected function casts(): array
    {
        return [
            'lida' => 'boolean',
        ];
    }
}
