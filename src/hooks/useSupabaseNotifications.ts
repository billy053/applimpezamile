import { useState, useEffect, useCallback } from 'react';
import { supabase, type Tables } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'system_alert';
  title: string;
  message: string;
  data: any | null;
  is_read: boolean;
  created_at: Date;
  read_at: Date | null;
}

export const useSupabaseNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Carregar notificações
  const loadNotifications = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedNotifications: Notification[] = data.map(item => ({
        id: item.id,
        type: item.type,
        title: item.title,
        message: item.message,
        data: item.data,
        is_read: item.is_read,
        created_at: new Date(item.created_at),
        read_at: item.read_at ? new Date(item.read_at) : null,
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date() }
            : notification
        )
      );

      setUnreadCount(prev => Math.max(0, prev - 1));

      return { success: true };
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      throw err;
    }
  }, []);

  // Marcar todas como lidas
  const markAllAsRead = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString(),
        })
        .eq('is_read', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          is_read: true,
          read_at: notification.read_at || new Date(),
        }))
      );

      setUnreadCount(0);

      return { success: true };
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      throw err;
    }
  }, []);

  // Criar nova notificação
  const createNotification = useCallback(async (notification: {
    type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'system_alert';
    title: string;
    message: string;
    data?: any;
  }) => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          type: notification.type,
          title: notification.title,
          message: notification.message,
          data: notification.data || null,
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, notification: data };
    } catch (err) {
      console.error('Erro ao criar notificação:', err);
      throw err;
    }
  }, []);

  // Deletar notificação
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Atualizar estado local
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (deletedNotification && !deletedNotification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      return { success: true };
    } catch (err) {
      console.error('Erro ao deletar notificação:', err);
      throw err;
    }
  }, [notifications]);

  // Limpar todas as notificações
  const clearAllNotifications = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      setNotifications([]);
      setUnreadCount(0);

      return { success: true };
    } catch (err) {
      console.error('Erro ao limpar notificações:', err);
      throw err;
    }
  }, []);

  // Configurar sincronização em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Nova notificação recebida:', payload);
          const newNotification: Notification = {
            id: payload.new.id,
            type: payload.new.type,
            title: payload.new.title,
            message: payload.new.message,
            data: payload.new.data,
            is_read: payload.new.is_read,
            created_at: new Date(payload.new.created_at),
            read_at: payload.new.read_at ? new Date(payload.new.read_at) : null,
          };

          setNotifications(prev => [newNotification, ...prev]);
          if (!newNotification.is_read) {
            setUnreadCount(prev => prev + 1);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          console.log('Notificação atualizada:', payload);
          setNotifications(prev =>
            prev.map(notification =>
              notification.id === payload.new.id
                ? {
                    ...notification,
                    is_read: payload.new.is_read,
                    read_at: payload.new.read_at ? new Date(payload.new.read_at) : null,
                  }
                : notification
            )
          );
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  // Carregar dados iniciais
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [realtimeChannel]);

  return {
    // Dados
    notifications,
    unreadCount,
    loading,
    error,

    // Funções
    loadNotifications,
    markAsRead,
    markAllAsRead,
    createNotification,
    deleteNotification,
    clearAllNotifications,

    // Utilitários
    refresh: loadNotifications,
  };
};