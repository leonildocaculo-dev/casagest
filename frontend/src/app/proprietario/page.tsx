import { resolveImageUrl } from '@/lib/utils';
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Building2,
  FileText,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Loader2,
  MapPin,
  DollarSign
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

interface Imovel {
  id: number;
  titulo: string;
  preco: string;
  estado: string;
  localizacao: string;
  tipo: string;
  imagens?: { caminho: string }[];
}

interface Proposta {
  id: number;
  valor_proposto: string;
  estado: string;
  imovel: { titulo: string };
  cliente: { name: string };
}

interface DashboardStats {
  metrics: {
    total_imoveis: number;
    total_propostas: number;
    imoveis_vendidos: number;
    receita_potencial: number;
  };
  chart_data: { name: string; propostas: number }[];
}

export default function ProprietarioDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'proprietario' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [imoveisRes, propostasRes, statsRes] = await Promise.all([
          api.get('/meus-imoveis?por_pagina=4'),
          api.get('/propostas?por_pagina=5'),
          api.get('/proprietario/stats')
        ]);
        setImoveis(imoveisRes.data.data || []);
        setPropostas(propostasRes.data.data || []);
        setStats(statsRes.data);
      } catch (err) {
        console.error('Erro ao carregar dados do proprietário:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user, router]);

  const formatPrice = (val: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(val));

  if (!user || (user.role !== 'proprietario' && user.role !== 'admin')) return null;

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
              Bem-vindo ao seu painel de gestão imobiliária.
            </p>
          </div>
          <Link
            href="/imoveis/novo"
            className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm transition-all flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" /> Anunciar Imóvel
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column: Stats & Recent Properties */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.metrics?.total_imoveis || 0}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Imóveis</p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{stats?.metrics?.total_propostas || 0}</p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Propostas</p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">
                    {stats?.metrics?.imoveis_vendidos || 0}
                  </p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Imóveis Vendidos/Arr.</p>
                </div>

                <div className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm space-y-2">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <p className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white truncate" title={formatPrice(stats?.metrics?.receita_potencial || 0)}>
                    {formatPrice(stats?.metrics?.receita_potencial || 0)}
                  </p>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Receita Potencial</p>
                </div>
              </div>

              {/* Chart: Evolução de Propostas */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Evolução de Propostas (6 meses)</h3>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats?.chart_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorPropostas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="#64748b" />
                      <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} stroke="#64748b" allowDecimals={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="propostas" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorPropostas)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Properties */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Meus Imóveis Recentes</h3>
                  <Link href="/meus-imoveis" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                    Ver Todos <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>

                {imoveis.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {imoveis.map(imovel => (
                      <Link key={imovel.id} href={`/imoveis/${imovel.id}`} className="group flex gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700">
                        <div className="relative w-20 h-20 rounded-xl bg-slate-200 dark:bg-slate-700 overflow-hidden shrink-0">
                          {imovel.imagens && imovel.imagens.length > 0 ? (
                            <Image src={resolveImageUrl(imovel.imagens?.[0]?.caminho)} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Building2 className="w-6 h-6 text-slate-400" /></div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center">
                          <h4 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1 group-hover:text-primary transition-colors">{imovel.titulo}</h4>
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {imovel.localizacao}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs font-bold text-primary">{formatPrice(imovel.preco)}</span>
                            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {imovel.estado}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">Ainda não anunciou nenhum imóvel.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Recent Proposals */}
            <div className="space-y-8">
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-slate-800 dark:text-white">Propostas Recentes</h3>
                  <Link href="/propostas" className="text-sm font-semibold text-primary flex items-center gap-1 hover:underline">
                    Ver Todas
                  </Link>
                </div>

                <div className="space-y-4">
                  {propostas.length > 0 ? (
                    propostas.map(p => (
                      <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="flex justify-between items-start mb-2">
                          <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-md ${
                            p.estado === 'pendente' ? 'bg-amber-100 text-amber-700' :
                            p.estado === 'aceite' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-rose-100 text-rose-700'
                          }`}>
                            {p.estado}
                          </span>
                          <span className="text-xs font-semibold text-slate-500">Ref: #{p.id}</span>
                        </div>
                        <h4 className="font-semibold text-sm text-slate-800 dark:text-white line-clamp-1">{p.imovel?.titulo}</h4>
                        <p className="text-xs text-slate-500 mt-1">Por: {p.cliente?.name}</p>
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                          <span className="text-xs font-bold uppercase text-slate-400">Oferta</span>
                          <span className="text-sm font-bold text-primary">{formatPrice(p.valor_proposto)}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500 text-center py-4">Nenhuma proposta recebida.</p>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
