import { resolveImageUrl } from '@/lib/utils';
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import {
  MapPin,
  Bed,
  Bath,
  Maximize,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Building2,
  Calendar,
  Send,
  CreditCard,
  Clock,
  ShieldCheck,
  LogIn,
  UserPlus
} from 'lucide-react';

interface ImovelImagem {
  id: number;
  caminho: string;
  ordem: number;
}

interface Imovel {
  id: number;
  titulo: string;
  descricao: string;
  preco?: string;
  preco_venda?: string;
  preco_arrendamento?: string;
  modalidade?: string;
  tipo: string;
  localizacao: string;
  destaque?: boolean;
  categoria_especial?: string;
  estado: string;
  quartos: number;
  casas_banho: number;
  area_m2: string | null;
  endereco: string | null;
  imagens: ImovelImagem[];
  proprietario?: { id: number; name: string; phone?: string; email?: string };
  created_at: string;
}

interface Proposta {
  id: number;
  valor_proposto: string;
  mensagem: string;
  estado: 'pendente' | 'aceite' | 'recusada' | 'contraproposta';
  created_at: string;
}

interface Contrato {
  id: number;
  estado: string;
}

const tipoLabels: Record<string, string> = {
  apartamento: 'Apartamento',
  vivenda: 'Vivenda / Moradia',
  escritorio: 'Escritório',
  terreno: 'Terreno',
  loja: 'Loja Comercial',
};

const estadoStyles: Record<string, string> = {
  publicado: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  pendente: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  reservado: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  vendido: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  inativo: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
};

export default function ImovelDetalhePage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [minhasPropostas, setMinhasPropostas] = useState<Proposta[]>([]);
  const [meuContrato, setMeuContrato] = useState<Contrato | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const fetchImovel = async () => {
      try {
        const res = await api.get(`/imoveis/${params.id}`);
        if (!active) return;
        setImovel(res.data.imovel);

        // Se o cliente estiver logado, carregar as propostas/contratos associados a este imóvel
        if (user && user.role === 'cliente') {
          try {
            const propRes = await api.get('/propostas');
            const propostasImovel = propRes.data.data.filter((p: { imovel_id: number }) => p.imovel_id === Number(params.id));
            setMinhasPropostas(propostasImovel);

            const contRes = await api.get('/contratos');
            const contratoImovel = contRes.data.data.find((c: { imovel_id: number }) => c.imovel_id === Number(params.id));
            if (contratoImovel) setMeuContrato(contratoImovel);
          } catch {
            // Silencioso se não tiver propostas
          }
        }
      } catch {
        if (active) setError('Imóvel não encontrado.');
      } finally {
        if (active) setLoading(false);
      }
    };

    if (params.id) fetchImovel();
    return () => { active = false; };
  }, [params.id, user]);

  const formatPrice = (preco: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(preco));

  const formatDate = (date: string) =>
    new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(date));

  const canEdit = user && imovel && (user.role === 'admin' || user.id === imovel.proprietario?.id);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-6 w-2/3 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
        </div>
      </div>
    );
  }

  if (error || !imovel) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Building2 className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto" />
          <h2 className="text-xl font-semibold text-slate-600 dark:text-slate-300">{error || 'Imóvel não encontrado'}</h2>
          <Link href="/imoveis" className="inline-block text-purple-600 hover:underline text-sm font-semibold">
            ← Voltar à listagem
          </Link>
        </div>
      </div>
    );
  }

  const images = imovel.imagens || [];
  const hasImages = images.length > 0;
  const isVenda = imovel.modalidade === 'venda';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top bar */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          {canEdit && (
            <Link
              href={`/imoveis/${imovel.id}/editar`}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-amber-300 bg-purple-900 hover:bg-purple-800 rounded-xl transition-colors shadow-md"
            >
              <Pencil className="w-3.5 h-3.5" />
              Editar Imóvel
            </Link>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        
        {/* Galeria de Fotos em Alta Resolução */}
        <div className="relative h-72 sm:h-96 lg:h-120 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-900/20">
          {hasImages ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={resolveImageUrl(images[currentImage].caminho)}
                alt={`${imovel.titulo} - Imagem ${currentImage + 1}`}
                className="w-full h-full object-cover"
              />
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-purple-950/70 backdrop-blur-md text-amber-300 rounded-full hover:bg-purple-950 transition-all shadow-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-purple-950/70 backdrop-blur-md text-amber-300 rounded-full hover:bg-purple-950 transition-all shadow-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 bg-purple-950/60 backdrop-blur-md rounded-full">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentImage(i)}
                        className={`w-2.5 h-2.5 rounded-full transition-all ${i === currentImage ? 'bg-amber-400 scale-125' : 'bg-white/40 hover:bg-white/80'}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
              alt={imovel.titulo}
              className="w-full h-full object-cover"
            />
          )}

          {/* Badges Flutuantes */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400 text-purple-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg">
              {imovel.modalidade || 'Arrendamento'}
            </span>
            {imovel.categoria_especial && (
              <span className="px-3 py-1 bg-purple-950 text-amber-300 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg border border-amber-400/40">
                {imovel.categoria_especial}
              </span>
            )}
          </div>
        </div>

        {/* Informações Principais & Ações de Negócio */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna Esquerda: Detalhes do Imóvel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Título e Localização */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${estadoStyles[imovel.estado] || estadoStyles.inativo}`}>
                  {imovel.estado.toUpperCase()}
                </span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-300 rounded-full text-xs font-bold">
                  {tipoLabels[imovel.tipo] || imovel.tipo}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                {imovel.titulo}
              </h1>

              <p className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-sm">
                <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                {imovel.localizacao}
                {imovel.endereco && ` — ${imovel.endereco}`}
              </p>
            </div>

            {/* Especificações Técnicas (Quartos, WCs, Área) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imovel.quartos > 0 && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{imovel.quartos}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">{imovel.quartos === 1 ? 'Quarto' : 'Quartos'}</p>
                  </div>
                </div>
              )}

              {imovel.casas_banho > 0 && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl">
                    <Bath className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{imovel.casas_banho}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">WC</p>
                  </div>
                </div>
              )}

              {imovel.area_m2 && (
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl">
                    <Maximize className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-800 dark:text-white">{Number(imovel.area_m2)}</p>
                    <p className="text-[11px] font-bold text-slate-400 uppercase">m² de área</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">{formatDate(imovel.created_at)}</p>
                  <p className="text-[11px] font-bold text-slate-400 uppercase">Data Anúncio</p>
                </div>
              </div>
            </div>

            {/* Descrição Detalhada */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 space-y-4 shadow-sm">
              <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-wider">Descrição da Propriedade</h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {imovel.descricao}
              </p>
            </div>

            {/* Minhas Propostas & Contrato Ativo (Se Cliente Logado) */}
            {user && user.role === 'cliente' && minhasPropostas.length > 0 && (
              <div className="bg-purple-950 text-white rounded-3xl border-2 border-amber-400 p-6 sm:p-8 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-amber-400 text-base uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-5 h-5" /> Meu Histórico de Negociação
                  </h3>
                  {meuContrato && (
                    <Link
                      href={`/pagamentos/novo?contrato=${meuContrato.id}`}
                      className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" /> Efetuar Pagamento
                    </Link>
                  )}
                </div>

                <div className="space-y-3">
                  {minhasPropostas.map((prop) => (
                    <div key={prop.id} className="p-4 bg-purple-900/80 rounded-2xl border border-purple-800 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-amber-300 block text-sm">{formatPrice(prop.valor_proposto)}</span>
                        <span className="text-purple-200 block text-[11px] mt-0.5">&quot;{prop.mensagem}&quot;</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full font-extrabold uppercase text-[10px] ${
                        prop.estado === 'aceite' ? 'bg-emerald-400 text-purple-950' : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                      }`}>
                        {prop.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Caixa de Preço & Checkout de Proposta */}
          <div className="space-y-6">
            
            {/* Caixa Principal de Ação */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-purple-900/30 p-6 shadow-xl space-y-6">
              
              <div className="space-y-4">
                {(imovel.modalidade === 'venda' || imovel.modalidade === 'ambos' || !imovel.modalidade) && (imovel.preco_venda || imovel.preco) && (
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Preço de Venda</span>
                    <p className="text-3xl sm:text-4xl font-black text-purple-950 dark:text-amber-400 mt-1">
                      {formatPrice(imovel.preco_venda || imovel.preco || 0)}
                    </p>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      Valor para compra definitiva
                    </span>
                  </div>
                )}
                {(imovel.modalidade === 'arrendamento' || imovel.modalidade === 'ambos' || !imovel.modalidade) && (imovel.preco_arrendamento || imovel.preco_venda || imovel.preco) && (
                  <div>
                    <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-widest block">Preço Mensal</span>
                    <p className="text-3xl sm:text-4xl font-black text-purple-950 dark:text-amber-400 mt-1">
                      {formatPrice(imovel.preco_arrendamento || (Number(imovel.preco_venda || imovel.preco) / 240))}
                    </p>
                    <span className="text-xs text-slate-500 font-medium block mt-1">
                      Valor mensal de arrendamento
                    </span>
                  </div>
                )}
              </div>

              {/* Ações de Acordo com Autenticação do Utilizador */}
              {!user ? (
                /* Caso 1: Visitante Não Autenticado -> Exigir Login com Redirect Parameter! */
                <div className="p-5 bg-amber-400/10 border-2 border-amber-400 rounded-2xl space-y-4 text-center">
                  <div className="space-y-1">
                    <h4 className="font-bold text-purple-950 dark:text-amber-300 text-sm uppercase">Deseja {isVenda ? 'Comprar' : 'Arrendar'} este Imóvel?</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Inicie sessão na sua conta para submeter uma proposta e emitir contratos automáticos.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Link
                      href={`/login?redirect=/imoveis/${imovel.id}`}
                      className="w-full py-3.5 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <LogIn className="w-4 h-4" /> Entrar na Minha Conta
                    </Link>

                    <Link
                      href={`/register?redirect=/imoveis/${imovel.id}`}
                      className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4" /> Criar Conta Grátis
                    </Link>
                  </div>
                </div>
              ) : user.role === 'cliente' ? (
                /* Caso 2: Cliente Autenticado -> Botão de Envio de Proposta ou Direcionamento para Pagamento */
                <div className="space-y-3">
                  {imovel.estado === 'publicado' ? (
                    <div className="space-y-3">
                      {(imovel.modalidade === 'venda' || imovel.modalidade === 'ambos' || !imovel.modalidade) && (
                        <Link
                          href={`/propostas/nova?imovel=${imovel.id}&tipo=venda`}
                          className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                          <Send className="w-4 h-4" /> Fazer Proposta de Compra
                        </Link>
                      )}
                      {(imovel.modalidade === 'arrendamento' || imovel.modalidade === 'ambos' || !imovel.modalidade) && (
                        <Link
                          href={`/propostas/nova?imovel=${imovel.id}&tipo=arrendamento`}
                          className="w-full py-4 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
                        >
                          <Send className="w-4 h-4" /> Fazer Proposta de Arrendamento
                        </Link>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-xl text-center">
                      Este imóvel encontra-se {imovel.estado}.
                    </div>
                  )}
                </div>
              ) : (
                /* Caso 3: Proprietário ou Admin */
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-2xl text-xs text-purple-900 dark:text-purple-200 text-center">
                  Sessão iniciada como <strong>{user.role}</strong>.
                </div>
              )}

              {/* Informações do Anunciante */}
              {imovel.proprietario && (
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block">Anunciante Certificado</span>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-900 text-amber-300 rounded-full flex items-center justify-center font-bold text-sm">
                      {imovel.proprietario.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{imovel.proprietario.name}</p>
                      <p className="text-[11px] text-slate-400">Proprietário Verificado CasaGest</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Selo de Garantia e Segurança */}
            <div className="p-5 bg-purple-950 text-white rounded-3xl space-y-2 border border-amber-400/30">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h4 className="font-black text-amber-300 text-xs uppercase tracking-wider">Processo 100% Seguro</h4>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Todas as propostas registradas são protegidas por minutas de contrato automáticas e pagamentos verificados.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
