<?php

namespace App\Exports;

use App\Models\Pagamento;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class PagamentosExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return Pagamento::with(['cliente:id,name,email', 'contrato'])->orderByDesc('created_at')->get();
    }

    public function headings(): array
    {
        return [
            'ID Pagamento',
            'Contrato ID',
            'Cliente',
            'Método',
            'Valor (AOA)',
            'Referência',
            'Estado',
            'Data Criado',
        ];
    }

    public function map($pagamento): array
    {
        return [
            $pagamento->id,
            $pagamento->contrato_id,
            $pagamento->cliente?->name ?? '',
            $pagamento->metodo,
            $pagamento->valor,
            $pagamento->referencia_multicaixa ?? 'N/D',
            $pagamento->estado,
            $pagamento->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
