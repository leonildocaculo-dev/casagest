'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import { AlertCircle, CheckCircle, Mail, X } from 'lucide-react';

export default function EmailVerificationBanner() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(true);

  if (!user || user.email_verified_at || !visible) return null;

  const handleResend = async () => {
    setLoading(true);
    setStatus('idle');
    try {
      const res = await api.post('/email/verification-notification');
      setStatus('success');
      setMessage(res.data.message || 'E-mail enviado com sucesso! Verifique a sua caixa de entrada.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.response?.data?.message || 'Erro ao enviar e-mail. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 dark:bg-amber-900/30 border-l-4 border-amber-500 p-4 mb-6 relative rounded-r-lg">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-amber-500" />
        </div>
        <div className="ml-3 flex-1 md:flex md:justify-between">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            A sua conta ainda não foi verificada. Para publicar imóveis, criar propostas ou assinar contratos, precisa de confirmar o seu endereço de e-mail.
          </p>
          <p className="mt-3 text-sm md:mt-0 md:ml-6">
            <button
              onClick={handleResend}
              disabled={loading || status === 'success'}
              className="whitespace-nowrap font-medium text-amber-900 dark:text-amber-100 hover:text-amber-700 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              {loading ? 'A enviar...' : <><Mail className="w-4 h-4" /> Reenviar e-mail</>}
            </button>
          </p>
        </div>
      </div>
      
      {status !== 'idle' && (
        <div className={`mt-3 text-sm flex items-center gap-2 p-2 rounded ${status === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'}`}>
          {status === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message}
        </div>
      )}

      <button onClick={() => setVisible(false)} className="absolute top-2 right-2 text-amber-500 hover:text-amber-700">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
