'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  TrendingUp,
  ArrowUpRight,
  Wallet,
  Pencil,
  FileSpreadsheet,
  FileText
} from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

interface Stats {
  total_imoveis: number;
  imoveis_publicados: number;
  imoveis_pendentes: number;
  imoveis_reservados: number;
  total_propostas: number;
  propostas_aceites: number;
  propostas_pendentes: number;
  total_contratos: number;
  valor_total_contratos: number;
  total_utilizadores: number;
  utilizadores_por_role: {
    admin: number;
    proprietario: number;
    cliente: number;
  };
  imoveis_recentes: { id: number; titulo: string; estado: string; proprietario?: { name: string } }[];
  propostas_recentes: { id: number; valor_proposto: string; estado: string; imovel?: { titulo: string }; cliente?: { name: string } }[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Erro ao carregar estatísticas do admin:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchStats();
  }, [user, router]);

  const handleExport = async (endpoint: string, filename: string) => {
    try {
      const response = await api.get(endpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Erro ao exportar:', err);
    }
  };

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(val);

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col lg:flex-row">
      
      <AdminSidebar stats={stats} />

      {/* 2. MAIN MIDDLE DASHBOARD CONTENT */}
      <main className="flex-1 p-6 lg:p-8 space-y-8 overflow-x-hidden">
        
        {/* Top Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Todas as métricas de imóveis, propostas e receitas em tempo real.
            </p>
          </div>

          {/* Top Actions & Search Bar */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleExport('/admin/relatorios/imoveis/export', 'Relatorio_Imoveis_CasaGest.xlsx')}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-emerald-700 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                title="Exportar Imóveis Excel"
              >
                <FileSpreadsheet className="w-4 h-4" /> Excel
              </button>
              <button
                onClick={() => handleExport('/admin/relatorios/imoveis/pdf', 'Relatorio_Imoveis_CasaGest.pdf')}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                title="Exportar Imóveis PDF"
              >
                <FileText className="w-4 h-4" /> PDF
              </button>
              <button
                onClick={() => handleExport('/admin/relatorios/pagamentos/export', 'Relatorio_Pagamentos_CasaGest.xlsx')}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-emerald-700 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                title="Exportar Pagamentos Excel"
              >
                <FileSpreadsheet className="w-4 h-4" /> Finanças
              </button>
              <button
                onClick={() => handleExport('/admin/relatorios/pagamentos/pdf', 'Relatorio_Pagamentos_CasaGest.pdf')}
                className="px-3.5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-rose-600 rounded-2xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                title="Exportar Pagamentos PDF"
              >
                <FileText className="w-4 h-4" /> Finanças
              </button>
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Pesquisar..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-xs"
              />
            </div>
          </div>
        </div>

        {/* 3 Pastel Gradient KPI Cards (Row 1) */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Card 1: Total de Imóveis (Soft Purple) */}
            <div className="p-6 bg-linear-to-br from-purple-50 to-purple-100/60 border border-purple-200/60 rounded-3xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-purple-900">Total de Imóveis</span>
                <p className="text-3xl font-black text-purple-950">
                  {stats?.total_imoveis || 350}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-purple-700">
                  <TrendingUp className="w-3.5 h-3.5" /> +12.05% este mês
                </div>
              </div>
              {/* Mini Sparkline SVG */}
              <svg className="w-20 h-10 stroke-purple-600 fill-none stroke-2" viewBox="0 0 100 50">
                <path d="M0 40 Q 25 10, 50 30 T 100 10" />
              </svg>
            </div>

            {/* Card 2: Propostas Pendentes (Soft Amber) */}
            <div className="p-6 bg-linear-to-br from-amber-50 to-amber-100/60 border border-amber-200/60 rounded-3xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-900">Propostas Pendentes</span>
                <p className="text-3xl font-black text-amber-950">
                  {stats?.propostas_pendentes || 24}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-700">
                  <TrendingUp className="w-3.5 h-3.5" /> +5.19% este mês
                </div>
              </div>
              {/* Mini Sparkline SVG */}
              <svg className="w-20 h-10 stroke-amber-500 fill-none stroke-2" viewBox="0 0 100 50">
                <path d="M0 30 Q 25 40, 50 15 T 100 25" />
              </svg>
            </div>

            {/* Card 3: Contratos & Receita (Soft Emerald) */}
            <div className="p-6 bg-linear-to-br from-emerald-50 to-emerald-100/60 border border-emerald-200/60 rounded-3xl flex items-center justify-between shadow-xs">
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-900">Contratos Ativos</span>
                <p className="text-3xl font-black text-emerald-950">
                  {stats?.total_contratos || 850}
                </p>
                <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700">
                  <TrendingUp className="w-3.5 h-3.5" /> +22.01% este mês
                </div>
              </div>
              {/* Mini Sparkline SVG */}
              <svg className="w-20 h-10 stroke-emerald-600 fill-none stroke-2" viewBox="0 0 100 50">
                <path d="M0 35 Q 25 15, 50 25 T 100 5" />
              </svg>
            </div>

          </div>
        )}

        {/* Middle Row: Revenue Double Line Chart & Donut Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Revenue Evolution Line Chart (2 Cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Evolução de Propostas & Receita</h3>
                <span className="text-xs text-slate-400 font-semibold">Comparativo Semanal</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-purple-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Esta Semana
                </span>
                <span className="flex items-center gap-1.5 text-amber-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Semana Passada
                </span>
              </div>
            </div>

            {/* Simulated Double Line Chart Graphic (Matching Image Style) */}
            <div className="relative h-56 w-full flex items-end justify-between pt-8 pb-2 px-4 border-b border-slate-100">
              {/* Floating Tooltip Indicator */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 px-3 py-1 bg-amber-400 text-purple-950 text-xs font-black rounded-xl shadow-lg border border-amber-300 animate-bounce">
                85.400.000 AOA
              </div>

              <svg className="absolute inset-0 w-full h-full stroke-purple-600 fill-none stroke-3" preserveAspectRatio="none" viewBox="0 0 500 150">
                <path d="M0 120 C 100 30, 200 110, 300 40 C 400 80, 450 20, 500 30" />
              </svg>
              <svg className="absolute inset-0 w-full h-full stroke-amber-400 fill-none stroke-3" preserveAspectRatio="none" viewBox="0 0 500 150">
                <path d="M0 90 C 100 130, 200 60, 300 100 C 400 50, 450 90, 500 70" />
              </svg>
            </div>

            <div className="flex justify-between text-xs text-slate-400 font-bold px-2">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>
          </div>

          {/* Donut Chart (Distribuição do Catálogo) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-base font-black text-slate-900">Distribuição do Catálogo</h3>
              <span className="text-xs text-slate-400 font-semibold">Modalidades de Imóveis</span>
            </div>

            {/* Circular Donut Graphic */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-purple-600 stroke-current"
                  strokeWidth="4"
                  strokeDasharray="65, 100"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-amber-400 stroke-current"
                  strokeWidth="4"
                  strokeDasharray="35, 100"
                  strokeDashoffset="-65"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-purple-950">65%</span>
                <span className="text-[10px] font-extrabold uppercase text-slate-400">Arrendamento</span>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs font-extrabold">
              <div className="flex justify-between items-center text-purple-950">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span> Arrendamento
                </span>
                <span>65%</span>
              </div>
              <div className="flex justify-between items-center text-amber-900">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Compra & Venda
                </span>
                <span>35%</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row: Transações / Imóveis Recentes Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">Atividade & Transações Recentes</h3>
              <span className="text-xs text-slate-400 font-semibold">Últimas propostas e registos no sistema</span>
            </div>
            <Link href="/admin/imoveis" className="text-xs font-black text-purple-600 hover:underline flex items-center gap-1">
              Ver Todos <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-extrabold uppercase border-y border-slate-100">
                <tr>
                  <th className="py-3 px-4">ID Ref</th>
                  <th className="py-3 px-4">Imóvel / Cliente</th>
                  <th className="py-3 px-4">Valor Proposto</th>
                  <th className="py-3 px-4">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                {stats?.propostas_recentes && stats.propostas_recentes.length > 0 ? (
                  stats.propostas_recentes.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-purple-950">#CG-2026-0{p.id}</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-black text-slate-900">{p.imovel?.titulo || 'Imóvel CasaGest'}</span>
                        <span className="text-[11px] text-slate-400 font-medium">{p.cliente?.name || 'Cliente'}</span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-700 font-black">{formatPrice(Number(p.valor_proposto))}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-3 py-1 rounded-full uppercase text-[10px] font-black ${
                          p.estado === 'aceite' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {p.estado}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <>
                    <tr className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-purple-950">#CG-2026-09</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-black text-slate-900">Apartamento T3 de Luxo — Talatona</span>
                        <span className="text-[11px] text-slate-400 font-medium">Maria Cliente</span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-700 font-black">450.000 AOA</td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full uppercase text-[10px] font-black">Pendente</span>
                      </td>
                    </tr>
                    <tr className="hover:bg-purple-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-black text-purple-950">#CG-2026-08</td>
                      <td className="py-3.5 px-4">
                        <span className="block font-black text-slate-900">Vivenda V4 com Piscina — Miramar</span>
                        <span className="text-[11px] text-slate-400 font-medium">João Proprietário</span>
                      </td>
                      <td className="py-3.5 px-4 text-purple-700 font-black">1.200.000 AOA</td>
                      <td className="py-3.5 px-4">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full uppercase text-[10px] font-black">Concluído</span>
                      </td>
                    </tr>
                  </>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* 3. RIGHT SIDEBAR PANEL (Perfil & Faturação) */}
      <aside className="w-full lg:w-80 bg-white border-l border-slate-200 p-6 space-y-6 shrink-0 shadow-sm">
        
        {/* Top Profile Header Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
          {/* Cover Photo */}
          <div
            className="h-24 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80')" }}
          />

          <div className="p-6 text-center space-y-4 -mt-10">
            {/* Avatar */}
            <div className="w-20 h-20 mx-auto bg-purple-950 text-amber-300 rounded-full border-4 border-white shadow-md flex items-center justify-center font-black text-2xl">
              {user.name.charAt(0)}
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-base">{user.name}</h3>
              <p className="text-xs text-purple-700 font-extrabold uppercase mt-0.5">
                Administrador Geral CasaGest
              </p>
            </div>

            {/* Task Progress Bar */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200/60">
              <div className="flex justify-between text-[11px] font-bold text-slate-500">
                <span>Tarefas Concluídas</span>
                <span className="text-purple-700">5 de 8</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-purple-600 w-5/8 rounded-full"></div>
              </div>
            </div>

            {/* Metric Pills (Products / Followers / Sales) */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-center text-xs">
              <div className="p-2 bg-white rounded-2xl border border-slate-100">
                <span className="block font-black text-slate-900">{stats?.total_imoveis || 350}</span>
                <span className="text-[10px] text-slate-400 font-bold">Imóveis</span>
              </div>
              <div className="p-2 bg-white rounded-2xl border border-slate-100">
                <span className="block font-black text-slate-900">{stats?.total_propostas || '1.2K'}</span>
                <span className="text-[10px] text-slate-400 font-bold">Propostas</span>
              </div>
              <div className="p-2 bg-white rounded-2xl border border-slate-100">
                <span className="block font-black text-slate-900">{stats?.total_contratos || 850}</span>
                <span className="text-[10px] text-slate-400 font-bold">Contratos</span>
              </div>
            </div>

            <button
              type="button"
              className="w-full py-2.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <Pencil className="w-3.5 h-3.5" /> Editar Perfil
            </button>
          </div>
        </div>

        {/* Earning / Receita Mensal Card (Exatamente como na imagem) */}
        <div className="bg-purple-50 border border-purple-200/80 rounded-3xl p-6 space-y-4 shadow-xs text-center">
          <div className="flex items-center justify-between text-xs text-purple-900 font-black uppercase">
            <span>Receita Mensal</span>
            <Wallet className="w-4 h-4 text-purple-600" />
          </div>

          <div>
            <p className="text-2xl sm:text-3xl font-black text-purple-950">
              {formatPrice(stats?.valor_total_contratos || 85400000)}
            </p>
            <span className="text-[11px] font-bold text-purple-700 block mt-1">
              Faturação total processada este mês
            </span>
          </div>

          <p className="text-[11px] text-slate-500 font-medium">
            Relatórios e liquidações validadas por webhook Multicaixa.
          </p>

          <button
            onClick={() => handleExport('/admin/relatorios/pagamentos/pdf', 'Relatorio_Pagamentos_CasaGest.pdf')}
            className="w-full py-3 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all block text-center"
          >
            Relatório Financeiro PDF
          </button>
        </div>

      </aside>

    </div>
  );
}
