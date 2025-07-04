import React from 'react';
import { CheckCircle, Calendar, User, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { Booking } from '../hooks/useBookings';

interface BookingConfirmationProps {
  booking: Booking;
  onNewBooking: () => void;
}

const BookingConfirmation: React.FC<BookingConfirmationProps> = ({ booking, onNewBooking }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Solicitação Enviada!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sua solicitação de agendamento foi enviada via WhatsApp. 
          Aguarde nossa confirmação para que a data seja bloqueada no calendário.
        </p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-4 text-center">Resumo da Solicitação</h3>
          
          <div className="space-y-3">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="font-medium">Data:</span>
                <span className="ml-2">{booking.date.toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="font-medium">Serviço:</span>
                <span className="ml-2">{booking.serviceName}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <User className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="font-medium">Nome:</span>
                <span className="ml-2">{booking.clientName}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="font-medium">Telefone:</span>
                <span className="ml-2">{booking.clientPhone}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <MapPin className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <span className="font-medium">Endereço:</span>
                <span className="ml-2">{booking.clientAddress}</span>
              </div>
            </div>
            
            {booking.notes && (
              <div className="flex items-start">
                <MessageCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                <div>
                  <span className="font-medium">Observações:</span>
                  <span className="ml-2">{booking.notes}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
            <p className="text-yellow-800 font-medium">
              Status: Aguardando confirmação
            </p>
          </div>
          <p className="text-yellow-700 text-sm">
            A data ficará disponível para outros clientes até recebermos sua confirmação via WhatsApp.
            Entraremos em contato em breve!
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
        >
          Fazer Nova Solicitação
        </button>
      </div>
    </div>
  );
};

export default BookingConfirmation;