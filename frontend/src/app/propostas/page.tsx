import { resolveImageUrl } from '@/lib/utils';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { FileText, Building2, User, Check, X, ArrowRightLeft, MessageSquare, AlertCircle, Loader2, LogIn } from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';
import { EmptyState } from '@/components/EmptyState';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  localizacao: string;
  imagens?: { caminho: string }[];
  proprietario?: { id: number; name: string };
}

interface Cliente {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface Proposta {
  id: number;
  imovel_id: number;
  cliente_id: number;
  valor_proposto: string;
  tipo: 'venda' | 'arrendamento';
  mensagem: string | null;
  estado: 'pendente' | 'aceite' | 'recusada' | 'contra_proposta';
  valor_contra_proposta: string | null;
  resposta_proprietario: string | null;
  created_at: string;
  imovel: Imovel;
  cliente: Cliente;
}

const estadoBadges: Record<string, { label: string; style: string }> = {
  pendente: { label: 'Pendente', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  aceite: { label: 'Aceite', style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  recusada: { label: 'Recusada', style: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  contra_proposta: { label: 'Contra-proposta', style: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
};

export default function PropostasPage() {
  const { user } = useAuth();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [selectedProposta, setSelectedProposta] = useState<Proposta | null>(null);
  const [responderModal, setResponderModal] = useState(false);
  const [respostaEstado, setRespostaEstado] = useState<'aceite' | 'recusada' | 'contra_proposta'>('aceite');
  const [respostaMsg, setRespostaMsg] = useState('');
  const [valorContra, setValorContra] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPropostas = async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      const res = await api.get('/propostas');
      setPropostas(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setIsUnauthorized(true);
      } else {
        console.error('Erro ao carregar propostas:', err);
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
          await fetchPropostas();
        }
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const openResponderModal = (p: Proposta, defaultEstado: 'aceite' | 'recusada' | 'contra_proposta') => {
    setSelectedProposta(p);
    setRespostaEstado(defaultEstado);
    setRespostaMsg('');
    setValorContra(p.valor_proposto);
    setResponderModal(true);
  };

  const handleResponderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProposta) return;
    setSubmitting(true);
    setError('');

    try {
      await api.post(`/propostas/${selectedProposta.id}/responder`, {
        estado: respostaEstado,
        resposta_proprietario: respostaMsg,
        valor_contra_proposta: respostaEstado === 'contra_proposta' ? Number(valorContra) : null,
      });

      setResponderModal(false);
      fetchPropostas();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao enviar resposta.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

  return (
    <div className={user?.role === 'admin' ? "min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row" : "min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4"}>
      {user?.role === 'admin' && <AdminSidebar />}
      
      <div className={user?.role === 'admin' ? "flex-1 p-6 lg:p-8 space-y-6 overflow-x-hidden" : "max-w-6xl mx-auto"}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Propostas de Arrendamento/Compra</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {user?.role === 'cliente' ? 'Acompanhe o estado das propostas enviadas aos proprietários.' : 'Gerencie as propostas recebidas dos interessados.'}
              </p>
            </div>
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
            <LogIn className="w-16 h-16 text-indigo-500 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-white">Autenticação Necessária</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Faça login na sua conta CasaGest para visualizar e gerir as suas propostas.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
              <LogIn className="w-4 h-4" /> Iniciar Sessão
            </Link>
          </div>
        ) : propostas.length === 0 ? (
          <EmptyState 
            icon={FileText} 
            title="Nenhuma proposta encontrada" 
            description={user?.role === 'cliente' ? 'Ainda não enviou nenhuma proposta para um imóvel.' : 'Ainda não recebeu propostas nos seus imóveis.'} 
            actionText={user?.role === 'cliente' ? 'Explorar imóveis →' : undefined} 
            actionHref={user?.role === 'cliente' ? '/imoveis' : undefined} 
          />
        ) : (
          <div className="space-y-4">
            {propostas.map((p) => {
              const badge = estadoBadges[p.estado] || estadoBadges.pendente;
              const isProprietarioOuAdmin = user?.role === 'proprietario' || user?.role === 'admin';

              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="relative w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {p.imovel?.imagens && p.imovel.imagens.length > 0 ? (
                          <Image src={resolveImageUrl(p.imovel.imagens?.[0]?.caminho)} alt="" fill className="object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <Link href={`/imoveis/${p.imovel_id}`} className="font-semibold text-slate-800 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                          {p.imovel?.titulo || `Imóvel #${p.imovel_id}`}
                        </Link>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Valor anunciado: <span className="font-medium text-slate-600 dark:text-slate-300">{formatPrice(p.imovel?.preco || 0)}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(p.created_at)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-sm">
                    {/* Detalhes da Proposta */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valor Proposto ({p.tipo === 'venda' ? 'Compra' : p.tipo === 'arrendamento' ? 'Arrendamento' : ''})</p>
                      <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatPrice(p.valor_proposto)}
                      </p>
                      {p.mensagem && (
                        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 italic flex gap-2">
                          <MessageSquare className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>&quot;{p.mensagem}&quot;</span>
                        </div>
                      )}
                    </div>

                    {/* Cliente / Resposta */}
                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {isProprietarioOuAdmin ? 'Interessado (Cliente)' : 'Resposta do Proprietário'}
                      </p>

                      {isProprietarioOuAdmin ? (
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <User className="w-4 h-4 text-indigo-500" />
                          <span className="font-medium">{p.cliente?.name}</span> ({p.cliente?.email} {p.cliente?.phone && `· ${p.cliente.phone}`})
                        </div>
                      ) : null}

                      {p.estado === 'contra_proposta' && p.valor_contra_proposta && (
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs space-y-1">
                          <p className="font-bold text-indigo-700 dark:text-indigo-300">
                            Valor de Contra-Proposta: {formatPrice(p.valor_contra_proposta)}
                          </p>
                          {p.resposta_proprietario && <p className="text-slate-600 dark:text-slate-300">&quot;{p.resposta_proprietario}&quot;</p>}
                        </div>
                      )}

                      {p.resposta_proprietario && p.estado !== 'contra_proposta' && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl italic">
                          &quot;{p.resposta_proprietario}&quot;
                        </p>
                      )}

                      {/* Botões de Ação para o Proprietário */}
                      {isProprietarioOuAdmin && p.estado === 'pendente' && (
                        <div className="flex items-center gap-2 pt-2">
                          <button
                            onClick={() => openResponderModal(p, 'aceite')}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Aceitar
                          </button>
                          <button
                            onClick={() => openResponderModal(p, 'contra_proposta')}
                            className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <ArrowRightLeft className="w-3.5 h-3.5" /> Contrapropor
                          </button>
                          <button
                            onClick={() => openResponderModal(p, 'recusada')}
                            className="py-2 px-3 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Recusar
                          </button>
                        </div>
                      )}

                      {/* Chat Button (Para Ambos) */}
                      <div className="pt-2">
                        <Link
                          href={`/propostas/${p.id}`}
                          className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                        >
                          <MessageSquare className="w-3.5 h-3.5" /> Chat / Negociação
                        </Link>
                      </div>

                      {/* Botão para Gerar Contrato se a proposta foi aceite */}
                      {p.estado === 'aceite' && (
                        <div className="pt-2">
                          <Link
                            href={`/contratos/novo?proposta_id=${p.id}`}
                            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <FileText className="w-3.5 h-3.5" /> Formalizar / Gerar Contrato
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal de Resposta */}
        {responderModal && selectedProposta && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                {respostaEstado === 'aceite' ? 'Aceitar Proposta' : respostaEstado === 'recusada' ? 'Recusar Proposta' : 'Fazer Contra-Proposta'}
              </h3>

              {error && (
                <div className="flex items-center gap-2 p-3 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleResponderSubmit} className="space-y-4">
                {respostaEstado === 'contra_proposta' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Novo Valor Proposto (AOA)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={valorContra}
                      onChange={(e) => setValorContra(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Mensagem/Justificação (opcional)</label>
                  <textarea
                    rows={3}
                    value={respostaMsg}
                    onChange={(e) => setRespostaMsg(e.target.value)}
                    placeholder="Deixe um comentário para o proponente..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResponderModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center gap-1.5 ${
                      respostaEstado === 'aceite' ? 'bg-emerald-600 hover:bg-emerald-700' : respostaEstado === 'recusada' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Confirmar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
