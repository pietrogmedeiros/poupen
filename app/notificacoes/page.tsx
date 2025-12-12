'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchNotifications, markNotificationAsRead } from '@/lib/supabase-queries';
import { useNotifications } from '@/lib/useNotifications';
import { useValueVisibility } from '@/lib/ValueVisibilityContext';
import { MaskedValue } from '@/components/MaskedValue';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'created' | 'failed';
  scheduled_for: string;
  read: boolean;
  created_at: string;
}

const typeStyles = {
  reminder: { bg: 'bg-blue-50 dark:bg-blue-900/20', icon: 'text-blue-600 dark:text-blue-400', label: '⏰ Lembrete' },
  created: { bg: 'bg-green-50 dark:bg-green-900/20', icon: 'text-green-600 dark:text-green-400', label: '✓ Criada' },
  vencido: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', label: '⚠️ Vencida' },
  failed: { bg: 'bg-red-50 dark:bg-red-900/20', icon: 'text-red-600 dark:text-red-400', label: '✗ Erro' },
};

export default function NotificacoesPage() {
  const { user, loading: authLoading } = useAuth();
  const { isValuesVisible } = useValueVisibility();
  const { notifications, unreadCount } = useNotifications(user?.id);
  const [marking, setMarking] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const handleMarkAsRead = async (id: string) => {
    setMarking(id);
    try {
      await markNotificationAsRead(id);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    } finally {
      setMarking(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-gray-600 dark:text-gray-400" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600 dark:text-gray-400">Faça login para continuar</p>
      </div>
    );
  }

  const filtered = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-blue-400 to-purple-400 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-white" />
            </div>
            Notificações
          </h1>
          <p className="text-slate-400 mt-3 text-lg">
            {unreadCount > 0 ? `Você tem ${unreadCount} notificação${unreadCount !== 1 ? 's' : ''} não lida${unreadCount !== 1 ? 's' : ''}` : 'Você está atualizado!'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
            filter === 'all'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all ${
            filter === 'unread'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
              : 'bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:bg-slate-800/80'
          }`}
        >
          Não lidas ({unreadCount})
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 text-center border border-slate-700/30">
            <Bell className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">
              {filter === 'unread' ? 'Sem notificações não lidas' : 'Sem notificações'}
            </p>
          </div>
        ) : (
          filtered.map((notification: any) => {
            const style = typeStyles[notification.type as keyof typeof typeStyles] || typeStyles.failed;
            return (
              <div
                key={notification.id}
                className={`bg-slate-800/30 rounded-2xl p-4 border transition-all ${
                  !notification.read ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-slate-700/30 hover:border-slate-700/50'
                } backdrop-blur-sm hover:bg-slate-800/60`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${
                    notification.type === 'reminder' ? 'bg-blue-500/20 text-blue-400' :
                    notification.type === 'created' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white">
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-slate-400 mt-1">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded ${
                            notification.type === 'reminder' ? 'bg-blue-500/20 text-blue-400' :
                            notification.type === 'created' ? 'bg-green-500/20 text-green-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {style.label}
                          </span>
                          {notification.daysRemaining !== undefined && notification.type === 'reminder' && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">
                              {notification.daysRemaining} dia{notification.daysRemaining !== 1 ? 's' : ''} restante{notification.daysRemaining !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-xs text-slate-500">
                            {new Date(notification.created_at).toLocaleDateString('pt-BR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={marking === notification.id}
                          className="flex-shrink-0 p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Marcar como lida"
                        >
                          {marking === notification.id ? (
                            <Loader2 className="w-4 h-4 animate-spin text-gray-600 dark:text-gray-400" />
                          ) : (
                            <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
