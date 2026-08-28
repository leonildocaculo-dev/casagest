'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  Search,
  MapPin,
  Home,
  Building2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Bed,
  Bath,
  Maximize,
  Plus,
  Tag,
  X,
  Filter,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Check,
  Map as MapIcon,
  List as ListIcon,
  Heart
} from 'lucide-react';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/Map'), { ssr: false });

interface ImovelImagem {
  id: number;
  caminho: string;
  ordem: number;
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
  endereco: string | null;
  latitude: number | null;
  longitude: number | null;
  imagens: ImovelImagem[];
  proprietario?: { id: number; name: string };
  created_at: string;
}

interface PaginatedResponse {
  data: Imovel[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

const TIPOS = [
  { value: '', label: 'Todos os tipos' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'vivenda', label: 'Vivenda & Moradia' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'loja', label: 'Loja' },
];

const CATEGORIAS_ESPECIAIS = [
  { value: '', label: 'Todas as categorias' },
  { value: 'Golf', label: 'Condomínios de Golfe' },
  { value: 'Resorts', label: 'Resorts de Luxo' },
  { value: 'Beach', label: 'Chalés de Praia' },
  { value: 'Urban', label: 'Apartamentos Urbanos' },
  { value: 'Countryside', label: 'Refúgios no Campo' },
  { value: 'Villas', label: 'Vivendas Mediterrâneas' },
];

const PRECOS_PRESETS = [
  { label: 'Todos os valores', min: '', max: '' },
  { label: 'Até 1.000.000 AOA', min: '', max: '1000000' },
  { label: '1M a 5M AOA', min: '1000000', max: '5000000' },
  { label: '5M a 15M AOA', min: '5000000', max: '15000000' },
  { label: 'Acima de 15M AOA', min: '15000000', max: '' },
];

function ImoveisListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, favoriteIds, toggleFavorite } = useAuth();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Filter States initialized from URL search params
  const [pesquisa, setPesquisa] = useState(searchParams.get('pesquisa') || '');
  const [localizacao, setLocalizacao] = useState(searchParams.get('localizacao') || '');
  const [tipo, setTipo] = useState(searchParams.get('tipo') || '');
  const [modalidade, setModalidade] = useState(searchParams.get('modalidade') || '');
  const [categoriaEspecial, setCategoriaEspecial] = useState(searchParams.get('categoria_especial') || '');
  const [precoMin, setPrecoMin] = useState(searchParams.get('preco_min') || '');
  const [precoMax, setPrecoMax] = useState(searchParams.get('preco_max') || '');
  const [quartos, setQuartos] = useState(searchParams.get('quartos') || '');
  const [casasBanho, setCasasBanho] = useState(searchParams.get('casas_banho') || '');
  const [destaque, setDestaque] = useState(searchParams.get('destaque') === 'true');
  const [ordenar, setOrdenar] = useState(searchParams.get('ordenar') || 'created_at');
  const [direcao, setDirecao] = useState(searchParams.get('direcao') || 'desc');
  const [lat, setLat] = useState(searchParams.get('lat') || '');
  const [lng, setLng] = useState(searchParams.get('lng') || '');
  const [raio, setRaio] = useState(searchParams.get('raio') || '5');

  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Mobile sidebar drawer state
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const fetchImoveis = async (targetPage: number = 1, currentLat?: string, currentLng?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(targetPage));
      params.set('por_pagina', '12');

      if (pesquisa) params.set('pesquisa', pesquisa);
      if (localizacao) params.set('localizacao', localizacao);
      if (tipo) params.set('tipo', tipo);
      if (modalidade) params.set('modalidade', modalidade);
      if (categoriaEspecial) params.set('categoria_especial', categoriaEspecial);
      if (precoMin) params.set('preco_min', precoMin);
      if (precoMax) params.set('preco_max', precoMax);
      if (quartos) params.set('quartos', quartos);
      if (casasBanho) params.set('casas_banho', casasBanho);
      if (destaque) params.set('destaque', 'true');
      if (ordenar) params.set('ordenar', ordenar);
      if (direcao) params.set('direcao', direcao);
      
      const applyLat = currentLat !== undefined ? currentLat : lat;
      const applyLng = currentLng !== undefined ? currentLng : lng;

      if (applyLat && applyLng) {
        params.set('lat', applyLat);
        params.set('lng', applyLng);
        params.set('raio', raio);
      }

      router.push(`/imoveis?${params.toString()}`, { scroll: false });

      const res = await api.get<PaginatedResponse>(`/imoveis?${params.toString()}`);
      setImoveis(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erro ao carregar imóveis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) await fetchImoveis(1);
    };
    load();
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ordenar, direcao]);

  const handleApplyFilters = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setShowMobileSidebar(false);
    
    let currentLat = lat;
    let currentLng = lng;

    if (localizacao && localizacao !== searchParams.get('localizacao')) {
      // Fetch geocode se a localização mudou
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localizacao)}`);
        const data = await res.json();
        if (data && data.length > 0) {
          currentLat = data[0].lat;
          currentLng = data[0].lon;
          setLat(currentLat);
          setLng(currentLng);
        } else {
          // Fallback se não encontrar
          currentLat = '';
          currentLng = '';
          setLat('');
          setLng('');
        }
      } catch (err) {
        console.error('Geocoding error', err);
      }
    } else if (!localizacao) {
      currentLat = '';
      currentLng = '';
      setLat('');
      setLng('');
    }

    fetchImoveis(1, currentLat, currentLng);
  };

  const handleClearFilters = async () => {
    setPesquisa('');
    setLocalizacao('');
    setTipo('');
    setModalidade('');
    setCategoriaEspecial('');
    setPrecoMin('');
    setPrecoMax('');
    setQuartos('');
    setCasasBanho('');
    setDestaque(false);
    setOrdenar('created_at');
    setDirecao('desc');
    setLat('');
    setLng('');
    setRaio('5');

    router.push('/imoveis', { scroll: false });

    setLoading(true);
    try {
      const res = await api.get<PaginatedResponse>('/imoveis?page=1&por_pagina=12');
      setImoveis(res.data.data);
      setPage(res.data.current_page);
      setLastPage(res.data.last_page);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Erro ao limpar filtros:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (preco: string) => {
    return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(preco));
  };

  const getImageUrl = (imovel: Imovel) => {
    if (imovel.imagens && imovel.imagens.length > 0) {
      return `http://localhost:8000/storage/${imovel.imagens[0].caminho}`;
    }
    return 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80';
  };

  const getTipoIcon = (t: string) => {
    switch (t) {
      case 'apartamento': return <Building2 className="w-3.5 h-3.5" />;
      case 'vivenda': return <Home className="w-3.5 h-3.5" />;
      default: return <Tag className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* 1. Header Banner */}
      <div className="bg-purple-950 text-white py-10 px-4 border-b-4 border-amber-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="px-3.5 py-1 bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wider rounded-full inline-block">
              Catálogo Oficial CasaGest
            </span>
            <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
              Explorar Imóveis & Empreendimentos
            </h1>
            <p className="text-purple-200 text-sm max-w-xl">
              Filtre imóveis por valor, localização, quartos e categoria. Emita propostas em tempo real.
            </p>
          </div>

          {(user?.role === 'proprietario' || user?.role === 'admin') && (
            <Link
              href="/imoveis/novo"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center gap-2 self-start md:self-auto hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Anunciar Novo Imóvel
            </Link>
          )}
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar (Mobile filter toggle + Sorting) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="lg:hidden px-4 py-2.5 bg-purple-950 text-amber-300 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros Avançados
            </button>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Encontrados <span className="text-purple-600 dark:text-amber-400 font-extrabold">{total}</span> imóveis
            </p>
          </div>

          <div className="flex items-center gap-4 self-end sm:self-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1 transition-colors ${viewMode === 'list' ? 'bg-purple-950 text-amber-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <ListIcon className="w-4 h-4" /> <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 text-xs font-bold flex items-center gap-1 transition-colors ${viewMode === 'map' ? 'bg-purple-950 text-amber-300' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <MapIcon className="w-4 h-4" /> <span className="hidden sm:inline">Mapa</span>
              </button>
            </div>

            {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <ArrowUpDown className="w-4 h-4 text-purple-600 dark:text-amber-400 shrink-0" />
            <span className="text-xs font-bold text-slate-500 uppercase hidden sm:inline">Ordenar:</span>
            <select
              value={`${ordenar}:${direcao}`}
              onChange={(e) => {
                const [ord, dir] = e.target.value.split(':');
                setOrdenar(ord);
                setDirecao(dir);
              }}
              className="px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              <option value="created_at:desc">Mais Recentes</option>
              <option value="preco:asc">Preço: Menor para Maior</option>
              <option value="preco:desc">Preço: Maior para Menor</option>
              <option value="quartos:desc">Mais Quartos</option>
            </select>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
          
          {/* 2. BARRA LATERAL DE FILTROS (Sidebar) */}
          <aside className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white dark:bg-slate-900 p-6 shadow-2xl overflow-y-auto transition-transform duration-300 lg:static lg:z-auto lg:w-full lg:shadow-none lg:p-0 lg:overflow-visible lg:translate-x-0
            ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}>
            <div className="space-y-6">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="font-black text-sm uppercase tracking-wider text-purple-950 dark:text-amber-400 flex items-center gap-2">
                  <Filter className="w-4 h-4" /> Filtros de Pesquisa
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearFilters}
                    className="text-[11px] font-bold text-slate-400 hover:text-purple-600 flex items-center gap-1"
                    title="Limpar todos os filtros"
                  >
                    <RotateCcw className="w-3 h-3" /> Limpar
                  </button>
                  <button
                    onClick={() => setShowMobileSidebar(false)}
                    className="lg:hidden p-1 text-slate-400 hover:text-slate-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleApplyFilters} className="space-y-5">
                
                {/* Keyword */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Palavra-Chave</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Título, descrição..."
                      value={pesquisa}
                      onChange={(e) => setPesquisa(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Localização e Raio */}
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase text-slate-500">Localização</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-amber-500" />
                      <input
                        type="text"
                        placeholder="Ex.: Talatona, Kilamba..."
                        value={localizacao}
                        onChange={(e) => {
                          setLocalizacao(e.target.value);
                          if (e.target.value === '') {
                             setLat('');
                             setLng('');
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      />
                    </div>
                  </div>


                </div>

                {/* Modalidade (Arrendar vs Comprar) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Modalidade</label>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setModalidade('')}
                      className={`py-1.5 text-[11px] font-extrabold uppercase rounded-lg transition-all ${
                        modalidade === '' ? 'bg-purple-950 text-amber-300 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Todas
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidade('arrendamento')}
                      className={`py-1.5 text-[11px] font-extrabold uppercase rounded-lg transition-all ${
                        modalidade === 'arrendamento' ? 'bg-purple-950 text-amber-300 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Arrendar
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalidade('venda')}
                      className={`py-1.5 text-[11px] font-extrabold uppercase rounded-lg transition-all ${
                        modalidade === 'venda' ? 'bg-purple-950 text-amber-300 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      Comprar
                    </button>
                  </div>
                </div>

                {/* Tipo de Imóvel */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Tipo de Imóvel</label>
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {TIPOS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                {/* Categoria Especial */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-slate-500">Categoria Especial</label>
                  <select
                    value={categoriaEspecial}
                    onChange={(e) => setCategoriaEspecial(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    {CATEGORIAS_ESPECIAIS.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Faixa de Valores */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-bold uppercase text-slate-500 block">Faixa de Valores (AOA)</label>
                  
                  {/* Presets Rápidos */}
                  <div className="space-y-1">
                    {PRECOS_PRESETS.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => { setPrecoMin(p.min); setPrecoMax(p.max); }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors flex items-center justify-between ${
                          precoMin === p.min && precoMax === p.max
                            ? 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-amber-300 font-bold'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{p.label}</span>
                        {precoMin === p.min && precoMax === p.max && <Check className="w-3 h-3 text-amber-400" />}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <input
                      type="number"
                      placeholder="Mínimo AOA"
                      value={precoMin}
                      onChange={(e) => setPrecoMin(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                    <input
                      type="number"
                      placeholder="Máximo AOA"
                      value={precoMax}
                      onChange={(e) => setPrecoMax(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    />
                  </div>
                </div>

                {/* Quartos e Casas de Banho */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">Quartos Mín.</label>
                    <select
                      value={quartos}
                      onChange={(e) => setQuartos(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Qualquer</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-bold uppercase text-slate-500">WCs Mín.</label>
                    <select
                      value={casasBanho}
                      onChange={(e) => setCasasBanho(e.target.value)}
                      className="w-full px-2.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                    >
                      <option value="">Qualquer</option>
                      <option value="1">1+</option>
                      <option value="2">2+</option>
                      <option value="3">3+</option>
                    </select>
                  </div>
                </div>

                {/* Imóveis em Destaque apenas */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={destaque}
                      onChange={(e) => setDestaque(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 accent-amber-400"
                    />
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Apenas Imóveis em Destaque
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  className="w-full py-3 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all hover:scale-[1.01]"
                >
                  Aplicar Filtros
                </button>
              </form>
            </div>
          </aside>

          {/* 3. GREED DE IMÓVEIS (Main Content) */}
          <main className="lg:col-span-3 space-y-6">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 h-80 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
                ))}
              </div>
            ) : imoveis.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 space-y-4">
                <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Nenhum imóvel encontrado</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Não encontramos propriedades com os critérios aplicados. Tente ajustar a localização ou a faixa de valores.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="px-6 py-2.5 bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all hover:scale-105"
                >
                  Limpar Todos os Filtros
                </button>
              </div>
            ) : viewMode === 'map' ? (
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-sm border border-slate-100 dark:border-slate-800 relative z-10">
                <MapView 
                  imoveis={imoveis} 
                  center={lat && lng ? [Number(lat), Number(lng)] : undefined}
                  zoom={lat && lng ? 13 : 11}
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {imoveis.map((imovel) => (
                  <Link
                    key={imovel.id}
                    href={`/imoveis/${imovel.id}`}
                    className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-2xl hover:border-purple-300 dark:hover:border-purple-800 transition-all duration-300 hover:-translate-y-1.5 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image */}
                      <div className="relative h-52 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={getImageUrl(imovel)}
                          alt={imovel.titulo}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Modality Tag */}
                        <span className="absolute top-3 left-3 px-3 py-1 bg-purple-950 text-amber-300 text-[10px] font-black uppercase rounded-lg shadow-md">
                          {imovel.modalidade || 'Arrendamento'}
                        </span>

                        {/* Special Category Tag */}
                        {imovel.categoria_especial && (
                          <span className="absolute top-3 right-3 px-2.5 py-1 bg-amber-400 text-purple-950 text-[10px] font-black uppercase rounded-lg shadow-md">
                            {imovel.categoria_especial}
                          </span>
                        )}

                        {/* Favorite Button */}
                        {user?.role === 'cliente' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleFavorite(imovel.id);
                            }}
                            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 rounded-full shadow-md hover:scale-110 transition-transform z-20"
                          >
                            <Heart 
                              className={`w-4 h-4 ${favoriteIds.includes(imovel.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400 dark:text-slate-300'}`} 
                            />
                          </button>
                        )}
                      </div>

                      {/* Info */}
                      <div className="p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                          {getTipoIcon(imovel.tipo)}
                          <span className="capitalize font-semibold">{imovel.tipo}</span>
                        </div>

                        <h3 className="font-bold text-slate-800 dark:text-white text-base line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-amber-400 transition-colors">
                          {imovel.titulo}
                        </h3>

                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 line-clamp-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {imovel.localizacao}
                        </p>

                        {/* Specs */}
                        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                          {imovel.quartos > 0 && (
                            <span className="flex items-center gap-1">
                              <Bed className="w-3.5 h-3.5 text-purple-600" /> {imovel.quartos} Qts
                            </span>
                          )}
                          {imovel.casas_banho > 0 && (
                            <span className="flex items-center gap-1">
                              <Bath className="w-3.5 h-3.5 text-purple-600" /> {imovel.casas_banho} WC
                            </span>
                          )}
                          {imovel.area_m2 && (
                            <span className="flex items-center gap-1">
                              <Maximize className="w-3.5 h-3.5 text-purple-600" /> {Number(imovel.area_m2)} m²
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Price and Footer */}
                    <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço</span>
                        <span className="text-base font-black text-purple-700 dark:text-amber-400">
                          {formatPrice(imovel.preco)}
                        </span>
                      </div>
                      <div className="text-right">
                         {(imovel as any).distancia && (
                           <span className="text-[10px] block font-semibold text-slate-500 dark:text-slate-400">
                             {parseFloat((imovel as any).distancia).toFixed(1)} km de distância
                           </span>
                         )}
                         <span className="text-xs font-bold text-purple-600 dark:text-amber-400 group-hover:underline">
                           Ver Mais →
                         </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8">
                <button
                  onClick={() => fetchImoveis(page - 1)}
                  disabled={page === 1}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: lastPage }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => fetchImoveis(p)}
                    className={`w-9 h-9 rounded-xl text-xs font-extrabold transition-all ${
                      p === page
                        ? 'bg-purple-950 text-amber-300 shadow-md font-black'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => fetchImoveis(page + 1)}
                  disabled={page === lastPage}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function ImoveisPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-purple-900 border-t-amber-400 animate-spin" /></div>}>
      <ImoveisListContent />
    </Suspense>
  );
}
