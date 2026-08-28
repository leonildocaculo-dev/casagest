'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { MessageSquare, ArrowLeft, Loader2, Mail, Phone, Calendar, User } from 'lucide-react';

interface MensagemContacto {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  assunto: string;
  mensagem: string;
  created_at: string;
}

export default function AdminContactosPage() {
  const [mensagens, setMensagens] = useState<MensagemContacto[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);

  const fetchMensagens = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get('/admin/contactos', { params: { page } });
      setMensagens(res.data.data);
      setTotalPaginas(res.data.last_page || 1);
    } catch (err) {
      console.error('Erro ao carregar mensagens de contacto:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      if (active) await fetchMensagens(pagina);
    };
    load();
    return () => { active = false; };
  }, [pagina]);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Admin
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl">
            <MessageSquare className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Mensagens de Contacto Recebidas</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Consulte as dúvidas e solicitações enviadas pelos visitantes do portal.</p>
          </div>
        </div>

        {/* Lista de Mensagens */}
        {loading ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-2">A carregar mensagens de contacto...</p>
          </div>
        ) : mensagens.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nenhuma mensagem de contacto recebida</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mensagens.map((msg) => (
              <div key={msg.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/50 rounded-xl flex items-center justify-center text-purple-600 font-bold shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 dark:text-white text-sm">{msg.nome}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {msg.email}</span>
                        {msg.telefone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {msg.telefone}</span>}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
                    <Calendar className="w-3.5 h-3.5" /> {formatDate(msg.created_at)}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                    {msg.assunto}
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl leading-relaxed mt-2 whitespace-pre-wrap">
                    {msg.mensagem}
                  </p>
                </div>
              </div>
            ))}

            {/* Paginação */}
            {totalPaginas > 1 && (
              <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs">
                <button
                  disabled={pagina === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Anterior
                </button>
                <span className="text-slate-500">Página {pagina} de {totalPaginas}</span>
                <button
                  disabled={pagina === totalPaginas}
                  onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Próxima
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
