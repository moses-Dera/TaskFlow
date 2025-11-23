import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useNotification = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }

  return {
    success: (message, duration = 3000) =>
      context.showNotification(message, 'success', duration),
    error: (message, duration = 4000) =>
      context.showNotification(message, 'error', duration),
    warning: (message, duration = 3500) =>
      context.showNotification(message, 'warning', duration),
    info: (message, duration = 3000) =>
      context.showNotification(message, 'info', duration),
    dismiss: context.hideNotification,
    clearAll: context.clearAll,
  };
};
