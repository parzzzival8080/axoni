import React from 'react';
import { FaTimes, FaGift, FaStar } from 'react-icons/fa';

const TradeRewardsPopup = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-gray-800 rounded-2xl max-w-md w-full mx-4 overflow-hidden shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-orange-400 transition-colors z-10"
        >
          <FaTimes size={20} />
        </button>

        {/* Header illustration area */}
        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-800 px-6 py-8 text-center border-b border-gray-800">
          {/* Decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-4 left-4 text-orange-400 opacity-20">
              <FaStar size={16} />
            </div>
            <div className="absolute top-8 right-8 text-orange-400 opacity-15">
              <FaStar size={12} />
            </div>
            <div className="absolute bottom-4 left-8 text-orange-400 opacity-18">
              <FaStar size={14} />
            </div>
            <div className="absolute bottom-8 right-4 text-orange-400 opacity-22">
              <FaStar size={10} />
            </div>
          </div>

          {/* Main illustration */}
          <div className="relative z-10 mb-4">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-xl border border-orange-400/20">
              <FaGift size={40} className="text-white" />
            </div>
            
            {/* Celebrating figures representation */}
            <div className="flex justify-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center border border-orange-400/30">
                <span className="text-white text-xs font-bold">🎉</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center border border-orange-300/30">
                <span className="text-white text-xs font-bold">🚀</span>
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center border border-orange-400/30">
                <span className="text-white text-xs font-bold">💎</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 bg-gradient-to-b from-black to-gray-900">
          <h2 className="text-2xl font-bold text-white mb-2">
            Trade more,
          </h2>
          <h2 className="text-2xl font-bold text-white mb-4">
            earn more with <span className="text-orange-400">COINCHI</span>
          </h2>

          <div className="mb-6">
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mt-0.5 border border-orange-400/30">
                <span className="text-white text-xs font-bold">🎯</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">
                <strong className="text-orange-300">Something Big is Coming!</strong> Get ready for an exciting airdrop on the COINCHI Trading Platform!
              </p>
            </div>

            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mt-0.5 border border-orange-400/30">
                <span className="text-white text-xs font-bold">💰</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                We're preparing to reward our loyal traders in a major way — and the more you trade, the more eligibility points you earn.
              </p>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mt-0.5 border border-orange-400/30">
                <span className="text-white text-xs font-bold">⚡</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Every transaction gets you closer to unlocking exclusive rewards in our upcoming airdrop event. Start trading now and be part of the momentum — COINCHI is about to change the game.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-gray-300 font-medium py-3 px-4 rounded-lg transition-all duration-200 border border-gray-700 hover:border-gray-600"
            >
              Skip
            </button>
            <button
              onClick={() => {
                onClose();
                window.location.href = '/spot-trading';
              }}
              className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 shadow-lg border border-orange-400/30 hover:border-orange-400/50"
            >
              Start Trading
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeRewardsPopup; 