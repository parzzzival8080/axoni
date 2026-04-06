import { useState } from "react";

const ChatBubble = () => {
  const [showChat, setShowChat] = useState(false);
  const [isChatLoaded, setIsChatLoaded] = useState(false);

  return (
    <>
      {/* Chat panel */}
      {showChat && (
        <div
          className="fixed z-[9998] sm:bottom-24 sm:right-5 bottom-16 right-0 left-0 sm:left-auto"
          style={{ borderRadius: 12, overflow: "hidden" }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ background: "#1E1E1E", borderBottom: "1px solid #2A2A2A" }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full bg-[#2EBD85]"
                style={{ boxShadow: "0 0 6px #2EBD85" }}
              />
              <span className="text-white text-sm font-semibold">
                Customer Support
              </span>
            </div>
            <button
              onClick={() => {
                setShowChat(false);
                setIsChatLoaded(false);
              }}
              className="text-gray-400 hover:text-white transition-colors p-1"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Loading state */}
          {!isChatLoaded && (
            <div
              className="flex flex-col items-center justify-center gap-4 bg-[#121212] sm:w-[380px] w-full"
              style={{ height: 560 }}
            >
              <div className="w-12 h-12 rounded-full border-2 border-[#2A2A2A] border-t-[#2EBD85] animate-spin" />
              <span className="text-sm text-gray-500">
                Connecting to support...
              </span>
            </div>
          )}

          {/* Iframe */}
          <iframe
            src="https://bot-chatter.vercel.app/livechat/widget?color=F0B90B&source=axoni.co"
            className="sm:w-[380px] w-full"
            height="560"
            style={{
              border: "none",
              display: isChatLoaded ? "block" : "none",
              borderRadius: "0 0 12px 12px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
            }}
            title="Customer Support Chat"
            onLoad={() => setIsChatLoaded(true)}
          />
        </div>
      )}

      {/* Floating action button */}
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
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        ) : (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
          </svg>
        )}
      </button>
    </>
  );
};

export default ChatBubble;
