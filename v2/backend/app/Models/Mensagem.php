<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Mensagem extends Model
{
    protected $fillable = [
        'proposta_id',
        'sender_id',
        'conteudo',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    public function proposta()
    {
        return $this->belongsTo(Proposta::class);
    }

    public function sender()
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
