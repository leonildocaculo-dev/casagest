'use client';
import { resolveImageUrl } from '@/lib/utils';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Heart, Loader2, MapPin, Bed, Bath, Maximize, ArrowLeft, Building2, Trash2 } from 'lucide-react';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  localizacao: string;
  tipo: string;
  modalidade: string;
  quartos: number;
  casas_banho: number;
  area_m2: string | null;
  imagens: { caminho: string }[];
}

export default function FavoritosPage() {
  const { user, favoriteIds, toggleFavorite } = useAuth();
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'cliente') {
      router.push('/');
      return;
    }

    const fetchFavoritos = async () => {
      try {
        const res = await api.get('/favoritos');
        setImoveis(res.data.data);
      } catch (err) {
        console.error('Erro ao carregar favoritos:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchFavoritos();
  }, [user, router]);

  const handleRemove = async (imovelId: number) => {
    const isFav = await toggleFavorite(imovelId);
    if (!isFav) {
      setImoveis((prev) => prev.filter((i) => i.id !== imovelId));
    }
  };

  const formatPrice = (val: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(val));

  if (!user || user.role !== 'cliente') return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/cliente" className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
              Meus Favoritos <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Os imóveis que tem debaixo de olho.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : imoveis.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-4">
            <Heart className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Ainda não tem favoritos</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Explore o nosso catálogo e guarde os imóveis que mais gostar para aceder facilmente mais tarde.
            </p>
            <Link
              href="/imoveis"
              className="inline-block px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm transition-all"
            >
              Explorar Catálogo
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveis.map((imovel) => (
              <div key={imovel.id} className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300 flex flex-col relative">
                <Link href={`/imoveis/${imovel.id}`} className="block relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  {imovel.imagens && imovel.imagens.length > 0 ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={resolveImageUrl(imovel.imagens?.[0]?.caminho)}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-slate-300" /></div>
                  )}
                  <span className="absolute top-3 left-3 px-3 py-1 bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase rounded-lg">
                    {imovel.modalidade || 'Arrendamento'}
                  </span>
                </Link>

                <button
                  type="button"
                  onClick={() => handleRemove(imovel.id)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 rounded-full shadow-md hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors z-20 group/btn"
                  title="Remover dos favoritos"
                >
                  <Trash2 className="w-4 h-4 text-slate-400 group-hover/btn:text-rose-500 transition-colors" />
                </button>

                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-base line-clamp-1">
                      {imovel.titulo}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 line-clamp-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 text-primary shrink-0" /> {imovel.localizacao}
                    </p>

                    <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800">
                      {imovel.quartos > 0 && (
                        <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5 text-primary" /> {imovel.quartos}</span>
                      )}
                      {imovel.casas_banho > 0 && (
                        <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5 text-primary" /> {imovel.casas_banho}</span>
                      )}
                      {imovel.area_m2 && (
                        <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5 text-primary" /> {Number(imovel.area_m2)}m²</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="pt-4 flex justify-between items-end">
                    <div className="text-lg font-black text-primary">
                      {formatPrice(imovel.preco)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
