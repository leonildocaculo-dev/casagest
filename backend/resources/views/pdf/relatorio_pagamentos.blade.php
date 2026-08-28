<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Relatório Financeiro</title>
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
        <h2>CasaGest - Relatório Financeiro (Pagamentos)</h2>
        <p>Gerado em: {{ now()->format('d/m/Y H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Cliente</th>
                <th>Contrato #</th>
                <th>Método</th>
                <th>Valor (AOA)</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            @foreach($pagamentos as $pagamento)
            <tr>
                <td>{{ $pagamento->id }}</td>
                <td>{{ $pagamento->created_at ? $pagamento->created_at->format('d/m/Y') : 'N/D' }}</td>
                <td>{{ $pagamento->cliente->name ?? 'N/D' }}</td>
                <td>{{ $pagamento->contrato_id }}</td>
                <td>{{ ucfirst($pagamento->metodo ?? '') }}</td>
                <td>{{ number_format($pagamento->valor ?? 0, 2, ',', '.') }}</td>
                <td>{{ ucfirst($pagamento->estado ?? '') }}</td>
            </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        <p>CasaGest © {{ date('Y') }} - Todos os direitos reservados.</p>
    </div>
</body>
</html>
