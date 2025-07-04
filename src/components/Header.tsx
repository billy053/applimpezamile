import React from 'react';
import { Sparkles, Clock, Shield } from 'lucide-react';

const Header = () => {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <Sparkles className="w-8 h-8 mr-3 text-blue-200" />
          <h1 className="text-3xl font-bold">CleanPro</h1>
        </div>
        <p className="text-center text-blue-100 text-lg max-w-2xl mx-auto">
          Serviços de limpeza profissional com agendamento flexível
        </p>
        <div className="flex justify-center space-x-8 mt-6">
          <div className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-blue-200" />
            <span className="text-sm">Horário Flexível</span>
          </div>
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2 text-blue-200" />
            <span className="text-sm">Profissionais Qualificados</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;