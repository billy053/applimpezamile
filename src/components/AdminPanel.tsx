import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Phone, Calendar, User, MapPin } from 'lucide-react';
import { Booking } from '../hooks/useBookings';

interface AdminPanelProps {
  bookings: Booking[];
  onConfirmBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, onConfirmBooking, onCancelBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const ADMIN_CODE = '1234'; // Em produção, use um sistema de autenticação mais seguro

  const handleLogin = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      setAdminCode('');
    } else {
      alert('Código incorreto!');
    }
  };

  const pendingBookings = bookings.filter(booking => booking.status === 'pending');

  if (!isOpen) {
    return (
      <div className="fixed bottom-20 right-6">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-all duration-200"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-gray-800 text-white p-4 flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-6 h-6 mr-2" />
            <h2 className="text-xl font-semibold">Painel Administrativo</h2>
          </div>
          <button
            onClick={() => {
              setIsOpen(false);
              setIsAuthenticated(false);
              setAdminCode('');
            }}
            className="text-gray-300 hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="p-6">
          {!isAuthenticated ? (
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Acesso Restrito</h3>
              <div className="max-w-sm mx-auto">
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Código de acesso"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4"
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <button
                  onClick={handleLogin}
                  className="w-full bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700"
                >
                  Entrar
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">
                  Solicitações Pendentes ({pendingBookings.length})
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Aguardando confirmação via WhatsApp
                </div>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Nenhuma solicitação pendente</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="font-medium text-gray-800">
                            Solicitação #{booking.id.slice(-6)}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {booking.createdAt.toLocaleString('pt-BR')}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">Data:</span>
                            <span className="ml-1">{booking.date.toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <User className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">Cliente:</span>
                            <span className="ml-1">{booking.clientName}</span>
                          </div>
                          
                          <div className="flex items-center text-sm">
                            <Phone className="w-4 h-4 text-blue-600 mr-2" />
                            <span className="font-medium">Telefone:</span>
                            <span className="ml-1">{booking.clientPhone}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Serviço:</span>
                            <span className="ml-1">{booking.serviceName}</span>
                          </div>
                          
                          <div className="flex items-start text-sm">
                            <MapPin className="w-4 h-4 text-blue-600 mr-2 mt-0.5" />
                            <div>
                              <span className="font-medium">Endereço:</span>
                              <span className="ml-1">{booking.clientAddress}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Observações:</span>
                          <span className="ml-1">{booking.notes}</span>
                        </div>
                      )}

                      <div className="flex space-x-3">
                        <button
                          onClick={() => onConfirmBooking(booking.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar Agendamento
                        </button>
                        <button
                          onClick={() => onCancelBooking(booking.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Recusar
                        </button>
                        <a
                          href={`https://wa.me/${booking.clientPhone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contatar Cliente
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;