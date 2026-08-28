'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { FileCheck, Calendar, ArrowLeft, Loader2, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  localizacao: string;
}

interface Cliente {
  id: number;
  name: string;
  email: string;
}

interface Proposta {
  id: number;
  imovel_id: number;
  valor_proposto: string;
  estado: string;
  imovel: Imovel;
  cliente: Cliente;
}

function NovoContratoForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propostaId = searchParams.get('proposta_id');

  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [loadingProposta, setLoadingProposta] = useState(true);
  const [tipoContrato, setTipoContrato] = useState<'arrendamento' | 'compra_venda'>('arrendamento');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [termosAdicionais, setTermosAdicionais] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!propostaId) {
      setLoadingProposta(false);
      return;
    }

    const fetchProposta = async () => {
      try {
        const res = await api.get(`/propostas/${propostaId}`);
        setProposta(res.data.proposta);
        // Preencher data padrão
        const hoje = new Date();
        const inicioPadrao = new Date(hoje.setDate(hoje.getDate() + 7)).toISOString().split('T')[0];
        const fimPadrao = new Date(hoje.setFullYear(hoje.getFullYear() + 1)).toISOString().split('T')[0];
        setDataInicio(inicioPadrao);
        setDataFim(fimPadrao);
      } catch (err) {
        console.error('Erro ao carregar proposta:', err);
        setError('Não foi possível carregar os detalhes da proposta.');
      } finally {
        setLoadingProposta(false);
      }
    };

    fetchProposta();
  }, [propostaId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!propostaId) return;

    setSubmitting(true);
    setError('');

    try {
      await api.post('/contratos', {
        proposta_id: Number(propostaId),
        tipo_contrato: tipoContrato,
        data_inicio: dataInicio,
        data_fim: dataFim,
        termos_adicionais: termosAdicionais || null,
      });

      router.push('/contratos');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao gerar o contrato.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  if (loadingProposta) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!propostaId || !proposta) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Proposta Inválida ou Não Encontrada</h2>
        <p className="text-sm text-slate-500 mt-2">Selecione uma proposta aceite a partir do menu de propostas para formalizar o contrato.</p>
        <Link href="/propostas" className="inline-block mt-6 px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold">
          Ver Propostas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/propostas" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Voltar às propostas
      </Link>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-xl space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 rounded-2xl">
            <FileCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-white">Formalizar Contrato</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure os parâmetros e termos para a emissão do documento oficial.</p>
          </div>
        </div>

        {/* Resumo da Proposta Aceite */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Imóvel:</span>
            <span className="text-slate-900 dark:text-white font-bold">{proposta.imovel?.titulo}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Cliente (Inquilino/Comprador):</span>
            <span className="text-slate-900 dark:text-white">{proposta.cliente?.name} ({proposta.cliente?.email})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 dark:text-slate-200">Valor Acordado:</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{formatPrice(proposta.valor_proposto)}</span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 rounded-2xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Tipo de Contrato</label>
              <select
                value={tipoContrato}
                onChange={(e) => setTipoContrato(e.target.value as 'arrendamento' | 'compra_venda')}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="arrendamento">Arrendamento Habitacional / Comercial</option>
                <option value="compra_venda">Promessa de Compra e Venda</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data de Início das Obrigações</label>
              <input
                type="date"
                required
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Data de Término do Contrato</label>
              <input
                type="date"
                required
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Estado do Documento</label>
              <div className="px-4 py-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Pronto a ser emitido e assinado
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Termos e Cláusulas Adicionais (opcional)</label>
            <textarea
              rows={4}
              value={termosAdicionais}
              onChange={(e) => setTermosAdicionais(e.target.value)}
              placeholder="Especificar cláusulas especiais sobre caução, manutenção, despesas do condomínio ou regras do imóvel..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Link
              href="/propostas"
              className="px-5 py-3 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Gerar e Emitir Contrato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NovoContratoPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <Suspense fallback={<div className="text-center py-20"><Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" /></div>}>
        <NovoContratoForm />
      </Suspense>
    </div>
  );
}
