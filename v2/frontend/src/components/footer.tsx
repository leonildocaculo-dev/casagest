'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { Mail, Phone, MapPin, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-t-4 border-purple-900 shadow-2xl">
      {/* Upper Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Social Networks */}
          <div className="space-y-5">
            <Logo variant="dark" size="lg" />

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              A plataforma líder em Angola para arrendamento, compra e gestão inteligente de imóveis com transparência, propostas em tempo real e minutas de contrato automáticas.
            </p>

            <div className="pt-2 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-900 dark:text-purple-300 text-xs font-extrabold rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Plataforma Certificada
              </span>

              {/* Redes Sociais com Links Reais e Ícones SVG Vetoriais */}
              <div className="flex items-center gap-2 pt-2">
                {/* Facebook */}
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook CasaGest"
                  className="p-2.5 bg-purple-100 dark:bg-purple-900 hover:bg-purple-950 hover:text-amber-400 text-purple-950 dark:text-amber-300 rounded-xl transition-all shadow-md hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram CasaGest"
                  className="p-2.5 bg-purple-100 dark:bg-purple-900 hover:bg-purple-950 hover:text-amber-400 text-purple-950 dark:text-amber-300 rounded-xl transition-all shadow-md hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn CasaGest"
                  className="p-2.5 bg-purple-100 dark:bg-purple-900 hover:bg-purple-950 hover:text-amber-400 text-purple-950 dark:text-amber-300 rounded-xl transition-all shadow-md hover:scale-110"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href="https://wa.me/244923000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp CasaGest"
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all shadow-md hover:scale-105 flex items-center gap-1.5 text-xs font-black px-3"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Navegação & Empresa */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-purple-950 dark:text-amber-400 uppercase tracking-widest">Institucional</h3>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <li>
                <Link href="/" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Início
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Quem Somos (Sobre)
                </Link>
              </li>
              <li>
                <Link href="/imoveis" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Catálogo de Imóveis
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Perguntas Frequentes (FAQ)
                </Link>
              </li>
              <li>
                <Link href="/contactos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Fale Connosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Suporte Legal */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-purple-950 dark:text-amber-400 uppercase tracking-widest">Legal & Segurança</h3>
            <ul className="space-y-2.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <li>
                <Link href="/termos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Termos & Condições de Uso
                </Link>
              </li>
              <li>
                <Link href="/privacidade" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Política de Privacidade
                </Link>
              </li>
              <li>
                <Link href="/contratos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Minutas de Contrato PDF
                </Link>
              </li>
              <li>
                <Link href="/pagamentos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                  <ArrowRight className="w-3.5 h-3.5 text-purple-600" /> Referências Multicaixa
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contactos & Sede */}
          <div className="space-y-3">
            <h3 className="text-xs font-black text-purple-950 dark:text-amber-400 uppercase tracking-widest">Sede & Atendimento</h3>
            <div className="space-y-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
              <p className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-purple-700 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>Via AL-15, Edifício CasaGest, Talatona — Luanda, Angola</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-purple-700 dark:text-amber-400 shrink-0" />
                <span>+244 923 000 000 / +244 912 000 000</span>
              </p>
              <p className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-purple-700 dark:text-amber-400 shrink-0" />
                <span>contacto@casagest.ao</span>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar com Crédito do Desenvolvedor */}
      <div className="bg-purple-950 text-white py-6 px-4 border-t border-purple-900">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
          <p className="text-slate-400">
            &copy; {new Date().getFullYear()} CasaGest. Todos os direitos reservados.
          </p>

          <p className="text-amber-300 font-black flex items-center gap-1">
            Desenvolvido por <span className="text-white underline">Rita Afonso</span>
          </p>

          <div className="flex items-center gap-4 text-slate-300">
            <Link href="/termos" className="hover:text-amber-400 transition-colors">Termos</Link>
            <Link href="/privacidade" className="hover:text-amber-400 transition-colors">Privacidade</Link>
            <Link href="/contactos" className="hover:text-amber-400 transition-colors">Contacto</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
