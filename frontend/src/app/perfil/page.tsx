'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { User, Lock, Save, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { isAxiosError } from 'axios';

export default function PerfilPage() {
  const { user, loading, refreshUser } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [initialized, setInitialized] = useState(false);

  if (user && !initialized) {
    setName(user.name);
    setPhone(user.phone || '');
    setInitialized(true);
  }

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const payload: Record<string, string> = {
        name,
        phone,
      };

      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'A nova senha e a confirmação não coincidem.' });
          setIsSubmitting(false);
          return;
        }
        if (!currentPassword) {
          setMessage({ type: 'error', text: 'Precisa introduzir a senha atual para alterar a senha.' });
          setIsSubmitting(false);
          return;
        }
        payload.current_password = currentPassword;
        payload.password = newPassword;
        payload.password_confirmation = confirmPassword;
      }

      await api.put('/perfil', payload);
      
      await refreshUser(); // Atualiza o contexto global com o novo nome
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
      
      // Limpar campos de senha após sucesso
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
    } catch (err: unknown) {
      let errorMsg = 'Ocorreu um erro ao atualizar o perfil. Tente novamente.';
      if (isAxiosError(err) && err.response?.data?.errors) {
        // Pega o primeiro erro retornado pelo Laravel
        const firstError = Object.values(err.response.data.errors)[0] as string[];
        if (firstError && firstError.length > 0) {
          errorMsg = firstError[0];
        }
      }
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8">
          <h1 className="text-3xl font-black text-purple-950 dark:text-white">Meus Dados Pessoais</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Atualize as suas informações e gerencie a segurança da sua conta.</p>
        </div>

        {message && (
          <div className={`p-4 rounded-2xl mb-6 flex items-start gap-3 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900' : 'bg-rose-50 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <span className="font-medium text-sm">{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Informações Básicas */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Informações Básicas</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 transition-all outline-none text-slate-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Endereço de E-mail</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400">O e-mail não pode ser alterado por motivos de segurança.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Telefone (Opcional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 transition-all outline-none text-slate-900 dark:text-white"
                    placeholder="+244 9XX XXX XXX"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Segurança */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-600 dark:text-amber-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Segurança & Senha</h2>
            </div>
            
            <div className="p-6 space-y-5">
              <p className="text-sm text-slate-500 dark:text-slate-400">Preencha estes campos apenas se desejar alterar a sua senha de acesso atual.</p>
              
              <div className="space-y-1.5 max-w-md">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 transition-all outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Nova Senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 transition-all outline-none text-slate-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Confirmar Nova Senha</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-600 transition-all outline-none text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black rounded-xl shadow-md transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              Guardar Alterações
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
