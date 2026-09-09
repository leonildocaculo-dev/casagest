'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/logo';
import { ChevronDown, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface FAQItem {
  pergunta: string;
  resposta: string;
  categoria: string;
}

const faqs: FAQItem[] = [
  {
    categoria: 'Propostas & Arrendamento',
    pergunta: 'Como posso submeter uma proposta de arrendamento ou compra?',
    resposta: 'Basta aceder à página do imóvel pretendido, clicar no botão "Fazer Proposta de Arrendamento/Compra", introduzir o valor proposto e a mensagem para o proprietário. Se ainda não tiver sessão iniciada, a plataforma irá solicitar o login e redirecioná-lo-á automaticamente de volta ao imóvel.'
  },
  {
    categoria: 'Propostas & Arrendamento',
    pergunta: 'O que acontece após o envio da proposta?',
    resposta: 'O proprietário recebe uma notificação instantânea e poderá aceitar, recusar ou submeter uma contraproposta. Assim que a proposta for aceite, é gerada automaticamente a minuta do contrato em PDF na sua área de contratos.'
  },
  {
    categoria: 'Pagamentos & Multicaixa',
    pergunta: 'Como funciona o pagamento por Referência Multicaixa?',
    resposta: 'Para pagamentos até 10.000.000 AOA, a plataforma gera uma Entidade e Referência de 9 dígitos com validade de 48 horas. Pode pagar em qualquer caixa Multicaixa ou app Multicaixa Express. Assim que o pagamento for concluído, o sistema atualiza o estado para "pago" e marca o contrato como assinado via webhook.'
  },
  {
    categoria: 'Pagamentos & Multicaixa',
    pergunta: 'E para pagamentos superiores a 10 Milhões de Kwanzas?',
    resposta: 'Para valores superiores a 10.000.000 AOA, o pagamento é efetuado por Transferência Bancária. O cliente deve anexa o comprovativo bancário (PDF ou imagem PNG/JPG/WebP <= 2MB) no checkout para validação pela nossa equipa administrativa.'
  },
  {
    categoria: 'Contratos & Segurança',
    pergunta: 'Os contratos gerados têm validade legal?',
    resposta: 'Sim, as minutas de contrato em PDF são elaboradas segundo os normativos do Código Civil Angolano para o arrendamento urbano e compra de imóveis, servindo como documento de compromisso entre as partes.'
  },
  {
    categoria: 'Proprietários',
    pergunta: 'Sou proprietário. Como posso anunciar os meus imóveis?',
    resposta: 'Ao registar-se como "Proprietário / Senhorio", terá acesso ao painel onde pode cadastrar novos imóveis com fotos, localização e preço. Após aprovação rápida pelo administrador, o seu anúncio fica visível para milhares de potenciais clientes.'
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* Hero Header (Fundo Branco com Acentos Púrpura) */}
      <section className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-purple-900 relative overflow-hidden shadow-xs">
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <div className="flex justify-center mb-2">
            <Logo variant="dark" size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-purple-950 dark:text-white">Perguntas Frequentes (FAQ)</h1>
          <p className="text-slate-600 dark:text-slate-300 font-bold text-xs sm:text-sm max-w-2xl mx-auto">
            Tire todas as suas dúvidas sobre o funcionamento de propostas, minutas de contrato e pagamentos por referência Multicaixa.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        
        {/* Accordion FAQ */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-md transition-all"
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-purple-950 dark:text-white hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors"
                >
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{faq.pergunta}</span>
                  </span>
                  <ChevronDown className={`w-5 h-5 text-purple-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800 animate-in fade-in">
                    <p className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-xl">
                      {faq.resposta}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Suporte Adicional */}
        <div className="bg-purple-950 text-white rounded-3xl p-8 border-2 border-amber-400/40 shadow-xl text-center space-y-4">
          <h3 className="text-xl font-black uppercase">Ainda tem dúvidas?</h3>
          <p className="text-xs text-slate-300">
            A nossa equipa de apoio ao cliente está pronta para ajudá-lo via WhatsApp ou e-mail.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              href="/contactos"
              className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-purple-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all"
            >
              Contactar Equipa CasaGest
            </Link>
          </div>
        </div>

      </section>

    </div>
  );
}
