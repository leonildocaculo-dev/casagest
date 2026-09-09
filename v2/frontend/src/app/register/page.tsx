'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth, UserRole } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { User, Mail, Phone, KeyRound, AlertCircle, ArrowRight, Building2, UserCheck, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [role, setRole] = useState<UserRole>('cliente');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('A confirmação da palavra-passe não coincide.');
      return;
    }

    setLoading(true);

    try {
      await register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        role,
      });
      router.push(redirectPath);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.errors) {
          const firstErrorKey = Object.keys(err.response.data.errors)[0];
          setError(err.response.data.errors[firstErrorKey][0]);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocorreu um erro ao criar a conta. Tente novamente.');
        }
      } else {
        setError('Ocorreu um erro inesperado.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-2xl border-2 border-purple-900/30 bg-white dark:bg-slate-900">
        
        {/* COLUNA ESQUERDA: DESIGN EM ROYAL PURPLE & GOLD (Visual de Impacto) */}
        <div className="relative hidden lg:flex flex-col justify-between p-12 bg-purple-950 text-white overflow-hidden">
          {/* Background Image with Dark Purple Gradient */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80')"
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Logo Transparente e Limpo */}
            <Logo variant="light" size="xl" />

            <div className="space-y-3 pt-6">
              <h2 className="text-4xl font-black tracking-tight leading-tight uppercase">
                Junte-se à Maior Plataforma Imobiliária <br />
                <span className="bg-linear-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  de Angola
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Registe-se em menos de 1 minuto para arrendar residências, adquirir imóveis, submeter propostas e emitir minutas de contrato em PDF com total transparência.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 pt-10 border-t border-purple-800/80">
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Registo 100% Gratuito para Clientes e Proprietários</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Checkout Dinâmico (Referência Multicaixa e Transferência)</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Notificações em Tempo Real sobre Propostas</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO ULTRA-PREMIUM DE REGISTRO */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-6">
          
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="px-3.5 py-1 bg-amber-400/20 text-purple-900 dark:text-amber-400 text-xs font-black uppercase tracking-wider rounded-full inline-block mb-2">
                Criar Nova Conta
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Registo de Utilizador
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Escolha o seu perfil e preencha os dados pessoais.
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="flex items-center gap-3 p-4 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-2xl animate-in fade-in">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Seleção do Perfil (Role Toggle Cards) */}
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Qual é o seu perfil de utilizador?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('cliente')}
                    className={`p-3.5 rounded-2xl border-2 text-left text-xs transition-all flex flex-col items-start gap-1 ${
                      role === 'cliente'
                        ? 'border-amber-400 bg-purple-950 text-white shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <UserCheck className={`w-4 h-4 ${role === 'cliente' ? 'text-amber-400' : 'text-purple-600'}`} />
                      {role === 'cliente' && <span className="text-[10px] font-black uppercase text-amber-400">Selecionado</span>}
                    </div>
                    <span className="font-extrabold uppercase mt-1">Cliente / Inquilino</span>
                    <span className={`text-[10px] ${role === 'cliente' ? 'text-purple-200' : 'text-slate-400'}`}>Procurar, arrendar ou comprar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('proprietario')}
                    className={`p-3.5 rounded-2xl border-2 text-left text-xs transition-all flex flex-col items-start gap-1 ${
                      role === 'proprietario'
                        ? 'border-amber-400 bg-purple-950 text-white shadow-lg'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Building2 className={`w-4 h-4 ${role === 'proprietario' ? 'text-amber-400' : 'text-purple-600'}`} />
                      {role === 'proprietario' && <span className="text-[10px] font-black uppercase text-amber-400">Selecionado</span>}
                    </div>
                    <span className="font-extrabold uppercase mt-1">Proprietário / Senhorio</span>
                    <span className={`text-[10px] ${role === 'proprietario' ? 'text-purple-200' : 'text-slate-400'}`}>Anunciar e rentabilizar imóveis</span>
                  </button>
                </div>
              </div>

              {/* Nome Completo */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu Nome Completo"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold transition-all"
                  />
                </div>
              </div>

              {/* E-mail e Telefone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    E-mail
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Telefone (Opcional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+244 923 000 000"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Palavra-passe
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mín. 8 caracteres"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Confirmar Palavra-passe
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                    <input
                      type="password"
                      required
                      value={passwordConfirmation}
                      onChange={(e) => setPasswordConfirmation(e.target.value)}
                      placeholder="Repetir palavra-passe"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-xs font-semibold transition-all"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-60 mt-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Criar Conta Grátis
              </button>
            </form>
          </div>

          {/* Footer Login Prompt */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Já tem uma conta registada?{' '}
              <Link href={`/login${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} className="font-extrabold text-purple-700 dark:text-amber-400 hover:underline">
                Iniciar Sessão →
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
