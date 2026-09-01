'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { KeyRound, Mail, AlertCircle, ArrowRight, Eye, EyeOff, CheckCircle2, Loader2 } from 'lucide-react';
import axios from 'axios';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/';

  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push(redirectPath);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.data?.errors?.email) {
          setError(err.response.data.errors.email[0]);
        } else if (err.response?.data?.message) {
          setError(err.response.data.message);
        } else {
          setError('Ocorreu um erro ao iniciar sessão. Verifique os seus dados.');
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
              backgroundImage: "url('https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=1200&q=80')"
            }}
          />

          <div className="relative z-10 space-y-6">
            {/* Logo Transparente e Limpo */}
            <Logo variant="light" size="xl" />

            <div className="space-y-3 pt-6">
              <h2 className="text-4xl font-black tracking-tight leading-tight uppercase">
                Bem-vindo ao Portal de <br />
                <span className="bg-linear-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  Gestão Imobiliária
                </span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Aceda ao ecossistema líder em Angola para arrendamento, compra, envio de propostas e liquidação por referência Multicaixa.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-4 pt-10 border-t border-purple-800/80">
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Geração Instantânea de Minutas de Contrato PDF</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pagamentos Automáticos por Referência Multicaixa</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-purple-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Negociação Direta em Tempo Real</span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: FORMULÁRIO ULTRA-PREMIUM */}
        <div className="p-8 sm:p-12 flex flex-col justify-between space-y-8">
          
          <div className="space-y-6">
            {/* Header */}
            <div>
              <span className="px-3.5 py-1 bg-amber-400/20 text-purple-900 dark:text-amber-400 text-xs font-black uppercase tracking-wider rounded-full inline-block mb-2">
                Acesso Seguro
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Iniciar Sessão
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Introduza as suas credenciais para gerir propostas e contratos.
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
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Endereço de E-mail
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Palavra-passe
                </label>
                <div className="relative">
                  <KeyRound className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-600 dark:text-amber-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-400 text-sm font-medium transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                Entrar no Sistema
              </button>
            </form>


          </div>

          {/* Footer Register Prompt */}
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              Ainda não tem conta no CasaGest?{' '}
              <Link href={`/register${redirectPath !== '/' ? `?redirect=${encodeURIComponent(redirectPath)}` : ''}`} className="font-extrabold text-purple-700 dark:text-amber-400 hover:underline">
                Registar Gratuitamente →
              </Link>
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-purple-600" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
