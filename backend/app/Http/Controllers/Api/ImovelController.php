<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Imovel;
use App\Models\ImovelImagem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ImovelController extends Controller
{
    /**
     * Listagem pública de imóveis (com filtros e paginação).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Imovel::with(['imagens', 'proprietario:id,name'])
            ->publicado();

        // Filtros
        if ($request->boolean('destaque')) {
            $query->destaque();
        }
        if ($request->filled('modalidade')) {
            $query->porModalidade($request->input('modalidade'));
        }
        if ($request->filled('categoria_especial')) {
            $query->porCategoria($request->input('categoria_especial'));
        }
        if ($request->filled('pesquisa')) {
            $query->pesquisa($request->input('pesquisa'));
        }
        if ($request->filled('tipo')) {
            $query->porTipo($request->input('tipo'));
        }
        if ($request->filled('localizacao')) {
            $query->porLocalizacao($request->input('localizacao'));
        }
        if ($request->filled('preco_min')) {
            $query->porPrecoMin((float) $request->input('preco_min'));
        }
        if ($request->filled('preco_max')) {
            $query->porPrecoMax((float) $request->input('preco_max'));
        }
        if ($request->filled('quartos')) {
            $query->porQuartos((int) $request->input('quartos'));
        }
        if ($request->filled('casas_banho')) {
            $query->where('casas_banho', '>=', (int) $request->input('casas_banho'));
        }

        if ($request->filled('lat') && $request->filled('lng')) {
            $lat = (float) $request->input('lat');
            $lng = (float) $request->input('lng');
            $raio = (float) $request->input('raio', 5); // default 5km

            $haversine = "(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude))))";

            $query->selectRaw("imoveis.*, {$haversine} AS distancia", [$lat, $lng, $lat])
                  ->whereRaw("{$haversine} <= ?", [$lat, $lng, $lat, $raio])
                  ->orderBy('distancia', 'asc');
        } else {
            $query->select('imoveis.*');
            
            // Ordenação normal se não for por distância
            $sortField = $request->input('ordenar', 'created_at');
            $sortDir = $request->input('direcao', 'desc');
            $allowedSorts = ['preco', 'created_at', 'area_m2', 'quartos'];
            if (in_array($sortField, $allowedSorts)) {
                $query->orderBy($sortField, $sortDir === 'asc' ? 'asc' : 'desc');
            }
        }

        $imoveis = $query->paginate($request->input('por_pagina', 12));

        return response()->json($imoveis);
    }

    /**
     * Listagem de imóveis para o proprietário autenticado (todos os estados).
     */
    public function meusImoveis(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $query = Imovel::with('imagens')
            ->where('proprietario_id', $user->id);

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }

        $imoveis = $query->orderByDesc('created_at')
            ->paginate($request->input('por_pagina', 12));

        return response()->json($imoveis);
    }

    /**
     * Listagem admin — todos os imóveis com filtro por estado.
     */
    public function adminIndex(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        Gate::authorize('create', Imovel::class);

        $query = Imovel::with(['imagens', 'proprietario:id,name,email']);

        if ($request->filled('estado')) {
            $query->where('estado', $request->input('estado'));
        }
        if ($request->filled('pesquisa')) {
            $query->pesquisa($request->input('pesquisa'));
        }

        $imoveis = $query->orderByDesc('created_at')
            ->paginate($request->input('por_pagina', 15));

        return response()->json($imoveis);
    }

    /**
     * Detalhes de um imóvel.
     */
    public function show(Imovel $imovel): JsonResponse
    {
        $imovel->load(['imagens', 'proprietario:id,name,phone']);

        // Visitante só vê publicados
        if ($imovel->estado !== 'publicado') {
            $user = request()->user();
            if (! $user || (! $user->isAdmin() && $user->id !== $imovel->proprietario_id)) {
                abort(404, 'Imóvel não encontrado.');
            }
        }

        return response()->json(['imovel' => $imovel]);
    }

    /**
     * Criar novo imóvel (proprietário ou admin).
     */
    public function store(Request $request): JsonResponse
    {
        Gate::authorize('create', Imovel::class);

        $validated = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descricao' => ['required', 'string', 'max:5000'],
            'preco' => ['nullable', 'numeric', 'min:0'],
            'preco_venda' => ['nullable', 'numeric', 'min:0'],
            'preco_arrendamento' => ['nullable', 'numeric', 'min:0'],
            'localizacao' => ['required', 'string', 'max:255'],
            'tipo' => ['required', Rule::in(['apartamento', 'vivenda', 'escritorio', 'terreno', 'loja'])],
            'modalidade' => ['nullable', Rule::in(['arrendamento', 'venda', 'ambos'])],
            'destaque' => ['nullable', 'boolean'],
            'categoria_especial' => ['nullable', 'string', 'max:255'],
            'quartos' => ['nullable', 'integer', 'min:0', 'max:50'],
            'casas_banho' => ['nullable', 'integer', 'min:0', 'max:20'],
            'area_m2' => ['nullable', 'numeric', 'min:0'],
            'endereco' => ['nullable', 'string', 'max:500'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        // Calculo automático de arrendamento (240x menor que o preço de venda)
        $precoBase = $validated['preco_venda'] ?? $validated['preco'] ?? 0;
        if (in_array($validated['modalidade'] ?? 'ambos', ['arrendamento', 'ambos']) && $precoBase > 0) {
            $validated['preco_arrendamento'] = $precoBase / 240;
        }

        /** @var Imovel $imovel */
        $imovel = Imovel::create([
            ...$validated,
            'proprietario_id' => $user->id,
            'estado' => 'pendente',
            'quartos' => $validated['quartos'] ?? 0,
            'casas_banho' => $validated['casas_banho'] ?? 0,
        ]);

        \App\Services\AuditLogService::log('imovel_criado', $user->id, 'Imovel', $imovel->id, ['titulo' => $imovel->titulo]);

        return response()->json([
            'message' => 'Imóvel criado com sucesso. Aguarda aprovação do administrador.',
            'imovel' => $imovel->load('imagens'),
        ], 201);
    }

    /**
     * Atualizar imóvel existente.
     */
    public function update(Request $request, Imovel $imovel): JsonResponse
    {
        Gate::authorize('update', $imovel);

        $validated = $request->validate([
            'titulo' => ['sometimes', 'string', 'max:255'],
            'descricao' => ['sometimes', 'string', 'max:5000'],
            'preco' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'preco_venda' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'preco_arrendamento' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'localizacao' => ['sometimes', 'string', 'max:255'],
            'tipo' => ['sometimes', Rule::in(['apartamento', 'vivenda', 'escritorio', 'terreno', 'loja'])],
            'modalidade' => ['sometimes', 'nullable', Rule::in(['arrendamento', 'venda', 'ambos'])],
            'quartos' => ['sometimes', 'integer', 'min:0', 'max:50'],
            'casas_banho' => ['sometimes', 'integer', 'min:0', 'max:20'],
            'area_m2' => ['sometimes', 'nullable', 'numeric', 'min:0'],
            'endereco' => ['sometimes', 'nullable', 'string', 'max:500'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
        ]);

        // Calculo automático de arrendamento (240x menor que o preço de venda)
        $modalidade = $validated['modalidade'] ?? $imovel->modalidade;
        $precoBase = $validated['preco_venda'] ?? $validated['preco'] ?? $imovel->preco_venda ?? $imovel->preco ?? 0;
        if (in_array($modalidade, ['arrendamento', 'ambos']) && $precoBase > 0) {
            $validated['preco_arrendamento'] = $precoBase / 240;
        }

        $imovel->update($validated);

        return response()->json([
            'message' => 'Imóvel atualizado com sucesso.',
            'imovel' => $imovel->fresh(['imagens']),
        ]);
    }

    /**
     * Remover imóvel.
     */
    public function destroy(Imovel $imovel): JsonResponse
    {
        Gate::authorize('delete', $imovel);

        // Apagar imagens do storage
        foreach ($imovel->imagens as $imagem) {
            Storage::disk('public')->delete($imagem->caminho);
        }

        $imovel->delete();

        return response()->json(['message' => 'Imóvel removido com sucesso.']);
    }

    /**
     * Admin aprova um imóvel (pendente → publicado).
     */
    public function aprovar(Request $request, Imovel $imovel): JsonResponse
    {
        Gate::authorize('aprovar', $imovel);

        $user = $request->user();
        $acao = $request->input('acao', 'aprovar'); // 'aprovar' ou 'rejeitar'

        if ($acao === 'rejeitar') {
            $imovel->update(['estado' => 'inativo']);
            \App\Services\AuditLogService::log('imovel_rejeitado', $user->id, 'Imovel', $imovel->id);
            return response()->json(['message' => 'Imóvel rejeitado.', 'imovel' => $imovel]);
        }

        $imovel->update(['estado' => 'publicado']);
        \App\Services\AuditLogService::log('imovel_aprovado', $user->id, 'Imovel', $imovel->id);

        return response()->json(['message' => 'Imóvel aprovado e publicado.', 'imovel' => $imovel]);
    }

    /**
     * Upload de imagens para um imóvel.
     */
    public function uploadImagens(Request $request, Imovel $imovel): JsonResponse
    {
        Gate::authorize('update', $imovel);

        $request->validate([
            'imagens' => ['required', 'array', 'min:1', 'max:10'],
            'imagens.*' => ['required', 'image', 'mimes:jpeg,jpg,png,webp', 'max:5120'], // 5MB max
        ]);

        $novasImagens = [];
        $totalAtual = $imovel->imagens()->count();
        $quantidadeNovas = count($request->file('imagens'));

        if ($totalAtual + $quantidadeNovas > 20) {
            return response()->json([
                'message' => 'O limite máximo é de 20 imagens por imóvel. Atualmente tem ' . $totalAtual . ' imagens e tentou enviar mais ' . $quantidadeNovas . '.'
            ], 422);
        }

        $ordemAtual = $imovel->imagens()->max('ordem') ?? 0;

        foreach ($request->file('imagens') as $file) {
            $ordemAtual++;
            $caminho = $file->store('imoveis/' . $imovel->id, 'public');

            $novasImagens[] = ImovelImagem::create([
                'imovel_id' => $imovel->id,
                'caminho' => $caminho,
                'ordem' => $ordemAtual,
            ]);
        }

        return response()->json([
            'message' => count($novasImagens) . ' imagem(ns) carregada(s) com sucesso.',
            'imagens' => $novasImagens,
        ], 201);
    }

    /**
     * Remover uma imagem específica de um imóvel.
     */
    public function removerImagem(Imovel $imovel, ImovelImagem $imagem): JsonResponse
    {
        Gate::authorize('update', $imovel);

        if ($imagem->imovel_id !== $imovel->id) {
            abort(404, 'Imagem não encontrada neste imóvel.');
        }

        Storage::disk('public')->delete($imagem->caminho);
        $imagem->delete();

        return response()->json(['message' => 'Imagem removida com sucesso.']);
    }
}
