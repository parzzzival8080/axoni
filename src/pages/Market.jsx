import React, { useState, useEffect, useRef } from 'react';
import NavigationTabs from '../components/Market/NavigationTabs';
import SecondaryTabs from '../components/Market/SecondaryTabs';
import CryptoPriceSection from '../components/Market/CryptoPriceSection';
import FaqSection from '../components/Market/FaqSection';
import '../components/Market/Market.css';

const Market = () => {
  // Only show the Crypto tab
  const [activeMainTab, setActiveMainTab] = useState('crypto');
  // Live coin data
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Caching logic ---
  const CACHE_KEY = 'market_coins';
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  const isFirstLoad = React.useRef(true);
  const lastCacheUpdate = useRef(Date.now());

  // Load from cache on mount
  useEffect(() => {
    let isMounted = true;
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Array.isArray(data) && Date.now() - timestamp < CACHE_EXPIRY) {
          setCoins(data);
          setLoading(false);
        }
      } catch {}
    }
  }, []);

  // Fetch and update coins every second, update only price and 24h change
  useEffect(() => {
    let isMounted = true;
    let intervalId;
    const fetchCoins = async () => {
      setError(null);
      try {
        const res = await fetch('https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud');
        const data = await res.json();
        if (!isMounted) return;
        let newCoins = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : [];
        setCoins(prev => {
          // If prev is empty or first load, just set
          if (!prev || prev.length === 0 || isFirstLoad.current) {
            isFirstLoad.current = false;
            return newCoins;
          }
          // Otherwise, update only price and 24h change
          return prev.map(oldCoin => {
            const fresh = newCoins.find(c => c.coin_pair === oldCoin.coin_pair);
            if (fresh) {
              return {
                ...oldCoin,
                price: fresh.price,
                price_change_24h: fresh.price_change_24h
              };
            }
            return oldCoin;
          });
        });
        // Every 5 minutes, update cache
        if (Date.now() - lastCacheUpdate.current > CACHE_EXPIRY) {
          localStorage.setItem(CACHE_KEY, JSON.stringify({ data: newCoins, timestamp: Date.now() }));
          lastCacheUpdate.current = Date.now();
        }
      } catch (err) {
        if (isMounted) setError('Failed to fetch coin data.');
      } finally {
        setLoading(false);
      }
    };
    fetchCoins();
    intervalId = setInterval(fetchCoins, 1000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  // Filter coins by search
  const filteredCoins = coins.filter(
    coin =>
      coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      coin.name?.toLowerCase().includes(search.toLowerCase())
  );

  const navigate = (url) => {
    window.location.href = url;
  };



  return (
    <div className="w-full min-h-screen bg-gray-900 text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title and Subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Markets</h1>
        <p className="text-gray-400 mb-8 text-base md:text-lg max-w-2xl">Live prices, changes, and trading actions for all major cryptocurrencies.</p>
        {/* Primary Navigation (Crypto tab only) */}
        <NavigationTabs activeTab={activeMainTab} onTabClick={setActiveMainTab} />

        {/* Search Bar */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            className="bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-4 w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500"
            placeholder="Search by symbol or name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Coin Table */}
        <div className="overflow-x-auto rounded-lg shadow-md bg-black/70">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Pair</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Price</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">24H Change</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400 animate-pulse">Loading coins...</td>
                </tr>
              )}
              {error && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-red-500">{error}</td>
                </tr>
              )}
              {!loading && !error && filteredCoins.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">No coins found.</td>
                </tr>
              )}
              {!loading && !error && filteredCoins.map((coin, idx) => (
                <tr key={coin.symbol + (coin.pair_name || '') || idx}>
                  <td className="flex items-center gap-3 py-2 px-4 min-w-0">
                    {coin.logo_path ? (
                      <img src={coin.logo_path} alt={coin.symbol} className="w-7 h-7 rounded-full bg-gray-800 object-contain shadow" onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/28/222/fff?text=?'; }} />
                    ) : (
                      <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">{coin.symbol?.slice(0, 1)}</span>
                      </div>
                    )}
                    <span className="text-white font-medium truncate max-w-[110px]">{coin.symbol && coin.pair_name ? `${coin.symbol}/${coin.pair_name}` : coin.symbol || coin.name || '-'}</span>
                  </td>
                  <td className="text-white font-medium text-right px-4">${coin.price ? parseFloat(coin.price).toLocaleString(undefined, { maximumFractionDigits: 8 }) : '-'}</td>
                  <td className="text-right px-4">
                    <span className={`text-sm font-medium ${parseFloat(coin.price_change_24h) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {parseFloat(coin.price_change_24h) >= 0 ? '+' : ''}{coin.price_change_24h ? parseFloat(coin.price_change_24h).toFixed(2) : '0.00'}%
                    </span>
                  </td>
                  <td className="text-center px-4">
                    <button
                      className="text-orange-500 text-xs font-semibold hover:text-orange-400 transition-colors px-3 py-1 rounded-full bg-white/5 border border-orange-500/20 shadow-sm mr-2"
                      onClick={() => {
  if (coin.coin_pair) {
    navigate(`/spot-trading?coin_pair_id=${coin.coin_pair}`);
  } else {
    alert('Trading pair ID not found for this coin.');
  }
}}
                    >
                      Trade
                    </button>
                    <button
                      className="text-blue-500 text-xs font-semibold hover:text-blue-400 transition-colors px-3 py-1 rounded-full bg-white/5 border border-blue-500/20 shadow-sm"
                      onClick={() => navigate('/conversion')}
                    >
                      Convert
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

};

export default Market;