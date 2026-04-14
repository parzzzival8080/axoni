import { useState, useEffect, useRef } from "react";

const CHAT_URL = "https://bot-chatter.vercel.app/livechat/widget?color=2EBD85&source=axoni.tech";
const LOAD_TIMEOUT = 15000;

const ChatBubble = () => {
  const [showChat, setShowChat] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (showChat && !isChatLoaded && !loadFailed) {
      timeoutRef.current = setTimeout(() => {
        if (!isChatLoaded) setLoadFailed(true);
      }, LOAD_TIMEOUT);
    }
    return () => clearTimeout(timeoutRef.current);
  }, [showChat, isChatLoaded, loadFailed]);

  const handleClose = () => {
    setShowChat(false);
    setIsChatLoaded(false);
    setLoadFailed(false);
    clearTimeout(timeoutRef.current);
  };

  const handleRetry = () => {
    setLoadFailed(false);
    setIsChatLoaded(false);
    setIframeKey((k) => k + 1);
  };

  const handleLoad = () => {
    clearTimeout(timeoutRef.current);
    setIsChatLoaded(true);
    setLoadFailed(false);
  };

  return (
    <>
      {showChat && (
        <div
          className="fixed z-[9998] sm:bottom-24 sm:right-5 bottom-16 right-0 left-0 sm:left-auto"
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#1E1E1E", borderBottom: "1px solid #2A2A2A" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  background: loadFailed ? "#F6465D" : "#2EBD85",
                  boxShadow: loadFailed ? "0 0 6px #F6465D" : "0 0 6px #2EBD85",
                }}
              />
              <span className="text-white text-sm font-semibold">
                Customer Support
              </span>
            </div>
            <button
              onClick={handleClose}
              className="text-[#5E6673] hover:text-white transition-colors p-1"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!isChatLoaded && !loadFailed && (
            <div
              className="flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] sm:w-[380px] w-full"
              style={{ height: 560 }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#2A2A2A] border-t-[#2EBD85] animate-spin" />
              <span className="text-sm text-[#5E6673]">
                Connecting to support...
              </span>
            </div>
          )}

          {loadFailed && (
            <div
              className="flex flex-col items-center justify-center gap-4 bg-[#0a0a0a] sm:w-[380px] w-full px-6 text-center"
              style={{ height: 560 }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#F6465D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4M12 16h.01" />
              </svg>
              <span className="text-sm text-[#5E6673]">
                Unable to connect to support.<br />This may be due to your network or region.
              </span>
              <button
                onClick={handleRetry}
                className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-colors"
                style={{ background: "#2EBD85" }}
              >
                Try again
              </button>
              <button
                onClick={handleRetry}
                className="text-xs text-[#5E6673] hover:text-[#848E9C] transition-colors underline"
              >
                Refresh chat support
              </button>
              <a
                href="mailto:customerservice@axoni.tech"
                className="text-xs text-[#5E6673] hover:text-[#848E9C] transition-colors underline"
              >
                Or email us at customerservice@axoni.tech
              </a>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={CHAT_URL}
            className="sm:w-[380px] w-full"
            height="560"
            style={{
              border: "none",
              display: isChatLoaded ? "block" : "none",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
            title="Customer Support Chat"
            onLoad={handleLoad}
            onError={() => setLoadFailed(true)}
          />
        </div>
      )}

      <button
        onClick={() => setShowChat((v) => !v)}
        title="Customer Support"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-[9999] flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 active:scale-95"
        style={{
          background: "#2EBD85",
          boxShadow: "0 4px 20px rgba(46,189,133,0.4)",
        }}
      >
        {showChat ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatBubble;
