import React from 'react';
import { X, Home, Briefcase, Building } from 'lucide-react';
import Calendar from './Calendar';
import BookingForm, { BookingData } from './BookingForm';

interface Service {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  price: string;
  duration: string;
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (serviceId: string) => void;
  services: Service[];
  currentStep: 'service' | 'date' | 'booking' | 'review' | 'confirmation';
  selectedService: string;
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onBookingFormSubmit: (booking: BookingData) => void;
  onConfirmBooking: () => void;
  onBackToForm: () => void;
  onEditService: () => void;
  onEditDate: () => void;
  bookedDates: Date[];
  pendingDates: Date[];
  bookingFormData: BookingData | null;
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onServiceSelect,
  services,
  currentStep,
  selectedService,
  selectedDate,
  onDateSelect,
  onBookingFormSubmit,
  onConfirmBooking,
  onBackToForm,
  onEditService,
  onEditDate,
  bookedDates,
  pendingDates,
  bookingFormData
}) => {
  if (!isOpen) return null;

  const handleServiceSelect = (serviceId: string) => {
    onServiceSelect(serviceId);
  };

  const selectedServiceData = services.find(s => s.id === selectedService);

  const getStepTitle = () => {
    switch (currentStep) {
      case 'service':
        return 'Escolha seu Serviço';
      case 'date':
        return 'Escolha a Data';
      case 'booking':
        return 'Finalize seu Agendamento';
      case 'review':
        return 'Confirme seu Agendamento';
      default:
        return 'Agendamento';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'service':
        return 'Selecione o tipo de limpeza que você precisa';
      case 'date':
        return 'Selecione a data desejada para o serviço';
      case 'booking':
        return 'Preencha seus dados para finalizar';
      case 'review':
        return 'Revise os dados antes de finalizar sua solicitação';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">{getStepTitle()}</h2>
              <p className="text-pink-100">{getStepDescription()}</p>
            </div>
            <button
              onClick={onClose}
              className="text-pink-100 hover:text-white p-2 hover:bg-pink-400 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress indicator - only show for booking flow */}
          {currentStep !== 'service' && (
            <div className="flex justify-center">
              <div className="flex items-center space-x-4">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  ['date', 'booking', 'review'].includes(currentStep) ? 'bg-white text-pink-600' : 'bg-pink-400 text-pink-100'
                }`}>
                  1
                </div>
                <div className="w-8 h-0.5 bg-pink-300"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === 'date' ? 'bg-white text-pink-600' : 
                  ['booking', 'review'].includes(currentStep) ? 'bg-white text-pink-600' : 'bg-pink-400 text-pink-100'
                }`}>
                  2
                </div>
                <div className="w-8 h-0.5 bg-pink-300"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === 'booking' ? 'bg-white text-pink-600' : 
                  currentStep === 'review' ? 'bg-white text-pink-600' : 'bg-pink-400 text-pink-100'
                }`}>
                  3
                </div>
                <div className="w-8 h-0.5 bg-pink-300"></div>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep === 'review' ? 'bg-white text-pink-600' : 'bg-pink-400 text-pink-100'
                }`}>
                  4
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {/* Service Selection */}
          {currentStep === 'service' && (
            <div>
              <div className="grid md:grid-cols-3 gap-6">
                {services.map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <div
                      key={service.id}
                      onClick={() => handleServiceSelect(service.id)}
                      className="group p-6 rounded-lg border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-pink-500 hover:shadow-lg hover:scale-105"
                    >
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                          <IconComponent className="w-8 h-8 text-pink-600 group-hover:text-white" />
                        </div>
                        
                        <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-pink-600">
                          {service.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                          {service.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="text-2xl font-bold text-pink-600">
                            {service.price}
                          </div>
                          <div className="text-sm text-gray-500">
                            Duração: {service.duration}
                          </div>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold group-hover:bg-pink-700 transition-colors">
                            Selecionar Serviço
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Info */}
              <div className="mt-8 bg-pink-50 border border-pink-200 rounded-lg p-4">
                <div className="text-center">
                  <h4 className="font-semibold text-pink-800 mb-2">Por que escolher a CleanPro?</h4>
                  <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                      Profissionais qualificados
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                      Produtos de qualidade
                    </div>
                    <div className="flex items-center justify-center">
                      <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                      Agendamento flexível
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date Selection */}
          {currentStep === 'date' && selectedServiceData && (
            <div>
              <div className="text-center mb-6">
                <p className="text-gray-600 mb-2">
                  Serviço selecionado: <strong>{selectedServiceData.title}</strong>
                </p>
                <button
                  onClick={onEditService}
                  className="text-pink-600 hover:text-pink-800 text-sm"
                >
                  Alterar serviço
                </button>
              </div>
              <Calendar
                selectedDate={selectedDate}
                onDateSelect={onDateSelect}
                bookedDates={bookedDates}
                pendingDates={pendingDates}
              />
            </div>
          )}

          {/* Booking Form */}
          {currentStep === 'booking' && selectedServiceData && selectedDate && (
            <div>
              <div className="text-center mb-6">
                <div className="flex justify-center space-x-4 text-sm text-gray-600">
                  <button
                    onClick={onEditService}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    Alterar serviço
                  </button>
                  <span>•</span>
                  <button
                    onClick={onEditDate}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    Alterar data
                  </button>
                </div>
              </div>
              <BookingForm
                selectedDate={selectedDate}
                selectedService={selectedServiceData.title}
                onBookingSubmit={onBookingFormSubmit}
              />
            </div>
          )}

          {/* Booking Review */}
          {currentStep === 'review' && selectedServiceData && selectedDate && bookingFormData && (
            <div>
              <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
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
                  onClick={onBackToForm}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Voltar e Editar
                </button>
                <button
                  onClick={onConfirmBooking}
                  className="flex-1 bg-pink-600 hover:bg-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
                >
                  Confirmar Agendamento
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;