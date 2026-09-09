<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <title>Contrato de Arrendamento - CasaGest</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; color: #1e293b; line-height: 1.6; margin: 30px; }
        .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 15px; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .title { font-size: 18px; font-weight: bold; margin-top: 10px; color: #0f172a; text-transform: uppercase; letter-spacing: 1px; }
        .section { margin-bottom: 25px; }
        .section-title { font-size: 14px; font-weight: bold; color: #4f46e5; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 12px; }
        .grid { width: 100%; margin-bottom: 10px; }
        .grid td { padding: 5px 0; vertical-align: top; }
        .label { font-weight: bold; color: #64748b; width: 30%; }
        .value { color: #0f172a; }
        .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; font-size: 12px; }
        .signatures { margin-top: 50px; width: 100%; }
        .signatures td { width: 50%; text-align: center; vertical-align: bottom; }
        .line { border-top: 1px solid #94a3b8; width: 80%; margin: 0 auto 8px auto; }
        .footer { text-align: center; font-size: 10px; color: #94a3b8; margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">CasaGest</div>
        <div class="title">Contrato de Arrendamento de Imóvel</div>
        <div style="font-size: 11px; color: #64748b; margin-top: 5px;">Documento Gerado Automáticamente · ID #{{ $contrato->id }}</div>
    </div>

    <!-- Partes Envolvidas -->
    <div class="section">
        <div class="section-title">1. Partes Contratantes</div>
        <table class="grid">
            <tr>
                <td class="label">Senhorio (Proprietário):</td>
                <td class="value"><strong>{{ $contrato->proprietario->name }}</strong> (E-mail: {{ $contrato->proprietario->email }}, Tel: {{ $contrato->proprietario->phone ?? 'N/D' }})</td>
            </tr>
            <tr>
                <td class="label">Inquilino (Cliente):</td>
                <td class="value"><strong>{{ $contrato->cliente->name }}</strong> (E-mail: {{ $contrato->cliente->email }}, Tel: {{ $contrato->cliente->phone ?? 'N/D' }})</td>
            </tr>
        </table>
    </div>

    <!-- Objeto do Contrato -->
    <div class="section">
        <div class="section-title">2. Objeto do Contrato (Imóvel)</div>
        <table class="grid">
            <tr>
                <td class="label">Imóvel:</td>
                <td class="value"><strong>{{ $contrato->imovel->titulo }}</strong></td>
            </tr>
            <tr>
                <td class="label">Tipo:</td>
                <td class="value">{{ ucfirst($contrato->imovel->tipo) }}</td>
            </tr>
            <tr>
                <td class="label">Localização / Endereço:</td>
                <td class="value">{{ $contrato->imovel->localizacao }} {{ $contrato->imovel->endereco ? '— '.$contrato->imovel->endereco : '' }}</td>
            </tr>
        </table>
    </div>

    <!-- Condições Financeiras e Prazos -->
    <div class="section">
        <div class="section-title">3. Condições Financeiras e Período</div>
        <table class="grid">
            <tr>
                <td class="label">Valor Acordado:</td>
                <td class="value"><strong style="font-size: 15px; color: #4f46e5;">{{ number_format($contrato->valor_acordado, 2, ',', '.') }} AOA</strong></td>
            </tr>
            <tr>
                <td class="label">Data de Início:</td>
                <td class="value">{{ $contrato->data_inicio ? $contrato->data_inicio->format('d/m/Y') : 'A definir' }}</td>
            </tr>
            <tr>
                <td class="label">Data de Término:</td>
                <td class="value">{{ $contrato->data_fim ? $contrato->data_fim->format('d/m/Y') : 'Renovável' }}</td>
            </tr>
        </table>
    </div>

    <!-- Cláusulas Adicionais -->
    @if($contrato->termos_adicionais)
    <div class="section">
        <div class="section-title">4. Cláusulas e Termos Adicionais</div>
        <div class="box">
            {!! nl2br(e($contrato->termos_adicionais)) !!}
        </div>
    </div>
    @endif

    <!-- Assinaturas -->
    <table class="signatures">
        <tr>
            <td>
                <div class="line"></div>
                <strong>{{ $contrato->proprietario->name }}</strong><br>
                <span style="font-size: 11px; color: #64748b;">Senhorio / Proprietário</span>
            </td>
            <td>
                <div class="line"></div>
                <strong>{{ $contrato->cliente->name }}</strong><br>
                <span style="font-size: 11px; color: #64748b;">Inquilino / Cliente</span>
            </td>
        </tr>
    </table>

    <div class="footer">
        CasaGest — Plataforma Inteligente de Gestão Imobiliária · {{ date('Y') }} · Todos os direitos reservados.
    </div>
</body>
</html>
