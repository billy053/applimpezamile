import React, { useState } from 'react';
import { Home, Briefcase, Building, MessageCircle, Calendar } from 'lucide-react';
import Header from './components/Header';
import ServiceCard from './components/ServiceCard';
import Calendar from './components/Calendar';
import BookingForm, { BookingData } from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import AdminPanel from './components/AdminPanel';
import ReviewSystem from './components/ReviewSystem';
import ImageSlider from './components/ImageSlider';
import ServiceSelectionModal from './components/ServiceSelectionModal';
import { useBookings } from './hooks/useBookings';
import { useSliderImages } from './hooks/useSliderImages';

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
  const [showServiceModal, setShowServiceModal] = useState(false);
  
  const { bookings, addBooking, getBookedDates, getPendingDates, confirmBookingViaWhatsApp, cancelBooking } = useBookings();
  const sliderImages = useSliderImages();

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep('date');
  };

  const handleQuickBooking = () => {
    setShowServiceModal(true);
  };

  const handleModalServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setCurrentStep('date');
    setShowServiceModal(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('booking');
  };

  const handleBookingSubmit = (booking: BookingData) => {
    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    // Create booking record (status: pending, no WhatsApp sent yet)
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

    // Format the WhatsApp message for admin notification
    const adminMessage = `🧹 *NOVA SOLICITAÇÃO DE AGENDAMENTO*

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

 `;

    // Replace with your actual WhatsApp number (include country code without + or spaces)
    const whatsappNumber = '555381556144';
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(adminMessage)}`;
    
    // Open WhatsApp in a new tab/window to notify admin
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
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Confirm the booking
    confirmBookingViaWhatsApp(bookingId);

    // Send confirmation WhatsApp to client
    const service = services.find(s => s.id === booking.serviceId);
    const clientMessage = `✅ *AGENDAMENTO CONFIRMADO - CleanPro*

Olá ${booking.clientName}! Seu agendamento foi confirmado com sucesso.

📅 *Data:* ${booking.date.toLocaleDateString('pt-BR')}
🏠 *Serviço:* ${booking.serviceName}
💰 *Valor:* ${service?.price || 'A combinar'}
⏰ *Duração estimada:* ${service?.duration || 'A definir'}
📍 *Local:* ${booking.clientAddress}

${booking.notes ? `📝 *Observações:* ${booking.notes}` : ''}

🔢 *Número do agendamento:* #${booking.id.slice(-6)}

📞 *Dúvidas?* Entre em contato conosco pelo WhatsApp.

Obrigado por escolher a CleanPro! 🧹✨`;

    // Send WhatsApp message to client
    const clientPhone = booking.clientPhone.replace(/\D/g, '');
    const clientWhatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(clientMessage)}`;
    
    // Open WhatsApp to send confirmation to client
    window.open(clientWhatsappUrl, '_blank');
  };

  const handleCancelBooking = (bookingId: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Cancel the booking
    cancelBooking(bookingId);

    // Send cancellation WhatsApp to client
    const clientMessage = `❌ *AGENDAMENTO CANCELADO - CleanPro*

Olá ${booking.clientName},

Infelizmente precisamos cancelar seu agendamento:

📅 *Data:* ${booking.date.toLocaleDateString('pt-BR')}
🏠 *Serviço:* ${booking.serviceName}
🔢 *Número:* #${booking.id.slice(-6)}

Pedimos desculpas pelo inconveniente. Entre em contato conosco para reagendar ou esclarecer dúvidas.

📞 *WhatsApp:* Responda esta mensagem
💬 *Atendimento:* Segunda a sexta, 8h às 18h

Obrigado pela compreensão! 🙏`;

    // Send WhatsApp message to client
    const clientPhone = booking.clientPhone.replace(/\D/g, '');
    const clientWhatsappUrl = `https://wa.me/${clientPhone}?text=${encodeURIComponent(clientMessage)}`;
    
    // Open WhatsApp to send cancellation to client
    window.open(clientWhatsappUrl, '_blank');
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Quick Booking Button */}
      <div className="container mx-auto px-4 pt-8">
        <div className="text-center mb-6">
          <button
            onClick={handleQuickBooking}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
          >
            <Calendar className="w-6 h-6 mr-3" />
            Agendar Agora
          </button>
          <p className="text-gray-600 text-sm mt-2">
            Clique para escolher seu serviço e agendar rapidamente
          </p>
        </div>
      </div>
      
      {/* Image Slider */}
      <div className="container mx-auto px-4 pt-8">
        <ImageSlider images={sliderImages.images} />
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Progress indicator - only show for booking flow */}
        {currentStep !== 'confirmation' && (
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'service' ? 'bg-pink-500 text-white' : 'bg-green-500 text-white'
              }`}>
                1
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'date' ? 'bg-pink-500 text-white' : 
                currentStep === 'booking' ? 'bg-green-500 text-white' : 'bg-gray-300'
              }`}>
                2
              </div>
              <div className="w-12 h-0.5 bg-gray-300"></div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                currentStep === 'booking' ? 'bg-pink-500 text-white' : 'bg-gray-300'
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
            
            {/* Review System */}
            <div className="mt-16">
              <ReviewSystem />
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
                className="text-pink-600 hover:text-pink-800 text-sm mt-2"
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
                  className="text-pink-600 hover:text-pink-800"
                >
                  Alterar serviço
                </button>
                <span>•</span>
                <button
                  onClick={() => setCurrentStep('date')}
                  className="text-pink-600 hover:text-pink-800"
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
        sliderImages={sliderImages}
        onConfirmBooking={handleConfirmBooking}
        onCancelBooking={handleCancelBooking}
      />

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onServiceSelect={handleModalServiceSelect}
        services={services}
      />
    </div>
  );
}

export default App;