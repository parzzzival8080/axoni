import React from 'react';
import { Link } from 'react-router-dom';

const TrendingCoin = ({ symbol, name, price, change, chartData }) => (
  <Link to={`/spot/${symbol}`} className="flex items-center justify-between p-4 hover:bg-gray-900 rounded-lg transition-colors">
    <div className="flex items-center gap-4">
      <div className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center">
        {symbol.slice(0, 1)}
      </div>
      <div>
        <h3 className="font-semibold">{name}</h3>
        <p className="text-sm text-gray-400">{symbol}</p>
      </div>
    </div>
    <div className="flex items-center gap-8">
      <div className="text-right">
        <p className="font-semibold">${price}</p>
        <p className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </p>
      </div>
      <div className="w-24 h-12">
        <svg viewBox="0 0 100 40" className={`w-full h-full ${change >= 0 ? 'text-green-500' : 'text-red-500'} opacity-50`}>
          <path d={chartData} fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
  </Link>
);

const Trading = () => {
  // Sample data - in real app, this would come from an API
  const trendingCoins = [
    {
      symbol: 'BTC/USDT',
      name: 'Bitcoin',
      price: '43,680.21',
      change: 2.34,
      chartData: 'M0,20 Q25,25 50,15 T100,20' // Sample SVG path
    },
    {
      symbol: 'ETH/USDT',
      name: 'Ethereum',
      price: '2,280.15',
      change: -1.2,
      chartData: 'M0,15 Q25,25 50,10 T100,25' // Sample SVG path
    },
    {
      symbol: 'SOL/USDT',
      name: 'Solana',
      price: '98.45',
      change: 5.67,
      chartData: 'M0,20 Q25,10 50,25 T100,15' // Sample SVG path
    },
    {
      symbol: 'XRP/USDT',
      name: 'Ripple',
      price: '0.6234',
      change: -0.89,
      chartData: 'M0,15 Q25,20 50,15 T100,20' // Sample SVG path
    },
  ];

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-white">Trending Cryptocurrencies</h2>
        <div className="grid gap-4">
          {trendingCoins.map((coin) => (
            <TrendingCoin key={coin.symbol} {...coin} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trading;