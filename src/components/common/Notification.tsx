import React, { useEffect } from 'react';
import './Notification.css';

interface NotificationProps {
    message: string;
    onClose: () => void;
    duration?: number;
    actionLabel?: string;
    onAction?: () => void;
    type?: 'success' | 'error';
}

export const Notification: React.FC<NotificationProps> = ({ 
    message, 
    onClose, 
    duration = 3000,
    actionLabel = 'OK',
    onAction,
    type
}) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const handleAction = () => {
        if (onAction) {
            onAction();
        }
        onClose();
    };

    return (
        <div className={`notification ${type ? type : ''}`}>
            <div className="notification-content">
                <span className="notification-message">{message}</span>
                <button className="notification-action" onClick={handleAction}>
                    {actionLabel}
                </button>
            </div>
        </div>
    );
}; 