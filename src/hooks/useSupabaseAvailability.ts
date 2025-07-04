import { useState, useEffect, useCallback } from 'react';
import { supabase, type Tables } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface AvailabilityDate {
  id: string;
  date: Date;
  is_available: boolean;
  reason?: string;
  created_at: Date;
  updated_at: Date;
}

export const useSupabaseAvailability = () => {
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);

  // Carregar configurações de disponibilidade
  const loadAvailability = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('availability')
        .select('*')
        .order('date', { ascending: true });

      if (error) throw error;

      const formattedData: AvailabilityDate[] = data.map(item => ({
        id: item.id,
        date: new Date(item.date),
        is_available: item.is_available,
        reason: item.reason || undefined,
        created_at: new Date(item.created_at),
        updated_at: new Date(item.updated_at),
      }));

      setAvailabilityDates(formattedData);
    } catch (err) {
      console.error('Erro ao carregar disponibilidade:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  // Definir disponibilidade de uma data
  const setDateAvailability = useCallback(async (
    date: Date,
    isAvailable: boolean,
    reason?: string
  ) => {
    try {
      const dateString = date.toISOString().split('T')[0];

      const { error } = await supabase
        .from('availability')
        .upsert({
          date: dateString,
          is_available: isAvailable,
          reason: isAvailable ? null : reason,
        }, {
          onConflict: 'date'
        });

      if (error) throw error;

      // Recarregar dados
      await loadAvailability();

      return { success: true };
    } catch (err) {
      console.error('Erro ao definir disponibilidade:', err);
      throw err;
    }
  }, [loadAvailability]);

  // Definir disponibilidade para múltiplas datas
  const setBulkAvailability = useCallback(async (
    dates: Date[],
    isAvailable: boolean,
    reason?: string
  ) => {
    try {
      const availabilityData = dates.map(date => ({
        date: date.toISOString().split('T')[0],
        is_available: isAvailable,
        reason: isAvailable ? null : reason,
      }));

      const { error } = await supabase
        .from('availability')
        .upsert(availabilityData, {
          onConflict: 'date'
        });

      if (error) throw error;

      // Recarregar dados
      await loadAvailability();

      return { success: true };
    } catch (err) {
      console.error('Erro ao definir disponibilidade em lote:', err);
      throw err;
    }
  }, [loadAvailability]);

  // Remover configuração de disponibilidade
  const removeDateAvailability = useCallback(async (date: Date) => {
    try {
      const dateString = date.toISOString().split('T')[0];

      const { error } = await supabase
        .from('availability')
        .delete()
        .eq('date', dateString);

      if (error) throw error;

      // Recarregar dados
      await loadAvailability();

      return { success: true };
    } catch (err) {
      console.error('Erro ao remover disponibilidade:', err);
      throw err;
    }
  }, [loadAvailability]);

  // Verificar se uma data está disponível
  const isDateAvailable = useCallback((date: Date): boolean => {
    const dateString = date.toDateString();
    const availabilityItem = availabilityDates.find(
      item => item.date.toDateString() === dateString
    );

    // Se não há configuração específica, aplicar regras padrão
    if (!availabilityItem) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Não disponível se for data passada
      if (date < today) return false;
      
      // Não disponível aos domingos por padrão
      if (date.getDay() === 0) return false;
      
      return true;
    }

    return availabilityItem.is_available;
  }, [availabilityDates]);

  // Obter motivo da indisponibilidade
  const getUnavailabilityReason = useCallback((date: Date): string | undefined => {
    const dateString = date.toDateString();
    const availabilityItem = availabilityDates.find(
      item => item.date.toDateString() === dateString
    );

    if (!availabilityItem) {
      // Verificar regras padrão
      if (date.getDay() === 0) {
        return 'Não trabalhamos aos domingos';
      }
      return undefined;
    }

    return availabilityItem.reason;
  }, [availabilityDates]);

  // Obter estatísticas
  const getAvailabilityStats = useCallback(() => {
    const total = availabilityDates.length;
    const available = availabilityDates.filter(item => item.is_available).length;
    const unavailable = total - available;

    return { total, available, unavailable };
  }, [availabilityDates]);

  // Limpar todas as configurações
  const clearAllAvailability = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('availability')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (error) throw error;

      // Recarregar dados
      await loadAvailability();

      return { success: true };
    } catch (err) {
      console.error('Erro ao limpar disponibilidade:', err);
      throw err;
    }
  }, [loadAvailability]);

  // Configurar sincronização em tempo real
  useEffect(() => {
    const channel = supabase
      .channel('availability_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability',
        },
        (payload) => {
          console.log('Mudança em disponibilidade detectada:', payload);
          loadAvailability();
        }
      )
      .subscribe();

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [loadAvailability]);

  // Carregar dados iniciais
  useEffect(() => {
    loadAvailability();
  }, [loadAvailability]);

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
    availabilityDates,
    loading,
    error,

    // Funções principais
    setDateAvailability,
    setBulkAvailability,
    removeDateAvailability,
    isDateAvailable,
    getUnavailabilityReason,
    getAvailabilityStats,
    clearAllAvailability,

    // Utilitários
    refresh: loadAvailability,
  };
};