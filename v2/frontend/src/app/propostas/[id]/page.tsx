'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import echo from '@/lib/echo';
import { Loader2, ArrowLeft, Send, CheckCircle2, XCircle, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Mensagem {
  id: number;
  conteudo: string;
  sender_id: number;
  read_at: string | null;
  created_at: string;
  sender: {
    id: number;
    name: string;
    role: string;
  };
}

interface Proposta {
  id: number;
  estado: string;
  valor_proposto: string;
  imovel: { id: number; titulo: string; proprietario_id: number };
  cliente: { id: number; name: string };
}

export default function ChatPropostaPage({ params }: { params: { id: string } }) {
  const { user } = useAuth();
  const router = useRouter();
  const [proposta, setProposta] = useState<Proposta | null>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    const fetchChat = async () => {
      try {
        const [propRes, msgRes] = await Promise.all([
          api.get(`/propostas/${params.id}`),
          api.get(`/propostas/${params.id}/mensagens`),
        ]);
        setProposta(propRes.data.proposta);
        setMensagens(msgRes.data.mensagens);
      } catch (err) {
        console.error('Erro ao buscar chat', err);
        router.push('/propostas');
      } finally {
        setLoading(false);
      }
    };

    fetchChat();

    if (echo) {
      const channel = echo.private(`chat.proposta.${params.id}`);
      channel.listen('NovaMensagemChat', (e: { mensagem: Mensagem }) => {
        setMensagens((prev) => [...prev, e.mensagem]);
      });

      return () => {
        channel.stopListening('NovaMensagemChat');
        echo.leave(`chat.proposta.${params.id}`);
      };
    }
  }, [user, params.id, router]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !proposta) return;

    setSending(true);
    try {
      const res = await api.post(`/propostas/${proposta.id}/mensagens`, {
        conteudo: newMessage,
      });
      setMensagens((prev) => [...prev, res.data.mensagem]);
      setNewMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatPrice = (valor: string | number) =>
    new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA', maximumFractionDigits: 0 }).format(Number(valor));

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!proposta) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col h-[85vh]">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <Link href="/propostas" className="p-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white line-clamp-1">
              Negociação: {proposta.imovel.titulo}
            </h2>
            <div className="flex items-center gap-3 text-sm mt-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                proposta.estado === 'pendente' ? 'bg-amber-100 text-amber-700' :
                proposta.estado === 'aceite' ? 'bg-emerald-100 text-emerald-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {proposta.estado}
              </span>
              <span className="text-slate-500 font-semibold">{formatPrice(proposta.valor_proposto)}</span>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4" ref={scrollRef}>
          {mensagens.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="text-sm">Inicie a negociação. Envie a primeira mensagem!</p>
            </div>
          ) : (
            mensagens.map((msg) => {
              const isMe = msg.sender_id === user.id;
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                    isMe 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                  }`}>
                    {!isMe && <p className="text-[10px] font-bold uppercase opacity-50 mb-1">{msg.sender.name} ({msg.sender.role})</p>}
                    <p className="text-sm">{msg.conteudo}</p>
                    <div className={`text-[10px] mt-2 flex justify-end gap-1 ${isMe ? 'opacity-80' : 'opacity-50'}`}>
                      {new Date(msg.created_at).toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })}
                      {isMe && msg.read_at && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 rounded-b-3xl">
          <form onSubmit={sendMessage} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escreva uma mensagem..."
              className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              disabled={sending || proposta.estado === 'recusada' || proposta.estado === 'aceite'}
            />
            <button
              type="submit"
              disabled={!newMessage.trim() || sending || proposta.estado === 'recusada' || proposta.estado === 'aceite'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground p-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center shrink-0"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          {(proposta.estado === 'recusada' || proposta.estado === 'aceite') && (
            <p className="text-xs text-center text-slate-500 mt-2 flex items-center justify-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Negociação encerrada (Proposta {proposta.estado}).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}


