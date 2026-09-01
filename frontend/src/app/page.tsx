'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import {
  Search,
  Building2,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Sparkles,
  Award,
  Send,
  Loader2,
  AlertCircle,
  FileCheck,
  CheckCircle2
} from 'lucide-react';

interface ImovelImagem {
  caminho: string;
}

interface Imovel {
  id: number;
  titulo: string;
  descricao: string;
  preco: string;
  localizacao: string;
  tipo: string;
  modalidade?: string;
  destaque?: boolean;
  categoria_especial?: string;
  quartos: number;
  casas_banho: number;
  area_m2: string | null;
  imagens: ImovelImagem[];
}

export default function HomePage() {
  const [imoveisDestaque, setImoveisDestaque] = useState<Imovel[]>([]);
  const [loadingImoveis, setLoadingImoveis] = useState(true);

  // Search form
  const [localizacao, setLocalizacao] = useState('');
  const [tipo, setTipo] = useState('todos');
  const [modalidadeTab, setModalidadeTab] = useState<'todos' | 'arrendamento' | 'venda'>('todos');

  // Contact form
  const [contactoForm, setContactoForm] = useState({ nome: '', email: '', telefone: '', mensagem: '' });
  const [submittingContacto, setSubmittingContacto] = useState(false);
  const [contactoSuccess, setContactoSuccess] = useState('');
  const [contactoError, setContactoError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchDestaques = async () => {
      try {
        const res = await api.get('/imoveis?por_pagina=6');
        if (active) setImoveisDestaque(res.data.data);
      } catch (err) {
        console.error('Erro ao carregar destaques:', err);
      } finally {
        if (active) setLoadingImoveis(false);
      }
    };
    fetchDestaques();
    return () => { active = false; };
  }, []);

  const handleContactoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingContacto(true);
    setContactoSuccess('');
    setContactoError('');

    try {
      await api.post('/contacto', contactoForm);
      setContactoSuccess('A sua mensagem foi enviada com sucesso! A nossa equipa entrará em contacto.');
      setContactoForm({ nome: '', email: '', telefone: '', mensagem: '' });
    } catch {
      setContactoError('Erro ao enviar mensagem. Tente novamente.');
    } finally {
      setSubmittingContacto(false);
    }
  };

  const formatPrice = (preco: string) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(preco));
  };

  const getImageUrl = (imovel: Imovel) => {
    if (imovel.imagens && imovel.imagens.length > 0) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000';
      return `${baseUrl}/storage/${imovel.imagens[0].caminho}`;
    }
    // High-res Unsplash fallback
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 1. HERO SECTION (Fundo Branco com Acentos Púrpura & Dourado) */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-950 py-20 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 shadow-sm">
        <div className="max-w-6xl mx-auto text-center space-y-8 relative z-10">
          {/* Pill Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950 border border-purple-300 dark:border-purple-800 text-purple-950 dark:text-amber-300 text-xs font-black uppercase tracking-widest shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-700 dark:text-amber-400" />
            <span>Construção, Gestão Imobiliária & Investimentos</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight uppercase text-purple-950 dark:text-white">
            <span>O Maior Portal de </span>
            <span className="text-amber-500">
              Investimento & Gestão
            </span>
            <br />
            <span className="text-purple-700 dark:text-amber-300">Imobiliária em Angola</span>
          </h1>

          <p className="max-w-3xl mx-auto text-base sm:text-lg text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
            Conectamos proprietários, investidores e clientes com total transparência. Pesquise imóveis certificados, envie propostas em tempo real e emita contratos de arrendamento automáticos.
          </p>

          {/* Search Bar Container */}
          <div className="max-w-4xl mx-auto bg-slate-50 dark:bg-slate-900 p-4 sm:p-6 rounded-3xl border-2 border-purple-900/30 shadow-2xl space-y-4">
            {/* Tabs Arrendar / Comprar */}
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setModalidadeTab('todos')}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  modalidadeTab === 'todos' ? 'bg-purple-950 text-amber-300 shadow-md' : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-slate-300 hover:bg-purple-100'
                }`}
              >
                Todos
              </button>
              <button
                type="button"
                onClick={() => setModalidadeTab('arrendamento')}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  modalidadeTab === 'arrendamento' ? 'bg-purple-950 text-amber-300 shadow-md' : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-slate-300 hover:bg-purple-100'
                }`}
              >
                Arrendar
              </button>
              <button
                type="button"
                onClick={() => setModalidadeTab('venda')}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase transition-all ${
                  modalidadeTab === 'venda' ? 'bg-purple-950 text-amber-300 shadow-md' : 'bg-white dark:bg-slate-800 text-purple-900 dark:text-slate-300 hover:bg-purple-100'
                }`}
              >
                Comprar
              </button>
            </div>

            {/* Controls */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              <div className="flex-1 relative">
                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                <input
                  type="text"
                  placeholder="Localização (ex.: Talatona, Kilamba, Mussulo...)"
                  value={localizacao}
                  onChange={(e) => setLocalizacao(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                />
              </div>

              <div className="w-full sm:w-56">
                <select
                  value={tipo}
                  onChange={(e) => setTipo(e.target.value)}
                  className="w-full px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                >
                  <option value="todos">Todos os tipos</option>
                  <option value="apartamento">Apartamentos</option>
                  <option value="vivenda">Vivendas & Moradias</option>
                  <option value="escritorio">Escritórios</option>
                  <option value="terreno">Terrenos</option>
                  <option value="loja">Lojas Comerciais</option>
                </select>
              </div>

              <Link
                href={`/imoveis?localizacao=${encodeURIComponent(localizacao)}&tipo=${tipo !== 'todos' ? tipo : ''}${modalidadeTab !== 'todos' ? `&modalidade=${modalidadeTab}` : ''}`}
                className="w-full sm:w-auto px-8 py-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 shrink-0 hover:scale-105"
              >
                <Search className="w-5 h-5" />
                Pesquisar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. WELCOME / ABOUT SECTION (Inspired by Image) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-bold uppercase rounded-full">
              <Award className="w-4 h-4" />
              Empresa & Plataforma Líder
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white uppercase leading-tight">
              Bem-vindo ao CasaGest — Plataforma de Gestão Imobiliária
            </h2>

            <p className="text-slate-300 text-base leading-relaxed">
              O **CasaGest** é o sistema integrado concebido para transformar o mercado imobiliário angolano. Oferecemos um ecossistema digital onde proprietários cadastram imóveis, a administração analisa e valida anúncios, e os clientes realizam propostas seguras com emissão imediata de minutas de contrato em formato PDF.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 bg-purple-900/40 border border-purple-700/60 rounded-2xl">
                <ShieldCheck className="w-8 h-8 text-amber-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Garantia & Segurança</h4>
                <p className="text-xs text-slate-400 mt-1">Imóveis certificados e propostas registradas.</p>
              </div>

              <div className="p-4 bg-purple-900/40 border border-purple-700/60 rounded-2xl">
                <FileCheck className="w-8 h-8 text-amber-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Contratos Automáticos</h4>
                <p className="text-xs text-slate-400 mt-1">Geração instantânea de minutas em PDF.</p>
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <div className="p-4 bg-purple-900 border-2 border-amber-400 rounded-2xl text-center font-black">
                <span className="text-2xl text-amber-400">IMO</span>
                <span className="text-white text-xs block">CasaGest</span>
              </div>
              <div>
                <p className="font-bold text-white text-sm">Mais de 10 Anos de Inovação</p>
                <p className="text-xs text-slate-400">Transformando a gestão de propriedades em Angola.</p>
              </div>
            </div>
          </div>

          {/* Right Image Container with Custom Framed Box (like image) */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden border-4 border-purple-700 shadow-2xl p-2 bg-purple-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1000&q=80"
                alt="Equipa CasaGest & Empreendimentos"
                className="w-full h-100 object-cover rounded-2xl"
              />
            </div>
            {/* Framed Corner Accents */}
            <div className="absolute -bottom-6 -left-6 bg-amber-400 text-purple-950 font-black p-4 rounded-2xl shadow-xl hidden sm:block">
              <p className="text-2xl font-black">100%</p>
              <p className="text-xs uppercase tracking-wider">Digital & Transparente</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. BRIGHT YELLOW/GOLD HIGHLIGHT SECTION ("REAL ESTATE EXPO EVENTS 2026 / DESTAQUES") */}
      <section className="bg-amber-400 py-16 px-4 sm:px-6 lg:px-8 text-purple-950">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="px-4 py-1 bg-purple-950 text-amber-300 text-xs font-black uppercase tracking-widest rounded-full inline-block">
              Oportunidades Especiais
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight">
              Real Estate & Imóveis em Destaque 2026
            </h2>
            <p className="text-purple-900 font-semibold text-sm sm:text-base">
              Seleção exclusiva dos melhores empreendimentos e residências disponíveis para arrendamento e compra.
            </p>
          </div>

          {/* Grid de Imóveis em Destaque */}
          {loadingImoveis ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-purple-900 h-80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {imoveisDestaque.slice(0, 3).map((imovel) => (
                <div
                  key={imovel.id}
                  className="bg-purple-950 rounded-3xl overflow-hidden border-2 border-purple-900 text-white shadow-2xl flex flex-col justify-between hover:-translate-y-1 transition-all group"
                >
                  <div className="relative h-56 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getImageUrl(imovel)}
                      alt={imovel.titulo}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 right-3 px-3 py-1 bg-amber-400 text-purple-950 text-xs font-extrabold rounded-lg uppercase shadow-md">
                      {imovel.modalidade || 'Arrendamento'}
                    </span>
                  </div>

                  <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">
                        {imovel.categoria_especial || imovel.tipo}
                      </span>
                      <h3 className="text-lg font-bold text-white line-clamp-1 mt-1">{imovel.titulo}</h3>
                      <p className="text-xs text-slate-300 flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        {imovel.localizacao}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-purple-800/60 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase">Preço</span>
                        <span className="text-lg font-extrabold text-amber-400">{formatPrice(imovel.preco)}</span>
                      </div>
                      <Link
                        href={`/imoveis/${imovel.id}`}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 shadow-md"
                      >
                        Ver Detalhes <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-4">
            <Link
              href="/imoveis"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all hover:scale-105"
            >
              Ver Todos os Imóveis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. TRUSTED PARTNERS LOGO BAR */}
      <section className="bg-white text-slate-800 py-10 px-4 border-b border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-6">
          <p className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
            Parceiros de Confiança & Instituições Bancárias
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-8 items-center opacity-80 grayscale hover:grayscale-0 transition-all">
            <div className="flex items-center justify-center p-3 border border-slate-200 rounded-xl font-black text-purple-900 text-sm">
              <Building2 className="w-5 h-5 mr-1.5 text-purple-700" /> BANCO BAI
            </div>
            <div className="flex items-center justify-center p-3 border border-slate-200 rounded-xl font-black text-purple-900 text-sm">
              <Building2 className="w-5 h-5 mr-1.5 text-purple-700" /> ATLÂNTICO
            </div>
            <div className="flex items-center justify-center p-3 border border-slate-200 rounded-xl font-black text-purple-900 text-sm">
              <Building2 className="w-5 h-5 mr-1.5 text-purple-700" /> SONANGOL IMO
            </div>
            <div className="flex items-center justify-center p-3 border border-slate-200 rounded-xl font-black text-purple-900 text-sm">
              <Building2 className="w-5 h-5 mr-1.5 text-purple-700" /> EDICA CONSTRUTORA
            </div>
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center p-3 border border-slate-200 rounded-xl font-black text-purple-900 text-sm">
              <Building2 className="w-5 h-5 mr-1.5 text-purple-700" /> CASAS & JARDINS
            </div>
          </div>
        </div>
      </section>

      {/* 5. STATS COUNTER BANNER (Fundo Claro com Cartões Púrpura & Dourado) */}
      <section className="bg-white dark:bg-slate-900 py-16 px-4 border-y-4 border-purple-900 shadow-sm">
        <div className="max-w-7xl mx-auto text-center space-y-10">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black uppercase text-purple-950 dark:text-amber-400 tracking-tight">
              CasaGest em Números
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mt-2">Métricas do maior ecossistema de gestão imobiliária de Angola</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div className="p-6 bg-purple-950 text-white rounded-3xl text-center space-y-1 shadow-xl border border-amber-400/40">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">25.000+</p>
              <p className="text-xs text-slate-200 font-bold uppercase">Clientes Ativos</p>
            </div>

            <div className="p-6 bg-purple-950 text-white rounded-3xl text-center space-y-1 shadow-xl border border-amber-400/40">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">350+</p>
              <p className="text-xs text-slate-200 font-bold uppercase">Imóveis Ativos</p>
            </div>

            <div className="p-6 bg-purple-950 text-white rounded-3xl text-center space-y-1 shadow-xl border border-amber-400/40">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">2.500+</p>
              <p className="text-xs text-slate-200 font-bold uppercase">Contratos Gerados</p>
            </div>

            <div className="p-6 bg-purple-950 text-white rounded-3xl text-center space-y-1 shadow-xl border border-amber-400/40">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">20+</p>
              <p className="text-xs text-slate-200 font-bold uppercase">Cidades Atendidas</p>
            </div>

            <div className="col-span-2 md:col-span-1 p-6 bg-purple-950 text-white rounded-3xl text-center space-y-1 shadow-xl border border-amber-400/40">
              <p className="text-3xl sm:text-4xl font-black text-amber-400">99.8%</p>
              <p className="text-xs text-slate-200 font-bold uppercase">Satisfação</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CIRCULAR CATEGORY GALLERY ("CATEGORIAS ESPECIAIS" - Inspired by Image Bottom) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-950 text-white">
        <div className="max-w-7xl mx-auto space-y-12 text-center">
          <div>
            <span className="px-4 py-1 bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-widest rounded-full inline-block">
              Explorar Estilos de Vida
            </span>
            <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight mt-3 text-white">
              Categorias Especiais de Imóveis
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl mx-auto mt-2">
              Escolha a propriedade perfeita de acordo com a sua preferência geográfica e estilo de vida.
            </p>
          </div>

          {/* 6 Circular Image Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {/* Card 1 */}
            <Link href="/imoveis?categoria_especial=Golf" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1587061949409-02df41d5e562?auto=format&fit=crop&w=400&q=80"
                  alt="Golf Course Estates"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Condomínios de Golfe
              </h4>
            </Link>

            {/* Card 2 */}
            <Link href="/imoveis?categoria_especial=Resorts" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80"
                  alt="Luxury Resorts"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Resorts de Luxo
              </h4>
            </Link>

            {/* Card 3 */}
            <Link href="/imoveis?categoria_especial=Beach" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=400&q=80"
                  alt="Modern Beach Chalets"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Chalés de Praia
              </h4>
            </Link>

            {/* Card 4 */}
            <Link href="/imoveis?categoria_especial=Urban" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
                  alt="Urban Oasis Apartments"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Apartamentos Urbanos
              </h4>
            </Link>

            {/* Card 5 */}
            <Link href="/imoveis?categoria_especial=Countryside" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400&q=80"
                  alt="Countryside Retreats"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Refúgios no Campo
              </h4>
            </Link>

            {/* Card 6 */}
            <Link href="/imoveis?categoria_especial=Villas" className="group flex flex-col items-center space-y-3">
              <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 p-1 bg-purple-900 group-hover:scale-105 transition-transform duration-300 shadow-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80"
                  alt="Mediterranean Villas"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h4 className="text-xs font-black uppercase text-amber-300 group-hover:text-white transition-colors">
                Vivendas Mediterrâneas
              </h4>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. CONTACT & QUESTIONS FORM ("TEM DÚVIDAS? FALE CONOSCO!") */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 border-t-4 border-amber-400">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Form Box (Gold Container as in Image) */}
          <div className="bg-amber-400 p-8 sm:p-10 rounded-3xl text-purple-950 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 bg-purple-950 text-amber-300 rounded-full inline-block">
                Contacto Rápido
              </span>
              <h2 className="text-3xl font-black uppercase tracking-tight mt-2">
                Tem Dúvidas? Fale Conosco!
              </h2>
              <p className="text-xs font-bold text-purple-900 mt-1">
                Deixe os seus dados e a nossa equipa imobiliária responderá em menos de 24 horas.
              </p>
            </div>

            {contactoSuccess && (
              <div className="p-4 bg-purple-950 text-amber-300 font-bold rounded-2xl text-xs flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-amber-400" />
                <span>{contactoSuccess}</span>
              </div>
            )}

            {contactoError && (
              <div className="p-4 bg-rose-950 text-rose-200 font-bold rounded-2xl text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-400" />
                <span>{contactoError}</span>
              </div>
            )}

            <form onSubmit={handleContactoSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  required
                  placeholder="Seu Nome Completo"
                  value={contactoForm.nome}
                  onChange={(e) => setContactoForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-sm"
                />
                <input
                  type="email"
                  required
                  placeholder="Seu E-mail"
                  value={contactoForm.email}
                  onChange={(e) => setContactoForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-3 bg-white rounded-xl text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-sm"
                />
              </div>

              <input
                type="text"
                placeholder="Telefone (ex.: +244 923 000 000)"
                value={contactoForm.telefone}
                onChange={(e) => setContactoForm(prev => ({ ...prev, telefone: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-sm"
              />

              <textarea
                required
                rows={4}
                placeholder="Como podemos ajudá-lo? (Ex.: Gostaria de saber mais sobre o apartamento em Talatona...)"
                value={contactoForm.mensagem}
                onChange={(e) => setContactoForm(prev => ({ ...prev, mensagem: e.target.value }))}
                className="w-full px-4 py-3 bg-white rounded-xl text-sm font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-900 shadow-sm resize-none"
              />

              <button
                type="submit"
                disabled={submittingContacto}
                className="w-full py-4 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
              >
                {submittingContacto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Mensagem
              </button>
            </form>
          </div>

          {/* Right Image Container */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-purple-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1000&q=80"
                alt="Edifício CasaGest"
                className="w-full h-130 object-cover"
              />
          </div>
        </div>
      </section>

    </div>
  );
}
