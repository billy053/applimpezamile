import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Users, 
  Filter, 
  Search, 
  Download, 
  RefreshCw, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Phone,
  MapPin,
  FileText,
  BarChart3,
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';
import { useSupabaseBookings } from '../hooks/useSupabaseBookings';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import BookingDetailsModal from './BookingDetailsModal';
import BookingFormModal from './BookingFormModal';
import BookingFilters from './BookingFilters';
import BookingStats from './BookingStats';

interface BookingManagementSystemProps {
  onClose?: () => void;
}

const BookingManagementSystem: React.FC<BookingManagementSystemProps> = ({ onClose }) => {
  const { user, isAuthenticated } = useSupabaseAuth();
  const {
    bookings,
    stats,
    loading,
    error,
    loadBookings,
    updateBookingStatus,
    createBooking,
    getBookedDates,
    getPendingDates,
    refresh
  } = useSupabaseBookings();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'bookings' | 'analytics'>('dashboard');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetails, setShowBookingDetails] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    clientSearch: '',
    serviceFilter: '',
    priorityFilter: '',
    assignedToFilter: ''
  });

  // Carregar dados iniciais
  useEffect(() => {
    if (isAuthenticated) {
      loadBookings(filters);
    }
  }, [isAuthenticated, filters, loadBookings]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      await updateBookingStatus(bookingId, newStatus as any);
      // Dados serão atualizados automaticamente via realtime
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do agendamento');
    }
  };

  const handleBookingCreate = async (bookingData: any) => {
    try {
      await createBooking(bookingData);
      setShowBookingForm(false);
      // Dados serão atualizados automaticamente via realtime
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao criar agendamento');
    }
  };

  const handleExportData = () => {
    const csvContent = [
      ['Data', 'Cliente', 'Telefone', 'Serviço', 'Status', 'Valor', 'Criado em'].join(','),
      ...bookings.map(booking => [
        booking.booking_date,
        booking.client_name,
        booking.client_phone,
        booking.service_title,
        booking.booking_status,
        booking.service_price,
        new Date(booking.booking_created_at).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `agendamentos-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      confirmed: { icon: CheckCircle, color: 'bg-green-100 text-green-800', label: 'Confirmado' },
      cancelled: { icon: XCircle, color: 'bg-red-100 text-red-800', label: 'Cancelado' },
      completed: { icon: CheckCircle, color: 'bg-blue-100 text-blue-800', label: 'Concluído' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: { color: 'bg-gray-100 text-gray-800', label: 'Baixa' },
      normal: { color: 'bg-blue-100 text-blue-800', label: 'Normal' },
      high: { color: 'bg-orange-100 text-orange-800', label: 'Alta' },
      urgent: { color: 'bg-red-100 text-red-800', label: 'Urgente' }
    };

    const config = priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.normal;

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Acesso Restrito</h3>
          <p className="text-gray-600">Você precisa estar logado para acessar o sistema de agendamentos.</p>
        </div>
      </div>
    );
  }

  if (loading && bookings.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-pink-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Carregando sistema de agendamentos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Erro ao Carregar</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Sistema de Agendamentos</h2>
            <p className="text-pink-100">Gerencie todos os agendamentos em tempo real</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className={`p-2 rounded-full transition-colors ${
                isRefreshing 
                  ? 'bg-pink-400 cursor-not-allowed' 
                  : 'bg-pink-400 hover:bg-pink-300'
              }`}
            >
              <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-pink-400 hover:bg-pink-300 transition-colors"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mt-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'bookings', label: 'Agendamentos', icon: Calendar },
            { id: 'analytics', label: 'Relatórios', icon: TrendingUp }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-pink-600'
                  : 'text-pink-100 hover:bg-pink-400'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <BookingStats stats={stats} />
            
            {/* Ações Rápidas */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setShowBookingForm(true)}
                className="flex items-center justify-center p-4 bg-pink-50 border-2 border-dashed border-pink-300 rounded-lg hover:bg-pink-100 transition-colors"
              >
                <Plus className="w-6 h-6 text-pink-600 mr-2" />
                <span className="font-medium text-pink-600">Novo Agendamento</span>
              </button>
              
              <button
                onClick={() => setActiveTab('bookings')}
                className="flex items-center justify-center p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Calendar className="w-6 h-6 text-blue-600 mr-2" />
                <span className="font-medium text-blue-600">Ver Agendamentos</span>
              </button>
              
              <button
                onClick={handleExportData}
                className="flex items-center justify-center p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg hover:bg-green-100 transition-colors"
              >
                <Download className="w-6 h-6 text-green-600 mr-2" />
                <span className="font-medium text-green-600">Exportar Dados</span>
              </button>
            </div>

            {/* Agendamentos Recentes */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Agendamentos Recentes</h3>
              <div className="space-y-3">
                {bookings.slice(0, 5).map((booking) => (
                  <div key={booking.booking_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">{booking.client_name}</h4>
                        <p className="text-sm text-gray-600">{booking.service_title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                      </p>
                      {getStatusBadge(booking.booking_status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            {/* Controles */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Agendamentos ({bookings.length})
                </h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    showFilters 
                      ? 'bg-pink-100 text-pink-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtros
                </button>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowBookingForm(true)}
                  className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Agendamento
                </button>
                <button
                  onClick={handleExportData}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </button>
              </div>
            </div>

            {/* Filtros */}
            {showFilters && (
              <BookingFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setShowFilters(false)}
              />
            )}

            {/* Lista de Agendamentos */}
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-600 mb-2">Nenhum agendamento encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {Object.values(filters).some(f => f) 
                      ? 'Tente ajustar os filtros para ver mais resultados'
                      : 'Comece criando um novo agendamento'
                    }
                  </p>
                  <button
                    onClick={() => setShowBookingForm(true)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    Criar Primeiro Agendamento
                  </button>
                </div>
              ) : (
                bookings.map((booking) => (
                  <div key={booking.booking_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-pink-600" />
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{booking.client_name}</h4>
                          <p className="text-gray-600">{booking.service_title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            {getStatusBadge(booking.booking_status)}
                            {getPriorityBadge(booking.booking_priority)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-800">
                          {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-sm text-gray-600">
                          Criado em {new Date(booking.booking_created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        {booking.client_phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {booking.client_address}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        {booking.service_price}
                      </div>
                    </div>

                    {booking.booking_notes && (
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start">
                          <FileText className="w-4 h-4 text-gray-500 mr-2 mt-0.5" />
                          <p className="text-sm text-gray-700">{booking.booking_notes}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {booking.booking_status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.booking_id, 'confirmed')}
                              className="flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirmar
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(booking.booking_id, 'cancelled')}
                              className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancelar
                            </button>
                          </>
                        )}
                        
                        {booking.booking_status === 'confirmed' && (
                          <button
                            onClick={() => handleStatusUpdate(booking.booking_id, 'completed')}
                            className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Marcar como Concluído
                          </button>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedBooking(booking);
                            setShowBookingDetails(true);
                          }}
                          className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Detalhes
                        </button>
                        
                        <a
                          href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                        >
                          <Phone className="w-4 h-4 mr-1" />
                          WhatsApp
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-6">Relatórios e Análises</h3>
            
            {/* Estatísticas Avançadas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Receita do Mês</p>
                    <p className="text-2xl font-bold">
                      R$ {stats?.revenue_this_month?.toLocaleString('pt-BR') || '0'}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm">Ticket Médio</p>
                    <p className="text-2xl font-bold">
                      R$ {stats?.avg_booking_value?.toFixed(2) || '0'}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-green-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm">Serviço Mais Popular</p>
                    <p className="text-lg font-bold truncate">
                      {stats?.most_popular_service || 'N/A'}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-200" />
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm">Dia Mais Movimentado</p>
                    <p className="text-lg font-bold">
                      {stats?.busiest_day_of_week?.trim() || 'N/A'}
                    </p>
                  </div>
                  <Calendar className="w-8 h-8 text-orange-200" />
                </div>
              </div>
            </div>

            {/* Ações de Relatório */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-800 mb-4">Exportar Relatórios</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <Download className="w-5 h-5 text-gray-600 mr-2" />
                  <span className="font-medium text-gray-700">Todos os Agendamentos</span>
                </button>
                
                <button
                  onClick={() => {
                    setFilters({ ...filters, status: 'completed' });
                    setTimeout(handleExportData, 100);
                  }}
                  className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="font-medium text-gray-700">Agendamentos Concluídos</span>
                </button>
                
                <button
                  onClick={() => {
                    const thisMonth = new Date();
                    const firstDay = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
                    setFilters({ 
                      ...filters, 
                      dateFrom: firstDay.toISOString().split('T')[0],
                      dateTo: new Date().toISOString().split('T')[0]
                    });
                    setTimeout(handleExportData, 100);
                  }}
                  className="flex items-center justify-center p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                >
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="font-medium text-gray-700">Relatório Mensal</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBookingDetails && selectedBooking && (
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => {
            setShowBookingDetails(false);
            setSelectedBooking(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}

      {showBookingForm && (
        <BookingFormModal
          onClose={() => setShowBookingForm(false)}
          onSubmit={handleBookingCreate}
        />
      )}
    </div>
  );
};

export default BookingManagementSystem;