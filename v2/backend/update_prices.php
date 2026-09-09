<?php
$imoveis = App\Models\Imovel::whereIn('modalidade', ['arrendamento', 'ambos'])->get();
foreach($imoveis as $imovel) {
    $novoPreco = rand(50, 300) * 1000;
    $imovel->preco_arrendamento = $novoPreco;
    if ($imovel->modalidade === 'arrendamento') {
        $imovel->preco = $novoPreco;
    }
    $imovel->save();
}
echo "Preços de arrendamento atualizados!\n";
