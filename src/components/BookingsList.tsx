import React from 'react';
import { Calendar, User, Phone, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Booking } from '../hooks/useBookings';

interface BookingsListProps {
  bookings: Booking[];
  onUpdateStatus: (id: string, status: Booking['status']) => void;
}

const BookingsList: React.FC<BookingsListProps> = ({ bookings, onUpdateStatus }) => {
  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getStatusText = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmado';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  };

  const getStatusColor = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'cancelled':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-8">
        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Nenhum agendamento encontrado</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center">
              {getStatusIcon(booking.status)}
              <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
                {getStatusText(booking.status)}
              </span>
            </div>
            <div className="text-sm text-gray-500">
              {booking.createdAt.toLocaleDateString('pt-BR')}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm">
                  <strong>Data:</strong> {booking.date.toLocaleDateString('pt-BR')}
                </span>
              </div>
              
              <div className="flex items-center">
                <Clock className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm">
                  <strong>Serviço:</strong> {booking.serviceName}
                </span>
              </div>
              
              <div className="flex items-center">
                <User className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm">
                  <strong>Cliente:</strong> {booking.clientName}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <Phone className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm">
                  <strong>Telefone:</strong> {booking.clientPhone}
                </span>
              </div>
              
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                <span className="text-sm">
                  <strong>Endereço:</strong> {booking.clientAddress}
                </span>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Observações:</strong> {booking.notes}
              </p>
            </div>
          )}

          {booking.status === 'pending' && (
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => onUpdateStatus(booking.id, 'confirmed')}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => onUpdateStatus(booking.id, 'cancelled')}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default BookingsList;