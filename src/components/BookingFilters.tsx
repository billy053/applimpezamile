import React from 'react';
import { X, Filter, Calendar, User, Briefcase, AlertTriangle } from 'lucide-react';

interface BookingFiltersProps {
  filters: {
    status: string;
    dateFrom: string;
    dateTo: string;
    clientSearch: string;
    serviceFilter: string;
    priorityFilter: string;
    assignedToFilter: string;
  };
  onFiltersChange: (filters: any) => void;
  onClose: () => void;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({ filters, onFiltersChange, onClose }) => {
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      status: '',
      dateFrom: '',
      dateTo: '',
      clientSearch: '',
      serviceFilter: '',
      priorityFilter: '',
      assignedToFilter: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(filter => filter !== '');

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Filter className="w-5 h-5 text-gray-600 mr-2" />
          <h4 className="font-semibold text-gray-800">Filtros de Busca</h4>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-1 bg-pink-100 text-pink-700 text-xs rounded-full">
              Filtros ativos
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpar filtros
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Todos os status</option>
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="cancelled">Cancelado</option>
            <option value="completed">Concluído</option>
          </select>
        </div>

        {/* Prioridade */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prioridade
          </label>
          <select
            value={filters.priorityFilter}
            onChange={(e) => handleFilterChange('priorityFilter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Todas as prioridades</option>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {/* Data Inicial */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Inicial
          </label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Data Final */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Data Final
          </label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Busca por Cliente */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="w-4 h-4 inline mr-1" />
            Buscar Cliente
          </label>
          <input
            type="text"
            value={filters.clientSearch}
            onChange={(e) => handleFilterChange('clientSearch', e.target.value)}
            placeholder="Nome ou telefone do cliente..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>

        {/* Serviço */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Briefcase className="w-4 h-4 inline mr-1" />
            Serviço
          </label>
          <select
            value={filters.serviceFilter}
            onChange={(e) => handleFilterChange('serviceFilter', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            <option value="">Todos os serviços</option>
            <option value="residencial">Limpeza Residencial</option>
            <option value="comercial">Limpeza Comercial</option>
            <option value="predial">Limpeza Predial</option>
          </select>
        </div>
      </div>

      {/* Filtros Rápidos */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Filtros Rápidos:</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleFilterChange('status', 'pending')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => {
              const today = new Date().toISOString().split('T')[0];
              handleFilterChange('dateFrom', today);
              handleFilterChange('dateTo', today);
            }}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.dateFrom === new Date().toISOString().split('T')[0] && 
              filters.dateTo === new Date().toISOString().split('T')[0]
                ? 'bg-blue-100 text-blue-800 border border-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Hoje
          </button>
          <button
            onClick={() => {
              const today = new Date();
              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
              const weekEnd = new Date(today.setDate(today.getDate() - today.getDay() + 6));
              handleFilterChange('dateFrom', weekStart.toISOString().split('T')[0]);
              handleFilterChange('dateTo', weekEnd.toISOString().split('T')[0]);
            }}
            className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            Esta Semana
          </button>
          <button
            onClick={() => handleFilterChange('priorityFilter', 'urgent')}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              filters.priorityFilter === 'urgent'
                ? 'bg-red-100 text-red-800 border border-red-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Urgentes
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingFilters;