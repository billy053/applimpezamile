import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  Trash2, 
  Save, 
  X, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { useAvailability, AvailabilityDate } from '../hooks/useAvailability';

interface AvailabilityManagerProps {
  onClose?: () => void;
}

const AvailabilityManager: React.FC<AvailabilityManagerProps> = ({ onClose }) => {
  const {
    availabilityDates,
    setDateAvailability,
    setBulkAvailability,
    removeDateAvailability,
    isDateAvailable,
    getUnavailabilityReason,
    setWeeklyPattern,
    setHolidays,
    getAvailabilityStats,
    clearAllAvailability,
  } = useAvailability();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [bulkAvailable, setBulkAvailable] = useState(false);
  const [activeTab, setActiveTab] = useState<'single' | 'bulk' | 'weekly' | 'holidays'>('single');

  const stats = getAvailabilityStats();

  // Feriados nacionais brasileiros para 2024/2025
  const brazilianHolidays = [
    { date: new Date(2024, 0, 1), name: 'Confraternização Universal' },
    { date: new Date(2024, 3, 21), name: 'Tiradentes' },
    { date: new Date(2024, 4, 1), name: 'Dia do Trabalhador' },
    { date: new Date(2024, 8, 7), name: 'Independência do Brasil' },
    { date: new Date(2024, 9, 12), name: 'Nossa Senhora Aparecida' },
    { date: new Date(2024, 10, 2), name: 'Finados' },
    { date: new Date(2024, 10, 15), name: 'Proclamação da República' },
    { date: new Date(2024, 11, 25), name: 'Natal' },
    { date: new Date(2025, 0, 1), name: 'Confraternização Universal' },
    { date: new Date(2025, 3, 21), name: 'Tiradentes' },
    { date: new Date(2025, 4, 1), name: 'Dia do Trabalhador' },
    { date: new Date(2025, 8, 7), name: 'Independência do Brasil' },
    { date: new Date(2025, 9, 12), name: 'Nossa Senhora Aparecida' },
    { date: new Date(2025, 10, 2), name: 'Finados' },
    { date: new Date(2025, 10, 15), name: 'Proclamação da República' },
    { date: new Date(2025, 11, 25), name: 'Natal' },
  ];

  const handleSingleDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const isAvailable = formData.get('available') === 'true';
    const reason = formData.get('reason') as string;

    setDateAvailability(selectedDate, isAvailable, reason || undefined);
    setSelectedDate(null);
    form.reset();
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkStartDate || !bulkEndDate) return;

    const startDate = new Date(bulkStartDate);
    const endDate = new Date(bulkEndDate);
    const dates: Date[] = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    setBulkAvailability(dates, bulkAvailable, bulkReason || undefined);
    
    setBulkStartDate('');
    setBulkEndDate('');
    setBulkReason('');
    setBulkAvailable(false);
  };

  const handleWeeklyPattern = (daysOfWeek: number[], available: boolean, reason: string) => {
    setWeeklyPattern(daysOfWeek, available, reason);
  };

  const handleSetHolidays = () => {
    setHolidays(brazilianHolidays);
  };

  const exportAvailability = () => {
    const csvContent = [
      ['Data', 'Disponível', 'Motivo', 'Criado em', 'Atualizado em'].join(','),
      ...availabilityDates.map(item => [
        item.date.toLocaleDateString('pt-BR'),
        item.isAvailable ? 'Sim' : 'Não',
        `"${item.reason || ''}"`,
        item.createdAt.toLocaleDateString('pt-BR'),
        item.updatedAt.toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `disponibilidade-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sortedAvailability = [...availabilityDates].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <CalendarIcon className="w-6 h-6 text-pink-600 mr-2" />
          <h3 className="text-xl font-semibold text-gray-800">Gerenciar Disponibilidade</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
          <div className="text-sm text-blue-800">Total Configurado</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.available}</div>
          <div className="text-sm text-green-800">Disponíveis</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{stats.unavailable}</div>
          <div className="text-sm text-red-800">Indisponíveis</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'single', label: 'Data Individual', icon: CalendarIcon },
          { id: 'bulk', label: 'Período', icon: Clock },
          { id: 'weekly', label: 'Padrão Semanal', icon: Settings },
          { id: 'holidays', label: 'Feriados', icon: AlertTriangle },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'single' && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Configurar Data Individual</h4>
          <form onSubmit={handleSingleDateSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar Data
              </label>
              <input
                type="date"
                value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
                onChange={(e) => setSelectedDate(e.target.value ? new Date(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidade
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="available"
                    value="true"
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  Disponível
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="available"
                    value="false"
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                  Indisponível
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <input
                type="text"
                name="reason"
                placeholder="Ex: Feriado, Manutenção, Férias..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Configuração
            </button>
          </form>
        </div>
      )}

      {activeTab === 'bulk' && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Configurar Período</h4>
          <form onSubmit={handleBulkSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Inicial
                </label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={(e) => setBulkStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Final
                </label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={(e) => setBulkEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Disponibilidade
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bulkAvailable === true}
                    onChange={() => setBulkAvailable(true)}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <CheckCircle className="w-4 h-4 text-green-600 mr-1" />
                  Disponível
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={bulkAvailable === false}
                    onChange={() => setBulkAvailable(false)}
                    className="mr-2 text-pink-600 focus:ring-pink-500"
                  />
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                  Indisponível
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motivo (opcional)
              </label>
              <input
                type="text"
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                placeholder="Ex: Férias, Reforma, Evento especial..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="flex items-center px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Aplicar ao Período
            </button>
          </form>
        </div>
      )}

      {activeTab === 'weekly' && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Padrão Semanal</h4>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h5 className="font-medium text-blue-800 mb-2">Configurações Rápidas</h5>
              <div className="space-y-2">
                <button
                  onClick={() => handleWeeklyPattern([0], false, 'Não trabalhamos aos domingos')}
                  className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Bloquear todos os domingos
                </button>
                <button
                  onClick={() => handleWeeklyPattern([6], false, 'Não trabalhamos aos sábados')}
                  className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Bloquear todos os sábados
                </button>
                <button
                  onClick={() => handleWeeklyPattern([0, 6], false, 'Não trabalhamos nos fins de semana')}
                  className="w-full text-left px-3 py-2 bg-white border border-blue-200 rounded hover:bg-blue-50 transition-colors"
                >
                  Bloquear fins de semana
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'holidays' && (
        <div>
          <h4 className="font-semibold text-gray-800 mb-4">Feriados Nacionais</h4>
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 text-sm mb-3">
                Clique no botão abaixo para marcar automaticamente todos os feriados nacionais brasileiros como indisponíveis.
              </p>
              <button
                onClick={handleSetHolidays}
                className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Configurar Feriados Nacionais
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">Feriados que serão configurados:</h5>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {brazilianHolidays.slice(0, 8).map((holiday, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{holiday.name}</span>
                    <span className="text-gray-600">{holiday.date.toLocaleDateString('pt-BR')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Configurações */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-gray-800">Configurações Ativas</h4>
          <div className="flex space-x-2">
            <button
              onClick={exportAvailability}
              className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Exportar
            </button>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja limpar todas as configurações?')) {
                  clearAllAvailability();
                }
              }}
              className="flex items-center px-3 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Limpar Tudo
            </button>
          </div>
        </div>

        <div className="max-h-64 overflow-y-auto custom-scrollbar">
          {sortedAvailability.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma configuração de disponibilidade</p>
              <p className="text-sm text-gray-400">Configure datas usando as abas acima</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedAvailability.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                  <div className="flex items-center space-x-3">
                    {item.isAvailable ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium text-gray-800">
                        {item.date.toLocaleDateString('pt-BR')}
                      </div>
                      {item.reason && (
                        <div className="text-sm text-gray-600">{item.reason}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.isAvailable 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {item.isAvailable ? 'Disponível' : 'Indisponível'}
                    </span>
                    <button
                      onClick={() => removeDateAvailability(item.date)}
                      className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityManager;