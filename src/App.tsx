import React, { useState } from 'react';
import { Home, Briefcase, Building, MessageCircle } from 'lucide-react';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import Calendar from './components/Calendar';
import BookingForm, { BookingData } from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import AdminPanel from './components/AdminPanel';
import { useBookings } from './hooks/useBookings';

const services = [
  {
    id: 'residencial',
    icon: Home,
    title: 'Limpeza Residencial',
    description: 'Limpeza completa de casas e apartamentos',
    price: 'R$ 120',
    duration: '3-4 horas',
  },
  {
    id: 'comercial',
    icon: Briefcase,
    title: 'Limpeza Comercial',
    description: 'Limpeza de escritórios e estabelecimentos comerciais',
    price: 'R$ 180',
    duration: '4-6 horas',
  },
  {
    id: 'predial',
    icon: Building,
    title: 'Limpeza Predial',
    description: 'Limpeza de condomínios e áreas comuns',
    price: 'R$ 250',
    duration: '6-8 horas',
  },
];

function App() {
  const [selectedService, setSelectedService] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentStep, setCurrentStep] = useState<'service' | 'date' | 'booking' | 'confirmation'>('service');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  
  const { bookings, addBooking, getBookedDates, getPendingDates, confirmBookingViaWhatsApp, cancelBooking } = useBookings();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep('date');
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('booking');
  };

  const handleBookingSubmit = (booking: BookingData) => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    // Create booking record
    const newBooking = addBooking({
      date: booking.date,
      serviceId: selectedService,
      serviceName: service.title,
      clientName: booking.name,
      clientPhone: booking.phone,
      clientEmail: booking.email,
      clientAddress: booking.address,
      notes: booking.notes,
    });

    setCurrentBooking(newBooking);

    // Format the WhatsApp message with all booking details
    const message = `🧹 *NOVA SOLICITAÇÃO DE AGENDAMENTO*

📅 *Data:* ${booking.date.toLocaleDateString('pt-BR')}
🏠 *Serviço:* ${service.title}
💰 *Valor:* ${service.price}
⏰ *Duração:* ${service.duration}

👤 *Cliente:* ${booking.name}
📧 *E-mail:* ${booking.email}
📱 *Telefone:* ${booking.phone}
📍 *Endereço:* ${booking.address}

${booking.notes ? `📝 *Observações:* ${booking.notes}` : ''}

🔢 *ID da Solicitação:* #${newBooking.id.slice(-6)}

⚠️ *IMPORTANTE:* Responda com "ESTOU CONFIRMANDO" para aprovar este agendamento ou "VOU RECUSAR" para cancelar.`;

    // Replace with your actual WhatsApp number (include country code without + or spaces)
    const whatsappNumber = '555381556144';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    
    // Open WhatsApp in a new tab/window
    window.open(whatsappUrl, '_blank');

    // Show confirmation screen
    setCurrentStep('confirmation');
  };

  const resetBooking = () => {
    setSelectedService('');
    setSelectedDate(null);
    setCurrentBooking(null);
    setCurrentStep('service');
  };

  const handleConfirmBooking = (bookingId: string) => {
    confirmBookingViaWhatsApp(bookingId);
  };

  const handleCancelBooking = (bookingId: string) => {
    cancelBooking(bookingId);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress indicator - only show for booking flow */}
        {currentStep !== 'confirmation' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'service' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'date' ? 'bg-blue-500 text-white' : 
                currentStep === 'booking' ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'booking' ? 'bg-blue-500 text-white' : 'bg-gray-300'
              }`}>
                3
              </div>
            </div>
          </div>
        )}

        {/* Service Selection */}
        {currentStep === 'service' && (
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
              Escolha o Tipo de Serviço
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  icon={service.icon}
                  title={service.title}
                  description={service.description}
                  price={service.price}
                  duration={service.duration}
                  isSelected={selectedService === service.id}
                  onClick={() => handleServiceSelect(service.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Date Selection */}
        {currentStep === 'date' && selectedServiceData && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Escolha a Data
              </h2>
              <p className="text-gray-600">
                Serviço selecionado: <strong>{selectedServiceData.title}</strong>
              </p>
              <button
                onClick={resetBooking}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
              >
                Alterar serviço
              </button>
            </div>
            <Calendar
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              bookedDates={getBookedDates()}
              pendingDates={getPendingDates()}
            />
          </div>
        )}

        {/* Booking Form */}
        {currentStep === 'booking' && selectedServiceData && selectedDate && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Finalize seu Agendamento
              </h2>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <button
                  onClick={() => setCurrentStep('service')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Alterar serviço
                </button>
                <span>•</span>
                <button
                  onClick={() => setCurrentStep('date')}
                  className="text-blue-600 hover:text-blue-800"
                >
                  Alterar data
                </button>
              </div>
            </div>
            <BookingForm
              selectedDate={selectedDate}
              selectedService={selectedServiceData.title}
              onBookingSubmit={handleBookingSubmit}
            />
          </div>
        )}

        {/* Booking Confirmation */}
        {currentStep === 'confirmation' && currentBooking && (
          <div className="max-w-2xl mx-auto">
            <BookingConfirmation
              booking={currentBooking}
              onNewBooking={resetBooking}
            />
          </div>
        )}
      </div>

      {/* WhatsApp Float Button */}
      <div className="fixed bottom-6 right-6">
        <a
          href="https://wa.me/555381556144"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-14 h-14 bg-green-500 text-white rounded-full shadow-lg hover:bg-green-600 transition-all duration-200 hover:scale-105"
        >
          <MessageCircle className="w-6 h-6" />
        </a>
      </div>

      {/* Admin Panel */}
      <AdminPanel
        bookings={bookings}
        onConfirmBooking={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
}

export default App;