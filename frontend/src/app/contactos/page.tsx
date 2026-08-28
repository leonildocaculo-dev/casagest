'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/logo';
import { Mail, Phone, MapPin, Send, MessageCircle, Clock, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function ContactosPage() {
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.post('/contacto', {
        nome: form.nome,
        email: form.email,
        telefone: form.telefone,
        mensagem: `[Assunto: ${form.assunto || 'Geral'}]\n${form.mensagem}`
      });
      setSuccess('A sua mensagem foi enviada com sucesso! Responderemos dentro de 24 horas úteis.');
      setForm({ nome: '', email: '', telefone: '', assunto: '', mensagem: '' });
    } catch {
      setError('Ocorreu um erro ao enviar a sua mensagem. Tente novamente ou use o WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Header (Fundo Branco com Acentos Púrpura) */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 relative overflow-hidden shadow-xs">
        <div className="max-w-5xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-purple-950 dark:text-white">Fale Connosco</h1>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm max-w-2xl mx-auto">
            Estamos ao seu dispor para esclarecer dúvidas sobre propostas, contratos de arrendamento e agendamento de visitas.
          </p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Informações de Atendimento */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-6">
              <h2 className="text-base font-black uppercase text-purple-950 dark:text-amber-400">Dados de Contacto</h2>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase block text-slate-800 dark:text-white">Sede Central</span>
                    <p className="text-slate-500 dark:text-slate-400">Via AL-15, Edifício CasaGest, Talatona — Luanda, Angola</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase block text-slate-800 dark:text-white">Telefones</span>
                    <p className="text-slate-500 dark:text-slate-400">+244 923 000 000 / +244 912 000 000</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase block text-slate-800 dark:text-white">E-mail</span>
                    <p className="text-slate-500 dark:text-slate-400">contacto@casagest.ao</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-xl shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-extrabold uppercase block text-slate-800 dark:text-white">Horário de Atendimento</span>
                    <p className="text-slate-500 dark:text-slate-400">Segunda a Sexta: 08:00 – 18:00 <br />Sábados: 09:00 – 13:00</p>
                  </div>
                </div>
              </div>

              {/* Botão de Atalho WhatsApp */}
              <a
                href="https://wa.me/244923000000"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> Atendimento Instantâneo via WhatsApp
              </a>
            </div>
          </div>

          {/* Formulário de Contacto */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
            <div>
              <h2 className="text-xl font-black uppercase text-purple-950 dark:text-white">Envie a sua Mensagem</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Preencha os seus dados e a mensagem para a nossa equipa imobiliária.
              </p>
            </div>

            {success && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>{success}</span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    placeholder="Seu Nome"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="seu.email@exemplo.com"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={form.telefone}
                    onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                    placeholder="+244 923 000 000"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                    Assunto
                  </label>
                  <select
                    value={form.assunto}
                    onChange={(e) => setForm({ ...form, assunto: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                  >
                    <option value="">Selecione o Assunto</option>
                    <option value="Proposta de Imóvel">Proposta de Imóvel</option>
                    <option value="Dúvidas sobre Contrato">Dúvidas sobre Contrato</option>
                    <option value="Pagamento Multicaixa">Pagamento Multicaixa</option>
                    <option value="Anunciar o meu Imóvel">Anunciar o meu Imóvel</option>
                    <option value="Outro">Outro Assunto</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase text-slate-700 dark:text-slate-300">
                  Mensagem
                </label>
                <textarea
                  required
                  rows={5}
                  value={form.mensagem}
                  onChange={(e) => setForm({ ...form, mensagem: e.target.value })}
                  placeholder="Escreva detalhadamente a sua dúvida ou pedido..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-950 hover:bg-purple-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Enviar Mensagem
              </button>
            </form>
          </div>

        </div>
      </section>

    </div>
  );
}
