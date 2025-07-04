import React, { useState } from 'react';
import { Shield, CheckCircle, XCircle, Clock, Phone, Calendar, User, MapPin, MessageCircle, RefreshCw, History, Filter, Search, Download } from 'lucide-react';
import { Booking } from '../hooks/useBookings';
import SliderManager from './SliderManager';
import AvailabilityManager from './AvailabilityManager';
import { useSliderImages } from '../hooks/useSliderImages';

interface AdminPanelProps {
  bookings: Booking[];
  sliderImages: ReturnType<typeof useSliderImages>;
  onConfirmBooking: (id: string) => void;
  onCancelBooking: (id: string) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ bookings, sliderImages, onConfirmBooking, onCancelBooking }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'history' | 'slider' | 'availability'>('pending');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

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
  
  // Filtrar histórico baseado nos filtros selecionados
  const getFilteredHistory = () => {
    let filtered = bookings;

    // Filtro por status
    if (historyFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === historyFilter);
    }

    // Filtro por termo de busca (nome, telefone, endereço)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.clientName.toLowerCase().includes(term) ||
        booking.clientPhone.includes(term) ||
        booking.clientAddress.toLowerCase().includes(term) ||
        booking.serviceName.toLowerCase().includes(term)
      );
    }

    // Filtro por data
    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter(booking => 
        booking.date.toDateString() === filterDate.toDateString()
      );
    }

    // Ordenar por data de criação (mais recente primeiro)
    return filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const exportHistory = () => {
    const history = getFilteredHistory();
    const csvContent = [
      ['Data Criação', 'Data Serviço', 'Cliente', 'Telefone', 'Serviço', 'Status', 'Endereço', 'Observações'].join(','),
      ...history.map(booking => [
        booking.createdAt.toLocaleDateString('pt-BR'),
        booking.date.toLocaleDateString('pt-BR'),
        booking.clientName,
        booking.clientPhone,
        booking.serviceName,
        booking.status === 'confirmed' ? 'Confirmado' : booking.status === 'cancelled' ? 'Cancelado' : 'Pendente',
        `"${booking.clientAddress}"`,
        `"${booking.notes || ''}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historico-agendamentos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Confirmado
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pendente
          </span>
        );
    }
  };

  const getBookingStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    return { total, confirmed, pending, cancelled };
  };

  const stats = getBookingStats();
  const filteredHistory = getFilteredHistory();

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
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
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
              setActiveTab('pending');
              setSearchTerm('');
              setDateFilter('');
              setHistoryFilter('all');
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
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-pink-600">{stats.total}</div>
                  <div className="text-sm text-pink-800">Total</div>
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                  <div className="text-sm text-yellow-800">Pendentes</div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
                  <div className="text-sm text-green-800">Confirmados</div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
                  <div className="text-sm text-red-800">Cancelados</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'pending'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Solicitações Pendentes ({pendingBookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'history'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <History className="w-4 h-4 mr-2" />
                  Histórico Completo ({bookings.length})
                </button>
                <button
                  onClick={() => setActiveTab('slider')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'slider'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Slides ({sliderImages.images.length})
                </button>
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'availability'
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Disponibilidade
                </button>
              </div>

              {/* Conteúdo das Tabs */}
              {activeTab === 'pending' ? (
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
                            : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
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
                                <Calendar className="w-4 h-4 text-pink-600 mr-2" />
                                <span className="font-medium">Data:</span>
                                <span className="ml-1">{booking.date.toLocaleDateString('pt-BR')}</span>
                              </div>
                              
                              <div className="flex items-center text-sm">
                                <User className="w-4 h-4 text-pink-600 mr-2" />
                                <span className="font-medium">Cliente:</span>
                                <span className="ml-1">{booking.clientName}</span>
                              </div>
                              
                              <div className="flex items-center text-sm">
                                <Phone className="w-4 h-4 text-pink-600 mr-2" />
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
                                <MapPin className="w-4 h-4 text-pink-600 mr-2 mt-0.5" />
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
                </div>
              ) : activeTab === 'history' ? (
                <div>
                  {/* Filtros do Histórico */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center">
                        <Filter className="w-4 h-4 mr-2 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700 mr-2">Filtros:</span>
                      </div>
                      
                      <select
                        value={historyFilter}
                        onChange={(e) => setHistoryFilter(e.target.value as any)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="all">Todos os status</option>
                        <option value="confirmed">Confirmados</option>
                        <option value="cancelled">Cancelados</option>
                        <option value="pending">Pendentes</option>
                      </select>

                      <div className="flex items-center">
                        <Search className="w-4 h-4 mr-2 text-gray-600" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, telefone..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="px-3 py-1 border border-gray-300 rounded text-sm w-48"
                        />
                      </div>

                      <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      />

                      <button
                        onClick={() => {
                          setHistoryFilter('all');
                          setSearchTerm('');
                          setDateFilter('');
                        }}
                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300"
                      >
                        Limpar
                      </button>

                      <button
                        onClick={exportHistory}
                        className="flex items-center px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Exportar CSV
                      </button>
                    </div>
                  </div>

                  {/* Lista do Histórico */}
                  <div className="space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
                    {filteredHistory.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p className="mb-2">Nenhum agendamento encontrado</p>
                        <p className="text-sm text-gray-400">
                          Ajuste os filtros para ver mais resultados
                        </p>
                      </div>
                    ) : (
                      filteredHistory.map((booking) => (
                        <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <span className="font-medium text-gray-800">
                                #{booking.id.slice(-6)}
                              </span>
                              {getStatusBadge(booking.status)}
                            </div>
                            <div className="text-right text-xs text-gray-500">
                              <div>Criado: {booking.createdAt.toLocaleString('pt-BR')}</div>
                              {booking.confirmedAt && (
                                <div>Confirmado: {booking.confirmedAt.toLocaleString('pt-BR')}</div>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <span className="font-medium text-gray-600">Data:</span>
                              <div>{booking.date.toLocaleDateString('pt-BR')}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Cliente:</span>
                              <div>{booking.clientName}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Telefone:</span>
                              <div>{booking.clientPhone}</div>
                            </div>
                            <div>
                              <span className="font-medium text-gray-600">Serviço:</span>
                              <div>{booking.serviceName}</div>
                            </div>
                          </div>

                          <div className="mt-2 text-sm">
                            <span className="font-medium text-gray-600">Endereço:</span>
                            <div className="text-gray-700">{booking.clientAddress}</div>
                          </div>

                          {booking.notes && (
                            <div className="mt-2 text-sm">
                              <span className="font-medium text-gray-600">Observações:</span>
                              <div className="text-gray-700">{booking.notes}</div>
                            </div>
                          )}

                          <div className="mt-3 flex justify-end">
                            <a
                              href={`https://wa.me/${booking.clientPhone.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                            >
                              <Phone className="w-3 h-3 mr-1" />
                              Contatar
                            </a>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Informações do Histórico */}
                  <div className="mt-4 text-sm text-gray-600 text-center">
                    Mostrando {filteredHistory.length} de {bookings.length} agendamentos
                  </div>
                </div>
              ) : activeTab === 'slider' ? (
                <SliderManager
                  images={sliderImages.images}
                  onAddImage={sliderImages.addImage}
                  onUpdateImage={sliderImages.updateImage}
                  onDeleteImage={sliderImages.deleteImage}
                  onReorderImage={sliderImages.reorderImages}
                  onToggleActive={sliderImages.toggleImageActive}
                />
              ) : activeTab === 'availability' ? (
                <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
                  <AvailabilityManager 
                    bookings={bookings}
                    onRemoveBooking={onCancelBooking}
                  />
                </div>
              ) : null}

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