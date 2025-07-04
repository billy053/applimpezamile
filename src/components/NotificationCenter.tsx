import React, { useState } from 'react';
import { Bell, BellOff, Check, CheckCheck, Trash2, X, Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { useSupabaseNotifications } from '../hooks/useSupabaseNotifications';

interface NotificationCenterProps {
  className?: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useSupabaseNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created':
        return <Calendar className="w-5 h-5 text-blue-600" />;
      case 'booking_confirmed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'booking_cancelled':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'system_alert':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Bell className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora';
    if (diffInMinutes < 60) return `${diffInMinutes}m atrás`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error('Erro ao marcar como lida:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
    } catch (error) {
      console.error('Erro ao deletar notificação:', error);
    }
  };

  const handleClearAll = async () => {
    if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
      try {
        await clearAllNotifications();
      } catch (error) {
        console.error('Erro ao limpar notificações:', error);
      }
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Botão de notificações */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      >
        {unreadCount > 0 ? (
          <Bell className="w-6 h-6" />
        ) : (
          <BellOff className="w-6 h-6" />
        )}
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Painel de notificações */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-gray-800">Notificações</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                  title="Marcar todas como lidas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Lista de notificações */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.is_read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${
                              !notification.is_read ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {formatTimeAgo(notification.created_at)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1 ml-2">
                            {!notification.is_read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id)}
                                className="p-1 text-blue-600 hover:text-blue-800"
                                title="Marcar como lida"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => handleDelete(notification.id)}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Deletar notificação"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleClearAll}
                className="w-full text-center text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Limpar todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;