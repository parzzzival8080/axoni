import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: "bg-green-500 text-white",
  error: "bg-red-500 text-white",
  warning: "bg-yellow-500 text-white",
  info: "bg-gray-800 text-white",
};

let showToastFn = null;

export const toast = {
  success: (message) => showToastFn?.({ message, type: "success" }),
  error: (message) => showToastFn?.({ message, type: "error" }),
  warning: (message) => showToastFn?.({ message, type: "warning" }),
  info: (message) => showToastFn?.({ message, type: "info" }),
};

const ToastNotification = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ message, type = "info" }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    showToastFn = addToast;
    return () => { showToastFn = null; };
  }, [addToast]);

  const dismiss = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] flex flex-col items-center gap-2 pointer-events-none"
      style={{ paddingTop: "calc(52px + env(safe-area-inset-top, 0px))" }}
    >
      {toasts.map(({ id, message, type }) => {
        const Icon = ICONS[type];
        return (
          <div
            key={id}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg mx-4 pointer-events-auto animate-slide-down ${STYLES[type]}`}
          >
            <Icon size={18} />
            <span className="text-sm font-medium flex-1">{message}</span>
            <button onClick={() => dismiss(id)} className="ml-2">
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastNotification;
