'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  UserCheck,
  UserX,
  Loader2
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface UserItem {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'admin' | 'proprietario' | 'cliente';
  status: string;
  created_at: string;
}

interface PaginatedResponse {
  data: UserItem[];
  current_page: number;
  last_page: number;
  total: number;
}

const roleBadges: Record<string, { label: string; style: string }> = {
  admin: { label: 'Admin', style: 'bg-purple-100 text-purple-900 border border-purple-300 font-black' },
  proprietario: { label: 'Proprietário', style: 'bg-amber-100 text-amber-900 border border-amber-300 font-black' },
  cliente: { label: 'Cliente', style: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black' },
};

export default function AdminUtilizadoresPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [utilizadores, setUtilizadores] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [pesquisa, setPesquisa] = useState('');
  const [roleFiltro, setRoleFiltro] = useState('');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  const fetchUtilizadores = async (p: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(p));
      if (roleFiltro) params.set('role', roleFiltro);
      if (pesquisa) params.set('pesquisa', pesquisa);

      const res = await api.get<PaginatedResponse>(`/admin/utilizadores?${params.toString()}`);
      setUtilizadores(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erro ao carregar utilizadores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active && user?.role === 'admin') {
        await fetchUtilizadores(1);
      }
    };
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, roleFiltro]);

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    const novoStatus = currentStatus === 'ativo' ? 'inativo' : 'ativo';
    setActionLoading(userId);
    try {
      await api.patch(`/admin/utilizadores/${userId}/status`, { status: novoStatus });
      fetchUtilizadores(page);
    } catch (err) {
      console.error('Erro ao alterar estado do utilizador:', err);
    } finally {
      setActionLoading(null);
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row">
      
      <AdminSidebar stats={{ total }} />

      {/* 2. MAIN MIDDLE CONTENT */}
      <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Gestão de Utilizadores & Perfis</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Gerencie permissões de Administradores, Proprietários e Clientes ({total} utilizadores).
            </p>
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Pesquisar utilizador..."
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchUtilizadores(1)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <button
            onClick={() => setRoleFiltro('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              !roleFiltro ? 'bg-purple-950 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50'
            }`}
          >
            Todos ({total})
          </button>
          <button
            onClick={() => setRoleFiltro('admin')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFiltro === 'admin' ? 'bg-purple-700 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-purple-50'
            }`}
          >
            Administradores
          </button>
          <button
            onClick={() => setRoleFiltro('proprietario')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFiltro === 'proprietario' ? 'bg-amber-400 text-purple-950 font-black shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-amber-50'
            }`}
          >
            Proprietários
          </button>
          <button
            onClick={() => setRoleFiltro('cliente')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              roleFiltro === 'cliente' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:bg-emerald-50'
            }`}
          >
            Clientes
          </button>
        </div>

        {/* Utilizadores Action Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          {loading ? (
            <div className="py-20 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
            </div>
          ) : utilizadores.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs font-bold">
              Nenhum utilizador encontrado com os filtros selecionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-y border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Utilizador</th>
                    <th className="py-3 px-4">Telefone</th>
                    <th className="py-3 px-4">Papel / Função</th>
                    <th className="py-3 px-4">Estado</th>
                    <th className="py-3 px-4 text-right">Ação Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {utilizadores.map((u) => {
                    const badge = roleBadges[u.role] || { label: u.role, style: 'bg-slate-100' };
                    const isSelf = u.id === user.id;

                    return (
                      <tr key={u.id} className="hover:bg-purple-50/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <span className="font-black text-slate-900 block">{u.name} {isSelf && '(Você)'}</span>
                          <span className="text-[11px] text-slate-400 font-medium">{u.email}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 font-bold">
                          {u.phone || 'Sem telefone'}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] ${badge.style}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-3 py-1 rounded-full uppercase text-[10px] font-black ${
                            u.status === 'ativo' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {!isSelf ? (
                            <button
                              onClick={() => handleToggleStatus(u.id, u.status)}
                              disabled={actionLoading === u.id}
                              className={`px-3 py-1.5 rounded-xl text-[11px] font-black shadow-xs transition-all flex items-center justify-end gap-1 ml-auto ${
                                u.status === 'ativo'
                                  ? 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                  : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              }`}
                            >
                              {actionLoading === u.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : u.status === 'ativo' ? (
                                <>
                                  <UserX className="w-3 h-3" /> Desativar
                                </>
                              ) : (
                                <>
                                  <UserCheck className="w-3 h-3" /> Ativar
                                </>
                              )}
                            </button>
                          ) : (
                            <span className="text-slate-400 text-[11px] font-normal">Conta Ativa</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginação */}
          {lastPage > 1 && (
            <div className="flex justify-between items-center pt-4 border-t border-slate-100 text-xs font-bold text-slate-500">
              <span>Página {page} de {lastPage} ({total} utilizadores)</span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => fetchUtilizadores(page - 1)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  disabled={page >= lastPage}
                  onClick={() => fetchUtilizadores(page + 1)}
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
            <p className="text-xs text-purple-700 font-extrabold uppercase mt-0.5">Módulo de Utilizadores</p>
          </div>
          <button
            onClick={() => fetchUtilizadores(page)}
            className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
          >
            Atualizar Utilizadores
          </button>
        </div>
      </aside>

    </div>
  );
}
