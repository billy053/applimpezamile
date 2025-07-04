import React from 'react';
import { CheckCircle, Calendar, User, Phone, MapPin, MessageCircle, Clock, AlertTriangle } from 'lucide-react';
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
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          Solicitação Recebida!
        </h2>
        
        <p className="text-gray-600 mb-8">
          Sua solicitação de agendamento foi enviada para nossa equipe. 
          Você receberá uma confirmação via WhatsApp assim que analisarmos sua solicitação.
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

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-center justify-center mb-2">
            <Clock className="w-5 h-5 text-amber-600 mr-2" />
            <p className="text-amber-800 font-medium">
              Status: Aguardando análise
            </p>
          </div>
          <p className="text-amber-700 text-sm">
            Nossa equipe analisará sua solicitação e entrará em contato via WhatsApp para confirmar o agendamento.
            A data ficará disponível para outros clientes até a confirmação.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800 text-left">
              <p className="font-medium mb-1">Próximos passos:</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Nossa equipe analisará sua solicitação</li>
                <li>• Você receberá uma mensagem de confirmação ou reagendamento</li>
                <li>• Após a confirmação, a data será bloqueada no calendário</li>
                <li>• Entraremos em contato 1 dia antes do serviço</li>
              </ul>
            </div>
          </div>
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