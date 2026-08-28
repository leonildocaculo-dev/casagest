'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { CreditCard, Building2, AlertCircle, Loader2, ArrowLeft, ShieldCheck } from 'lucide-react';

interface Contrato {
  id: number;
  proposta_id: number;
  tipo_contrato: string;
  valor_acordado: string;
  imovel: {
    id: number;
    titulo: string;
    localizacao: string;
  };
  proprietario: {
    name: string;
    email: string;
  };
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const contratoId = searchParams.get('contrato');

  const [contrato, setContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [comprovativo, setComprovativo] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');

  useEffect(() => {
    let active = true;

    const fetchContrato = async () => {
      if (!contratoId) {
        if (active) {
          setError('Nenhum contrato selecionado.');
          setLoading(false);
        }
        return;
      }

      try {
        const res = await api.get(`/contratos/${contratoId}`);
        if (active) setContrato(res.data.contrato);
      } catch {
        if (active) setError('Não foi possível carregar o contrato.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchContrato();
    return () => { active = false; };
  }, [contratoId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFileSizeError('');

    if (file) {
      if (file.size > 2097152) { // 2MB em Bytes
        setFileSizeError('Atenção: O ficheiro selecionado ultrapassa o limite de 2MB. Escolha um ficheiro menor.');
        setComprovativo(null);
        return;
      }
      setComprovativo(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contrato) return;

    const valor = Number(contrato.valor_acordado);
    const limite10M = 10000000.00;

    if (valor > limite10M && !comprovativo) {
      setError('O comprovativo de transferência é obrigatório para valores superiores a 10.000.000 AOA.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('contrato_id', String(contrato.id));
      if (comprovativo) {
        formData.append('comprovativo', comprovativo);
      }

      await api.post('/pagamentos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      router.push('/pagamentos');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao processar pagamento. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (error && !contrato) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
          <Link href="/contratos" className="text-purple-600 hover:underline font-semibold text-sm">
            Voltar aos contratos
          </Link>
        </div>
      </div>
    );
  }

  const valor = Number(contrato?.valor_acordado || 0);
  const isReferencia = valor <= 10000000.00; // <= 10 Milhões AOA

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => router.back()} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar aos Contratos
        </button>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Checkout Seguro</span>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white mt-1">Efetuar Pagamento</h1>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/40 text-purple-600 rounded-2xl">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>

          {/* Resumo do Contrato */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <p className="text-xs font-semibold text-slate-400 uppercase">Resumo do Contrato #{contrato?.id}</p>
            <h3 className="font-bold text-slate-800 dark:text-white text-base">{contrato?.imovel?.titulo}</h3>
            <p className="text-xs text-slate-500">{contrato?.imovel?.localizacao} · Senhorio: {contrato?.proprietario?.name}</p>
            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Montante a Pagar</span>
              <span className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">{formatPrice(valor)}</span>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 text-xs text-rose-700 bg-rose-50 dark:bg-rose-950/50 rounded-2xl border border-rose-200 dark:border-rose-900">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {isReferencia ? (
              /* Caso 1: Valor <= 10M AOA -> Referência Multicaixa */
              <div className="p-6 bg-purple-950 text-white rounded-2xl border-2 border-amber-400 shadow-xl space-y-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h4 className="font-bold text-amber-300 text-sm uppercase">Método: Referência Multicaixa</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Para valores até 10.000.000 AOA, a referência Multicaixa é gerada automaticamente. Poderá efetuar o pagamento nos Caixas Eletrónicos (Multicaixa) ou na app Multicaixa Express com confirmação em tempo real!
                </p>
                <div className="p-3 bg-purple-900/80 rounded-xl text-xs text-purple-200 border border-purple-800">
                  ⚡ Validade: 48 horas após emissão.
                </div>
              </div>
            ) : (
              /* Caso 2: Valor > 10M AOA -> Transferência Bancária com comprovativo <= 2MB */
              <div className="p-6 bg-amber-400/10 border-2 border-amber-400 rounded-2xl space-y-5">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-amber-300 text-sm uppercase flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-amber-500" />
                    Método: Transferência Bancária (&gt; 10M AOA)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    Para montantes superiores a 10.000.000 AOA, Efetue a transferência para um dos IBANs da plataforma e anexe obrigatoriamente o comprovativo (máx. 2MB).
                  </p>
                </div>

                {/* IBANs de Teste da Empresa */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-purple-700 dark:text-purple-400 block">BANCO BAI</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block mt-1">AO06 0040 0000 1234 5678 9012 3</span>
                    <span className="text-[10px] text-slate-400 block">Titular: CasaGest Imobiliária Lda</span>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                    <span className="font-extrabold text-purple-700 dark:text-purple-400 block">ATLÂNTICO</span>
                    <span className="font-mono text-slate-700 dark:text-slate-300 block mt-1">AO06 0055 0000 9876 5432 1098 7</span>
                    <span className="text-[10px] text-slate-400 block">Titular: CasaGest Imobiliária Lda</span>
                  </div>
                </div>

                {/* File Upload Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800 dark:text-white">
                    Anexar Comprovativo de Transferência * (PDF, PNG, JPG até 2MB)
                  </label>

                  {fileSizeError && (
                    <p className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 p-2.5 rounded-xl border border-rose-200">
                      {fileSizeError}
                    </p>
                  )}

                  <input
                    type="file"
                    required
                    accept="application/pdf,image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-xs cursor-pointer file:mr-4 file:py-3 file:px-4 file:rounded-xl file:border-0 file:font-extrabold file:bg-purple-900 file:text-amber-300 hover:file:bg-purple-800"
                  />
                  {comprovativo && (
                    <p className="text-xs text-emerald-600 font-semibold pt-1">
                      ✓ Ficheiro selecionado: {comprovativo.name} ({(comprovativo.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-60"
            >
              {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
              {isReferencia ? 'Gerar Referência Multicaixa' : 'Enviar Comprovativo de Transferência'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NovoPagamentoPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}
