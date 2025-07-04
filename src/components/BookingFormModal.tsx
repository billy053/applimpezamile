import React, { useState } from 'react';
import { X, User, Phone, Mail, MapPin, Calendar, FileText, Save } from 'lucide-react';

interface BookingFormModalProps {
  onClose: () => void;
  onSubmit: (bookingData: any) => void;
}

const BookingFormModal: React.FC<BookingFormModalProps> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    clientAddress: '',
    serviceId: 'residencial',
    bookingDate: '',
    notes: '',
    priority: 'normal'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const services = [
    { id: 'residencial', title: 'Limpeza Residencial', price: 'R$ 120' },
    { id: 'comercial', title: 'Limpeza Comercial', price: 'R$ 180' },
    { id: 'predial', title: 'Limpeza Predial', price: 'R$ 250' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Nome é obrigatório';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Telefone é obrigatório';
    } else if (formData.clientPhone.replace(/\D/g, '').length < 10) {
      newErrors.clientPhone = 'Telefone deve ter pelo menos 10 dígitos';
    }

    if (!formData.clientAddress.trim()) {
      newErrors.clientAddress = 'Endereço é obrigatório';
    }

    if (!formData.bookingDate) {
      newErrors.bookingDate = 'Data é obrigatória';
    } else {
      const selectedDate = new Date(formData.bookingDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.bookingDate = 'Data não pode ser no passado';
      }
    }

    if (formData.clientEmail && !/\S+@\S+\.\S+/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'E-mail inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      clientName: formData.clientName,
      clientEmail: formData.clientEmail || null,
      clientPhone: formData.clientPhone,
      clientAddress: formData.clientAddress,
      serviceId: formData.serviceId,
      bookingDate: formData.bookingDate,
      notes: formData.notes || null
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const selectedService = services.find(s => s.id === formData.serviceId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Novo Agendamento</h2>
              <p className="text-pink-100 text-sm">Preencha os dados para criar um agendamento</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-pink-400 hover:bg-pink-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] custom-scrollbar">
          {/* Informações do Cliente */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Informações do Cliente
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={(e) => handleChange('clientName', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.clientName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Nome do cliente"
                />
                {errors.clientName && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone/WhatsApp *
                </label>
                <input
                  type="tel"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange('clientPhone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.clientPhone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                />
                {errors.clientPhone && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientPhone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange('clientEmail', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.clientEmail ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="cliente@email.com"
                />
                {errors.clientEmail && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientEmail}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  value={formData.clientAddress}
                  onChange={(e) => handleChange('clientAddress', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.clientAddress ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Rua, número, bairro, cidade"
                />
                {errors.clientAddress && (
                  <p className="text-red-600 text-sm mt-1">{errors.clientAddress}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Serviço */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Informações do Serviço
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Serviço *
                </label>
                <select
                  value={formData.serviceId}
                  onChange={(e) => handleChange('serviceId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  {services.map(service => (
                    <option key={service.id} value={service.id}>
                      {service.title} - {service.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data do Agendamento *
                </label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => handleChange('bookingDate', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                    errors.bookingDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.bookingDate && (
                  <p className="text-red-600 text-sm mt-1">{errors.bookingDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prioridade
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="low">Baixa</option>
                  <option value="normal">Normal</option>
                  <option value="high">Alta</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 inline mr-1" />
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              placeholder="Informações adicionais sobre o serviço..."
            />
          </div>

          {/* Resumo */}
          {selectedService && formData.bookingDate && (
            <div className="mb-6 p-4 bg-pink-50 border border-pink-200 rounded-lg">
              <h4 className="font-semibold text-pink-800 mb-2">Resumo do Agendamento</h4>
              <div className="text-sm text-pink-700 space-y-1">
                <p><strong>Serviço:</strong> {selectedService.title}</p>
                <p><strong>Valor:</strong> {selectedService.price}</p>
                <p><strong>Data:</strong> {new Date(formData.bookingDate).toLocaleDateString('pt-BR')}</p>
                {formData.clientName && <p><strong>Cliente:</strong> {formData.clientName}</p>}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
            >
              <Save className="w-4 h-4 mr-2" />
              Criar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingFormModal;