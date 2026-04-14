import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

  const topCoins = coins.slice(0, 6);

  return (
    <div className="bg-[#0a0a0a] py-20 md:py-32">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex flex-col md:flex-row items-start gap-12 md:gap-20">

          {/* Left — Text */}
          <div className="flex-1 max-w-md pt-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight tracking-tight mb-5">
              Build your portfolio
            </h2>
            <p className="text-[#848E9C] text-sm md:text-base leading-relaxed mb-8">
              Take control of your financial future. Whether you're a seasoned trader or just starting out, easily trade over 500 cryptocurrencies on your terms, with low fees.
            </p>
            <Link
              to="/spot-trading"
              className="inline-flex bg-white hover:bg-gray-100 text-black px-8 py-3.5 rounded-full text-sm font-semibold transition-colors"
            >
              Buy crypto
            </Link>
          </div>

          {/* Right — 3x2 coin cards grid */}
          <div className="flex-1 w-full">
            {loading ? (
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-[#2A2A2A] mb-3" />
                    <div className="w-16 h-4 bg-[#2A2A2A] rounded mb-2" />
                    <div className="w-20 h-3 bg-[#2A2A2A] rounded mb-4" />
                    <div className="w-14 h-4 bg-[#2A2A2A] rounded" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {topCoins.map((coin, index) => {
                  const change = coin.price_change_24h != null ? parseFloat(coin.price_change_24h) : 0;
                  const isPositive = change >= 0;
                  const price = coin.price ? parseFloat(coin.price) : 0;

                  return (
                    <button
                      key={coin.coin_pair || index}
                      onClick={() => navigate(coin.coin_pair ? `/spot-trading?coin_pair_id=${coin.coin_pair}` : '/spot-trading')}
                      className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5 text-left hover:border-[#3a3a3a] transition-colors group"
                    >
                      {/* Coin icon */}
                      {coin.logo_path ? (
                        <img
                          src={coin.logo_path}
                          alt={coin.symbol}
                          className="w-10 h-10 rounded-full mb-3"
                          onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-[#2A2A2A] flex items-center justify-center mb-3">
                          <span className="text-xs font-bold text-white">{(coin.symbol || '?').slice(0, 2)}</span>
                        </div>
                      )}

                      {/* Name & price */}
                      <p className="text-white font-semibold text-sm mb-0.5">{coin.symbol || '--'}</p>
                      <p className="text-[#848E9C] text-xs mb-3">
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                      </p>

                      {/* Change */}
                      <p className={`text-base font-semibold ${isPositive ? 'text-[#2EBD85]' : 'text-[#F6465D]'}`}>
                        {isPositive ? '+' : ''}{change.toFixed(2)}%
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trading;
