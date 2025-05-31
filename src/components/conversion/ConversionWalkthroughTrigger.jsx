import React, { useState } from 'react';
import { FiHelpCircle, FiX } from 'react-icons/fi';
import ConversionWalkthrough from './ConversionWalkthrough';
import logo from '../../assets/logo/logo.png';

const ConversionWalkthroughTrigger = () => {
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check if user has seen the walkthrough before
  const hasSeenWalkthrough = localStorage.getItem('hasSeenConversionWalkthrough') === 'true';

  const handleOpenWalkthrough = () => {
    setIsWalkthroughOpen(true);
    // Mark as seen when user opens it
    localStorage.setItem('hasSeenConversionWalkthrough', 'true');
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-400 rounded-full text-white text-2xl hover:scale-110 flex items-center justify-center shadow-lg shadow-orange-500/40 transition-all duration-300 z-[1000] animate-pulse hover:animate-none md:bottom-5 md:right-5 md:w-12 md:h-12 md:text-xl"
        onClick={handleMinimize}
        title="Show conversion help panel"
      >
        <FiHelpCircle />
      </button>
    );
  }

  return (
    <>
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
            <span>Conversion Help</span>
          </div>
          <button 
            onClick={handleMinimize}
            className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded transition-all duration-200"
            title="Minimize conversion help panel"
          >
            <FiX size={16} />
          </button>
        </div>
        
        <div className="p-5">
          <p className="mb-5 text-sm leading-relaxed text-white/80">
            New to crypto conversion? Learn how to instantly convert between cryptocurrencies with zero fees!
          </p>
          
          <div className="space-y-4">
            <button 
              onClick={handleOpenWalkthrough}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 text-white font-semibold px-5 py-3 rounded-2xl hover:shadow-lg hover:shadow-orange-500/25 hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Conversion Tour
            </button>
            
            <div className="space-y-2">
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-orange-500/50">
                <strong className="text-orange-500">🎯 Zero Fees:</strong> Convert cryptocurrencies without any trading fees
              </div>
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-orange-500/50">
                <strong className="text-orange-500">⚡ Instant:</strong> Conversions are processed immediately at live rates
              </div>
              <div className="text-xs leading-tight text-white/70 px-3 py-2 bg-white/5 rounded-xl border-l-3 border-orange-500/50">
                <strong className="text-orange-500">💡 Pro Tip:</strong> Check exchange rates before converting large amounts
              </div>
              {!hasSeenWalkthrough && (
                <div className="text-xs leading-tight text-white/90 px-3 py-2 bg-orange-500/10 border border-orange-500/20 rounded-xl border-l-3 border-orange-500">
                  <strong className="text-orange-500">👋 Welcome!</strong> Take the conversion tour to get started quickly
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isWalkthroughOpen && (
        <ConversionWalkthrough
          isOpen={isWalkthroughOpen}
          onClose={handleCloseWalkthrough}
        />
      )}
    </>
  );
};

export default ConversionWalkthroughTrigger; 