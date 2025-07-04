import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Phone, Calendar, User, MapPin, MessageCircle, RefreshCw } from 'lucide-react';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  const ADMIN_CODE = '1234'; // Em produção, use um sistema de autenticação mais seguro

  const handleLogin = () => {
    if (adminCode === ADMIN_CODE) {
      setIsAuthenticated(true);
      setAdminCode('');
    } else {
      alert('Código incorreto!');
    }
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simula um refresh - força re-render dos dados
    setTimeout(() => {
      setIsRefreshing(false);
      // Força uma atualização visual
      window.dispatchEvent(new Event('storage'));
    }, 500);
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
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold mr-4">
                    Solicitações Pendentes ({pendingBookings.length})
                  </h3>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className={`flex items-center px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      isRefreshing 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                  </button>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="w-4 h-4 mr-1" />
                  Aguardando aprovação
                </div>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="mb-2">Nenhuma solicitação pendente</p>
                  <p className="text-sm text-gray-400">
                    Clique em "Atualizar" para verificar novas solicitações
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar">
                  {pendingBookings.map((booking) => (
                    <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center">
                          <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
                          <span className="font-medium text-gray-800">
                            Solicitação #{booking.id.slice(-6)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block">
                            {booking.createdAt.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full mt-1 inline-block">
                            Nova solicitação
                          </span>
                        </div>
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
                          
                          {booking.clientEmail && (
                            <div className="text-sm">
                              <span className="font-medium">E-mail:</span>
                              <span className="ml-1">{booking.clientEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="mb-4 p-3 bg-gray-50 rounded text-sm">
                          <span className="font-medium">Observações:</span>
                          <span className="ml-1">{booking.notes}</span>
                        </div>
                      )}

                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-sm text-amber-800">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">Ação necessária:</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">
                          Ao confirmar, o cliente receberá automaticamente uma mensagem de confirmação via WhatsApp.
                          Ao recusar, o cliente será notificado sobre o cancelamento.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onConfirmBooking(booking.id)}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirmar e Notificar Cliente
                        </button>
                        <button
                          onClick={() => onCancelBooking(booking.id)}
                          className="flex items-center px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Recusar e Notificar Cliente
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

              {/* Statistics Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center text-sm text-gray-600">
                  <span>
                    Última atualização: {new Date().toLocaleTimeString('pt-BR')}
                  </span>
                  <span>
                    Total de solicitações hoje: {bookings.filter(b => 
                      b.createdAt.toDateString() === new Date().toDateString()
                    ).length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;