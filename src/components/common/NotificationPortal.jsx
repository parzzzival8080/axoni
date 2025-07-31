import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * NotificationPortal Component
 * Renders notifications in a portal at the root level to ensure they're always on top
 */
const NotificationPortal = ({ children }) => {
  const [portalContainer, setPortalContainer] = useState(null);

  useEffect(() => {
    // Create or get the notification portal container
    let container = document.getElementById('notification-portal');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'notification-portal';
      container.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 2147483647 !important;
        isolation: isolate !important;
        overflow: visible !important;
      `;
      document.body.appendChild(container);
    }

    // Ensure the container always has maximum z-index
    container.style.zIndex = '2147483647';
    
    setPortalContainer(container);

    // Cleanup function
    return () => {
      // Don't remove the container on unmount as other notifications might be using it
      // The container will be reused across all notifications
    };
  }, []);

  // Don't render anything if no container or no children
  if (!portalContainer || !children) {
    return null;
  }

  // Render children in the portal
  return createPortal(children, portalContainer);
};

export default NotificationPortal;
