import { useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'reminder' | 'created' | 'vencido';
  daysRemaining?: number;
  read: boolean;
  scheduled_for: string;
}

/**
 * Hook para gerenciar notificações em tempo real via WebSocket
 * Mostra notificações de recorrências com status inteligente
 */
export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toastNotification, setToastNotification] = useState<NotificationData | null>(null);

  const calculateDaysRemaining = useCallback((scheduledFor: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(scheduledFor);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }, []);

  const getNotificationType = useCallback((scheduledFor: string): 'reminder' | 'vencido' => {
    const daysRemaining = calculateDaysRemaining(scheduledFor);
    return daysRemaining <= 0 ? 'vencido' : 'reminder';
  }, [calculateDaysRemaining]);

  const enrichNotification = useCallback((notification: any): NotificationData => {
    const daysRemaining = calculateDaysRemaining(notification.scheduled_for);
    const type = getNotificationType(notification.scheduled_for);
    
    let title = notification.title;
    let message = notification.message;

    if (type === 'vencido') {
      title = '⚠️ Transação Vencida';
      message = `${notification.message} - VENCIDO`;
    } else if (daysRemaining <= 5) {
      title = `⏰ Lembrete: ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''} para vencer`;
      message = `${notification.message}`;
    }

    return {
      ...notification,
      title,
      message,
      type,
      daysRemaining,
    };
  }, [calculateDaysRemaining, getNotificationType]);

  useEffect(() => {
    if (!userId) return;

    // Buscar notificações iniciais
    const loadNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .is('deleted_at', null)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        const enriched = (data || []).map(enrichNotification);
        setNotifications(enriched);
        setUnreadCount(enriched.filter(n => !n.read).length);
      } catch (error) {
        console.error('Erro ao carregar notificações:', error);
      }
    };

    loadNotifications();

    // Inscrever no canal de realtime para mudanças
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const enriched = enrichNotification(payload.new);
            setNotifications(prev => [enriched, ...prev]);
            setUnreadCount(prev => prev + 1);
            
            // Mostrar toast por 5 segundos
            setToastNotification(enriched);
            setTimeout(() => setToastNotification(null), 5000);
          } else if (payload.eventType === 'UPDATE') {
            const enriched = enrichNotification(payload.new);
            setNotifications(prev =>
              prev.map(n => n.id === enriched.id ? enriched : n)
            );
            if (payload.old.read === false && payload.new.read === true) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          } else if (payload.eventType === 'DELETE') {
            setNotifications(prev => prev.filter(n => n.id !== payload.old.id));
            if (!payload.old.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, enrichNotification]);

  return {
    notifications,
    unreadCount,
    toastNotification,
    setToastNotification,
  };
}
