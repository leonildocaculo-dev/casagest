<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Imovel;
use Illuminate\Http\Request;

class FavoritoController extends Controller
{
    public function index(Request $request)
    {
        $favoritos = $request->user()->favoritos()->with('imagens')->paginate(12);
        return response()->json($favoritos);
    }

    public function toggle(Request $request, Imovel $imovel)
    {
        $user = $request->user();
        
        $exists = $user->favoritos()->where('imovel_id', $imovel->id)->exists();
        
        if ($exists) {
            $user->favoritos()->detach($imovel->id);
            return response()->json(['message' => 'Removido dos favoritos', 'is_favorito' => false]);
        } else {
            $user->favoritos()->attach($imovel->id);
            return response()->json(['message' => 'Adicionado aos favoritos', 'is_favorito' => true]);
        }
    }
}
