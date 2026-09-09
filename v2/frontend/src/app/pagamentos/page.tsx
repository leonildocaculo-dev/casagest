'use client';
import { resolveImageUrl } from '@/lib/utils';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { CreditCard, Copy, Check, FileText, CheckCircle2, Upload, Loader2, ShieldCheck, LogIn } from 'lucide-react';

interface Imovel {
  id: number;
  titulo: string;
  localizacao: string;
}

interface Contrato {
  id: number;
  tipo_contrato: string;
  valor_acordado: string;
  imovel: Imovel;
  proprietario: { name: string; email: string };
}

interface Pagamento {
  id: number;
  contrato_id: number;
  cliente_id: number;
  valor: string;
  metodo: 'referencia' | 'transferencia_bancaria';
  entidade: string | null;
  referencia: string | null;
  data_limite: string | null;
  comprovativo_caminho: string | null;
  comprovativo_nome_original: string | null;
  estado: 'pendente' | 'em_analise' | 'pago' | 'rejeitado' | 'expirado';
  data_pagamento: string | null;
  notas_admin: string | null;
  created_at: string;
  contrato: Contrato;
  cliente: { name: string; email: string };
}

const estadoBadges: Record<string, { label: string; style: string }> = {
  pendente: { label: 'Aguardando Pagamento', style: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' },
  em_analise: { label: 'Em Análise (Admin)', style: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  pago: { label: 'Pago & Confirmado', style: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  rejeitado: { label: 'Comprovativo Rejeitado', style: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' },
  expirado: { label: 'Referência Expirada', style: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400' },
};

export default function PagamentosPage() {
  const { user } = useAuth();
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Webhook Simulator State
  const [simulatingWebhookId, setSimulatingWebhookId] = useState<number | null>(null);

  // Re-upload state
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');

  const fetchPagamentos = async () => {
    setLoading(true);
    setIsUnauthorized(false);
    try {
      const res = await api.get('/pagamentos');
      setPagamentos(res.data.data);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr.response?.status === 401) {
        setIsUnauthorized(true);
      } else {
        console.error('Erro ao carregar pagamentos:', err);
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
          await fetchPagamentos();
        }
      }
    };
    load();
    return () => { active = false; };
  }, [user]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Simular callback do webhook Multicaixa (para testes de desenvolvimento)
  const handleSimularWebhook = async (p: Pagamento) => {
    if (!p.entidade || !p.referencia) return;
    setSimulatingWebhookId(p.id);
    try {
      await api.post('/webhooks/pagamentos/referencia', {
        entidade: p.entidade,
        referencia: p.referencia,
        valor: Number(p.valor),
        status: 'PAID',
      });
      fetchPagamentos();
    } catch (err) {
      console.error('Erro no webhook:', err);
    } finally {
      setSimulatingWebhookId(null);
    }
  };

  const handleReupload = async (e: React.FormEvent, pagamentoId: number) => {
    e.preventDefault();
    if (!uploadFile) return;

    if (uploadFile.size > 2097152) { // 2MB
      setUploadError('O ficheiro não pode exceder 2MB.');
      return;
    }

    setUploadingId(pagamentoId);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('comprovativo', uploadFile);

      await api.post(`/pagamentos/${pagamentoId}/comprovativo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadFile(null);
      fetchPagamentos();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setUploadError(axiosErr.response?.data?.message || 'Erro ao enviar comprovativo.');
    } finally {
      setUploadingId(null);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr)) : 'N/D';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-400 text-purple-950 rounded-2xl shadow-lg">
              <CreditCard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Gestão de Pagamentos</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Acompanhe o estado de pagamentos por Referência Multicaixa e Transferência Bancária.
              </p>
            </div>
          </div>

          <Link
            href="/contratos"
            className="px-5 py-3 bg-purple-900 hover:bg-purple-800 text-amber-300 text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <FileText className="w-4 h-4" /> Ver Contratos para Pagar
          </Link>
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
              Faça login na sua conta CasaGest para consultar os seus pagamentos e referências Multicaixa.
            </p>
            <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md">
              <LogIn className="w-4 h-4" /> Iniciar Sessão
            </Link>
          </div>
        ) : pagamentos.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Nenhum registo de pagamento</h3>
            <p className="text-sm text-slate-400 mt-1">Os pagamentos são iniciados a partir da lista de contratos formalizados.</p>
            <Link href="/contratos" className="inline-block mt-4 text-purple-600 hover:underline font-medium text-sm">
              Ir para os Contratos →
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {pagamentos.map((p) => {
              const badge = estadoBadges[p.estado] || estadoBadges.pendente;
              const isReferencia = p.metodo === 'referencia';

              return (
                <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs hover:shadow-md transition-all space-y-5">
                  {/* Top Bar do Pagamento */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                          {isReferencia ? 'Referência Multicaixa' : 'Transferência Bancária'}
                        </span>
                        <span className="text-xs text-slate-400">· ID #{p.id}</span>
                      </div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-base mt-0.5">
                        Contrato #{p.contrato_id} — {p.contrato?.imovel?.titulo || 'Imóvel'}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.style}`}>
                        {badge.label}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(p.created_at)}</span>
                    </div>
                  </div>

                  {/* Detalhes por Método */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Col 1: Valor e Método */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Valor do Pagamento</p>
                        <p className="text-3xl font-extrabold text-purple-700 dark:text-purple-400 mt-1">
                          {formatPrice(p.valor)}
                        </p>
                      </div>

                      {/* Regra de Pagamento Info Badge */}
                      <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl text-xs text-purple-900 dark:text-purple-200 border border-purple-200 dark:border-purple-900">
                        {isReferencia ? (
                          <p>✓ Pagamento automático por Referência Multicaixa para valores até 10.000.000 AOA.</p>
                        ) : (
                          <p>ℹ Pagamento por Transferência Bancária para montantes superiores a 10.000.000 AOA com anexo de comprovativo de até 2MB.</p>
                        )}
                      </div>
                    </div>

                    {/* Col 2: Instruções Específicas */}
                    <div className="space-y-4">
                      {isReferencia ? (
                        /* Painel de Referência Multicaixa */
                        <div className="bg-purple-950 text-white p-5 rounded-2xl border-2 border-amber-400 shadow-xl space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase text-amber-400 tracking-wider">Dados Multicaixa Express / Caixas</span>
                            {p.estado === 'pago' ? (
                              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Confirmado
                              </span>
                            ) : (
                              <span className="text-[11px] text-purple-300">Válido por 48 Horas</span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-purple-900/80 p-3 rounded-xl border border-purple-800">
                              <span className="text-[10px] text-purple-300 uppercase block">Entidade</span>
                              <span className="font-extrabold text-amber-300 text-lg">{p.entidade}</span>
                            </div>

                            <div className="bg-purple-900/80 p-3 rounded-xl border border-purple-800 flex items-center justify-between">
                              <div>
                                <span className="text-[10px] text-purple-300 uppercase block">Referência</span>
                                <span className="font-extrabold text-white text-lg tracking-wider">{p.referencia}</span>
                              </div>
                              <button
                                onClick={() => copyToClipboard(p.referencia!, `ref-${p.id}`)}
                                className="p-1.5 bg-purple-800 hover:bg-purple-700 text-amber-300 rounded-lg transition-colors"
                                title="Copiar Referência"
                              >
                                {copiedId === `ref-${p.id}` ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          {/* Simulador de Webhook de Teste para o Utilizador */}
                          {p.estado === 'pendente' && (
                            <div className="pt-2">
                              <button
                                onClick={() => handleSimularWebhook(p)}
                                disabled={simulatingWebhookId === p.id}
                                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                              >
                                {simulatingWebhookId === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                Simular Confirmação Webhook Multicaixa
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Painel de Transferência Bancária */
                        <div className="bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl space-y-4">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Comprovativo de Transferência</span>
                            <span className="text-slate-400">Máx. 2MB (PDF/PNG/JPG)</span>
                          </div>

                          {p.comprovativo_caminho ? (
                            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-50">
                                📄 {p.comprovativo_nome_original || 'comprovativo.pdf'}
                              </span>
                              <a
                                href={resolveImageUrl(p.comprovativo_caminho)}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs font-bold text-purple-600 hover:underline"
                              >
                                Ver Ficheiro
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 italic">Nenhum comprovativo anexo.</p>
                          )}

                          {p.notas_admin && (
                            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-xs text-amber-900 dark:text-amber-200">
                              <strong>Nota da Administração:</strong> &quot;{p.notas_admin}&quot;
                            </div>
                          )}

                          {/* Re-upload Form se rejeitado */}
                          {p.estado === 'rejeitado' && (
                            <form onSubmit={(e) => handleReupload(e, p.id)} className="space-y-3 pt-2">
                              {uploadError && (
                                <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
                              )}
                              <input
                                type="file"
                                accept="application/pdf,image/png,image/jpeg,image/webp"
                                onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                className="block w-full text-xs cursor-pointer file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:font-semibold file:bg-purple-900 file:text-amber-300 hover:file:bg-purple-800"
                              />
                              <button
                                type="submit"
                                disabled={uploadingId === p.id || !uploadFile}
                                className="w-full py-2 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
                              >
                                {uploadingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                                Reenviar Comprovativo (máx 2MB)
                              </button>
                            </form>
                          )}
                        </div>
                      )}
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
