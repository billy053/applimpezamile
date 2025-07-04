import React from 'react';
import { X, Home, Briefcase, Building } from 'lucide-react';

interface Service {
  id: string;
  icon: React.ComponentType<any>;
  title: string;
  description: string;
  price: string;
  duration: string;
}

interface ServiceSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onServiceSelect: (serviceId: string) => void;
  services: Service[];
}

const ServiceSelectionModal: React.FC<ServiceSelectionModalProps> = ({
  isOpen,
  onClose,
  onServiceSelect,
  services
}) => {
  if (!isOpen) return null;

  const handleServiceSelect = (serviceId: string) => {
    onServiceSelect(serviceId);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Escolha seu Serviço</h2>
              <p className="text-pink-100">Selecione o tipo de limpeza que você precisa</p>
            </div>
            <button
              onClick={onClose}
              className="text-pink-100 hover:text-white p-2 hover:bg-pink-400 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Services Grid */}
        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <div
                  key={service.id}
                  onClick={() => handleServiceSelect(service.id)}
                  className="group p-6 rounded-lg border-2 border-gray-200 cursor-pointer transition-all duration-200 hover:border-pink-500 hover:shadow-lg hover:scale-105"
                >
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-pink-100 rounded-full flex items-center justify-center group-hover:bg-pink-500 transition-colors">
                      <IconComponent className="w-8 h-8 text-pink-600 group-hover:text-white" />
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-pink-600">
                      {service.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {service.description}
                    </p>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-pink-600">
                        {service.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        Duração: {service.duration}
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="bg-pink-600 text-white py-2 px-4 rounded-lg font-semibold group-hover:bg-pink-700 transition-colors">
                        Selecionar Serviço
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Additional Info */}
          <div className="mt-8 bg-pink-50 border border-pink-200 rounded-lg p-4">
            <div className="text-center">
              <h4 className="font-semibold text-pink-800 mb-2">Por que escolher a CleanPro?</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-pink-700">
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Profissionais qualificados
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Produtos de qualidade
                </div>
                <div className="flex items-center justify-center">
                  <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
                  Agendamento flexível
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceSelectionModal;