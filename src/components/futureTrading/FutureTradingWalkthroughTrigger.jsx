import React, { useState, useEffect } from 'react';
import { FiHelpCircle, FiX } from 'react-icons/fi';
import FutureTradingWalkthrough from './FutureTradingWalkthrough';
import logo from '../../assets/logo/logo.png';

const FutureTradingWalkthroughTrigger = () => {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [showFloatingCard, setShowFloatingCard] = useState(true);

  // Check if user has seen the walkthrough before
  const hasSeenWalkthrough = localStorage.getItem('hasSeenFutureTradingWalkthrough') === 'true';

  useEffect(() => {
    // If user has seen the walkthrough before, only show the circular button
    if (hasSeenWalkthrough) {
      setShowFloatingCard(false);
    }
  }, [hasSeenWalkthrough]);

  const handleOpenWalkthrough = () => {
    setIsWalkthroughOpen(true);
    // Mark as seen when user opens it
    localStorage.setItem('hasSeenFutureTradingWalkthrough', 'true');
  };

  const handleCloseWalkthrough = () => {
    setIsWalkthroughOpen(false);
  };

  const handleMinimize = () => {
    setShowFloatingCard(false);
    localStorage.setItem('hasSeenFutureTradingWalkthrough', 'true');
  };


  return (
    <>
      {!showFloatingCard ? (
        <button
          className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full text-white text-2xl hover:scale-110 flex items-center justify-center shadow-lg shadow-orange-500/40 transition-all duration-300 z-[1000] animate-pulse hover:animate-none md:bottom-5 md:right-5 md:w-12 md:h-12 md:text-xl"
          onClick={handleOpenWalkthrough}
          title="Start futures walkthrough"
        >
          <FiHelpCircle />
        </button>
      ) : (
        <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-zinc-900 to-zinc-800 border border-orange-500/30 rounded-3xl shadow-2xl backdrop-blur-xl text-white z-[1000] animate-in slide-in-from-bottom-4 duration-400 md:w-72 sm:bottom-5 sm:right-5 sm:left-5 sm:w-auto">
          <div className="flex justify-between items-center px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-2 font-semibold text-orange-500">
              <div className="w-5 h-5 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full flex items-center justify-center">
                <img 
                  src={logo} 
                  alt="Flux Logo" 
                  className="w-3 h-3 object-contain"
                />
              </div>
              <span>Futures Help</span>
            </div>
            <button 
              onClick={handleMinimize}
              className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200"
              title="Minimize futures help panel"
            >
              <FiX size={16} />
            </button>
          </div>
          
          <div className="p-5">
            <p className="mb-5 text-sm leading-relaxed text-white/80">
              New to futures trading? Take our guided tour to master leverage, short selling, and risk management!
            </p>
            
            <div className="space-y-4">
              <button 
                onClick={handleOpenWalkthrough}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold px-5 py-3 rounded-2xl hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-200"
              >
                Start Futures Tour
              </button>
              
              <div className="space-y-2">
                <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-orange-500/50">
                  <strong className="text-orange-500">⚠️ Warning:</strong> Futures trading involves high risk due to leverage
                </div>
                <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-orange-500/50">
                  <strong className="text-orange-500">💡 Pro Tip:</strong> Always use stop-losses in leveraged positions
                </div>
                {!hasSeenWalkthrough && (
                  <div className="text-xs leading-tight text-white/90 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl border-l-3 border-orange-500">
                    <strong className="text-orange-500">👋 Welcome!</strong> We strongly recommend taking the futures tour first
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isWalkthroughOpen && (
        <FutureTradingWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={handleCloseWalkthrough}
        />
      )}
    </>
  );
};

export default FutureTradingWalkthroughTrigger; 