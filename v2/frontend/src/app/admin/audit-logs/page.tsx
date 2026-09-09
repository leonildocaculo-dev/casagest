'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { ShieldAlert, Search, Loader2, User, Clock, HardDrive, Activity } from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface AuditLog {
  id: number;
  user_id: number | null;
  acao: string;
  modelo: string | null;
  modelo_id: number | null;
  detalhes: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchLogs = async (search = '', page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs', {
        params: { pesquisa: search, page },
      });
      setLogs(res.data.data);
      setTotalPaginas(res.data.last_page || 1);
    } catch (err) {
      console.error('Erro ao carregar logs de auditoria:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) await fetchLogs(pesquisa, pagina);
    };
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagina]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(1);
    fetchLogs(pesquisa, 1);
  };

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).format(new Date(dateStr));

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Logs de Auditoria do Sistema</h1>
              <p className="text-xs text-slate-500">Histórico detalhado de ações, acessos e modificações efetuadas por utilizadores.</p>
            </div>
          </div>
        </div>

        {/* Barra de Pesquisa */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar por ação, modelo ou endereço IP..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-sm"
            />
          </div>
          <button type="submit" className="px-4 py-2.5 bg-purple-950 hover:bg-purple-900 text-white rounded-xl text-xs font-semibold shadow-sm">
            Filtrar
          </button>
        </form>

        {/* Tabela de Audit Logs */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2">A carregar registos de auditoria...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <Activity className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Nenhum log de auditoria encontrado</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Data & Hora</th>
                    <th className="py-3 px-4">Utilizador</th>
                    <th className="py-3 px-4">Ação / Evento</th>
                    <th className="py-3 px-4">Entidade / ID</th>
                    <th className="py-3 px-4">Detalhes JSON</th>
                    <th className="py-3 px-4">IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500 font-mono text-[11px] font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" /> {formatDate(log.created_at)}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {log.user ? (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-purple-600" />
                            <span>{log.user.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
                              {log.user.role}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Sistema / Convidado</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-black uppercase text-[10px] bg-purple-100 text-purple-700">
                          {log.acao}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {log.modelo ? (
                          <span className="flex items-center gap-1 font-bold text-slate-700">
                            <HardDrive className="w-3 h-3 text-slate-400" /> {log.modelo} #{log.modelo_id}
                          </span>
                        ) : (
                          <span className="text-slate-400 font-bold">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-[10px] text-slate-500">
                        {log.detalhes ? JSON.stringify(log.detalhes) : '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px] font-bold">
                        {log.ip_address || '127.0.0.1'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-slate-100 text-xs font-bold text-slate-500">
                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50 transition-all"
                >
                  Anterior
                </button>
                <span className="text-slate-500">
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50 transition-all"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
