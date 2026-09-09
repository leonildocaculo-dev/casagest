'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Logo } from '@/components/logo';
import { NotificationBell } from '@/components/notification-bell';
import { LogOut, ShieldCheck, Home, PlusCircle, FileText, Search, PhoneCall, Sparkles, CreditCard, ChevronDown, User as UserIcon, Settings } from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-300 border border-purple-300 dark:border-purple-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Admin</span>;
      case 'proprietario':
        return <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Proprietário</span>;
      default:
        return <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">Cliente</span>;
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md">
      {/* Top Banner (Deep Purple Highlight Accent) */}
      <div className="bg-purple-950 text-white text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="bg-amber-400 text-purple-950 font-black text-[10px] px-2 py-0.5 rounded-md uppercase tracking-wider">
              DESTAQUE
            </span>
            <span className="truncate">Plataforma Certificada de Gestão Imobiliária & Contratos — Luanda & Talatona</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-slate-200">
            <a href="tel:+244923000000" className="hover:text-amber-400 transition-colors flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" /> +244 923 000 000
            </a>
            <span className="text-purple-700">|</span>
            <Link href="/imoveis" className="hover:text-amber-400 transition-colors underline font-medium">
              Ver Imóveis Disponíveis
            </Link>
          </div>
        </div>
      </div>

      {/* Main Nav (Clean White Background with Purple Text & Gold Accents) */}
      <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b border-purple-100 dark:border-slate-800 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo Transparente com Fundo Claro */}
            <Logo variant="dark" size="md" />

            {/* Nav Links (Purple Accent) */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-extrabold text-purple-950 dark:text-purple-100">
              <Link href="/" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Home className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                Início
              </Link>
              <Link href="/imoveis" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Search className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                Imóveis
              </Link>
              <Link href="/propostas" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                Propostas
              </Link>
              <Link href="/contratos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                Contratos
              </Link>
              <Link href="/pagamentos" className="hover:text-purple-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-purple-600 dark:text-amber-400" />
                Pagamentos
              </Link>
            </nav>

            {/* Right User Actions */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-24 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  {/* Se Cliente, botão Favoritos */}
                  {user.role === 'cliente' && (
                    <Link
                      href="/cliente/favoritos"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 rounded-xl transition-all"
                      title="Meus Favoritos"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                      <span className="hidden md:inline">Favoritos</span>
                    </Link>
                  )}

                  {/* Se Admin/Proprietário, botão Adicionar Imóvel */}
                  {(user.role === 'admin' || user.role === 'proprietario') && (
                    <Link
                      href="/imoveis/novo"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-black text-white bg-purple-950 hover:bg-purple-900 rounded-xl shadow-md transition-all hover:scale-105"
                    >
                      <PlusCircle className="w-4 h-4 text-amber-400" />
                      Anunciar Imóvel
                    </Link>
                  )}

                  {/* Painel Admin */}
                  {user.role === 'admin' && (
                    <Link
                      href="/admin"
                      className="inline-flex items-center gap-1 px-3 py-2 text-xs font-black text-amber-900 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Admin
                    </Link>
                  )}

                  <div className="mx-1 flex items-center justify-center">
                    <NotificationBell />
                  </div>

                  {/* User Profile Dropdown / Badge */}
                  <div className="relative pl-2 border-l border-purple-100 dark:border-slate-800" ref={dropdownRef}>
                    <button 
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-700 dark:text-purple-300 font-black border border-purple-200 dark:border-purple-800 shadow-sm shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div className="hidden sm:flex flex-col">
                        <span className="text-xs font-black text-purple-950 dark:text-white truncate max-w-24 md:max-w-32 leading-tight">
                          {user.name}
                        </span>
                        <div>{getRoleBadge(user.role)}</div>
                      </div>
                      <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 overflow-hidden transform origin-top-right transition-all">
                        <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sessão Iniciada</p>
                          <p className="text-xs font-black text-slate-900 dark:text-white truncate">{user.email}</p>
                        </div>
                        
                        <Link 
                          href={user.role === 'admin' ? '/admin' : user.role === 'proprietario' ? '/proprietario' : '/cliente'}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <Settings className="w-4 h-4" />
                          Opções de Gestão
                        </Link>
                        
                        <Link 
                          href="/perfil"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-900/30 hover:text-purple-700 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <UserIcon className="w-4 h-4" />
                          Dados Pessoais
                        </Link>

                        <div className="border-t border-slate-100 dark:border-slate-800 mt-1 pt-1">
                          <button
                            onClick={() => {
                              setIsDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair do Sistema
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-xs font-black text-purple-950 hover:text-purple-700 dark:text-purple-300 dark:hover:text-amber-400 transition-colors"
                  >
                    Entrar
                  </Link>

                  <Link
                    href="/register"
                    className="px-4 py-2 text-xs font-black text-purple-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-md transition-all hover:scale-105"
                  >
                    Criar Conta
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
