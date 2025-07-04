import { useState, useEffect, useCallback } from 'react';
import { supabase, type Tables } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface BookingWithDetails {
  id: string;
  booking_date: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes: string | null;
  created_at: string;
  confirmed_at: string | null;
  whatsapp_sent: boolean;
  client: {
    id: string;
    name: string;
    email: string | null;
    phone: string;
    address: string;
  };
  service: {
    id: string;
    title: string;
    price_text: string;
    duration: string;
  };
}

export interface DashboardStats {
  total_bookings: number;
  pending_bookings: number;
  confirmed_bookings: number;
  cancelled_bookings: number;
  completed_bookings: number;
  total_clients: number;
  bookings_today: number;
  bookings_this_week: number;
  bookings_this_month: number;
}

export const useSupabaseBookings = () => {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Carregar agendamentos com detalhes
  const loadBookings = useCallback(async (filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_bookings_with_details', {
        status_filter: filters?.status || null,
        date_from: filters?.dateFrom || null,
        date_to: filters?.dateTo || null,
        limit_count: filters?.limit || 100,
      });

      if (error) throw error;

      const formattedBookings: BookingWithDetails[] = data.map((item: any) => ({
        id: item.booking_id,
        booking_date: item.booking_date,
        status: item.booking_status,
        notes: item.booking_notes,
        created_at: item.booking_created_at,
        confirmed_at: item.booking_confirmed_at,
        whatsapp_sent: false, // Será implementado no banco
        client: {
          id: item.client_id,
          name: item.client_name,
          email: item.client_email,
          phone: item.client_phone,
          address: item.client_address,
        },
        service: {
          id: item.service_id,
          title: item.service_title,
          price_text: item.service_price,
          duration: item.service_duration,
        },
      }));

      setBookings(formattedBookings);
    } catch (err) {
      console.error('Erro ao carregar agendamentos:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar estatísticas do dashboard
  const loadStats = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_dashboard_stats');
      if (error) throw error;
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err);
    }
  }, []);

  // Criar agendamento completo
  const createBooking = useCallback(async (bookingData: {
    clientName: string;
    clientEmail?: string;
    clientPhone: string;
    clientAddress: string;
    serviceId: string;
    bookingDate: string;
    notes?: string;
  }) => {
    try {
      const { data, error } = await supabase.rpc('create_booking_complete', {
        client_name: bookingData.clientName,
        client_email: bookingData.clientEmail || null,
        client_phone: bookingData.clientPhone,
        client_address: bookingData.clientAddress,
        service_id: bookingData.serviceId,
        booking_date: bookingData.bookingDate,
        booking_notes: bookingData.notes || null,
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao criar agendamento');
      }

      // Recarregar dados
      await Promise.all([loadBookings(), loadStats()]);

      return {
        success: true,
        bookingId: data.booking_id,
        clientId: data.client_id,
      };
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      throw err;
    }
  }, [loadBookings, loadStats]);

  // Atualizar status do agendamento
  const updateBookingStatus = useCallback(async (
    bookingId: string,
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  ) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) throw error;

      // Recarregar dados
      await Promise.all([loadBookings(), loadStats()]);

      return { success: true };
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      throw err;
    }
  }, [loadBookings, loadStats]);

  // Verificar disponibilidade de data
  const checkDateAvailability = useCallback(async (date: string) => {
    try {
      const { data, error } = await supabase.rpc('check_date_availability', {
        check_date: date,
      });

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Erro ao verificar disponibilidade:', err);
      throw err;
    }
  }, []);

  // Obter datas ocupadas
  const getBookedDates = useCallback(() => {
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .map(booking => new Date(booking.booking_date));
  }, [bookings]);

  // Obter datas pendentes
  const getPendingDates = useCallback(() => {
    return bookings
      .filter(booking => booking.status === 'pending')
      .map(booking => new Date(booking.booking_date));
  }, [bookings]);

  // Configurar sincronização em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('bookings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
        },
        (payload) => {
          console.log('Mudança em tempo real detectada:', payload);
          // Recarregar dados quando houver mudanças
          loadBookings();
          loadStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clients',
        },
        (payload) => {
          console.log('Mudança em clientes detectada:', payload);
          loadBookings();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadBookings, loadStats]);

  // Carregar dados iniciais
  useEffect(() => {
    loadBookings();
    loadStats();
  }, [loadBookings, loadStats]);

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
    bookings,
    stats,
    loading,
    error,

    // Funções
    loadBookings,
    loadStats,
    createBooking,
    updateBookingStatus,
    checkDateAvailability,
    getBookedDates,
    getPendingDates,

    // Utilitários
    refresh: () => Promise.all([loadBookings(), loadStats()]),
  };
};