'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { EmptyState } from '@/components/EmptyState';
import { Building2, Plus, Edit, Trash2, Eye, MapPin, Loader2, LogIn } from 'lucide-react';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  localizacao: string;
  estado: string;
  destaque: boolean;
  is_oculto?: boolean;
  imagens?: { id: number; caminho: string }[];
  created_at: string;
}

const estadoBadges: Record<string, { label: string; style: string }> = {
  pendente: { label: 'Pendente Aprovação', style: 'bg-amber-100 text-amber-800' },
  publicado: { label: 'Publicado', style: 'bg-emerald-100 text-emerald-800' },
  reservado: { label: 'Reservado', style: 'bg-indigo-100 text-indigo-800' },
  vendido: { label: 'Vendido/Arrendado', style: 'bg-slate-100 text-slate-800' },
};

export default function MeusImoveisPage() {
  const { user } = useAuth();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchImoveis = async () => {
    try {
      const res = await api.get('/meus-imoveis');
      setImoveis(res.data.data || res.data); // Dependendo de como a API devolve (paginado ou não)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401 || axiosErr.response?.status === 403) {
        setIsUnauthorized(true);
      } else {
        console.error('Erro ao carregar imóveis:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active && user) {
        await fetchImoveis();
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  // Derived state to avoid setState synchronously on mount
  const showUnauthorized = isUnauthorized || !user;

  const handleDelete = async (id: number) => {
    if (!confirm('Tem a certeza que deseja remover este imóvel? Esta ação é irreversível.')) return;
    
    setDeletingId(id);
    try {
      await api.delete(`/imoveis/${id}`);
      setImoveis(imoveis.filter(i => i.id !== id));
    } catch (err) {
      console.error('Erro ao remover imóvel:', err);
      alert('Erro ao remover imóvel.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 rounded-xl">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Os Meus Imóveis</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Gira as propriedades que tem listadas no sistema.
              </p>
            </div>
          </div>
          <Link
            href="/imoveis/novo"
            className="px-6 py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" /> Adicionar Imóvel
          </Link>
        </div>

        {/* Content */}
        {loading && !showUnauthorized ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse h-32" />
            ))}
          </div>
        ) : showUnauthorized ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <LogIn className="w-16 h-16 text-purple-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Autenticação Necessária</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Faça login na sua conta CasaGest para gerir os seus imóveis.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-950 text-amber-300 font-bold rounded-xl text-xs shadow-md">
              <LogIn className="w-4 h-4" /> Iniciar Sessão
            </Link>
          </div>
        ) : imoveis.length === 0 ? (
          <EmptyState 
            icon={Building2} 
            title="Nenhum imóvel registado" 
            description="Ainda não adicionou nenhum imóvel à plataforma." 
            actionText="Anunciar o meu primeiro imóvel →" 
            actionHref="/imoveis/novo" 
          />
        ) : (
          <div className="space-y-4">
            {imoveis.map((imovel) => {
              const badge = estadoBadges[imovel.estado] || estadoBadges.pendente;

              return (
                <div key={imovel.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                  {/* Image */}
                  <div className="relative w-full sm:w-48 h-32 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0">
                    {imovel.imagens && imovel.imagens.length > 0 ? (
                      <Image src={`http://localhost:8000/storage/${imovel.imagens[0].caminho}`} alt="" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-slate-300" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/imoveis/${imovel.id}`} className="font-bold text-lg text-slate-800 dark:text-white hover:text-purple-600 transition-colors line-clamp-1">
                          {imovel.titulo}
                        </Link>
                        <div className="flex items-center gap-1">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 ${badge.style}`}>
                            {badge.label}
                          </span>
                          {imovel.is_oculto && imovel.estado === 'publicado' && (
                            <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide shrink-0 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                              Oculto (Contrato Ativo)
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-black text-purple-700 dark:text-amber-400 mt-1">
                        {formatPrice(imovel.preco)}
                      </p>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-2">
                        <MapPin className="w-3.5 h-3.5" /> {imovel.localizacao}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Adicionado em: {formatDate(imovel.created_at)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/imoveis/${imovel.id}`}
                        className="p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Ver página"
                      >
                        <Eye className="w-4 h-4" /> Ver
                      </Link>
                      <Link
                        href={`/imoveis/${imovel.id}/editar`}
                        className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" /> Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(imovel.id)}
                        disabled={deletingId === imovel.id}
                        className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold ml-auto"
                        title="Apagar"
                      >
                        {deletingId === imovel.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Apagar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
