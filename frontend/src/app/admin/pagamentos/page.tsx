import { resolveImageUrl } from '@/lib/utils';
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  Check,
  X,
  Loader2,
  Download
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface Pagamento {
  id: number;
  contrato_id: number;
  cliente_id: number;
  valor: string;
  metodo: 'referencia' | 'transferencia_bancaria';
  entidade: string | null;
  referencia: string | null;
  comprovativo_caminho: string | null;
  comprovativo_nome_original: string | null;
  estado: 'pendente' | 'em_analise' | 'pago' | 'rejeitado' | 'expirado';
  created_at: string;
  contrato: {
    id: number;
    imovel?: { titulo: string };
    proprietario?: { name: string };
  };
  cliente: { name: string; email: string };
}

interface PaginatedResponse {
  data: Pagamento[];
  current_page: number;
  last_page: number;
  total: number;
}

const estadoStyles: Record<string, string> = {
  pago: 'bg-emerald-100 text-emerald-800 font-bold',
  em_analise: 'bg-sky-100 text-sky-800 font-black animate-pulse',
  pendente: 'bg-amber-100 text-amber-800 font-bold',
  rejeitado: 'bg-rose-100 text-rose-800 font-bold',
  expirado: 'bg-slate-100 text-slate-600',
};

export default function AdminPagamentosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const fetchPagamentos = async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      params.set('por_pagina', '15');
      if (estadoFiltro) params.set('estado', estadoFiltro);

      const res = await api.get<PaginatedResponse>(`/pagamentos?${params.toString()}`);
      setPagamentos(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active && user?.role === 'admin') {
        await fetchPagamentos(1);
      }
    };
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, estadoFiltro]);

  const handleValidarComprovativo = async (pagamentoId: number, acao: 'aprovar' | 'rejeitar') => {
    setActionLoading(pagamentoId);
    try {
      await api.post(`/pagamentos/${pagamentoId}/validar-comprovativo`, { acao });
      fetchPagamentos(page);
    } catch (err) {
      console.error('Erro ao validar comprovativo:', err);
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
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Validação de Pagamentos & Comprovativos</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Inspecione comprovativos de transferência e liquidações por Referência Multicaixa.
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar pagamento..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-xs"
            />
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
            onClick={() => setEstadoFiltro('em_analise')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              estadoFiltro === 'em_analise' ? 'bg-sky-500 text-white font-black shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-sky-50'
            }`}
          >
            Em Análise (Comprovativos)
          </button>
          <button
            onClick={() => setEstadoFiltro('pago')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              estadoFiltro === 'pago' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Pagos
          </button>
          <button
            onClick={() => setEstadoFiltro('pendente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              estadoFiltro === 'pendente' ? 'bg-amber-400 text-purple-950 font-black shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
            }`}
          >
            Pendentes Multicaixa
          </button>
        </div>

        {/* Pagamentos Action Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : pagamentos.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-bold">
              Nenhum pagamento encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Ref / Contrato</th>
                    <th className="py-3 px-4">Cliente</th>
                    <th className="py-3 px-4">Valor (AOA)</th>
                    <th className="py-3 px-4">Método</th>
                    <th className="py-3 px-4">Comprovativo</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Ação Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {pagamentos.map((pag) => (
                    <tr key={pag.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-black text-purple-950 block">#PAG-{pag.id}</span>
                        <span className="text-[11px] text-slate-400 font-medium">Contrato #{pag.contrato_id}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="block font-black text-slate-900">{pag.cliente?.name}</span>
                        <span className="text-[11px] text-slate-400 font-normal">{pag.cliente?.email}</span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-950 font-black">{formatPrice(pag.valor)}</td>
                      <td className="py-3.5 px-4">
                        {pag.metodo === 'referencia' ? (
                          <span className="text-[11px] text-purple-700 font-black">
                            Ent: {pag.entidade} | Ref: {pag.referencia}
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-600 font-bold">Transferência Bancária</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        {pag.comprovativo_caminho ? (
                          <a
                            href={resolveImageUrl(pag.comprovativo_caminho)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-100 text-purple-900 rounded-lg text-[11px] font-black hover:bg-purple-200 transition-colors"
                          >
                            <Download className="w-3 h-3" /> Ver Anexo
                          </a>
                        ) : (
                          <span className="text-slate-400 font-normal text-[11px]">N/A</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full uppercase text-[10px] ${estadoStyles[pag.estado] || estadoStyles.expirado}`}>
                          {pag.estado}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {pag.metodo === 'transferencia_bancaria' && pag.estado === 'em_analise' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleValidarComprovativo(pag.id, 'aprovar')}
                              disabled={actionLoading === pag.id}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center gap-1"
                            >
                              {actionLoading === pag.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                              Aprovar
                            </button>

                            <button
                              onClick={() => handleValidarComprovativo(pag.id, 'rejeitar')}
                              disabled={actionLoading === pag.id}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center gap-1"
                            >
                              <X className="w-3 h-3" /> Rejeitar
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] font-normal">Sem ação pendente</span>
                        )}
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
              <span>Página {page} de {lastPage} ({total} pagamentos)</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchPagamentos(page - 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= lastPage}
                  onClick={() => fetchPagamentos(page + 1)}
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
            <p className="text-xs text-purple-700 font-extrabold uppercase mt-0.5">Módulo de Pagamentos</p>
          </div>
          <button
            onClick={() => fetchPagamentos(page)}
            className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
          >
            Atualizar Pagamentos
          </button>
        </div>
      </aside>

    </div>
  );
}
