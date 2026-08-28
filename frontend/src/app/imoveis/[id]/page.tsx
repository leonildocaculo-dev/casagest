import { Metadata } from 'next';
import ImovelDetalheClient from './client';

type Props = {
  params: { id: string };
};

// Gerar Metadados Dinâmicos (SEO, OpenGraph, Twitter Cards)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    // Busca os dados do imóvel diretamente da API para SEO
    const res = await fetch(`http://127.0.0.1:8000/api/imoveis/${params.id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Falha ao buscar imóvel');
    
    const data = await res.json();
    const imovel = data.imovel;
    
    const titulo = `${imovel.titulo} - CasaGest`;
    const descricao = imovel.descricao.substring(0, 160) + '...';
    const preco = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(imovel.preco));
    const imageUrl = imovel.imagens && imovel.imagens.length > 0 
      ? `http://127.0.0.1:8000/storage/${imovel.imagens[0].caminho}` 
      : 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80';

    return {
      title: titulo,
      description: descricao,
      keywords: `imóvel, luanda, angola, ${imovel.tipo}, ${imovel.modalidade}, ${imovel.localizacao}`,
      openGraph: {
        title: titulo,
        description: `${preco} | ${descricao}`,
        type: 'website',
        locale: 'pt_AO',
        url: `http://localhost:3000/imoveis/${params.id}`,
        siteName: 'CasaGest',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: imovel.titulo,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: titulo,
        description: `${preco} | ${descricao}`,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: 'Imóvel - CasaGest',
      description: 'Detalhes do imóvel na plataforma CasaGest.',
    };
  }
}

// O componente de Servidor repassa os params para o componente Cliente
export default function ImovelPage() {
  return <ImovelDetalheClient />;
}
