'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { ArrowLeft, Building2, Send, AlertCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const formSchema = z.object({
  valor_proposto: z.coerce.number().min(1, "Insira um valor válido acima de 0"),
  mensagem: z.string().optional(),
  duracao_meses: z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface Imovel {
  id: number;
  titulo: string;
  preco?: string;
  preco_venda?: string;
  preco_arrendamento?: string;
  localizacao: string;
  tipo: string;
  modalidade?: string;
  proprietario?: { name: string };
  imagens?: { caminho: string }[];
}

function NovaPropostaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const imovelId = searchParams.get('imovel');
  const tipo = searchParams.get('tipo');
  const { user } = useAuth();

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loadingImovel, setLoadingImovel] = useState(true);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      mensagem: '',
      duracao_meses: 12,
    }
  });

  useEffect(() => {
    let active = true;
    const init = async () => {
      if (!active) return;
      if (user && user.role !== 'cliente' && user.role !== 'admin') {
        router.push('/imoveis');
        return;
      }

      if (!imovelId) {
        setError('Nenhum imóvel especificado.');
        setLoadingImovel(false);
        return;
      }

      try {
        const res = await api.get(`/imoveis/${imovelId}`);
        const data = res.data.imovel;
        if (active) {
          setImovel(data);
          if (tipo === 'venda') {
            setValue('valor_proposto', Number(data.preco_venda || data.preco));
          } else if (tipo === 'arrendamento') {
            setValue('valor_proposto', Number(data.preco_arrendamento || data.preco));
          } else {
            setValue('valor_proposto', Number(data.preco));
          }
        }
      } catch {
        if (active) setError('Não foi possível carregar os dados do imóvel.');
      } finally {
        if (active) setLoadingImovel(false);
      }
    };

    init();
    return () => { active = false; };
  }, [imovelId, user, router, setValue, tipo]);

  const onSubmit = async (data: FormValues) => {
    if (!imovelId) return;
    setError('');

    try {
      const tipoReal = tipo || imovel?.modalidade || 'arrendamento';
      await api.post('/propostas', {
        imovel_id: Number(imovelId),
        valor_proposto: data.valor_proposto,
        tipo: tipoReal,
        mensagem: data.mensagem || null,
        duracao_meses: tipoReal === 'arrendamento' ? data.duracao_meses : null,
      });

      router.push('/propostas');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao submeter proposta. Tente novamente.');
    }
  };

  const formatPrice = (preco: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(preco));

  if (loadingImovel) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 flex justify-center items-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error && !imovel) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4 flex justify-center items-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
          <p className="text-slate-700 dark:text-slate-300 font-medium">{error}</p>
          <Link href="/imoveis" className="text-primary hover:underline text-sm">
            Voltar à lista de imóveis
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar ao Imóvel
        </Button>

        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Enviar Proposta {tipo === 'venda' ? 'de Compra' : tipo === 'arrendamento' ? 'de Arrendamento' : ''}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Envie a sua oferta financeira diretamente ao proprietário.</p>
          </div>

          {imovel && (
            <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="relative w-16 h-16 bg-slate-200 dark:bg-slate-700 rounded-lg overflow-hidden shrink-0">
                {imovel.imagens && imovel.imagens.length > 0 ? (
                  <Image src={`http://localhost:8000/storage/${imovel.imagens[0].caminho}`} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Building2 className="w-6 h-6 text-slate-400" /></div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800 dark:text-white text-sm line-clamp-1">{imovel.titulo}</h3>
                <p className="text-xs text-slate-500">{imovel.localizacao}</p>
                <p className="text-sm font-bold text-primary mt-1">Preço Anunciado: {formatPrice(tipo === 'venda' ? (imovel.preco_venda || imovel.preco || 0) : tipo === 'arrendamento' ? (imovel.preco_arrendamento || imovel.preco || 0) : (imovel.preco || 0))}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="valor_proposto">Valor da Sua Proposta (AOA) *</Label>
              <Input
                id="valor_proposto"
                type="number"
                step="0.01"
                placeholder="Insira o valor..."
                className="font-bold"
                {...register('valor_proposto')}
              />
              {errors.valor_proposto && <p className="text-xs text-destructive">{errors.valor_proposto.message}</p>}
            </div>

            {tipo === 'arrendamento' && (
              <div className="space-y-2">
                <Label htmlFor="duracao_meses">Duração do Contrato *</Label>
                <select
                  id="duracao_meses"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('duracao_meses')}
                >
                  <option value={6}>6 Meses</option>
                  <option value={12}>1 Ano</option>
                </select>
                {errors.duracao_meses && <p className="text-xs text-destructive">{errors.duracao_meses.message}</p>}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem ao Proprietário (opcional)</Label>
              <textarea
                id="mensagem"
                rows={4}
                placeholder="Apresente-se brevemente ou indique condições de pagamento/prazos..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                {...register('mensagem')}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Submeter Proposta
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NovaPropostaPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <NovaPropostaContent />
    </Suspense>
  );
}
