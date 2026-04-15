import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, TrendingUp } from "lucide-react";
import { useCurrency } from "../../context/CurrencyContext";
import { PROMO_BANNERS } from "./banners";
import axios from "axios";

const MobileHomeScreen = () => {
  const navigate = useNavigate();
  const { formatCurrency, selectedCurrency } = useCurrency();
  const [showBalance, setShowBalance] = useState(true);
  const [walletData, setWalletData] = useState({ overview: 0, spot_wallet: 0, future_wallet: 0, funding_wallet: 0 });
  const [loading, setLoading] = useState(true);
  const [topCoins, setTopCoins] = useState([]);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef(null);

  // Auto-rotate banners
  useEffect(() => {
    if (PROMO_BANNERS.length <= 1) return;
    const timer = setInterval(() => {
      setActiveBanner((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Fetch wallet balance (same API as OverviewTab)
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) { setLoading(false); return; }
        const apiKey = "5lPMMw7mIuyzQQDjlKJbe0dY";
        const res = await axios.get(
          `https://api.axoni.co/api/v1/user-wallets/${uid}?apikey=${apiKey}`,
          { timeout: 10000 }
        );
        if (res.data) {
          setWalletData({
            overview: res.data.overview || 0,
            spot_wallet: res.data.spot_wallet || 0,
            future_wallet: res.data.future_wallet || 0,
            funding_wallet: res.data.funding_wallet || 0,
          });
        }
      } catch (err) {
        console.warn("Balance fetch failed:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchBalance();
  }, [selectedCurrency]);

  // Fetch top coins
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const res = await axios.get("https://api.axoni.co/api/v1/coins?limit=5&apikey=5lPMMw7mIuyzQQDjlKJbe0dY", { timeout: 10000 });
        if (res.data && Array.isArray(res.data)) {
          setTopCoins(res.data.slice(0, 5));
        }
      } catch (err) {
        console.warn("Coins fetch failed:", err.message);
      }
    };
    fetchCoins();
  }, []);

  // Generate realistic volume based on coin price
  const fakeVol = (price) => {
    const p = parseFloat(price || 1);
    if (p > 50000) return (1.2 + Math.random() * 2.8).toFixed(2) + "B";
    if (p > 1000) return (100 + Math.random() * 900).toFixed(1) + "M";
    if (p > 10) return (10 + Math.random() * 90).toFixed(1) + "M";
    if (p > 0.1) return (1 + Math.random() * 20).toFixed(1) + "M";
    return (100 + Math.random() * 900).toFixed(0) + "K";
  };

  const formatPrice = (price) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "0.00";
    if (num >= 1000) return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (num >= 1) return num.toFixed(2);
    return num.toFixed(6);
  };

  const formatChange = (change) => {
    const num = parseFloat(change);
    if (isNaN(num)) return { text: "0.00%", color: "text-[#5E6673]", bg: "bg-[#2A2A2A]" };
    const sign = num >= 0 ? "+" : "";
    const color = num >= 0 ? "text-green-400" : "text-red-400";
    const bg = num >= 0 ? "bg-green-500/20" : "bg-red-500/20";
    return { text: `${sign}${num.toFixed(2)}%`, color, bg };
  };


  return (
    <div className="bg-[#0a0a0a] text-white">

      {/* === Portfolio Section === */}
      <div className="px-4 pt-1 pb-3">
        <p className="text-[#5E6673] text-xs mb-1">Est total value</p>
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-bold">
            {showBalance
              ? loading ? "..." : formatCurrency(walletData.overview)
              : "****"
            }
          </h2>
          <button onClick={() => setShowBalance(!showBalance)} className="text-[#5E6673]">
            {showBalance ? <Eye size={18} /> : <EyeOff size={18} />}
          </button>
        </div>
        {showBalance && !loading && (
          <div className="flex items-center gap-4 mt-1">
            <span className="text-xs text-[#5E6673]">Spot: {formatCurrency(walletData.spot_wallet)}</span>
            <span className="text-xs text-[#5E6673]">Futures: {formatCurrency(walletData.future_wallet)}</span>
          </div>
        )}
      </div>

      {/* === Quick Action Buttons === */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-3">
        <Link
          to="/deposit"
          className="flex items-center justify-center gap-2 bg-[#2EBD85] text-white py-3 rounded-lg font-semibold text-sm"
        >
          Deposit crypto
        </Link>
        <Link
          to="/spot-trading"
          className="flex items-center justify-center gap-2 bg-[#1E1E1E] text-white py-3 rounded-lg font-semibold text-sm"
        >
          Start trading
        </Link>
      </div>

      {/* === Action Grid === */}
      <div className="px-4 pb-2 grid grid-cols-4 gap-2">
        <button onClick={() => navigate("/deposit")} className="flex flex-col items-center gap-1.5 py-2">
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
            <ArrowDownToLine size={18} className="text-[#2EBD85]" />
          </div>
          <span className="text-[11px] text-[#848E9C]">Deposit</span>
        </button>
        <button onClick={() => navigate("/withdraw")} className="flex flex-col items-center gap-1.5 py-2">
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
            <ArrowUpFromLine size={18} className="text-[#2EBD85]" />
          </div>
          <span className="text-[11px] text-[#848E9C]">Withdraw</span>
        </button>
        <button onClick={() => navigate("/conversion")} className="flex flex-col items-center gap-1.5 py-2">
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
            <ArrowLeftRight size={18} className="text-[#2EBD85]" />
          </div>
          <span className="text-[11px] text-[#848E9C]">Convert</span>
        </button>
        <button onClick={() => navigate("/earn")} className="flex flex-col items-center gap-1.5 py-2">
          <div className="w-10 h-10 rounded-full bg-[#1E1E1E] flex items-center justify-center">
            <TrendingUp size={18} className="text-[#2EBD85]" />
          </div>
          <span className="text-[11px] text-[#848E9C]">Earn</span>
        </button>
      </div>

      {/* === Promo Banner Carousel === */}
      {PROMO_BANNERS.length > 0 && (
        <div className="px-4 pb-4">
          <div className="relative overflow-hidden rounded-xl">
            {PROMO_BANNERS.map((banner, index) => (
              <div
                key={banner.id}
                onClick={() => navigate(banner.link)}
                className={`transition-all duration-500 ease-in-out ${
                  index === activeBanner ? "block" : "hidden"
                }`}
              >
                <div className={`bg-gradient-to-r ${banner.bgGradient} p-4 rounded-xl cursor-pointer`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{banner.emoji}</span>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-white mb-1">{banner.title}</h4>
                      <p className="text-xs text-[#848E9C] leading-relaxed">{banner.subtitle}</p>
                    </div>
                    <span className="text-xs text-[#5E6673] whitespace-nowrap">{index + 1}/{PROMO_BANNERS.length}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Dots indicator */}
          <div className="flex items-center justify-center gap-1.5 mt-2">
            {PROMO_BANNERS.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveBanner(index)}
                className={`rounded-full transition-all ${
                  index === activeBanner ? "w-4 h-1.5 bg-[#2EBD85]" : "w-1.5 h-1.5 bg-[#3A3A3A]"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* === Markets Section === */}
      <div className="px-4 pt-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold">Markets</h3>
          <button onClick={() => navigate("/market")} className="text-xs text-[#5E6673]">
            See all &gt;
          </button>
        </div>

        <div className="space-y-1">
          {topCoins.length > 0 ? topCoins.map((coin, i) => {
            const change = formatChange(coin.price_change_24h || 0);
            return (
              <button
                key={coin.coin_pair || i}
                onClick={() => navigate(`/spot-trading?coin_pair_id=${coin.coin_pair}`)}
                className="flex items-center justify-between w-full py-3 px-1"
              >
                <div className="flex items-center gap-3">
                  {coin.logo_path ? (
                    <img src={coin.logo_path} alt={coin.symbol} className="w-9 h-9 rounded-full bg-[#1E1E1E]" onError={e => { e.target.style.display = 'none'; }} />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1E1E1E] flex items-center justify-center text-xs font-bold text-white">
                      {(coin.symbol || "?").substring(0, 3)}
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-sm font-medium text-white">
                      {coin.symbol} <span className="text-[#5E6673]">/ {coin.pair_name || 'USDT'}</span>
                    </p>
                    <p className="text-xs text-[#5E6673]">
                      Vol ${fakeVol(coin.price)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-sm font-medium text-white text-right">
                    {formatPrice(coin.price)}
                  </p>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded ${change.bg} ${change.color}`}>
                    {change.text}
                  </span>
                </div>
              </button>
            );
          }) : (
            <div className="py-8 text-center text-[#5E6673] text-sm">Loading markets...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileHomeScreen;
