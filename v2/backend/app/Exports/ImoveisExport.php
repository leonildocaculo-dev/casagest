<?php

namespace App\Exports;

use App\Models\Imovel;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ImoveisExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    public function collection()
    {
        return Imovel::with('proprietario:id,name,email')->orderByDesc('created_at')->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Título',
            'Tipo',
            'Finalidade',
            'Preço (AOA)',
            'Estado',
            'Localização',
            'Proprietário',
            'Email Proprietário',
            'Data Criado',
        ];
    }

    public function map($imovel): array
    {
        return [
            $imovel->id,
            $imovel->titulo,
            $imovel->tipo,
            $imovel->finalidade,
            $imovel->preco,
            $imovel->estado,
            $imovel->localizacao,
            $imovel->proprietario?->name ?? '',
            $imovel->proprietario?->email ?? '',
            $imovel->created_at->format('Y-m-d H:i:s'),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
