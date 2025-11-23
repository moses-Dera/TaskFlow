import React, { useContext } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { NotificationContext } from '../context/NotificationContext';

const NotificationContainer = () => {
  const { notifications, hideNotification } = useContext(NotificationContext);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500';
      default:
        return 'bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800 dark:text-green-200';
      case 'error':
        return 'text-red-800 dark:text-red-200';
      case 'warning':
        return 'text-yellow-800 dark:text-yellow-200';
      case 'info':
        return 'text-blue-800 dark:text-blue-200';
      default:
        return 'text-green-800 dark:text-green-200';
    }
  };

  return (
    <div className="fixed top-6 right-6 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`animate-slide-in-right ${getBgColor(notification.type)} rounded-lg shadow-lg border p-4 max-w-sm pointer-events-auto flex items-start gap-3 group`}
        >
          <div className="flex-shrink-0 pt-0.5">
            {getIcon(notification.type)}
          </div>
          
          <p className={`flex-1 text-sm font-medium ${getTextColor(notification.type)}`}>
            {notification.message}
          </p>
          
          <button
            onClick={() => hideNotification(notification.id)}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}

      <style>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(400px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideOutRight {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(400px);
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out;
        }

        .animate-slide-out-right {
          animation: slideOutRight 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default NotificationContainer;
