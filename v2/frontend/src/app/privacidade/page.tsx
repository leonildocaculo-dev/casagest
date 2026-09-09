import React from 'react';
import { Logo } from '@/components/logo';
import { ShieldCheck, Lock, Eye } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidade — CasaGest',
  description: 'Saiba como o CasaGest recolhe, protege e trata os seus dados pessoais em conformidade com as regras de proteção de dados.',
};

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Header (Fundo Branco com Acentos Púrpura) */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 relative overflow-hidden shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-purple-950 dark:text-white">Política de Privacidade</h1>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm">Proteção de Dados & Privacidade Digital</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl space-y-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          
          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <Lock className="w-5 h-5" /> 1. Recolha de Informação Pessoal
            </h2>
            <p>
              O CasaGest recolhe dados pessoais estritamente necessários para a execução dos serviços de mediação imobiliária, incluindo nome completo, endereço de e-mail, contacto telefónico, propostas submetidas e comprovativos de pagamento associados aos contratos.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <Eye className="w-5 h-5" /> 2. Finalidade do Tratamento
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Processamento de propostas de compra e arrendamento entre clientes e proprietários;</li>
              <li>Geração automática de minutas de contrato de arrendamento em formato PDF;</li>
              <li>Emissão e verificação de referências de pagamento Multicaixa;</li>
              <li>Comunicação de notificações sobre o estado das negociações.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 3. Segurança e Confidencialidade
            </h2>
            <p>
              Todos os dados e ficheiros de comprovativo armazenados no CasaGest são protegidos por encriptação e autenticação de sessão via tokens HTTP-Only. Não vendemos nem partilhamos dados pessoais com terceiros não autorizados.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Para exercer os seus direitos de acesso, retificação ou eliminação de dados, envie um pedido para **privacidade@casagest.ao**.
          </div>

        </div>
      </section>

    </div>
  );
}
