import React, { useState, useEffect } from 'react';
import { Database, Wifi, WifiOff, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface DatabaseStatusProps {
  className?: string;
}

const DatabaseStatus: React.FC<DatabaseStatusProps> = ({ className = '' }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('key')
        .limit(1);

      if (error) throw error;

      setIsConnected(true);
      setLastSync(new Date());
    } catch (error) {
      console.error('Erro de conexão com o banco:', error);
      setIsConnected(false);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConnection();
    
    // Verificar conexão a cada 30 segundos
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (isConnected === null || isChecking) return 'text-gray-500';
    return isConnected ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="w-4 h-4 animate-spin" />;
    }
    
    if (isConnected === null) {
      return <Database className="w-4 h-4" />;
    }
    
    return isConnected ? (
      <CheckCircle className="w-4 h-4" />
    ) : (
      <AlertTriangle className="w-4 h-4" />
    );
  };

  const getStatusText = () => {
    if (isChecking) return 'Verificando...';
    if (isConnected === null) return 'Inicializando...';
    return isConnected ? 'Conectado' : 'Desconectado';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center space-x-1 ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
      </div>
      
      {isConnected && (
        <div className="flex items-center space-x-1 text-green-600">
          <Wifi className="w-4 h-4" />
          <span className="text-xs text-gray-500">
            Tempo real ativo
          </span>
        </div>
      )}
      
      {!isConnected && isConnected !== null && (
        <div className="flex items-center space-x-1 text-red-600">
          <WifiOff className="w-4 h-4" />
          <span className="text-xs text-gray-500">
            Offline
          </span>
        </div>
      )}
      
      {lastSync && (
        <span className="text-xs text-gray-400">
          Última sync: {lastSync.toLocaleTimeString('pt-BR')}
        </span>
      )}
      
      <button
        onClick={checkConnection}
        disabled={isChecking}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        title="Verificar conexão"
      >
        <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
};

export default DatabaseStatus;