<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório de Imóveis</title>
    <style>
        body { font-family: sans-serif; font-size: 12px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .header { text-align: center; margin-bottom: 30px; }
        .footer { position: fixed; bottom: 0; width: 100%; text-align: center; font-size: 10px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h2>CasaGest - Relatório de Imóveis</h2>
        <p>Gerado em: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Tipo</th>
                <th>Finalidade</th>
                <th>Preço (AOA)</th>
                <th>Estado</th>
                <th>Proprietário</th>
            </tr>
        </thead>
        <tbody>
            @foreach($imoveis as $imovel)
            <tr>
                <td>{{ $imovel->id }}</td>
                <td>{{ $imovel->titulo ?? 'N/D' }}</td>
                <td>{{ ucfirst($imovel->tipo ?? '') }}</td>
                <td>{{ ucfirst($imovel->finalidade ?? '') }}</td>
                <td>{{ number_format($imovel->preco ?? 0, 2, ',', '.') }}</td>
                <td>{{ ucfirst($imovel->estado ?? '') }}</td>
                <td>{{ $imovel->proprietario->name ?? 'N/D' }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>CasaGest © {{ date('Y') }} - Todos os direitos reservados.</p>
    </div>
</body>
</html>
