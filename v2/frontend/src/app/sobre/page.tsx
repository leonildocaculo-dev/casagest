import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { ShieldCheck, Award, Users, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Sobre Nós — CasaGest',
  description: 'Conheça a história, missão e valores da maior plataforma de gestão e investimento imobiliário em Angola.',
};

export default function SobrePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Header (Fundo Branco com Acentos Púrpura) */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 relative overflow-hidden shadow-xs">
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="flex justify-center mb-4">
            <Logo variant="dark" size="xl" />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight text-purple-950 dark:text-white">
            Líderes em Gestão Inteligente de Imóveis em Angola
          </h1>

          <p className="max-w-3xl mx-auto text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-base leading-relaxed">
            O CasaGest nasceu para revolucionar a forma como angolanos e investidores internacionais arrendam, compram, gerem e rentabilizam propriedades imobiliárias.
          </p>
        </div>
      </section>

      {/* Conteúdo Principal */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        
        {/* Nossos Pilares */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="p-3 bg-purple-900 text-amber-300 rounded-2xl w-fit">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase">Transparência Total</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Todas as propostas, minutas de contrato em PDF e pagamentos por referência Multicaixa são auditados em tempo real.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="p-3 bg-purple-900 text-amber-300 rounded-2xl w-fit">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase">Imóveis Certificados</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Os anúncios passam por verificação rigorosa da nossa equipa de gestão de ativos para garantir veracidade de fotos e documentação.
            </p>
          </div>

          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <div className="p-3 bg-purple-900 text-amber-300 rounded-2xl w-fit">
              <Users className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black uppercase">Foco no Cliente</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Conectamos senhorios e inquilinos com processos desburocratizados e suporte dedicado via WhatsApp e canal presencial em Talatona.
            </p>
          </div>
        </div>

        {/* Missão e Visão */}
        <div className="bg-purple-950 text-white rounded-3xl p-8 sm:p-12 border-2 border-amber-400/40 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <span className="px-3 py-1 bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider rounded-full">
              Nossa Missão
            </span>
            <h3 className="text-2xl font-black uppercase">Digitalizar o Mercado Imobiliário Angolano</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Proporcionar a melhor experiência de arrendamento e investimento com minutas automáticas, referências Multicaixa integradas e gestão transparente para todas as províncias de Angola.
            </p>
          </div>

          <div className="space-y-4">
            <span className="px-3 py-1 bg-amber-400 text-purple-950 font-black text-xs uppercase tracking-wider rounded-full">
              Nossa Visão
            </span>
            <h3 className="text-2xl font-black uppercase">Ser a Maior Referência em PropTech</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Expandir a nossa infraestrutura tecnológica para ligar fundos de investimento, promotores imobiliários e famílias em toda a região da SADC com rapidez e segurança jurídica.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 pt-6">
          <h2 className="text-2xl font-black uppercase">Pronto para encontrar o seu novo imóvel?</h2>
          <div className="flex justify-center gap-4">
            <Link
              href="/imoveis"
              className="px-6 py-3.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center gap-2"
            >
              Explorar Catálogo de Imóveis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
