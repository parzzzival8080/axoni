import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationTabs from "../components/Market/NavigationTabs";
import SecondaryTabs from "../components/Market/SecondaryTabs";
import CryptoPriceSection from "../components/Market/CryptoPriceSection";
import FaqSection from "../components/Market/FaqSection";
import { useCurrency } from "../context/CurrencyContext";
import { useIsMobile } from "../hooks/useIsMobile";
import "../components/Market/Market.css";

const Market = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useCurrency();
  const isMobile = useIsMobile();

  const [activeMarketTab, setActiveMarketTab] = useState("ALL");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  // Live coin data
  const [coins, setCoins] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // --- Caching logic ---
  const CACHE_KEY_PREFIX = "market_data";
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
  const FETCH_INTERVAL = 10 * 1000; // 10 seconds (more reasonable than 1 second)
  const isFirstLoad = useRef(true);
  const lastCacheUpdate = useRef(Date.now());
  const lastFetchRef = useRef(0);

  const fetchMarketData = useCallback(
    async (marketType, forceRefresh = false) => {
      const CACHE_KEY = `${CACHE_KEY_PREFIX}_${marketType}`;
      const now = Date.now();

      // Try to get from cache first if not forcing refresh
      if (!forceRefresh) {
        try {
          const cachedData = localStorage.getItem(CACHE_KEY);
          if (cachedData) {
            const { data, timestamp } = JSON.parse(cachedData);
            if (now - timestamp < CACHE_EXPIRY && Array.isArray(data) && data.length > 0) {
              console.log(`Using cached market data for ${marketType}`);
              setCoins(data);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error(`Error reading market cache for ${marketType}:`, e);
        }
      }

      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      let url;
      if (marketType === "ALL") {
        url = `https://api.axoni.co/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY`;
      } else {
        const apiMarketType = marketType === "POS" ? "is_spot" : "is_future";
        url = `https://api.axoni.co/api/v1/fetch-market?apikey=5lPMMw7mIuyzQQDjlKJbe0dY&pair_type=All&market_type=${apiMarketType}`;
      }

      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        let newCoins = [];
        if (Array.isArray(data)) {
          newCoins = data;
        } else if (data && Array.isArray(data.data)) {
          newCoins = data.data;
        } else {
          console.warn("Unexpected API response structure:", data);
          throw new Error("Invalid API response structure");
        }

        newCoins = newCoins.filter(
          (coin) =>
            coin &&
            coin.symbol &&
            coin.price !== undefined &&
            coin.coin_pair !== undefined,
        );

        if (newCoins.length === 0) {
          console.warn("No valid coins found in API response for", marketType);
        }

        try {
          localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data: newCoins, timestamp: now }),
          );
        } catch (e) {
          console.error(`Error saving market cache for ${marketType}:`, e);
        }

        setCoins(newCoins);
        console.log(`Fetched ${newCoins.length} coins from API for ${marketType}`);
      } catch (err) {
        console.error(`Error fetching market data for ${marketType}:`, err);
        const errorMessage = err.message || "Failed to fetch coin data. Please try again.";
        setError(errorMessage);

        if (!forceRefresh && coins.length === 0) {
          setCoins([]);
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [coins.length], // Dependency on coins.length might be removed if it causes issues
  );

  // Fetch data when tab changes or on initial load
  useEffect(() => {
    fetchMarketData(activeMarketTab);
  }, [activeMarketTab]);

  // Periodic refresh
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      fetchMarketData(activeMarketTab, true);
    }, FETCH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [activeMarketTab]);

  // Filter coins by search
  const filteredCoins = coins.filter(
    (coin) =>
      coin.symbol?.toLowerCase().includes(search.toLowerCase()) ||
      coin.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="w-full bg-[#0a0a0a] text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">

        {/* Mobile: Quick trade navigation */}
        {isMobile && (
          <>
            <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {[
                { label: "Spot", path: "/spot-trading", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/></svg> },
                { label: "Futures", path: "/future-trading", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10M12 20V4M6 20v-6"/></svg> },
                { label: "Convert", path: "/conversion", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 7h12l-4-4M16 17H4l4 4"/></svg> },
                { label: "Transfer", path: "/transfer", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 9l4-4 4 4M11 19l4 4 4-4"/><line x1="9" y1="5" x2="9" y2="16"/><line x1="15" y1="8" x2="15" y2="19"/></svg> },
                { label: "Earn", path: "/earn", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2EBD85" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
              ].map((item) => (
                <button key={item.label} onClick={() => navigate(item.path)} className="flex items-center gap-1.5 bg-[#1E1E1E] border border-[#2A2A2A] rounded-full px-3.5 py-2 flex-shrink-0 active:bg-[#252525]">
                  {item.icon}
                  <span className="text-white text-xs font-medium">{item.label}</span>
                </button>
              ))}
            </div>

            {/* Marquee price ticker */}
            <div className="overflow-hidden py-2 border-y border-[#1E1E1E]">
              <div className="flex animate-marquee gap-6 whitespace-nowrap">
                {[...coins.slice(0, 10), ...coins.slice(0, 10)].map((coin, i) => {
                  const ch = parseFloat(coin.price_change_24h || 0);
                  return (
                    <span key={i} className="inline-flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-white text-[11px] font-medium">{coin.symbol}</span>
                      <span className={`text-[11px] font-semibold ${ch >= 0 ? 'text-[#2EBD85]' : 'text-[#F6465D]'}`}>{ch >= 0 ? '+' : ''}{ch.toFixed(2)}%</span>
                    </span>
                  );
                })}
              </div>
              <style>{`
                @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
                .animate-marquee { animation: marquee 20s linear infinite; }
              `}</style>
            </div>
          </>
        )}

        {/* Title — desktop only */}
        <div className="hidden md:block">
          <h1 className="text-4xl font-bold text-white mb-2">Markets</h1>
          <p className="text-[#5E6673] mb-8 text-lg max-w-2xl">Live prices and trading pairs.</p>
        </div>

        {/* Market Type Tabs */}
        <div className="flex space-x-1 border-b border-[#1E1E1E] mb-4 md:mb-6">
          {["ALL", "POS", "POW"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveMarketTab(tab); setPage(1); }}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeMarketTab === tab
                  ? "border-b-2 border-[#2EBD85] text-white"
                  : "text-[#5E6673] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search Bar and Refresh */}
        <div className="mb-6 flex justify-between items-center">
          <input
            type="text"
            className="bg-[#1E1E1E] text-white border border-[#2A2A2A] rounded-2xl py-2 px-4 w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-[#2EBD85] placeholder-[#5E6673]"
            placeholder="Search by symbol or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <button
            onClick={() => fetchMarketData(activeMarketTab, true)}
            disabled={refreshing}
            className="ml-4 flex items-center space-x-2 px-4 py-2 bg-[#1E1E1E] hover:bg-[#252525] text-white rounded-2xl transition-colors disabled:opacity-50"
            title="Refresh market data"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>

        {/* Coin Table */}
        <div className="overflow-x-auto rounded-2xl shadow-md bg-[#1E1E1E]">
          <table className="min-w-full divide-y divide-[#1E1E1E]">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-[#5E6673] uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#5E6673] uppercase tracking-wider">
                  Last Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-[#5E6673] uppercase tracking-wider">
                  24H Change
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-[#5E6673] uppercase tracking-wider hidden sm:table-cell">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E1E1E]">
              {loading && (
                <>
                  {/* Loading skeleton rows */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="flex items-center gap-3 py-3 px-4">
                        <div className="w-7 h-7 bg-[#252525] rounded-full"></div>
                        <div className="h-4 w-20 bg-[#252525] rounded"></div>
                      </td>
                      <td className="text-right px-4">
                        <div className="h-4 w-16 bg-[#252525] rounded ml-auto"></div>
                      </td>
                      <td className="text-right px-4">
                        <div className="h-4 w-12 bg-[#252525] rounded ml-auto"></div>
                      </td>
                      <td className="text-center px-4 hidden sm:table-cell">
                        <div className="h-6 w-20 bg-[#252525] rounded mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
              {error && !loading && (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="text-red-500 text-sm">{error}</div>
                      <button
                        onClick={() => fetchMarketData(activeMarketTab, true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredCoins.length === 0 &&
                coins.length > 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#5E6673]">
                      No coins match your search "{search}".
                    </td>
                  </tr>
                )}
              {!loading && !error && coins.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#5E6673]">
                    No market data available.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredCoins.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((coin, idx) => (
                  <tr
                    key={coin.symbol + (coin.pair_name || "") || idx}
                    className="cursor-pointer sm:cursor-default"
                    onClick={() => {
                      if (window.innerWidth < 640 && coin.coin_pair) {
                        const tradePath = activeMarketTab === "POW" ? "/future-trading" : "/spot-trading";
                        navigate(`${tradePath}?coin_pair_id=${coin.coin_pair}`);
                      }
                    }}
                  >
                    <td className="flex items-center gap-3 py-2 px-2 sm:px-4 min-w-0">
                      {coin.logo_path ? (
                        <img
                          src={coin.logo_path}
                          alt={coin.symbol}
                          className="w-7 h-7 rounded-full bg-[#1E1E1E] object-contain shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 bg-[#252525] rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {coin.symbol?.slice(0, 1)}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-white font-medium text-sm">
                          {coin.symbol || coin.name || "-"}
                        </span>
                        {coin.pair_name && (
                          <span className="text-[#5E6673] text-xs">
                            /{coin.pair_name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="text-white font-medium text-right px-4">
                      {coin.price
                        ? formatCurrency(parseFloat(coin.price), "USD", true)
                        : "-"}
                    </td>
                    <td className="text-right px-4">
                      <span
                        className={`text-sm font-medium ${parseFloat(coin.price_change_24h) >= 0 ? "text-green-500" : "text-red-500"}`}
                      >
                        {parseFloat(coin.price_change_24h) >= 0 ? "+" : ""}
                        {coin.price_change_24h
                          ? parseFloat(coin.price_change_24h).toFixed(2)
                          : "0.00"}
                        %
                      </span>
                    </td>
                    <td className="text-center px-4 hidden sm:table-cell">
                      <button
                        className="text-[#2EBD85] text-xs font-semibold hover:text-[#2EBD85] transition-colors px-3 py-1 rounded-full bg-white/5 border border-[#2EBD85]/20 shadow-sm mr-2"
                        onClick={() => {
                          if (coin.coin_pair) {
                            const params = new URLSearchParams(location.search);
                            params.set("coin_pair_id", coin.coin_pair);

                            let tradePath = "/spot-trading";
                            if (activeMarketTab === "POW") {
                              tradePath = "/future-trading";
                            }

                            navigate(`${tradePath}?${params.toString()}`);
                          } else {
                            alert("Trading pair ID not found for this coin.");
                          }
                        }}
                      >
                        Trade
                      </button>
                      <button
                        className="text-[#2EBD85] text-xs font-semibold hover:text-[#2EBD85] transition-colors px-3 py-1 rounded-full bg-white/5 border border-[#2EBD85]/20 shadow-sm"
                        onClick={() => navigate("/conversion")}
                      >
                        Convert
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredCoins.length > PAGE_SIZE && (() => {
          const totalPages = Math.ceil(filteredCoins.length / PAGE_SIZE);
          return (
            <div className="flex items-center justify-center gap-1.5 mt-5">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] text-white disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <span className="text-xs text-[#848E9C] px-3">
                <span className="text-white font-semibold">{page}</span> / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 text-xs font-medium rounded-lg bg-[#1E1E1E] border border-[#2A2A2A] text-white disabled:opacity-20 disabled:cursor-not-allowed"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default Market;
