'use client';
import { resolveImageUrl } from '@/lib/utils';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { ArrowLeft, Save, AlertCircle, Loader2, Trash2, ImagePlus, X } from 'lucide-react';

interface ImovelImagem {
  id: number;
  caminho: string;
  ordem: number;
}

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

export default function EditarImovelPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingImages, setExistingImages] = useState<ImovelImagem[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    preco: '',
    localizacao: '',
    tipo: 'apartamento',
    modalidade: 'arrendamento',
    preco_venda: '',
    preco_arrendamento: '',
    quartos: '0',
    casas_banho: '0',
    area_m2: '',
    endereco: '',
  });

  useEffect(() => {
    const fetchImovel = async () => {
      try {
        const res = await api.get(`/imoveis/${params.id}`);
        const imovel = res.data.imovel;
        setForm({
          titulo: imovel.titulo,
          descricao: imovel.descricao,
          preco: imovel.preco,
          localizacao: imovel.localizacao,
          tipo: imovel.tipo,
          modalidade: imovel.modalidade || 'arrendamento',
          preco_venda: imovel.preco_venda ? String(imovel.preco_venda) : '',
          preco_arrendamento: imovel.preco_arrendamento ? String(imovel.preco_arrendamento) : '',
          quartos: String(imovel.quartos),
          casas_banho: String(imovel.casas_banho),
          area_m2: imovel.area_m2 || '',
          endereco: imovel.endereco || '',
        });
        setExistingImages(imovel.imagens || []);
      } catch {
        setError('Erro ao carregar imóvel.');
      } finally {
        setLoading(false);
      }
    };
    if (params.id) fetchImovel();
  }, [params.id]);

  const updateForm = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImageFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewImagePreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index: number) => {
    setNewImageFiles(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = async (imagem: ImovelImagem) => {
    try {
      await api.delete(`/imoveis/${params.id}/imagens/${imagem.id}`);
      setExistingImages(prev => prev.filter(img => img.id !== imagem.id));
    } catch {
      setError('Erro ao remover imagem.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await api.put(`/imoveis/${params.id}`, {
        ...form,
        preco: form.preco ? Number(form.preco) : null,
        preco_venda: form.preco_venda ? Number(form.preco_venda) : null,
        preco_arrendamento: form.preco_arrendamento ? Number(form.preco_arrendamento) : null,
        quartos: Number(form.quartos),
        casas_banho: Number(form.casas_banho),
        area_m2: form.area_m2 ? Number(form.area_m2) : null,
      });

      // Upload novas imagens
      if (newImageFiles.length > 0) {
        const formData = new FormData();
        newImageFiles.forEach(file => formData.append('imagens[]', file));
        await api.post(`/imoveis/${params.id}/imagens`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccess('Imóvel atualizado com sucesso!');
      setTimeout(() => router.push(`/imoveis/${params.id}`), 1500);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || 'Erro ao atualizar imóvel.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
        <div className="max-w-3xl mx-auto animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Editar Imóvel</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Atualize os dados do seu imóvel.</p>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-xl">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 p-3 mb-6 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 rounded-xl">
            <span>✓ {success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Info básica */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Informações Básicas</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Título *</label>
              <input type="text" required value={form.titulo} onChange={(e) => updateForm('titulo', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição *</label>
              <textarea required rows={5} value={form.descricao} onChange={(e) => updateForm('descricao', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo *</label>
                <select value={form.tipo} onChange={(e) => updateForm('tipo', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Modalidade *</label>
                <select value={form.modalidade} onChange={(e) => updateForm('modalidade', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
                  {MODALIDADES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(form.modalidade === 'venda' || form.modalidade === 'ambos') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preço de Venda (AOA) *</label>
                  <input type="number" required min="0" step="0.01" value={form.preco_venda} onChange={(e) => updateForm('preco_venda', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              )}
              {(form.modalidade === 'arrendamento' || form.modalidade === 'ambos') && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Preço Mensal (AOA) *</label>
                  <input type="number" required min="0" step="0.01" value={form.preco_arrendamento} onChange={(e) => updateForm('preco_arrendamento', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
                </div>
              )}
            </div>
          </div>

          {/* Localização */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Localização</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Localização *</label>
                <input type="text" required value={form.localizacao} onChange={(e) => updateForm('localizacao', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Endereço completo</label>
                <input type="text" value={form.endereco} onChange={(e) => updateForm('endereco', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Specs */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Especificações</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Quartos</label>
                <input type="number" min="0" value={form.quartos} onChange={(e) => updateForm('quartos', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Casas de Banho</label>
                <input type="number" min="0" value={form.casas_banho} onChange={(e) => updateForm('casas_banho', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Área (m²)</label>
                <input type="number" min="0" step="0.01" value={form.area_m2} onChange={(e) => updateForm('area_m2', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all" />
              </div>
            </div>
          </div>

          {/* Imagens existentes */}
          {existingImages.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Fotografias Atuais</h2>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Image src={resolveImageUrl(img.caminho)} alt="Imóvel" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Novas imagens */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-800 dark:text-white uppercase tracking-wider">Adicionar Novas Fotografias</h2>
            {newImagePreviews.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {newImagePreviews.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                    <Image src={src} alt={`Nova ${i + 1}`} fill className="object-cover" />
                    <button type="button" onClick={() => removeNewImage(i)}
                      className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 transition-all">
              <ImagePlus className="w-6 h-6 text-slate-400 mb-1" />
              <span className="text-xs text-slate-500 dark:text-slate-400">Adicionar fotografias</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleNewImages} className="hidden" />
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3">
            <button type="button" onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />A guardar...</> : <><Save className="w-4 h-4" />Guardar Alterações</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
