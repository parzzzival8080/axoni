import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

const announcements = [
  {
    id: 1,
    title: "GLD Now Supports 50+ Trading Pairs",
    subtitle: "New altcoin pairs with deeper liquidity",
    bgGradient: "from-[#0d2818] to-[#1E1E1E]",
    link: "/help/category/announcements",
  },
  {
    id: 2,
    title: "Simple Earn: Up to 12% APY",
    subtitle: "Stake USDT & USDC with no lock-up",
    bgGradient: "from-[#1a0d2e] to-[#1E1E1E]",
    link: "/earn",
  },
  {
    id: 3,
    title: "Futures Trading is Live",
    subtitle: "Up to 100x leverage on BTC, ETH & more",
    bgGradient: "from-[#0d1a2e] to-[#1E1E1E]",
    link: "/future-trading",
  },
  {
    id: 4,
    title: "Proof of Reserves Published",
    subtitle: "All funds backed 1:1 — verify on-chain",
    bgGradient: "from-[#2e1a0d] to-[#1E1E1E]",
    link: "/help/category/announcements",
  },
];

const AnnouncementSlider = ({ navigate }) => {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((p) => (p + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="px-4 pb-4">
      <div
        className={`bg-gradient-to-r ${announcements[active].bgGradient} rounded-xl p-4 cursor-pointer active:opacity-80 transition-opacity`}
        onClick={() => navigate(announcements[active].link)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#2EBD85]/15 flex items-center justify-center flex-shrink-0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold truncate">{announcements[active].title}</p>
            <p className="text-[#848E9C] text-xs truncate">{announcements[active].subtitle}</p>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5E6673" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </div>
      </div>
      {/* Dots */}
      <div className="flex items-center justify-center gap-1 mt-2">
        {announcements.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={`rounded-full transition-all ${
              i === active ? "w-4 h-1 bg-[#2EBD85]" : "w-1 h-1 bg-[#2A2A2A]"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

const MobileGuestHome = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [activeTab, setActiveTab] = useState("hot");

  useEffect(() => {
    fetch("https://api.axoni.co/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY")
      .then((r) => r.json())
      .then((data) => setCoins(Array.isArray(data) ? data : data.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[#0a0a0a] text-white pb-20">
      {/* Login / Sign up card */}
      <div className="px-4 pt-2 pb-4">
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-1">Welcome to GLD</h2>
          <p className="text-[#848E9C] text-xs mb-4">
            Sign up or log in to start trading 50+ crypto pairs with low fees.
          </p>
          <div className="flex gap-3">
            <Link
              to="/signup"
              className="flex-1 bg-[#2EBD85] text-white text-center py-2.5 rounded-lg text-sm font-semibold"
            >
              Sign up
            </Link>
            <Link
              to="/login"
              className="flex-1 bg-[#2A2A2A] text-white text-center py-2.5 rounded-lg text-sm font-medium"
            >
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-3 grid grid-cols-4 gap-2">
        {[
          { label: "Deposit", path: "/deposit", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
          )},
          { label: "Trade", path: "/spot-trading", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
          )},
          { label: "Futures", path: "/future-trading", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg>
          )},
          { label: "Earn", path: "/earn", icon: (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8l-8 8M8 8h8v8"/></svg>
          )},
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-1.5 py-3"
          >
            <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
              {item.icon}
            </div>
            <span className="text-[10px] text-[#848E9C]">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Announcement slider */}
      <AnnouncementSlider navigate={navigate} />

      {/* Markets section */}
      <div className="px-4">
        {/* Tabs */}
        <div className="flex items-center gap-5 mb-3 border-b border-[#1E1E1E]">
          {["hot", "new", "gainers"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-white border-b-2 border-[#2EBD85]"
                  : "text-[#5E6673]"
              }`}
            >
              {tab === "hot" ? "🔥 Hot" : tab === "new" ? "New" : "Gainers"}
            </button>
          ))}
          <button
            onClick={() => navigate("/market")}
            className="ml-auto text-[#2EBD85] text-xs"
          >
            More &rsaquo;
          </button>
        </div>

        {/* Table header */}
        <div className="flex items-center px-1 py-2 text-[10px] text-[#5E6673] uppercase">
          <span className="flex-1">Name</span>
          <span className="w-24 text-right">Last Price</span>
          <span className="w-20 text-right">24h</span>
        </div>

        {/* Coin list */}
        {coins.length === 0 ? (
          <div className="py-8 text-center text-[#5E6673] text-sm animate-pulse">
            Loading...
          </div>
        ) : (
          coins.slice(0, 10).map((coin, i) => {
            const change = parseFloat(coin.price_change_24h || 0);
            const isPos = change >= 0;
            const price = parseFloat(coin.price || 0);

            return (
              <button
                key={coin.coin_pair || i}
                onClick={() =>
                  navigate(
                    coin.coin_pair
                      ? `/spot-trading?coin_pair_id=${coin.coin_pair}`
                      : "/spot-trading"
                  )
                }
                className="flex items-center w-full py-3 px-1 active:bg-[#1E1E1E] transition-colors"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {coin.logo_path ? (
                    <img
                      src={coin.logo_path}
                      alt={coin.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2A2A2A] flex items-center justify-center text-[10px] font-bold">
                      {(coin.symbol || "?").slice(0, 2)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-semibold">
                      {coin.symbol}
                      <span className="text-[#5E6673] font-normal">
                        /USDT
                      </span>
                    </p>
                  </div>
                </div>
                <span className="w-24 text-right text-sm font-medium font-mono">
                  $
                  {price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: price < 1 ? 6 : 2,
                  })}
                </span>
                <span
                  className={`w-20 text-right text-xs font-semibold ${
                    isPos ? "text-[#2EBD85]" : "text-[#F6465D]"
                  }`}
                >
                  {isPos ? "+" : ""}
                  {change.toFixed(2)}%
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* News headlines */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">News</h3>
          <button
            onClick={() => navigate("/help/category/announcements")}
            className="text-xs text-[#2EBD85]"
          >
            More &rsaquo;
          </button>
        </div>
        <div className="space-y-3">
          {[
            "GLD Now Supports 50+ Trading Pairs",
            "Proof of Reserves: April 2026 Audit",
            "Simple Earn: Up to 12% APY on Stablecoins",
          ].map((headline, i) => (
            <p
              key={i}
              className="text-[#848E9C] text-sm py-2 border-b border-[#1E1E1E] last:border-b-0"
            >
              {headline}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MobileGuestHome;
