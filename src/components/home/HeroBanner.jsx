import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { heroBanners } from "../../config/homepageImages";

const AUTO_PLAY_INTERVAL = 6000;

const HeroMarketCard = () => {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    fetch('https://api.axoni.co/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY')
      .then(r => r.json())
      .then(data => {
        if (!mounted) return;
        setCoins(Array.isArray(data) ? data.slice(0, 5) : Array.isArray(data.data) ? data.data.slice(0, 5) : []);
      })
      .catch(() => {})
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  return (
    <div className="hidden lg:block flex-1 max-w-[480px]">
      {/* Hot coins card */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-6 px-5 pt-5 pb-3">
          <span className="text-white font-bold text-base">Hot</span>
          <span className="text-[#5E6673] text-sm cursor-pointer hover:text-white transition-colors">New listing</span>
          <span className="text-[#2EBD85] text-xs ml-auto cursor-pointer hover:underline" onClick={() => navigate('/market')}>View 50+ cryptos &rsaquo;</span>
        </div>

        {/* Table header */}
        <div className="flex items-center px-5 py-2 text-[10px] text-[#5E6673] uppercase tracking-wider">
          <span className="flex-1">Name</span>
          <span className="w-24 text-right">Last Price</span>
          <span className="w-20 text-right">Change</span>
        </div>

        {/* Coin rows */}
        <div>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center px-5 py-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-[#2A2A2A] mr-3" />
                <div className="w-12 h-4 bg-[#2A2A2A] rounded" />
                <div className="w-16 h-4 bg-[#2A2A2A] rounded ml-auto" />
              </div>
            ))
          ) : (
            coins.map((coin, i) => {
              const change = parseFloat(coin.price_change_24h || 0);
              const isPos = change >= 0;
              return (
                <div
                  key={coin.coin_pair || i}
                  className="flex items-center px-5 py-3 hover:bg-white/[0.03] cursor-pointer transition-colors"
                  onClick={() => navigate(coin.coin_pair ? `/spot-trading?coin_pair_id=${coin.coin_pair}` : '/spot-trading')}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {coin.logo_path ? (
                      <img src={coin.logo_path} alt={coin.symbol} className="w-8 h-8 rounded-full" onError={e => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[10px] font-bold text-white">{(coin.symbol || '?').slice(0, 2)}</div>
                    )}
                    <span className="text-white font-semibold text-sm">{coin.symbol}</span>
                  </div>
                  <span className="w-24 text-right text-white text-sm font-medium font-mono">
                    {parseFloat(coin.price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`w-20 text-right text-sm font-semibold ${isPos ? 'text-[#2EBD85]' : 'text-[#F6465D]'}`}>
                    {isPos ? '+' : ''}{change.toFixed(2)}%
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* News card */}
      <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl mt-4 p-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-white font-bold text-base">News</span>
          <span className="text-[#2EBD85] text-xs cursor-pointer hover:underline" onClick={() => navigate('/help/category/announcements')}>More &rsaquo;</span>
        </div>
        <div className="space-y-3">
          {[
            "GLD Now Supports 50+ Trading Pairs",
            "Proof of Reserves: April 2026 Audit Published",
            "Simple Earn: Up to 12% APY on Stablecoins",
            "New: Perpetual Futures for SOL, ADA, DOT",
          ].map((headline, i) => (
            <p key={i} className="text-[#848E9C] text-sm leading-snug hover:text-white cursor-pointer transition-colors truncate">
              {headline}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

const HeroBanner = ({ isLoggedIn = false }) => {
  const [current, setCurrent] = useState(0);
  const banners = heroBanners;

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, AUTO_PLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (!banners.length) return null;
  const banner = banners[current];

  return (
    <div className="bg-[#0a0a0a]">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-24 pt-12 md:pt-20 pb-10 md:pb-16">
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">

          {/* Left — Big bold text */}
          <div className="flex-1 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl md:text-[52px] lg:text-[64px] font-bold text-white leading-[1.08] tracking-tight mb-6">
              {banner.title}
            </h1>
            <p className="text-[#848E9C] text-base md:text-lg leading-relaxed mb-8 max-w-md">
              {banner.subtitle}
            </p>

            {/* Buttons */}
            {!isLoggedIn ? (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Link
                  to="/signup"
                  className="bg-white hover:bg-gray-100 text-black px-7 py-3.5 rounded-full text-sm font-semibold transition-colors"
                >
                  Sign up
                </Link>
                <Link
                  to="/download"
                  className="bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] text-white px-7 py-3.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                  Download app
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Link to={banner.link} className="bg-white hover:bg-gray-100 text-black px-7 py-3.5 rounded-full text-sm font-semibold transition-colors">
                  {banner.cta}
                </Link>
                <Link to="/my-assets" className="bg-[#1E1E1E] hover:bg-[#252525] border border-[#2A2A2A] text-white px-7 py-3.5 rounded-full text-sm font-medium transition-colors">
                  View Assets
                </Link>
              </div>
            )}

            {/* Carousel dots */}
            {banners.length > 1 && (
              <div className="flex items-center gap-1.5 mb-10">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`rounded-full transition-all duration-300 ${
                      i === current ? "w-6 h-1.5 bg-[#2EBD85]" : "w-1.5 h-1.5 bg-[#2A2A2A] hover:bg-[#3a3a3a]"
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Trust logos / partners */}
            <div className="flex items-center gap-8 opacity-40">
              <span className="text-white text-xs font-bold tracking-widest uppercase">Trusted by</span>
              <span className="text-white text-sm font-bold">CoinGecko</span>
              <span className="text-white text-sm font-bold">CoinMarketCap</span>
              <span className="text-white text-sm font-bold hidden sm:block">DeFiLlama</span>
            </div>
          </div>

          {/* Right — Live market card */}
          <HeroMarketCard />
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
