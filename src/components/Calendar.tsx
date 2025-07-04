import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  bookedDates: Date[];
  pendingDates?: Date[];
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateSelect, bookedDates, pendingDates = [] }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(bookedDate => 
      bookedDate.toDateString() === date.toDateString()
    );
  };

  const isDatePending = (date: Date) => {
    return pendingDates.some(pendingDate => 
      pendingDate.toDateString() === date.toDateString()
    );
  };

  const isDateSelected = (date: Date) => {
    return selectedDate && selectedDate.toDateString() === date.toDateString();
  };

  const isDateAvailable = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Data disponível se for futura e NÃO estiver confirmada (pendente ainda pode ser selecionada)
    return date >= today && !isDateBooked(date);
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(currentMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };

  const days = getDaysInMonth(currentMonth);

  // Count available, booked and pending dates for current month
  const currentMonthDays = days.filter(day => day !== null) as Date[];
  const availableDays = currentMonthDays.filter(date => isDateAvailable(date) && !isDatePending(date)).length;
  const bookedDays = currentMonthDays.filter(date => isDateBooked(date)).length;
  const pendingDays = currentMonthDays.filter(date => isDatePending(date)).length;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Calendar Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-xl font-semibold">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </h2>
          </div>
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        
        {/* Monthly Stats */}
        <div className="flex justify-center space-x-6 text-sm">
          <div className="flex items-center">
            <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
            <span>{availableDays} disponíveis</span>
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2 text-yellow-300" />
            <span>{pendingDays} pendentes</span>
          </div>
          <div className="flex items-center">
            <XCircle className="w-4 h-4 mr-2 text-red-300" />
            <span>{bookedDays} confirmados</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={index} className="h-12"></div>;
            }

            const isAvailable = isDateAvailable(date);
            const isBooked = isDateBooked(date);
            const isPending = isDatePending(date);
            const isSelected = isDateSelected(date);
            const isPast = isPastDate(date);

            return (
              <button
                key={index}
                onClick={() => isAvailable && onDateSelect(date)}
                disabled={!isAvailable}
                className={`h-12 w-full rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-blue-500 text-white shadow-md transform scale-105'
                    : isBooked
                    ? 'bg-red-100 text-red-600 cursor-not-allowed border border-red-200'
                    : isPending
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border border-yellow-200'
                    : isAvailable
                    ? 'bg-green-50 text-green-700 hover:bg-green-100 hover:shadow-sm border border-green-200 hover:border-green-300'
                    : isPast
                    ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {date.getDate()}
                {isBooked && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>
                )}
                {isPending && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                )}
                {isSelected && (
                  <div className="absolute top-1 right-1">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CalendarIcon className="w-4 h-4 mr-2" />
            Legenda
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-100 border border-green-200 rounded mr-2"></div>
              <span className="text-gray-600">Disponível</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 border border-yellow-200 rounded mr-2 relative">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">Aguardando confirmação</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 border border-red-200 rounded mr-2 relative">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
              </div>
              <span className="text-gray-600">Confirmado</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2 relative">
                <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-white rounded-full"></div>
              </div>
              <span className="text-gray-600">Selecionado</span>
            </div>
          </div>
        </div>

        {/* Information Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Clock className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Como funciona o agendamento:</p>
              <ul className="text-xs space-y-1 text-blue-700">
                <li>• Datas em <span className="font-medium text-yellow-700">amarelo</span> foram solicitadas via WhatsApp</li>
                <li>• Datas em <span className="font-medium text-red-700">vermelho</span> foram confirmadas e estão ocupadas</li>
                <li>• Você ainda pode selecionar datas pendentes se não forem confirmadas</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;