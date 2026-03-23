import React, { useState, useEffect } from "react";

const ConnectionIndicator = () => {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      <span className="text-[10px] font-medium text-red-600 dark:text-red-400">
        Offline
      </span>
    </div>
  );
};

export default ConnectionIndicator;
