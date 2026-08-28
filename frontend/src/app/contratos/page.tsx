'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { FileCheck, Download, User, Calendar, Loader2, FileText, CheckCircle2, CreditCard, LogIn } from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface Imovel {
  id: number;
  titulo: string;
  localizacao: string;
  imagens?: { caminho: string }[];
}

interface UserSummary {
  id: number;
  name: string;
  email: string;
}

interface Contrato {
  id: number;
  proposta_id: number;
  tipo_contrato: string;
  valor_acordado: string;
  data_inicio: string | null;
  data_fim: string | null;
  estado: string;
  created_at: string;
  imovel: Imovel;
  cliente: UserSummary;
  proprietario: UserSummary;
}

export default function ContratosPage() {
  const { user } = useAuth();
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const fetchContratos = async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      const res = await api.get('/contratos');
      setContratos(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setIsUnauthorized(true);
      } else {
        console.error('Erro ao carregar contratos:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) {
        if (!user) {
          setIsUnauthorized(true);
          setLoading(false);
        } else {
          await fetchContratos();
        }
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const handleDownloadPdf = async (contratoId: number) => {
    setDownloadingId(contratoId);
    try {
      const response = await api.get(`/contratos/${contratoId}/pdf`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contrato_CasaGest_#${contratoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao descarregar PDF:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleUpdateEstado = async (contratoId: number, novoEstado: string) => {
    if (!confirm(`Tem a certeza que deseja alterar o estado para ${novoEstado.toUpperCase()}?`)) return;
    
    try {
      const res = await api.post(`/contratos/${contratoId}/estado`, { estado: novoEstado });
      setContratos(prev => prev.map(c => c.id === contratoId ? res.data.contrato : c));
    } catch (err) {
      console.error('Erro ao atualizar estado do contrato:', err);
      alert('Ocorreu um erro ao atualizar o estado.');
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(dateStr)) : 'N/D';

  return (
    <div className={user?.role === 'admin' ? "min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row" : "min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4"}>
      {user?.role === 'admin' && <AdminSidebar />}
      
      <div className={user?.role === 'admin' ? "flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden" : "max-w-6xl mx-auto"}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Contratos Gerados</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Consulte e descarregue em PDF os contratos de arrendamento/compra celebrados.</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : isUnauthorized ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
            <LogIn className="w-16 h-16 text-emerald-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Autenticação Necessária</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Faça login na sua conta CasaGest para consultar e descarregar os seus contratos.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md">
              <LogIn className="w-4 h-4" /> Iniciar Sessão
            </Link>
          </div>
        ) : contratos.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <FileText className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum contrato formalizado</h3>
            <p className="text-sm text-slate-400 mt-1">Os contratos são gerados automaticamente quando uma proposta é aceite.</p>
            <Link href="/propostas" className="inline-block mt-4 text-indigo-600 hover:underline font-medium text-sm">
              Ver propostas →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {contratos.map((c) => (
              <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center shrink-0 text-emerald-600 dark:text-emerald-400">
                    <FileCheck className="w-7 h-7" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-800 dark:text-white text-base">
                        Contrato #{c.id} · {c.imovel?.titulo}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        c.estado === 'rescindido' || c.estado === 'cancelado' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' :
                        c.estado === 'terminado' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}>
                        <CheckCircle2 className="w-3 h-3" /> 
                        {c.estado.charAt(0).toUpperCase() + c.estado.slice(1).replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3 pt-1">
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> Senh.: {c.proprietario?.name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-slate-400" /> Inq.: {c.cliente?.name}</span>
                    </p>

                    <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Início: {formatDate(c.data_inicio)}</span>
                      <span>Fim: {formatDate(c.data_fim)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 dark:border-slate-800 justify-between md:justify-end">
                  <div className="text-left md:text-right">
                    <p className="text-xs text-slate-400">Valor Acordado</p>
                    <p className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                      {formatPrice(c.valor_acordado)}
                    </p>
                  </div>

                    <div className="flex flex-col gap-2">
                      <Link
                        href={`/pagamentos/novo?contrato=${c.id}`}
                        className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105 flex items-center gap-1.5 justify-center"
                      >
                        <CreditCard className="w-4 h-4" />
                        Pagar Contrato
                      </Link>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownloadPdf(c.id)}
                          disabled={downloadingId === c.id}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm shadow-indigo-500/20 transition-all hover:shadow-md disabled:opacity-60 flex-1 justify-center"
                        >
                          {downloadingId === c.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                          Baixar PDF
                        </button>
                      </div>

                      {user && (user.role === 'admin' || user.id === c.proprietario.id) && c.estado !== 'rescindido' && c.estado !== 'terminado' && (
                        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <button
                            onClick={() => handleUpdateEstado(c.id, 'rescindido')}
                            className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400 dark:hover:bg-red-900/60 rounded-lg text-xs font-semibold transition-all flex-1"
                          >
                            Rescindir
                          </button>
                          <button
                            onClick={() => handleUpdateEstado(c.id, 'terminado')}
                            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold transition-all flex-1"
                          >
                            Terminar
                          </button>
                        </div>
                      )}
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
