import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
  faExclamationTriangle,
  faTimes,
} from '@fortawesome/free-solid-svg-icons';
import NotificationPortal from './NotificationPortal';

/**
 * Unified Notification Component
 * Provides consistent notification styling and behavior across the entire application
 * Always appears on top with high z-index and proper visibility
 */
const UnifiedNotification = ({ 
  notification, 
  onClose, 
  position = 'bottom-center',
  className = '' 
}) => {
  if (!notification || !notification.show) return null;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return faCheckCircle;
      case 'error':
        return faExclamationCircle;
      case 'warning':
        return faExclamationTriangle;
      case 'info':
      default:
        return faInfoCircle;
    }
  };

  const getNotificationStyles = (type) => {
    const baseStyles = "fixed max-w-sm w-auto min-w-0 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-start gap-3 text-sm pointer-events-auto box-border animate-slideInUp backdrop-blur-md border border-white/20";
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-gradient-to-br from-emerald-900/95 to-emerald-800/95 border-l-4 border-emerald-400 text-emerald-50`;
      case 'error':
        return `${baseStyles} bg-gradient-to-br from-red-900/95 to-red-800/95 border-l-4 border-red-400 text-red-50`;
      case 'warning':
        return `${baseStyles} bg-gradient-to-br from-amber-900/95 to-amber-800/95 border-l-4 border-amber-400 text-amber-50`;
      case 'info':
      default:
        return `${baseStyles} bg-gradient-to-br from-yellow-900/95 to-yellow-800/95 border-l-4 border-yellow-400 text-yellow-50`;
    }
  };

  const getPositionStyles = (position) => {
    switch (position) {
      case 'top-center':
        return 'top-5 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-5 right-5';
      case 'bottom-right':
        return 'bottom-5 right-5';
      case 'bottom-left':
        return 'bottom-5 left-5';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'bottom-center':
      default:
        return 'bottom-5 left-1/2 transform -translate-x-1/2';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-emerald-300';
      case 'error':
        return 'text-red-300';
      case 'warning':
        return 'text-amber-300';
      case 'info':
      default:
        return 'text-yellow-300';
    }
  };

  return (
    <NotificationPortal>
      <div
        className={`${getNotificationStyles(notification.type)} ${getPositionStyles(position)} ${className} unified-notification-force-top`}
        role="alert"
        aria-live="polite"
        style={{
          // Force maximum z-index to be above everything
          zIndex: 2147483647, // Maximum 32-bit integer
          // Force fixed positioning
          position: 'fixed !important',
          // Force visibility
          visibility: 'visible !important',
          opacity: '1 !important',
          // Force display
          display: 'flex !important',
          // Override any potential parent transforms
          transform: position.includes('center') ? 
            (position === 'center' ? 'translate(-50%, -50%) !important' : 'translateX(-50%) !important') : 
            'none !important',
          // Force pointer events
          pointerEvents: 'auto !important',
          // Ensure it's not affected by parent containers
          isolation: 'isolate',
          // Create new stacking context
          willChange: 'transform',
        }}
      >
        {/* Icon */}
        <div className={`text-xl flex-shrink-0 ${getIconColor(notification.type)}`}>
          <FontAwesomeIcon icon={getNotificationIcon(notification.type)} />
        </div>
        
        {/* Message */}
        <div className="flex-1 font-medium leading-snug break-words">
          {notification.message}
        </div>
        
        {/* Close Button */}
        <button
          className="bg-transparent border-none text-white/60 hover:text-white/90 text-lg cursor-pointer p-1 opacity-80 hover:opacity-100 transition-all duration-200 ml-2 flex-shrink-0 rounded-full hover:bg-white/10"
          onClick={onClose}
          aria-label="Close notification"
          type="button"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
    </NotificationPortal>
  );
};

export default UnifiedNotification;
