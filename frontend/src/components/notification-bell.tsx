'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Check, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { api } from '@/lib/api';
import echo from '@/lib/echo';
import Link from 'next/link';

interface AppNotification {
  id: string;
  type: string;
  data: {
    mensagem: string;
    url?: string;
  };
  read_at: string | null;
  created_at: string;
}

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notificacoes');
        setNotifications(res.data.notifications.data);
        setUnreadCount(res.data.unread_count);
      } catch (err) {
        console.error('Erro ao buscar notificações', err);
      }
    };

    fetchNotifications();

    // Listen for real-time notifications via Reverb
    if (echo) {
      echo.private(`App.Models.User.${user.id}`)
        .notification((notification: { id: string; type: string; mensagem: string; url?: string }) => {
          setNotifications((prev) => [
            {
              id: notification.id,
              type: notification.type,
              data: {
                mensagem: notification.mensagem,
                url: notification.url,
              },
              read_at: null,
              created_at: new Date().toISOString(),
            },
            ...prev
          ]);
          setUnreadCount((prev) => prev + 1);
        });
    }

    return () => {
      if (echo && user) {
        echo.leave(`App.Models.User.${user.id}`);
      }
    };
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await api.post(`/notificacoes/${id}/mark-read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.post('/notificacoes/mark-all-read');
      setNotifications(notifications.map(n => ({ ...n, read_at: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-amber-500 transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
            <h3 className="font-bold text-slate-800 dark:text-white">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> Marcar todas como lidas
              </button>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">Não tem notificações recentes.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 transition-colors ${
                      !notif.read_at ? 'bg-amber-50/50 dark:bg-amber-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${!notif.read_at ? 'bg-amber-500' : 'bg-transparent'}`} />
                      <div className="flex-1 space-y-1">
                        <p className={`text-sm ${!notif.read_at ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                          {notif.data.mensagem}
                        </p>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                          {new Date(notif.created_at).toLocaleString('pt-AO')}
                        </span>
                        
                        <div className="flex items-center gap-3 pt-2">
                          {notif.data.url && (
                            <Link
                              href={notif.data.url}
                              onClick={() => {
                                if (!notif.read_at) markAsRead(notif.id);
                                setIsOpen(false);
                              }}
                              className="text-[11px] font-bold text-primary flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" /> Ver Detalhes
                            </Link>
                          )}
                          {!notif.read_at && (
                            <button
                              onClick={() => markAsRead(notif.id)}
                              className="text-[11px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              Marcar como lida
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
