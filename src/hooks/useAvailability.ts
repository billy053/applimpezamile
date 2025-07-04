import { useState, useEffect } from 'react';

export interface AvailabilityDate {
  id: string;
  date: Date;
  isAvailable: boolean;
  reason?: string; // Motivo da indisponibilidade (ex: "Feriado", "Manutenção", etc.)
  createdAt: Date;
  updatedAt: Date;
}

export const useAvailability = () => {
  const [availabilityDates, setAvailabilityDates] = useState<AvailabilityDate[]>([]);

  // Carregar disponibilidade do localStorage
  useEffect(() => {
    const savedAvailability = localStorage.getItem('cleanpro-availability');
    if (savedAvailability) {
      try {
        const parsedAvailability = JSON.parse(savedAvailability).map((item: any) => ({
          ...item,
          date: new Date(item.date),
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt),
        }));
        setAvailabilityDates(parsedAvailability);
      } catch (error) {
        console.error('Erro ao carregar disponibilidade:', error);
      }
    }
  }, []);

  // Salvar disponibilidade no localStorage
  useEffect(() => {
    localStorage.setItem('cleanpro-availability', JSON.stringify(availabilityDates));
  }, [availabilityDates]);

  // Adicionar ou atualizar disponibilidade de uma data
  const setDateAvailability = (date: Date, isAvailable: boolean, reason?: string) => {
    const dateString = date.toDateString();
    const existingIndex = availabilityDates.findIndex(
      item => item.date.toDateString() === dateString
    );

    if (existingIndex >= 0) {
      // Atualizar existente
      setAvailabilityDates(prev => 
        prev.map((item, index) => 
          index === existingIndex 
            ? { 
                ...item, 
                isAvailable, 
                reason: isAvailable ? undefined : reason,
                updatedAt: new Date() 
              }
            : item
        )
      );
    } else {
      // Adicionar novo
      const newAvailability: AvailabilityDate = {
        id: Date.now().toString(),
        date: new Date(date),
        isAvailable,
        reason: isAvailable ? undefined : reason,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setAvailabilityDates(prev => [...prev, newAvailability]);
    }
  };

  // Definir disponibilidade para múltiplas datas
  const setBulkAvailability = (dates: Date[], isAvailable: boolean, reason?: string) => {
    dates.forEach(date => {
      setDateAvailability(date, isAvailable, reason);
    });
  };

  // Remover configuração de disponibilidade (volta ao padrão)
  const removeDateAvailability = (date: Date) => {
    const dateString = date.toDateString();
    setAvailabilityDates(prev => 
      prev.filter(item => item.date.toDateString() !== dateString)
    );
  };

  // Verificar se uma data está disponível
  const isDateAvailable = (date: Date): boolean => {
    const dateString = date.toDateString();
    const availabilityItem = availabilityDates.find(
      item => item.date.toDateString() === dateString
    );

    // Se não há configuração específica, considera disponível por padrão
    // (exceto domingos e datas passadas)
    if (!availabilityItem) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Não disponível se for data passada
      if (date < today) return false;
      
      // Não disponível aos domingos por padrão
      if (date.getDay() === 0) return false;
      
      return true;
    }

    return availabilityItem.isAvailable;
  };

  // Obter motivo da indisponibilidade
  const getUnavailabilityReason = (date: Date): string | undefined => {
    const dateString = date.toDateString();
    const availabilityItem = availabilityDates.find(
      item => item.date.toDateString() === dateString
    );

    return availabilityItem?.reason;
  };

  // Obter todas as datas indisponíveis
  const getUnavailableDates = (): Date[] => {
    return availabilityDates
      .filter(item => !item.isAvailable)
      .map(item => item.date);
  };

  // Obter todas as datas com disponibilidade forçada (disponível mesmo sendo domingo)
  const getForcedAvailableDates = (): Date[] => {
    return availabilityDates
      .filter(item => item.isAvailable && item.date.getDay() === 0)
      .map(item => item.date);
  };

  // Definir padrão de disponibilidade semanal
  const setWeeklyPattern = (daysOfWeek: number[], isAvailable: boolean, reason?: string) => {
    // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
    const today = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 6); // Próximos 6 meses

    const dates: Date[] = [];
    const currentDate = new Date(today);

    while (currentDate <= endDate) {
      if (daysOfWeek.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setBulkAvailability(dates, isAvailable, reason);
  };

  // Definir feriados como indisponíveis
  const setHolidays = (holidays: { date: Date; name: string }[]) => {
    holidays.forEach(holiday => {
      setDateAvailability(holiday.date, false, `Feriado: ${holiday.name}`);
    });
  };

  // Obter estatísticas de disponibilidade
  const getAvailabilityStats = () => {
    const total = availabilityDates.length;
    const available = availabilityDates.filter(item => item.isAvailable).length;
    const unavailable = total - available;

    return { total, available, unavailable };
  };

  // Limpar todas as configurações de disponibilidade
  const clearAllAvailability = () => {
    setAvailabilityDates([]);
  };

  return {
    availabilityDates,
    setDateAvailability,
    setBulkAvailability,
    removeDateAvailability,
    isDateAvailable,
    getUnavailabilityReason,
    getUnavailableDates,
    getForcedAvailableDates,
    setWeeklyPattern,
    setHolidays,
    getAvailabilityStats,
    clearAllAvailability,
  };
};