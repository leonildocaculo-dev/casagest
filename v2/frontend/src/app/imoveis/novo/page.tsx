'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { ArrowLeft, Upload, X, AlertCircle, ImagePlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Image from 'next/image';

const formSchema = z.object({
  titulo: z.string().min(3, "O título deve ter pelo menos 3 caracteres"),
  descricao: z.string().min(10, "A descrição deve ter pelo menos 10 caracteres"),
  localizacao: z.string().min(2, "Informe a localização"),
  tipo: z.enum(['apartamento', 'vivenda', 'escritorio', 'terreno', 'loja']),
  modalidade: z.enum(['arrendamento', 'venda', 'ambos']),
  preco_venda: z.coerce.number().optional(),
  preco_arrendamento: z.coerce.number().optional(),
  quartos: z.coerce.number().min(0).default(0),
  casas_banho: z.coerce.number().min(0).default(0),
  area_m2: z.coerce.number().nullable().optional(),
  endereco: z.string().optional(),
}).refine(data => {
  if (data.modalidade === 'venda' || data.modalidade === 'ambos' || data.modalidade === 'arrendamento') {
    return (data.preco_venda ?? 0) > 0;
  }
  return true;
}, { message: "Preço Base obrigatório", path: ["preco_venda"] });

type FormValues = z.infer<typeof formSchema>;

const TIPOS = [
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'vivenda', label: 'Vivenda / Moradia' },
  { value: 'escritorio', label: 'Escritório' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'loja', label: 'Loja Comercial' },
];

const MODALIDADES = [
  { value: 'arrendamento', label: 'Para Arrendar' },
  { value: 'venda', label: 'Para Vender' },
  { value: 'ambos', label: 'Ambos (Vender e Arrendar)' },
];

export default function NovoImovelPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [error, setError] = useState('');
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      titulo: '',
      descricao: '',
      localizacao: '',
      tipo: 'apartamento',
      modalidade: 'arrendamento',
      preco_venda: 0,
      preco_arrendamento: 0,
      quartos: 0,
      casas_banho: 0,
    }
  });

  // eslint-disable-next-line react-hooks/incompatible-library
  const watchModalidade = watch('modalidade');
  const watchPrecoVenda = watch('preco_venda');

  if (user && user.role === 'cliente') {
    router.push('/imoveis');
    return null;
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 10) {
      setError('Máximo de 10 imagens permitidas.');
      return;
    }
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setError('');

    try {
      // 1. Criar imóvel
      const res = await api.post('/imoveis', data);
      const imovelId = res.data.imovel.id;

      // 2. Upload de imagens (se houver)
      if (imageFiles.length > 0) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append('imagens[]', file));

        await api.post(`/imoveis/${imovelId}/imagens`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      router.push(`/imoveis/${imovelId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao criar imóvel. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Cadastrar Novo Imóvel</h1>
            <p className="text-sm text-slate-500">Preencha os detalhes do seu imóvel.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-destructive bg-destructive/10 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-white">Informações Básicas</h2>

            <div className="space-y-2">
              <Label htmlFor="titulo">Título *</Label>
              <Input id="titulo" placeholder="Ex.: Apartamento T3 em Talatona" {...register('titulo')} />
              {errors.titulo && <p className="text-xs text-destructive">{errors.titulo.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição *</Label>
              <textarea
                id="descricao"
                rows={5}
                placeholder="Descreva o imóvel em detalhe..."
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                {...register('descricao')}
              />
              {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <select
                  id="tipo"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('tipo')}
                >
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.tipo && <p className="text-xs text-destructive">{errors.tipo.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="modalidade">Modalidade *</Label>
                <select
                  id="modalidade"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...register('modalidade')}
                >
                  {MODALIDADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                {errors.modalidade && <p className="text-xs text-destructive">{errors.modalidade.message}</p>}
              </div>
            </div>

            {/* Renderizar o preço base que será usado para o cálculo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="preco_venda">Preço Base do Imóvel (AOA) *</Label>
                <Input id="preco_venda" type="number" step="0.01" placeholder="Ex.: 25000000" {...register('preco_venda')} />
                {errors.preco_venda && <p className="text-xs text-destructive">{errors.preco_venda.message}</p>}
                {(watchModalidade === 'arrendamento' || watchModalidade === 'ambos') && watchPrecoVenda ? (
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-1">
                    O valor mensal do arrendamento será gerado automaticamente (240x menor): {Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(Number(watchPrecoVenda) / 240)}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-white">Localização</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="localizacao">Localização *</Label>
                <Input id="localizacao" placeholder="Ex.: Talatona, Luanda" {...register('localizacao')} />
                {errors.localizacao && <p className="text-xs text-destructive">{errors.localizacao.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço completo</Label>
                <Input id="endereco" placeholder="Rua, número, bloco..." {...register('endereco')} />
                {errors.endereco && <p className="text-xs text-destructive">{errors.endereco.message}</p>}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-white">Especificações</h2>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quartos">Quartos</Label>
                <Input id="quartos" type="number" min="0" {...register('quartos')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="casas_banho">Casas de Banho</Label>
                <Input id="casas_banho" type="number" min="0" {...register('casas_banho')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area_m2">Área (m²)</Label>
                <Input id="area_m2" type="number" step="0.01" {...register('area_m2')} />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-800 dark:text-white">Fotografias</h2>

            {imagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {imagePreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border">
                    <Image src={src} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-slate-50 transition-all">
              <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
              <span className="text-sm text-slate-500">Adicionar fotografias</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageChange} className="hidden" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
              Cadastrar Imóvel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
