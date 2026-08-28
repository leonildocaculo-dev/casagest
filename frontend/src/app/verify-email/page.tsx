'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('A verificar o seu e-mail...');

  useEffect(() => {
    const url = searchParams.get('url');
    if (!url) {
      setStatus('error');
      setMessage('Link de verificação inválido ou inexistente.');
      return;
    }

    const verify = async () => {
      try {
        const res = await api.post('/email/verify', { url });
        setStatus('success');
        setMessage(res.data.message || 'E-mail verificado com sucesso!');
        await refreshUser();
        
        // Redirecionar para o dashboard após alguns segundos
        setTimeout(() => {
          router.push('/');
        }, 3000);
      } catch (err: any) {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Falha ao verificar o e-mail. O link pode ter expirado.');
      }
    };

    verify();
  }, [searchParams, router, refreshUser]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          Verificação de E-mail
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          {status === 'loading' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
              <p className="text-slate-600 dark:text-slate-300">{message}</p>
            </div>
          )}
          
          {status === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">{message}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">A redirecionar...</p>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <XCircle className="w-16 h-16 text-red-500" />
              <p className="text-lg font-medium text-slate-900 dark:text-white">{message}</p>
              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Voltar à página inicial
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
