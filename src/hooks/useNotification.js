import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook for managing unified notifications
 * Provides consistent notification state management across the application
 */
export const useNotification = (autoHideDelay = 5000) => {
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'info', // 'success', 'error', 'warning', 'info'
  });

  // Auto-hide notification after specified delay
  useEffect(() => {
    if (notification.show && autoHideDelay > 0) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [notification.show, autoHideDelay]);

  // Show notification with message and type
  const showNotification = useCallback((message, type = 'info') => {
    setNotification({
      show: true,
      message,
      type,
    });
  }, []);

  // Show success notification
  const showSuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  // Show error notification
  const showError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  // Show warning notification
  const showWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  // Show info notification
  const showInfo = useCallback((message) => {
    showNotification(message, 'info');
  }, [showNotification]);

  // Hide notification
  const hideNotification = useCallback(() => {
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  // Clear notification completely
  const clearNotification = useCallback(() => {
    setNotification({
      show: false,
      message: '',
      type: 'info',
    });
  }, []);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification,
    clearNotification,
  };
};
