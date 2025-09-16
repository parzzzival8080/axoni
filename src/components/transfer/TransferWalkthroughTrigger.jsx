
import React, { useState } from 'react';
import { FiHelpCircle, FiX } from 'react-icons/fi';
import TransferWalkthrough from './TransferWalkthrough';
import logo from '../../assets/logo/logo.png';

const TransferWalkthroughTrigger = () => {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if user has seen the walkthrough before
  const hasSeenWalkthrough = localStorage.getItem('hasSeenTransferWalkthrough') === 'true';

  const handleOpenWalkthrough = () => {
    setIsWalkthroughOpen(true);
    // Mark as seen when user opens it
    localStorage.setItem('hasSeenTransferWalkthrough', 'true');
  };

  const handleCloseWalkthrough = () => {
    setIsWalkthroughOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (isMinimized) {
    return (
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full text-white text-2xl hover:scale-110 flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all duration-300 z-[1000] animate-pulse hover:animate-none md:right-5 md:w-12 md:h-12 md:text-xl"
        onClick={handleMinimize}
        title="Show transfer help panel"
      >
        <FiHelpCircle />
      </button>
    );
  }

  return (
    <>
      <div className="fixed top-1/2 right-6 transform -translate-y-1/2 w-80 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-blue-500/30 rounded-3xl shadow-2xl backdrop-blur-xl text-white z-[1000] animate-in slide-in-from-right-4 duration-400 md:w-72 sm:right-5 sm:w-auto">
        <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2 font-semibold text-blue-500">
            <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center">
              <img 
                src={logo} 
                alt="COINCHI Logo" 
                className="w-3 h-3 object-contain"
              />
            </div>
            <span>Transfer Help</span>
          </div>
          <button 
            onClick={handleMinimize}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200"
            title="Minimize transfer help panel"
          >
            <FiX size={16} />
          </button>
        </div>
        
        <div className="p-5">
          <p className="mb-5 text-sm leading-relaxed text-white/80">
            New to account transfers? Learn how to move funds between your Spot and Futures accounts instantly!
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleOpenWalkthrough}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold px-5 py-3 rounded-2xl hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Transfer Tour
            </button>
            
            <div className="space-y-2">
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-blue-500/50">
                <strong className="text-blue-500">⚡ Instant:</strong> Transfers between accounts are processed immediately
              </div>
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-blue-500/50">
                <strong className="text-blue-500">🔄 Flexible:</strong> Move funds between Spot and Futures as needed
              </div>
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-blue-500/50">
                <strong className="text-blue-500">💡 Pro Tip:</strong> Keep balanced funds for optimal trading flexibility
              </div>
              {!hasSeenWalkthrough && (
                <div className="text-xs leading-tight text-white/90 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl border-l-3 border-blue-500">
                  <strong className="text-blue-500">👋 Welcome!</strong> Take the transfer tour to master account management
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isWalkthroughOpen && (
        <TransferWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={handleCloseWalkthrough}
        />
      )}
    </>
  );
};

export default TransferWalkthroughTrigger; 