import React, { useState, useEffect } from "react";
import "./Assets.css";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../context/CurrencyContext";
import { useIsMobile } from "../hooks/useIsMobile";
import OverviewTab from "../components/assets/OverviewTab";
import FundingTab from "../components/assets/FundingTab";
import TradingTab from "../components/assets/TradingTab";

export default function Assets() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("trading");
  const [searchTerm, setSearchTerm] = useState("");
  const [showZeroBalance, setShowZeroBalance] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0,
  });
  const { selectedCurrency, formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);
        const uid = localStorage.getItem("uid") || localStorage.getItem("user_id");
        if (!uid) { setError("User ID not found."); setLoading(false); return; }

        const apiKey = "5lPMMw7mIuyzQQDjlKJbe0dY";
        const response = await axios.get(`https://api.axoni.co/api/v1/user-wallets/${uid}?apikey=${apiKey}`);

        if (response.data && response.data["0"]) {
          const formattedCoins = response.data["0"].map((coin) => {
            const price = parseFloat(coin.price) || 0;
            const spotWallet = parseFloat(coin.spot_wallet) || 0;
            const futureWallet = parseFloat(coin.future_wallet) || 0;
            const fundingWallet = parseFloat(coin.funding_wallet) || 0;
            return {
              id: coin.coin_id, symbol: coin.crypto_symbol, name: coin.crypto_name,
              logo: coin.logo_path, price, balance: spotWallet, value: price * spotWallet,
              raw_balance: spotWallet, raw_value: price * spotWallet,
              future_wallet: futureWallet, funding_wallet: fundingWallet,
              formatted_price: price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
              formatted_balance: spotWallet.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 }),
              formatted_value: (price * spotWallet).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            };
          });
          setCoins(formattedCoins);
          if (response.data.overview !== undefined) {
            setOverviewData({
              overview: parseFloat(response.data.overview) || 0,
              spot_wallet: parseFloat(response.data.spot_wallet) || 0,
              future_wallet: parseFloat(response.data.future_wallet) || 0,
              funding_wallet: parseFloat(response.data.funding_wallet) || 0,
            });
          }
        } else { setCoins([]); }
      } catch (err) {
        setError("Failed to load wallet data.");
        setCoins([]);
      } finally { setLoading(false); }
    };
    fetchWalletData();
  }, [selectedCurrency]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview": return <OverviewTab />;
      case "funding": return <FundingTab />;
      case "trading": return (
        <TradingTab coins={coins} searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          showZeroBalance={showZeroBalance} setShowZeroBalance={setShowZeroBalance}
          page={page} setPage={setPage} loading={loading} error={error} overviewData={overviewData} />
      );
      default: return null;
    }
  };

  // Mobile Assets Screen
  if (isMobile) {
    return (
      <div className="bg-[#0a0a0a] text-white pb-20">
        {/* Balance Card */}
        <div className="px-4 pt-2 pb-4">
          <div className="mb-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#5E6673] text-xs">Total Balance</span>
              <button onClick={() => setShowBalance(!showBalance)} className="text-[#5E6673]">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showBalance ? (
                    <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                  ) : (
                    <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>
                  )}
                </svg>
              </button>
            </div>
            <h2 className="text-2xl font-bold">
              {showBalance ? (loading ? "..." : formatCurrency(overviewData.overview)) : "****"}
            </h2>
          </div>

          {showBalance && !loading && (
            <div className="flex gap-4 mt-1">
              <span className="text-[10px] text-[#5E6673]">Spot: {formatCurrency(overviewData.spot_wallet)}</span>
              <span className="text-[10px] text-[#5E6673]">Futures: {formatCurrency(overviewData.future_wallet)}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mt-4">
            <button onClick={() => navigate('/deposit')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Deposit</span>
            </button>
            <button onClick={() => navigate('/withdraw')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Withdraw</span>
            </button>
            <button onClick={() => navigate('/transfer')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Transfer</span>
            </button>
            <button onClick={() => navigate('/spot-trading')} className="flex flex-col items-center gap-1.5 py-3 bg-[#1E1E1E] rounded-xl">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
              <span className="text-[10px] text-[#848E9C]">Trade</span>
            </button>
          </div>
        </div>

        {/* Coin List */}
        <div className="px-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">Your Assets</h3>
            <button
              onClick={() => setShowZeroBalance(!showZeroBalance)}
              className={`text-[10px] px-2.5 py-1 rounded-md transition-colors ${
                !showZeroBalance ? 'bg-[#2EBD85]/15 text-[#2EBD85]' : 'text-[#5E6673] bg-[#1E1E1E]'
              }`}
            >
              {showZeroBalance ? 'Hide zero' : 'Show all'}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#2EBD85] border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-[#5E6673] text-sm">{error}</div>
          ) : (
            <div className="space-y-0.5">
              {coins
                .filter(c => showZeroBalance || c.raw_balance > 0)
                .filter(c => !searchTerm || c.symbol.toLowerCase().includes(searchTerm.toLowerCase()) || c.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((coin) => (
                <button
                  key={coin.symbol}
                  onClick={() => navigate(`/spot-trading?coin_pair_id=${coin.id}`)}
                  className="flex items-center justify-between w-full py-3 px-1 active:bg-[#1E1E1E] rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {coin.logo ? (
                      <img src={coin.logo} alt={coin.symbol} className="w-9 h-9 rounded-full" />
                    ) : (
                      <div className="w-9 h-9 bg-[#1E1E1E] rounded-full flex items-center justify-center text-xs font-bold text-white">
                        {coin.symbol.charAt(0)}
                      </div>
                    )}
                    <div className="text-left">
                      <p className="text-sm font-medium">{coin.symbol}</p>
                      <p className="text-[10px] text-[#5E6673]">{coin.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {coin.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                    </p>
                    <p className="text-[10px] text-[#5E6673]">
                      {formatCurrency(coin.value)}
                    </p>
                  </div>
                </button>
              ))}
              {coins.filter(c => showZeroBalance || c.raw_balance > 0).length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#5E6673] text-sm mb-3">No assets yet</p>
                  <button onClick={() => navigate('/deposit')} className="px-5 py-2.5 bg-[#2EBD85] text-white rounded-lg text-sm font-medium">
                    Deposit
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop layout
  return (
    <div className="assets-container">
      <div className="assets-header">
        <div className="header-tabs">
          <div className={activeTab === "overview" ? "header-tab active" : "header-tab"} onClick={() => setActiveTab("overview")}>Overview</div>
          <div className={activeTab === "trading" ? "header-tab active" : "header-tab"} onClick={() => setActiveTab("trading")}>Trading</div>
        </div>
      </div>
      <div className="assets-content">{renderTabContent()}</div>
    </div>
  );
}
