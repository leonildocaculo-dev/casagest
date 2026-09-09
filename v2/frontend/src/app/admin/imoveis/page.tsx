'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  Check,
  X,
  Eye,
  Loader2,
  PlusCircle
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  localizacao: string;
  tipo: string;
  estado: string;
  quartos: number;
  created_at: string;
  proprietario?: { id: number; name: string; email: string };
  imagens: { id: number; caminho: string }[];
}

interface PaginatedResponse {
  data: Imovel[];
  current_page: number;
  last_page: number;
  total: number;
}

const estadoStyles: Record<string, string> = {
  publicado: 'bg-emerald-100 text-emerald-800',
  pendente: 'bg-amber-100 text-amber-800 font-extrabold animate-pulse',
  reservado: 'bg-blue-100 text-blue-800',
  vendido: 'bg-rose-100 text-rose-800',
  inativo: 'bg-slate-100 text-slate-600',
};

export default function AdminImoveisPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [pesquisa, setPesquisa] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const fetchImoveis = async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('por_pagina', '15');
      if (estadoFiltro) params.set('estado', estadoFiltro);
      if (pesquisa) params.set('pesquisa', pesquisa);

      const res = await api.get<PaginatedResponse>(`/admin/imoveis?${params.toString()}`);
      setImoveis(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active && user?.role === 'admin') {
        await fetchImoveis(1);
      }
    };
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, estadoFiltro]);

  const handleAction = async (imovelId: number, acao: 'aprovar' | 'rejeitar') => {
    setActionLoading(imovelId);
    try {
      await api.post(`/imoveis/${imovelId}/aprovar`, { acao });
      fetchImoveis(page);
    } catch (err) {
      console.error('Erro na ação:', err);
    } finally {
      setActionLoading(null);
    }
  };

  const formatPrice = (val: string) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(val));

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row">
      
      <AdminSidebar stats={{ total }} />

      {/* 2. MAIN MIDDLE CONTENT */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestão & Aprovação de Imóveis</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Valide e publique os anúncios submetidos pelos proprietários ({total} registados).
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Pesquisar imóvel..."
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchImoveis(1)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-xs"
              />
            </div>

            <Link
              href="/imoveis/novo"
              className="px-4 py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all shrink-0 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" /> Novo Anúncio
            </Link>
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setEstadoFiltro('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !estadoFiltro ? 'bg-purple-950 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50'
            }`}
          >
            Todos ({total})
          </button>
          <button
            onClick={() => setEstadoFiltro('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              estadoFiltro === 'pendente' ? 'bg-amber-400 text-purple-950 font-black shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
            }`}
          >
            Pendentes de Aprovação
          </button>
          <button
            onClick={() => setEstadoFiltro('publicado')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              estadoFiltro === 'publicado' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Publicados
          </button>
        </div>

        {/* Imóveis Action Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : imoveis.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-bold">
              Nenhum imóvel encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Imóvel</th>
                    <th className="py-3 px-4">Proprietário</th>
                    <th className="py-3 px-4">Localização / Tipo</th>
                    <th className="py-3 px-4">Preço</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Ações de Aprovação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {imoveis.map((imovel) => (
                    <tr key={imovel.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-slate-900 block">{imovel.titulo}</span>
                        <span className="text-[11px] text-slate-400 font-medium">Cadastrado em {new Date(imovel.created_at).toLocaleDateString('pt-PT')}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-bold">{imovel.proprietario?.name || 'Sistema'}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{imovel.proprietario?.email}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-bold">{imovel.localizacao}</span>
                        <span className="text-[11px] text-slate-400 uppercase">{imovel.tipo}</span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-950 font-black">{formatPrice(imovel.preco)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full uppercase text-[10px] font-black ${estadoStyles[imovel.estado] || estadoStyles.inativo}`}>
                          {imovel.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/imoveis/${imovel.id}`}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all"
                            title="Ver Imóvel"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>

                          {imovel.estado === 'pendente' && (
                            <>
                              <button
                                onClick={() => handleAction(imovel.id, 'aprovar')}
                                disabled={actionLoading === imovel.id}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center gap-1"
                              >
                                {actionLoading === imovel.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Aprovar
                              </button>

                              <button
                                onClick={() => handleAction(imovel.id, 'rejeitar')}
                                disabled={actionLoading === imovel.id}
                                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center gap-1"
                              >
                                <X className="w-3 h-3" /> Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {lastPage > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <span>Página {page} de {lastPage} ({total} imóveis)</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchImoveis(page - 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= lastPage}
                  onClick={() => fetchImoveis(page + 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* 3. RIGHT SIDEBAR PANEL */}
      <aside className="w-full lg:w-80 bg-white border-l border-slate-200 p-6 space-y-6 shrink-0 shadow-xs">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-purple-950 text-amber-300 rounded-full border-4 border-white shadow-md flex items-center justify-center font-black text-xl">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-sm">{user.name}</h3>
            <p className="text-xs text-purple-700 font-extrabold uppercase mt-0.5">Módulo de Imóveis</p>
          </div>
          <button
            onClick={() => fetchImoveis(page)}
            className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
          >
            Atualizar Lista
          </button>
        </div>
      </aside>

    </div>
  );
}
