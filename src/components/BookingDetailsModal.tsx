import React, { useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Edit,
  Save,
  AlertTriangle
} from 'lucide-react';

interface BookingDetailsModalProps {
  booking: any;
  onClose: () => void;
  onStatusUpdate: (bookingId: string, status: string) => void;
}

const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({ 
  booking, 
  onClose, 
  onStatusUpdate 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedNotes, setEditedNotes] = useState(booking.booking_notes || '');
  const [editedPriority, setEditedPriority] = useState(booking.booking_priority || 'normal');

  const handleSaveChanges = () => {
    // Aqui você implementaria a atualização dos dados
    // Por enquanto, apenas fechamos o modo de edição
    setIsEditing(false);
    // TODO: Implementar atualização via API
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100',
      completed: 'text-blue-600 bg-blue-100'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      pending: 'Pendente',
      confirmed: 'Confirmado',
      cancelled: 'Cancelado',
      completed: 'Concluído'
    };
    return labels[status as keyof typeof labels] || 'Desconhecido';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      normal: 'text-blue-600 bg-blue-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const getPriorityLabel = (priority: string) => {
    const labels = {
      low: 'Baixa',
      normal: 'Normal',
      high: 'Alta',
      urgent: 'Urgente'
    };
    return labels[priority as keyof typeof labels] || 'Normal';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Detalhes do Agendamento</h2>
              <p className="text-pink-100 text-sm">
                ID: #{booking.booking_id.slice(-8)}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="p-2 rounded-full bg-pink-400 hover:bg-pink-300 transition-colors"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-pink-400 hover:bg-pink-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Status e Prioridade */}
          <div className="flex items-center space-x-4 mb-6">
            <div className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.booking_status)}`}>
              {getStatusLabel(booking.booking_status)}
            </div>
            {isEditing ? (
              <select
                value={editedPriority}
                onChange={(e) => setEditedPriority(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="low">Baixa Prioridade</option>
                <option value="normal">Prioridade Normal</option>
                <option value="high">Alta Prioridade</option>
                <option value="urgent">Urgente</option>
              </select>
            ) : (
              <div className={`px-3 py-2 rounded-full text-sm font-medium ${getPriorityColor(booking.booking_priority)}`}>
                {getPriorityLabel(booking.booking_priority)}
              </div>
            )}
          </div>

          {/* Informações do Cliente */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Nome</label>
                <p className="text-gray-800">{booking.client_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Telefone</label>
                <div className="flex items-center space-x-2">
                  <p className="text-gray-800">{booking.client_phone}</p>
                  <a
                    href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:text-green-800"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                </div>
              </div>
              {booking.client_email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">E-mail</label>
                  <div className="flex items-center space-x-2">
                    <p className="text-gray-800">{booking.client_email}</p>
                    <a
                      href={`mailto:${booking.client_email}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Mail className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-600">Endereço</label>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <p className="text-gray-800">{booking.client_address}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Informações do Serviço */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Informações do Serviço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Serviço</label>
                <p className="text-gray-800 font-medium">{booking.service_title}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Valor</label>
                <p className="text-gray-800 font-medium">{booking.service_price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Data do Agendamento</label>
                <p className="text-gray-800">
                  {new Date(booking.booking_date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Duração Estimada</label>
                <p className="text-gray-800">{booking.service_duration}</p>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="bg-yellow-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Observações
            </h3>
            {isEditing ? (
              <textarea
                value={editedNotes}
                onChange={(e) => setEditedNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                placeholder="Adicione observações sobre o agendamento..."
              />
            ) : (
              <p className="text-gray-700">
                {booking.booking_notes || 'Nenhuma observação adicionada.'}
              </p>
            )}
          </div>

          {/* Histórico */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Histórico
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Criado em:</span>
                <span className="text-gray-800">
                  {new Date(booking.booking_created_at).toLocaleString('pt-BR')}
                </span>
              </div>
              {booking.booking_confirmed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmado em:</span>
                  <span className="text-gray-800">
                    {new Date(booking.booking_confirmed_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              {booking.booking_cancelled_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Cancelado em:</span>
                  <span className="text-gray-800">
                    {new Date(booking.booking_cancelled_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
              {booking.booking_completed_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Concluído em:</span>
                  <span className="text-gray-800">
                    {new Date(booking.booking_completed_at).toLocaleString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </>
            ) : (
              <>
                {booking.booking_status === 'pending' && (
                  <>
                    <button
                      onClick={() => onStatusUpdate(booking.booking_id, 'confirmed')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Confirmar
                    </button>
                    <button
                      onClick={() => onStatusUpdate(booking.booking_id, 'cancelled')}
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancelar
                    </button>
                  </>
                )}
                
                {booking.booking_status === 'confirmed' && (
                  <button
                    onClick={() => onStatusUpdate(booking.booking_id, 'completed')}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar como Concluído
                  </button>
                )}

                <a
                  href={`https://wa.me/${booking.client_phone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Contatar Cliente
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetailsModal;