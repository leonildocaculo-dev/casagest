<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Imovel extends Model
{
    use HasFactory;

    protected $table = 'imoveis';

    protected $fillable = [
        'proprietario_id',
        'titulo',
        'descricao',
        'preco',
        'preco_venda',
        'preco_arrendamento',
        'localizacao',
        'tipo',
        'estado',
        'destaque',
        'modalidade',
        'categoria_especial',
        'quartos',
        'casas_banho',
        'area_m2',
        'endereco',
    ];

    protected function casts(): array
    {
        return [
            'preco' => 'decimal:2',
            'preco_venda' => 'decimal:2',
            'preco_arrendamento' => 'decimal:2',
            'area_m2' => 'decimal:2',
            'quartos' => 'integer',
            'casas_banho' => 'integer',
            'destaque' => 'boolean',
        ];
    }

    protected $appends = [
        'is_oculto'
    ];

    // --- Relações ---

    public function proprietario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietario_id');
    }

    public function imagens(): HasMany
    {
        return $this->hasMany(ImovelImagem::class)->orderBy('ordem');
    }

    public function getIsOcultoAttribute(): bool
    {
        if ($this->estado !== 'publicado') {
            return true;
        }

        // Verifica se existe algum contrato ativo que impeça a visibilidade
        return $this->contratos()->whereIn('estado', ['pendente_assinatura', 'assinado'])
            ->where(function (Builder $subQ) {
                $subQ->where('tipo_contrato', 'compra_venda')
                     ->orWhere(function (Builder $rentalQ) {
                         $rentalQ->where('tipo_contrato', 'arrendamento')
                                 ->where(function (Builder $dateQ) {
                                     $dateQ->whereNull('data_fim')
                                           ->orWhere('data_fim', '>=', now()->toDateString());
                                 });
                     });
            })->exists();
    }

    public function contratos(): HasMany
    {
        return $this->hasMany(Contrato::class, 'imovel_id');
    }

    // --- Scopes ---

    public function scopePublicado(Builder $query): Builder
    {
        return $query->where('estado', 'publicado')
            ->whereDoesntHave('contratos', function (Builder $q) {
                // Se estiver assinado ou pendente de assinatura, não mostra
                $q->whereIn('estado', ['pendente_assinatura', 'assinado'])
                  ->where(function (Builder $subQ) {
                      $subQ->where('tipo_contrato', 'compra_venda') // Venda é permanente (até ser rescindido/cancelado)
                           ->orWhere(function (Builder $rentalQ) {
                               $rentalQ->where('tipo_contrato', 'arrendamento')
                                       ->where(function (Builder $dateQ) {
                                           $dateQ->whereNull('data_fim')
                                                 ->orWhere('data_fim', '>=', now()->toDateString());
                                       });
                           });
                  });
            });
    }

    public function scopeDestaque(Builder $query): Builder
    {
        return $query->where('destaque', true);
    }

    public function scopePorModalidade(Builder $query, string $modalidade): Builder
    {
        return $query->where('modalidade', $modalidade);
    }

    public function scopePorCategoria(Builder $query, string $categoria): Builder
    {
        return $query->where('categoria_especial', 'ILIKE', "%{$categoria}%");
    }

    public function scopePorTipo(Builder $query, string $tipo): Builder
    {
        return $query->where('tipo', $tipo);
    }

    public function scopePorLocalizacao(Builder $query, string $localizacao): Builder
    {
        return $query->where('localizacao', 'ILIKE', "%{$localizacao}%");
    }

    public function scopePorPrecoMin(Builder $query, float $min): Builder
    {
        return $query->where(function (Builder $q) use ($min) {
            $q->where('preco', '>=', $min)
              ->orWhere('preco_venda', '>=', $min)
              ->orWhere('preco_arrendamento', '>=', $min);
        });
    }

    public function scopePorPrecoMax(Builder $query, float $max): Builder
    {
        return $query->where(function (Builder $q) use ($max) {
            $q->where('preco', '<=', $max)
              ->orWhere('preco_venda', '<=', $max)
              ->orWhere('preco_arrendamento', '<=', $max);
        });
    }

    public function scopePorQuartos(Builder $query, int $quartos): Builder
    {
        return $query->where('quartos', '>=', $quartos);
    }

    public function scopePesquisa(Builder $query, string $termo): Builder
    {
        return $query->where(function (Builder $q) use ($termo) {
            $q->where('titulo', 'ILIKE', "%{$termo}%")
              ->orWhere('descricao', 'ILIKE', "%{$termo}%")
              ->orWhere('localizacao', 'ILIKE', "%{$termo}%")
              ->orWhere('endereco', 'ILIKE', "%{$termo}%");
        });
    }

    // --- Helpers ---

    public function imagemPrincipal(): ?ImovelImagem
    {
        return $this->imagens->first();
    }
}
