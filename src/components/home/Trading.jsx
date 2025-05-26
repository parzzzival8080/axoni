import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const TrendingCoin = ({ symbol, price, change, high, volume, chart }) => (
  <div className="flex items-center justify-between py-3 hover:bg-gray-900/50 transition-colors">
    <div className="flex items-center gap-3 flex-1">
      <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
        <span className="text-xs font-semibold text-white">
          {symbol.split('/')[0].slice(0, 1)}
        </span>
      </div>
      <span className="text-white font-medium">{symbol}</span>
    </div>
    
    <div className="text-white font-medium w-24 text-right">
      ${price}
    </div>
    
    <div className="w-20 text-right">
      <span className={`text-sm font-medium ${
        change >= 0 ? 'text-green-500' : 'text-red-500'
      }`}>
        {change >= 0 ? '+' : ''}{change}%
      </span>
    </div>
    
    <div className="text-white font-medium w-24 text-right">
      {high}
    </div>
    
    <div className="text-white font-medium w-20 text-right">
      {volume}
    </div>
    
    <div className="w-24 h-8 flex items-center justify-center">
      <svg viewBox="0 0 80 20" className="w-full h-full">
        <path 
          d={chart} 
          fill="none" 
          stroke={change >= 0 ? '#10b981' : '#ef4444'} 
          strokeWidth="1.5"
          className="opacity-80"
        />
      </svg>
    </div>
    
    <div className="w-16 text-right">
      <button className="text-orange-500 text-sm font-medium hover:text-orange-400 transition-colors">
        Trade
      </button>
    </div>
  </div>
);

const Trading = () => {
  const [activeTab, setActiveTab] = useState('Popular Futures');
  
  const tabs = ['Popular Futures', 'Popular Spot', 'Gainers'];
  
  const trendingCoins = [
    {
      symbol: 'BTCUSDT',
      price: '104,569.0',
      change: 1.20,
      high: '106,108.8',
      volume: '7.44B',
      chart: 'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'
    },
    {
      symbol: 'BTCUSDT',
      price: '104,569.0',
      change: 1.20,
      high: '106,108.8',
      volume: '7.44B',
      chart: 'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'
    },
    {
      symbol: 'BTCUSDT',
      price: '104,569.0',
      change: 1.20,
      high: '106,108.8',
      volume: '7.44B',
      chart: 'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'
    },
    {
      symbol: 'BTCUSDT',
      price: '104,569.0',
      change: 1.20,
      high: '106,108.8',
      volume: '7.44B',
      chart: 'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'
    },
    {
      symbol: 'BTCUSDT',
      price: '104,569.0',
      change: 1.20,
      high: '106,108.8',
      volume: '7.44B',
      chart: 'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'
    },
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Trending Cryptocurrencies
          </h2>
          <button className="text-gray-400 text-sm hover:text-white transition-colors">
            View More
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-8 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'text-white border-b-2 border-orange-500 pb-2'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Table Header */}
        <div className="flex items-center justify-between py-3 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-gray-400 text-sm">Trading Pairs</span>
          </div>
          <div className="w-24 text-right">
            <span className="text-gray-400 text-sm">Last Traded Price</span>
          </div>
          <div className="w-20 text-right">
            <span className="text-gray-400 text-sm">24H Change</span>
          </div>
          <div className="w-24 text-right">
            <span className="text-gray-400 text-sm">24H High</span>
          </div>
          <div className="w-20 text-right">
            <span className="text-gray-400 text-sm">24H Trading Volume</span>
          </div>
          <div className="w-24 text-center">
            <span className="text-gray-400 text-sm">Chart</span>
          </div>
          <div className="w-16"></div>
        </div>

        {/* Coin List */}
        <div className="space-y-1">
          {trendingCoins.map((coin, index) => (
            <TrendingCoin key={index} {...coin} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trading;