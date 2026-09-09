import React from 'react';
import { Logo } from '@/components/logo';
import { ShieldCheck, FileText, Scale } from 'lucide-react';

export const metadata = {
  title: 'Termos e Condições de Uso — CasaGest',
  description: 'Consulte os termos legais de utilização do portal CasaGest para arrendamento, compra e contratação imobiliária.',
};

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Header (Fundo Branco com Acentos Púrpura) */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 relative overflow-hidden shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-purple-950 dark:text-white">Termos & Condições de Uso</h1>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm">Última atualização: Julho de 2026</p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-12 shadow-xl space-y-8 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          
          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <Scale className="w-5 h-5" /> 1. Objeto e Âmbito de Aplicação
            </h2>
            <p>
              Os presentes Termos e Condições regem o acesso e utilização da plataforma **CasaGest**, um sistema inteligente de gestão imobiliária, arrendamento e facilitação contratual operado em conformidade com a legislação da República de Angola.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <FileText className="w-5 h-5" /> 2. Propostas e Minutas de Contrato PDF
            </h2>
            <p>
              Todas as propostas financeiras submetidas por clientes clientes a imóveis listados são enviadas diretamente ao proprietário ou agente verificado. Aquando da aceitação da proposta pelo senhorio, o CasaGest gera automaticamente uma minuta de contrato em formato PDF com os termos aceites.
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" /> 3. Pagamentos e Referências Multicaixa
            </h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                **Valores até 10.000.000 AOA:** O pagamento do sinal ou renda é efetuado por Referência Multicaixa (Entidade e Referência de 9 dígitos), sendo o contrato assinado automaticamente mediante receção do webhook.
              </li>
              <li>
                **Valores superiores a 10.000.000 AOA:** O pagamento é efetuado por Transferência Bancária com anexo obrigatório de comprovativo em PDF ou Imagem não superior a 2MB.
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-black uppercase text-purple-950 dark:text-amber-400">
              4. Deveres dos Utilizadores
            </h2>
            <p>
              O utilizador compromete-se a fornecer informações verdadeiras aquando do registo e do envio de propostas, abstendo-se de utilizar a plataforma para fins ilícitos, falsificação de comprovativos ou spam.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
            Para dúvidas adicionais sobre estes termos, contacte-nos através do e-mail **legal@casagest.ao**.
          </div>

        </div>
      </section>

    </div>
  );
}
