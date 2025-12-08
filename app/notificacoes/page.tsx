'use client';

import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { fetchNotifications, markNotificationAsRead } from '@/lib/supabase-queries';
import { useNotifications } from '@/lib/useNotifications';

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
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bell className="w-10 h-10" />
            Notificações
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {unreadCount > 0 ? `Você tem ${unreadCount} notificação${unreadCount !== 1 ? 's' : ''} não lida${unreadCount !== 1 ? 's' : ''}` : 'Você está atualizado!'}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Todas ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'unread'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Não lidas ({unreadCount})
        </button>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-3">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {filter === 'unread' ? 'Sem notificações não lidas' : 'Sem notificações'}
            </p>
          </div>
        ) : (
          filtered.map((notification: any) => {
            const style = typeStyles[notification.type as keyof typeof typeStyles] || typeStyles.failed;
            return (
              <div
                key={notification.id}
                className={`${style.bg} rounded-2xl p-4 border border-gray-200 dark:border-gray-700 transition-all ${
                  !notification.read ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${style.bg}`}>
                    <Bell className={`w-5 h-5 ${style.icon}`} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {notification.title}
                        </h3>
                        {notification.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs font-medium px-2 py-1 rounded`}>
                            {style.label}
                          </span>
                          {notification.daysRemaining !== undefined && notification.type === 'reminder' && (
                            <span className="text-xs font-bold px-2 py-1 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                              {notification.daysRemaining} dia{notification.daysRemaining !== 1 ? 's' : ''} restante{notification.daysRemaining !== 1 ? 's' : ''}
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
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
