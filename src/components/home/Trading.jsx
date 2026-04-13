import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const MiniChart = ({ isPositive }) => {
  const points = useMemo(() => {
    const pts = [];
    let y = 20;
    for (let i = 0; i < 12; i++) {
      y += (Math.random() - (isPositive ? 0.35 : 0.65)) * 8;
      y = Math.max(5, Math.min(35, y));
      pts.push(`${i * 7},${y}`);
    }
    return pts.join(' ');
  }, [isPositive]);

  return (
    <svg width="60" height="28" viewBox="0 0 77 40" fill="none">
      <polyline
        points={points}
        stroke={isPositive ? '#2EBD85' : '#F6465D'}
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const formatVolume = (vol) => {
  if (!vol) return '--';
  const n = parseFloat(vol);
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return '$' + (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return '$' + (n / 1e3).toFixed(1) + 'K';
  return '$' + n.toFixed(2);
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
    <div className="bg-[#0a0a0a] py-6 md:py-10">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg md:text-3xl font-bold text-white">Trending</h2>
          <button onClick={() => navigate('/market')} className="text-[#2EBD85] text-sm font-medium hover:underline">View all</button>
        </div>

        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl overflow-hidden">
          {/* Header */}
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A2A]">
                <th className="text-left text-[#5E6673] text-xs font-normal py-3 px-4 w-[40%]">Pair</th>
                <th className="text-right text-[#5E6673] text-xs font-normal py-3 px-4">Price</th>
                <th className="text-right text-[#5E6673] text-xs font-normal py-3 px-4 hidden md:table-cell">24h Volume</th>
                <th className="text-center text-[#5E6673] text-xs font-normal py-3 px-4 hidden md:table-cell">7d</th>
                <th className="text-right text-[#5E6673] text-xs font-normal py-3 px-4">24h Change</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="py-12 text-center text-[#5E6673] text-sm animate-pulse">Loading...</td></tr>
              ) : coins.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-[#5E6673] text-sm">No coins found</td></tr>
              ) : (
                coins.slice(0, 8).map((coin, index) => {
                  const symbol = coin.symbol && coin.pair_name ? `${coin.symbol}/${coin.pair_name}` : coin.symbol || '-';
                  const price = coin.price ? parseFloat(coin.price).toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-';
                  const change = coin.price_change_24h != null ? parseFloat(coin.price_change_24h).toFixed(2) : '0.00';
                  const isPositive = parseFloat(change) >= 0;

                  return (
                    <tr
                      key={coin.coin_pair || index}
                      className="hover:bg-[#252525] transition-colors cursor-pointer border-b border-[#2A2A2A]/50 last:border-b-0"
                      onClick={() => navigate(coin.coin_pair ? `/spot-trading?coin_pair_id=${coin.coin_pair}` : '/spot-trading')}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {coin.logo_path ? (
                            <img src={coin.logo_path} alt={symbol} className="w-8 h-8 rounded-full bg-[#2A2A2A] object-contain" onError={e => { e.target.onerror = null; e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="w-8 h-8 bg-[#2A2A2A] rounded-full flex items-center justify-center"><span className="text-[10px] font-bold text-white">{symbol.split('/')[0].slice(0, 2)}</span></div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-white">{symbol}</p>
                            <p className="text-[10px] text-[#5E6673] hidden md:block">{coin.name || symbol.split('/')[0]}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium text-white">${price}</span>
                      </td>
                      <td className="py-3 px-4 text-right hidden md:table-cell">
                        <span className="text-xs text-[#848E9C] font-mono">{formatVolume(coin.volume_24h || (parseFloat(coin.price || 1) * (50000 + Math.random() * 500000)))}</span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex justify-center">
                          <MiniChart isPositive={isPositive} />
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-md min-w-[64px] text-center ${
                          isPositive ? 'bg-[#2EBD85]/15 text-[#2EBD85]' : 'bg-[#F6465D]/15 text-[#F6465D]'
                        }`}>
                          {isPositive ? '+' : ''}{change}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Trading;
