import React, { useState } from 'react';
import { Home, Briefcase, Building, MessageCircle, Calendar as CalendarIcon } from 'lucide-react';
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
  const [currentStep, setCurrentStep] = useState<'service' | 'date' | 'booking' | 'review' | 'confirmation'>('service');
  const [currentBooking, setCurrentBooking] = useState<any>(null);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [bookingFormData, setBookingFormData] = useState<BookingData | null>(null);
  const [showHomepage, setShowHomepage] = useState(true);
  
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
    setShowHomepage(false);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setCurrentStep('booking');
  };

  const handleBookingFormSubmit = (booking: BookingData) => {
    setBookingFormData(booking);
    setCurrentStep('review');
  };

  const handleConfirmBooking = () => {
    if (!bookingFormData) return;
    
    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    // Create booking record (status: pending, no WhatsApp sent yet)
    const newBooking = addBooking({
      date: bookingFormData.date,
      serviceId: selectedService,
      serviceName: service.title,
      clientName: bookingFormData.name,
      clientPhone: bookingFormData.phone,
      clientEmail: bookingFormData.email,
      clientAddress: bookingFormData.address,
      notes: bookingFormData.notes,
    });

    setCurrentBooking(newBooking);

    // Format the WhatsApp message for admin notification
    const adminMessage = `🧹 *NOVA SOLICITAÇÃO DE AGENDAMENTO*

📅 *Data:* ${bookingFormData.date.toLocaleDateString('pt-BR')}
🏠 *Serviço:* ${service.title}
💰 *Valor:* ${service.price}
⏰ *Duração:* ${service.duration}

👤 *Cliente:* ${bookingFormData.name}
📧 *E-mail:* ${bookingFormData.email}
📱 *Telefone:* ${bookingFormData.phone}
📍 *Endereço:* ${bookingFormData.address}

${bookingFormData.notes ? `📝 *Observações:* ${bookingFormData.notes}` : ''}

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

  const handleBackToForm = () => {
    setCurrentStep('booking');
  };

  const handleEditService = () => {
    setCurrentStep('service');
    setShowServiceModal(true);
    setShowHomepage(true);
  };

  const handleEditDate = () => {
    setCurrentStep('date');
  };

  const resetBooking = () => {
    setSelectedService('');
    setSelectedDate(null);
    setCurrentBooking(null);
    setBookingFormData(null);
    setCurrentStep('service');
    setShowHomepage(true);
  };

  const handleConfirmBookingViaWhatsApp = (bookingId: string) => {
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
      {showHomepage && (
        <div className="container mx-auto px-4 pt-8">
          <div className="text-center mb-6">
            <button
              onClick={handleQuickBooking}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:from-pink-600 hover:to-pink-700 transform hover:scale-105 transition-all duration-200"
            >
              <CalendarIcon className="w-6 h-6 mr-3" />
              Agendar Agora
            </button>
            <p className="text-gray-600 text-sm mt-2">
              Clique para escolher seu serviço e agendar rapidamente
            </p>
          </div>
        </div>
      )}
      
      {/* Image Slider */}
      {showHomepage && (
        <div className="container mx-auto px-4 pt-8">
          <ImageSlider images={sliderImages.images} />
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Service Selection */}
        {currentStep === 'service' && showHomepage && (
          <div className="max-w-4xl mx-auto">
            {/* Review System */}
            <div className="mt-8">
              <ReviewSystem />
            </div>
          </div>
        )}

        {/* Date Selection */}
        {currentStep === 'date' && selectedServiceData && !showHomepage && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowHomepage(true)}
                className="flex items-center text-pink-600 hover:text-pink-800 text-sm font-medium"
              >
                ← Voltar ao início
              </button>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Escolha a Data
              </h2>
              <p className="text-gray-600">
                Serviço selecionado: <strong>{selectedServiceData.title}</strong>
              </p>
              <button
                onClick={handleEditService}
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
        {currentStep === 'booking' && selectedServiceData && selectedDate && !showHomepage && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowHomepage(true)}
                className="flex items-center text-pink-600 hover:text-pink-800 text-sm font-medium"
              >
                ← Voltar ao início
              </button>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Finalize seu Agendamento
              </h2>
              <div className="flex justify-center space-x-4 text-sm text-gray-600">
                <button
                  onClick={handleEditService}
                  className="text-pink-600 hover:text-pink-800"
                >
                  Alterar serviço
                </button>
                <span>•</span>
                <button
                  onClick={handleEditDate}
                  className="text-pink-600 hover:text-pink-800"
                >
                  Alterar data
                </button>
              </div>
            </div>
            <BookingForm
              selectedDate={selectedDate}
              selectedService={selectedServiceData.title}
              onBookingSubmit={handleBookingFormSubmit}
            />
          </div>
        )}

        {/* Booking Review */}
        {currentStep === 'review' && selectedServiceData && selectedDate && bookingFormData && !showHomepage && (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <button
                onClick={() => setShowHomepage(true)}
                className="flex items-center text-pink-600 hover:text-pink-800 text-sm font-medium"
              >
                ← Voltar ao início
              </button>
            </div>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Confirme seu Agendamento
              </h2>
              <p className="text-gray-600">
                Revise os dados antes de finalizar sua solicitação
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Resumo do Agendamento</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Serviço:</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-800">{selectedServiceData.title}</div>
                    <div className="text-sm text-gray-600">{selectedServiceData.duration}</div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Data:</span>
                  <span className="font-semibold text-gray-800">{selectedDate.toLocaleDateString('pt-BR')}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Valor:</span>
                  <span className="font-semibold text-pink-600 text-lg">{selectedServiceData.price}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <span className="font-semibold text-gray-800">{bookingFormData.name}</span>
                </div>
                
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Telefone:</span>
                  <span className="font-semibold text-gray-800">{bookingFormData.phone}</span>
                </div>
                
                <div className="flex justify-between items-start py-3 border-b border-gray-100">
                  <span className="font-medium text-gray-700">Endereço:</span>
                  <span className="font-semibold text-gray-800 text-right max-w-xs">{bookingFormData.address}</span>
                </div>
                
                {bookingFormData.email && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-100">
                    <span className="font-medium text-gray-700">E-mail:</span>
                    <span className="font-semibold text-gray-800">{bookingFormData.email}</span>
                  </div>
                )}
                
                {bookingFormData.notes && (
                  <div className="flex justify-between items-start py-3">
                    <span className="font-medium text-gray-700">Observações:</span>
                    <span className="font-semibold text-gray-800 text-right max-w-xs">{bookingFormData.notes}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="w-5 h-5 bg-amber-500 rounded-full flex-shrink-0 mt-0.5 mr-3"></div>
                <div className="text-sm text-amber-800">
                  <p className="font-medium mb-1">Importante:</p>
                  <ul className="text-xs space-y-1 text-amber-700">
                    <li>• Sua solicitação será enviada para nossa equipe</li>
                    <li>• Você receberá uma confirmação via WhatsApp</li>
                    <li>• A data ficará disponível até a confirmação oficial</li>
                    <li>• Nossa equipe entrará em contato em até 2 horas</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <button
                onClick={handleBackToForm}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Voltar e Editar
              </button>
              <button
                onClick={handleConfirmBooking}
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Confirmar Agendamento
              </button>
            </div>
          </div>
        )}

        {/* Booking Confirmation */}
        {currentStep === 'confirmation' && currentBooking && !showHomepage && (
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
        onConfirmBooking={handleConfirmBookingViaWhatsApp}
        onCancelBooking={handleCancelBooking}
      />

      {/* Service Selection Modal */}
      <ServiceSelectionModal
        isOpen={showServiceModal}
        onClose={() => setShowServiceModal(false)}
        onServiceSelect={handleModalServiceSelect}
        services={services}
        currentStep={currentStep}
        selectedService={selectedService}
        selectedDate={selectedDate}
        onDateSelect={handleDateSelect}
        onBookingFormSubmit={handleBookingFormSubmit}
        onConfirmBooking={handleConfirmBooking}
        onBackToForm={handleBackToForm}
        onEditService={handleEditService}
        onEditDate={handleEditDate}
        bookedDates={getBookedDates()}
        pendingDates={getPendingDates()}
        bookingFormData={bookingFormData}
      />
    </div>
  );
}

export default App;