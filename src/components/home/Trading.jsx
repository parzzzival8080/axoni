import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useNavigate } from 'react-router-dom';

const TrendingCoin = ({ symbol, price, change, logo, coinPair }) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-3 hover:bg-gray-900/50 transition-colors border-b border-gray-800 last:border-b-0 sm:border-none">
      {/* Logo + Pair */}
      <div className="flex items-center gap-3 w-full mb-2 sm:mb-0 sm:flex-1 sm:min-w-0">
        {logo ? (
          <img
            src={logo}
            alt={symbol}
            className="w-8 h-8 rounded-full bg-gray-800 object-contain shadow-md"
            onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/32/222/fff?text=?'; }}
          />
        ) : (
          <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-white">
              {symbol.split('/')[0].slice(0, 1)}
            </span>
          </div>
        )}
        <span className="text-white font-medium truncate">{symbol}</span>
      </div>
      {/* Price */}
      <div className="text-white font-medium w-full text-left sm:w-32 sm:text-right mb-2 sm:mb-0">
        ${price}
      </div>
      {/* 24h Change */}
      <div className="w-full text-left sm:w-24 sm:text-right mb-2 sm:mb-0">
        <span className={`text-sm font-medium ${parseFloat(change) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {parseFloat(change) >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      {/* Trade Button */}
      <div className="w-full mt-2 sm:mt-0 sm:w-20 sm:text-right">
        <button
          className="w-full sm:w-auto text-orange-500 text-base sm:text-sm font-medium hover:text-orange-400 transition-colors px-4 py-2 sm:px-3 sm:py-1 rounded-lg sm:rounded-full bg-orange-500/10 sm:bg-white/5 border border-orange-500/30 sm:border-orange-500/20 shadow-sm"
          onClick={() => {
            if (coinPair) {
              // Navigate to spot-trading with the specific coin pair ID
              const params = new URLSearchParams();
              params.set('coin_pair_id', coinPair);
              navigate(`/spot-trading?${params.toString()}`);
            } else {
              // Fallback to general spot-trading page
              navigate('/spot-trading');
            }
          }}
        >
          Trade
        </button>
      </div>
    </div>
  );
};

const Trading = () => {
  const [activeTab, setActiveTab] = useState('Popular Futures');
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabs = ['Popular Futures'];

  useEffect(() => {
    let isMounted = true;
    const fetchCoins = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('https://api.fluxcoin.tech/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY');
        const data = await res.json();
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setCoins(data);
        } else if (Array.isArray(data.data)) {
          setCoins(data.data);
        } else {
          setCoins([]);
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch coin data.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCoins();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-black py-16">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
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
        <div className="hidden sm:flex items-center justify-between py-3 border-b border-gray-800 mb-4">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-gray-400 text-sm">Pair</span>
          </div>
          <div className="w-24 sm:w-32 text-right">
            <span className="text-gray-400 text-sm">Last Price</span>
          </div>
          <div className="hidden sm:block w-24 text-right">
            <span className="text-gray-400 text-sm">24H Change</span>
          </div>
          <div className="hidden sm:block w-20 text-right">
            <span className="text-gray-400 text-sm">Trade</span>
          </div>
        </div>

        {/* Coin List */}
        <div className="space-y-1 min-h-[120px]">
          {loading && (
            <div className="text-gray-400 py-8 text-center animate-pulse">Loading coins...</div>
          )}
          {error && (
            <div className="text-red-500 py-8 text-center">{error}</div>
          )}
          {!loading && !error && coins.length === 0 && (
            <div className="text-gray-400 py-8 text-center">No coins found.</div>
          )}
          {!loading && !error && coins.slice(0, 10).map((coin, index) => (
            <TrendingCoin
              key={coin.symbol + (coin.pair_name || '') || index}
              symbol={coin.symbol && coin.pair_name ? `${coin.symbol}/${coin.pair_name}` : coin.symbol || coin.name || '-'}
              price={coin.price ? parseFloat(coin.price).toLocaleString(undefined, { maximumFractionDigits: 8 }) : '-'}
              change={coin.price_change_24h !== undefined && coin.price_change_24h !== null ? parseFloat(coin.price_change_24h).toFixed(2) : '0.00'}
              high={coin['24_high'] ? parseFloat(coin['24_high']).toLocaleString(undefined, { maximumFractionDigits: 8 }) : '-'}
              low={coin['24_low'] ? parseFloat(coin['24_low']).toLocaleString(undefined, { maximumFractionDigits: 8 }) : '-'}
              volume={coin.volume_24h ? Number(coin.volume_24h).toLocaleString() : '-'}
              logo={coin.logo_path}
              coinPair={coin.coin_pair}
              chart={'M5,15 Q20,10 35,12 Q50,8 65,11 Q75,9 75,9'} // Placeholder chart
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Trading;