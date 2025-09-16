import React, { useState, useEffect } from 'react';
import { FiHelpCircle, FiX } from 'react-icons/fi';
import SpotTradingWalkthrough from './SpotTradingWalkthrough';
import logo from '../../assets/logo/logo.png';

const WalkthroughTrigger = () => {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [showFloatingCard, setShowFloatingCard] = useState(true);

  // Check if user has seen the walkthrough before
  const hasSeenWalkthrough = localStorage.getItem('hasSeenSpotTradingWalkthrough') === 'true';

  useEffect(() => {
    // If user has seen walkthrough, don't show floating card
    if (hasSeenWalkthrough) {
      setShowFloatingCard(false);
    }
  }, [hasSeenWalkthrough]);

  const handleOpenWalkthrough = () => {
    setIsWalkthroughOpen(true);
    setShowFloatingCard(false); // Hide floating card when walkthrough opens
    // Mark as seen when user opens it
    localStorage.setItem('hasSeenSpotTradingWalkthrough', 'true');
  };

  const handleCloseWalkthrough = () => {
    setIsWalkthroughOpen(false);
  };

  const handleMinimize = () => {
    setShowFloatingCard(false);
  };

  return (
    <>
      {!showFloatingCard ? (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full text-white text-2xl hover:scale-110 flex items-center justify-center shadow-lg shadow-blue-500/40 transition-all duration-300 z-[1000] animate-pulse hover:animate-none md:bottom-5 md:right-5 md:w-12 md:h-12 md:text-xl"
          onClick={handleOpenWalkthrough}
          title="Start walkthrough"
        >
          <FiHelpCircle />
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-blue-500/30 rounded-2xl shadow-2xl backdrop-blur-xl text-white z-[1000] animate-in slide-in-from-bottom-4 duration-400 md:w-72 sm:bottom-5 sm:right-5 sm:left-5 sm:w-auto">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-semibold text-blue-500">
              <div className="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="COINCHI Logo" 
                  className="w-3 h-3 object-contain"
                />
              </div>
              <span>Need Help?</span>
            </div>
            <button 
              onClick={handleMinimize}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200"
              title="Minimize help panel"
            >
              <FiX size={16} />
            </button>
          </div>
          
          <div className="p-5">
            <p className="mb-5 text-sm leading-relaxed text-white/80">
              New to COINCHI? Take our guided tour to learn all the features!
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={handleOpenWalkthrough}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold px-5 py-3 rounded-lg hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Tour
              </button>
              
              <div className="space-y-2">
                <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded border-l-3 border-blue-500/50">
                  <strong className="text-blue-500">💡 Quick Tip:</strong> Use the percentage slider for easy amount selection
                </div>
                {!hasSeenWalkthrough && (
                  <div className="text-xs leading-tight text-white/90 px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded border-l-3 border-blue-500">
                    <strong className="text-blue-500">👋 Welcome!</strong> We recommend taking the tour first
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isWalkthroughOpen && (
        <SpotTradingWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={handleCloseWalkthrough}
        />
      )}
    </>
  );
};

export default WalkthroughTrigger; 