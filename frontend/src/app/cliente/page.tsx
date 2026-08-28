'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  FileText,
  ShieldCheck,
  Loader2,
  MapPin
} from 'lucide-react';

interface Proposta {
  id: number;
  valor_proposto: string;
  estado: string;
  imovel: { id: number; titulo: string; localizacao: string; imagens?: { caminho: string }[] };
}

interface Contrato {
  id: number;
  estado: string;
  valor_acordado: string;
  imovel: { titulo: string };
}

export default function ClienteDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'cliente' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [propostasRes, contratosRes] = await Promise.all([
          api.get('/propostas?por_pagina=4'),
          api.get('/contratos?por_pagina=4')
        ]);
        setPropostas(propostasRes.data.data || []);
        setContratos(contratosRes.data.data || []);
      } catch (err) {
        console.error('Erro ao carregar dados do cliente:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, router]);

  const formatPrice = (val: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(val));

  if (!user || (user.role !== 'cliente' && user.role !== 'admin')) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight">
              Olá, {user.name} 👋
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Acompanhe as suas propostas e contratos.
            </p>
          </div>
          <Link
            href="/imoveis"
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm transition-all"
          >
            Explorar Mais Imóveis
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Minhas Propostas */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" /> Minhas Propostas
                </h3>
                <Link href="/propostas" className="text-sm font-semibold text-primary hover:underline">
                  Ver Todas
                </Link>
              </div>

              <div className="space-y-4">
                {propostas.length > 0 ? (
                  propostas.map(p => (
                    <Link key={p.id} href={`/propostas/${p.id}`} className="block p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors">
                      <div className="flex gap-4">
                        <div className="relative w-16 h-16 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                          {p.imovel?.imagens && p.imovel.imagens.length > 0 ? (
                            <Image src={`http://localhost:8000/storage/${p.imovel.imagens[0].caminho}`} alt="" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><FileText className="w-6 h-6 text-slate-400" /></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{p.imovel?.titulo}</h4>
                            <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md shrink-0 ${
                              p.estado === 'pendente' ? 'bg-amber-100 text-amber-700' :
                              p.estado === 'aceite' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-rose-100 text-rose-700'
                            }`}>
                              {p.estado}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {p.imovel?.localizacao}</p>
                          <div className="mt-2 text-sm font-bold text-primary">{formatPrice(p.valor_proposto)}</div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4">Nenhuma proposta submetida.</p>
                )}
              </div>
            </div>

            {/* Meus Contratos */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" /> Meus Contratos
                </h3>
                <Link href="/contratos" className="text-sm font-semibold text-primary hover:underline">
                  Ver Todos
                </Link>
              </div>

              <div className="space-y-4">
                {contratos.length > 0 ? (
                  contratos.map(c => (
                    <div key={c.id} className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-slate-500">Contrato #{c.id}</span>
                        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded-md">
                          {c.estado}
                        </span>
                      </div>
                      <h4 className="font-semibold text-sm text-slate-800 dark:text-white">{c.imovel?.titulo}</h4>
                      <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-900/30 flex justify-between items-center">
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-500">Valor Acordado</span>
                        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">{formatPrice(c.valor_acordado)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500 py-4">Nenhum contrato ativo.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
