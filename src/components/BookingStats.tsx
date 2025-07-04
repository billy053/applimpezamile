import React from 'react';
import { 
  Calendar, 
  Users, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp,
  DollarSign,
  Target
} from 'lucide-react';

interface BookingStatsProps {
  stats: any;
}

const BookingStats: React.FC<BookingStatsProps> = ({ stats }) => {
  if (!stats) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total de Agendamentos',
      value: stats.total_bookings || 0,
      icon: Calendar,
      color: 'bg-blue-50 border-blue-200 text-blue-600',
      iconColor: 'text-blue-600'
    },
    {
      title: 'Pendentes',
      value: stats.pending_bookings || 0,
      icon: Clock,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-600',
      iconColor: 'text-yellow-600'
    },
    {
      title: 'Confirmados',
      value: stats.confirmed_bookings || 0,
      icon: CheckCircle,
      color: 'bg-green-50 border-green-200 text-green-600',
      iconColor: 'text-green-600'
    },
    {
      title: 'Cancelados',
      value: stats.cancelled_bookings || 0,
      icon: XCircle,
      color: 'bg-red-50 border-red-200 text-red-600',
      iconColor: 'text-red-600'
    },
    {
      title: 'Total de Clientes',
      value: stats.total_clients || 0,
      icon: Users,
      color: 'bg-purple-50 border-purple-200 text-purple-600',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Hoje',
      value: stats.bookings_today || 0,
      icon: TrendingUp,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-600',
      iconColor: 'text-indigo-600'
    },
    {
      title: 'Esta Semana',
      value: stats.bookings_this_week || 0,
      icon: Calendar,
      color: 'bg-pink-50 border-pink-200 text-pink-600',
      iconColor: 'text-pink-600'
    },
    {
      title: 'Este Mês',
      value: stats.bookings_this_month || 0,
      icon: Target,
      color: 'bg-orange-50 border-orange-200 text-orange-600',
      iconColor: 'text-orange-600'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Estatísticas Gerais</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`border rounded-lg p-4 ${stat.color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium opacity-75">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.iconColor} opacity-75`} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Estatísticas Avançadas */}
      {stats.revenue_this_month !== undefined && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Receita do Mês</p>
                <p className="text-xl font-bold">
                  R$ {(stats.revenue_this_month || 0).toLocaleString('pt-BR')}
                </p>
              </div>
              <DollarSign className="w-6 h-6 text-green-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Ticket Médio</p>
                <p className="text-xl font-bold">
                  R$ {(stats.avg_booking_value || 0).toFixed(2)}
                </p>
              </div>
              <Target className="w-6 h-6 text-blue-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Taxa de Conversão</p>
                <p className="text-xl font-bold">
                  {stats.total_bookings > 0 
                    ? ((stats.confirmed_bookings / stats.total_bookings) * 100).toFixed(1)
                    : '0'
                  }%
                </p>
              </div>
              <TrendingUp className="w-6 h-6 text-purple-200" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingStats;