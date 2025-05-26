import React from 'react';
import laptop from '../../assets/homepage/laptop.png';

const TradingGame = () => {
  return (
    <div className="relative min-h-[75vh] bg-black overflow-hidden">
      {/* Blurry Orange Background Effect */}
      <div className="absolute inset-0">
        {/* Main orange blur in the center-right */}
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl transform -translate-y-1/2" />
        
        {/* Secondary orange blur for more depth */}
        <div className="absolute top-1/3 right-1/3 w-80 h-80 bg-amber-600/20 rounded-full blur-3xl" />
        
        {/* Additional subtle blur on the left */}
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-orange-700/15 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-8 md:px-16 lg:px-24 py-4 h-[70vh] flex flex-col justify-center">        <div className="text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Level up your trading game
          </h2>
          <p className="text-gray-300 text-lg mb-16 max-w-2xl mx-auto">
            Access low costs, high-speed transactions, powerful developer tools,
            and more.
          </p>

          {/* Laptop Image Container */}
          <div className="flex justify-center">
            <div className="relative max-w-4xl w-full">
              <img
                src={laptop}
                alt="Trading Platform"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Ticker Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-gray-700/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-center items-center space-x-12 text-sm overflow-x-auto">
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-400">BTC</span>
              <span className="text-white font-medium">$103,655.35</span>
              <span className="text-green-400 text-xs">(+1.00%)</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-400">ETH</span>
              <span className="text-white font-medium">$3,456.78</span>
              <span className="text-red-400 text-xs">(-2.34%)</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-400">BNB</span>
              <span className="text-white font-medium">$645.23</span>
              <span className="text-green-400 text-xs">(+0.87%)</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-400">ADA</span>
              <span className="text-white font-medium">$1.23</span>
              <span className="text-green-400 text-xs">(+3.45%)</span>
            </div>
            <div className="flex items-center space-x-2 whitespace-nowrap">
              <span className="text-gray-400">SOL</span>
              <span className="text-white font-medium">$234.56</span>
              <span className="text-red-400 text-xs">(-1.23%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingGame;