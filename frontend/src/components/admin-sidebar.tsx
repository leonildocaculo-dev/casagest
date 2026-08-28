'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from '@/components/logo';
import { useAuth } from '@/context/auth-context';
import {
  LayoutDashboard,
  Building2,
  FileText,
  ShieldCheck,
  CreditCard,
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface AdminSidebarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stats?: any;
}

export function AdminSidebar({ stats }: AdminSidebarProps) {
  const { logout } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return pathname === path ? 'bg-purple-50 text-purple-950 border border-purple-200/80 shadow-xs' : 'text-slate-600 hover:bg-slate-50 hover:text-purple-950 transition-colors border border-transparent';
  };

  return (
    <>
      {/* Mobile Header (Only visible on small screens) */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <Logo variant="dark" size="sm" />
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile (Hidden on mobile unless toggled) */}
      <aside className={`w-full lg:w-64 bg-white border-r border-slate-200 p-6 flex-col justify-between shrink-0 shadow-sm z-40 fixed lg:sticky top-0 h-screen lg:h-auto overflow-y-auto transition-transform ${isMobileMenuOpen ? 'flex translate-x-0' : 'hidden lg:flex -translate-x-full lg:translate-x-0'}`}>
        <div className="space-y-8">
          
          {/* Logo (Hidden on mobile, shown in header) */}
          <div className="hidden lg:flex items-center gap-3 pt-2">
            {/* Custom Logo Layout for Admin Sidebar to match the 'GEST' picture */}
            <div className="flex items-center gap-2">
              <svg width="42" height="42" viewBox="0 0 100 100" fill="none" className="shrink-0 drop-shadow-md">
                <path d="M50 8L8 42H20V88H80V42H92L50 8Z" fill="#3B0764" />
                <path d="M70 20H80V35L70 26V20Z" fill="#3B0764" />
                <path d="M50 28L26 48H35V78H65V48H74L50 28Z" fill="#F59E0B" />
                <path d="M50 42L38 52V78H46V62C46 59.8 47.8 58 50 58C52.2 58 54 59.8 54 62V78H62V52L50 42Z" fill="#3B0764" />
              </svg>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-amber-400 tracking-tight leading-none uppercase">GEST</span>
                <span className="text-[9px] font-extrabold text-purple-950 uppercase tracking-wider leading-tight">Gestão Inteligente<br/>de Imóveis</span>
              </div>
            </div>
          </div>

        {/* Section: Visão Geral */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3">
            Visão Geral
          </span>

          <nav className="space-y-1 font-extrabold text-xs">
            <Link href="/admin" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/admin')}`}>
              <LayoutDashboard className={`w-4 h-4 ${pathname === '/admin' ? 'text-purple-600' : 'text-slate-400'}`} />
              Dashboard
            </Link>

            <Link href="/admin/imoveis" className={`flex items-center justify-between px-3.5 py-3 rounded-2xl ${isActive('/admin/imoveis')}`}>
              <span className="flex items-center gap-3">
                <Building2 className={`w-4 h-4 ${pathname === '/admin/imoveis' ? 'text-purple-600' : 'text-slate-400'}`} />
                Imóveis
              </span>
              {stats?.imoveis_pendentes ? (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-[10px] rounded-full">
                  {stats.imoveis_pendentes}
                </span>
              ) : null}
            </Link>

            <Link href="/propostas" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/propostas')}`}>
              <FileText className={`w-4 h-4 ${pathname === '/propostas' ? 'text-purple-600' : 'text-slate-400'}`} />
              Propostas
            </Link>

            <Link href="/contratos" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/contratos')}`}>
              <ShieldCheck className={`w-4 h-4 ${pathname === '/contratos' ? 'text-purple-600' : 'text-slate-400'}`} />
              Contratos
            </Link>
          </nav>
        </div>

        {/* Section: Gestão de Negócio */}
        <div className="space-y-2">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block px-3">
            Negócio & Finanças
          </span>

          <nav className="space-y-1 font-extrabold text-xs">
            <Link href="/admin/pagamentos" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/admin/pagamentos')}`}>
              <CreditCard className={`w-4 h-4 ${pathname === '/admin/pagamentos' ? 'text-purple-600' : 'text-slate-400'}`} />
              Pagamentos
            </Link>

            <Link href="/admin/utilizadores" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/admin/utilizadores')}`}>
              <Users className={`w-4 h-4 ${pathname === '/admin/utilizadores' ? 'text-purple-600' : 'text-slate-400'}`} />
              Utilizadores
            </Link>

            <Link href="/admin/audit-logs" className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl ${isActive('/admin/audit-logs')}`}>
              <ShieldCheck className={`w-4 h-4 ${pathname === '/admin/audit-logs' ? 'text-purple-600' : 'text-slate-400'}`} />
              Audit Logs
            </Link>
          </nav>
        </div>

      </div>

      {/* Bottom Logout & Credit */}
      <div className="pt-6 border-t border-slate-100 space-y-4">
        <button onClick={logout} className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors">
          <LogOut className="w-4 h-4" />
          Sair do Sistema
        </button>

        <div className="text-[10px] text-slate-400 font-bold px-3">
          © 2026 CasaGest <br />
          <span className="text-purple-950 font-black">CaculoTech & Associados</span>
        </div>
        </div>
      </aside>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
}
