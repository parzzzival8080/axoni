import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TrendingCoin = ({ symbol, price, change, logo, coinPair }) => {
  const navigate = useNavigate();
  const isPositive = parseFloat(change) >= 0;

  return (
    <button
      onClick={() => navigate(coinPair ? `/spot-trading?coin_pair_id=${coinPair}` : '/spot-trading')}
      className="flex items-center justify-between w-full py-3 px-3 rounded-xl hover:bg-[#1E1E1E] transition-colors"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {logo ? (
          <img
            src={logo}
            alt={symbol}
            className="w-9 h-9 rounded-full bg-[#1E1E1E] object-contain"
            onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="w-9 h-9 bg-[#1E1E1E] rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-white">
              {symbol.split('/')[0].slice(0, 2)}
            </span>
          </div>
        )}
        <div className="text-left min-w-0">
          <p className="text-sm font-semibold text-white truncate">{symbol}</p>
        </div>
      </div>
      <div className="text-right mr-4">
        <p className="text-sm font-medium text-white">${price}</p>
      </div>
      <div className={`text-xs font-semibold px-2.5 py-1 rounded-md min-w-[68px] text-center ${
        isPositive ? 'bg-[#2EBD85]/15 text-[#2EBD85]' : 'bg-[#F6465D]/15 text-[#F6465D]'
      }`}>
        {isPositive ? '+' : ''}{change}%
      </div>
    </button>
  );
};

const Trading = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchCoins = async () => {
      try {
        const res = await fetch('https://api.axoni.co/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY');
        const data = await res.json();
        if (!isMounted) return;
        setCoins(Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : []);
      } catch {
        if (isMounted) setCoins([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchCoins();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="bg-[#121212] py-10 md:py-16">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-3xl font-bold text-white">
            Trending
          </h2>
          <button
            onClick={() => navigate('/market')}
            className="text-[#2EBD85] text-sm font-medium"
          >
            View all
          </button>
        </div>

        {/* Coin List */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden">
          {/* Table Header — desktop */}
          <div className="hidden md:flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
            <span className="text-[#5E6673] text-xs flex-1">Pair</span>
            <span className="text-[#5E6673] text-xs w-32 text-right">Price</span>
            <span className="text-[#5E6673] text-xs w-20 text-right">24h Change</span>
          </div>

          <div className="divide-y divide-[#2A2A2A] md:divide-y-0">
            {loading ? (
              <div className="py-12 text-center text-[#5E6673] text-sm animate-pulse">Loading...</div>
            ) : coins.length === 0 ? (
              <div className="py-12 text-center text-[#5E6673] text-sm">No coins found</div>
            ) : (
              coins.slice(0, 8).map((coin, index) => (
                <TrendingCoin
                  key={coin.coin_pair || index}
                  symbol={coin.symbol && coin.pair_name ? `${coin.symbol}/${coin.pair_name}` : coin.symbol || '-'}
                  price={coin.price ? parseFloat(coin.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-'}
                  change={coin.price_change_24h != null ? parseFloat(coin.price_change_24h).toFixed(2) : '0.00'}
                  logo={coin.logo_path}
                  coinPair={coin.coin_pair}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
