import { useState, useEffect } from 'react';

export interface Booking {
  id: string;
  date: Date;
  serviceId: string;
  serviceName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  clientAddress: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  whatsappSent: boolean;
  confirmedAt?: Date;
}

export const useBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Load bookings from localStorage on component mount
  useEffect(() => {
    const savedBookings = localStorage.getItem('cleanpro-bookings');
    if (savedBookings) {
      try {
        const parsedBookings = JSON.parse(savedBookings).map((booking: any) => ({
          ...booking,
          date: new Date(booking.date),
          createdAt: new Date(booking.createdAt),
          confirmedAt: booking.confirmedAt ? new Date(booking.confirmedAt) : undefined,
          whatsappSent: booking.whatsappSent || false,
        }));
        setBookings(parsedBookings);
      } catch (error) {
        console.error('Error loading bookings:', error);
      }
    }
  }, []);

  // Save bookings to localStorage whenever bookings change
  useEffect(() => {
    localStorage.setItem('cleanpro-bookings', JSON.stringify(bookings));
  }, [bookings]);

  const addBooking = (booking: Omit<Booking, 'id' | 'createdAt' | 'status' | 'whatsappSent'>) => {
    const newBooking: Booking = {
      ...booking,
      id: Date.now().toString(),
      status: 'pending',
      createdAt: new Date(),
      whatsappSent: false, // WhatsApp to client not sent yet
    };
    setBookings(prev => [...prev, newBooking]);
    return newBooking;
  };

  const updateBookingStatus = (id: string, status: Booking['status']) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id ? { 
          ...booking, 
          status,
          confirmedAt: status === 'confirmed' ? new Date() : booking.confirmedAt,
          whatsappSent: status === 'confirmed' || status === 'cancelled' ? true : booking.whatsappSent
        } : booking
      )
    );
  };

  // Confirma agendamento via WhatsApp
  const confirmBookingViaWhatsApp = (id: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id ? { 
          ...booking, 
          status: 'confirmed' as const,
          confirmedAt: new Date(),
          whatsappSent: true // Mark that WhatsApp confirmation was sent
        } : booking
      )
    );
    
    // Notificação de sucesso
    const booking = bookings.find(b => b.id === id);
    if (booking) {
      console.log(`Agendamento confirmado para ${booking.clientName} em ${booking.date.toLocaleDateString('pt-BR')}`);
    }
  };

  // Cancela agendamento
  const cancelBooking = (id: string) => {
    setBookings(prev => 
      prev.map(booking => 
        booking.id === id ? { 
          ...booking, 
          status: 'cancelled' as const,
          whatsappSent: true // Mark that WhatsApp cancellation was sent
        } : booking
      )
    );
  };

  // Retorna apenas datas de agendamentos CONFIRMADOS
  const getBookedDates = () => {
    return bookings
      .filter(booking => booking.status === 'confirmed')
      .map(booking => booking.date);
  };

  // Retorna datas pendentes (solicitadas mas não confirmadas)
  const getPendingDates = () => {
    return bookings
      .filter(booking => booking.status === 'pending')
      .map(booking => booking.date);
  };

  const getBookingByDate = (date: Date) => {
    return bookings.find(booking => 
      booking.date.toDateString() === date.toDateString()
    );
  };

  // Estatísticas para dashboard
  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    return { total, confirmed, pending, cancelled };
  };

  return {
    bookings,
    addBooking,
    updateBookingStatus,
    confirmBookingViaWhatsApp,
    cancelBooking,
    getBookedDates,
    getPendingDates,
    getBookingByDate,
    getBookingStats,
  };
};