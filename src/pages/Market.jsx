import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavigationTabs from "../components/Market/NavigationTabs";
import SecondaryTabs from "../components/Market/SecondaryTabs";
import CryptoPriceSection from "../components/Market/CryptoPriceSection";
import FaqSection from "../components/Market/FaqSection";
import { useCurrency } from "../context/CurrencyContext";
import "../components/Market/Market.css";

const Market = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { formatCurrency } = useCurrency();

  const [activeMarketTab, setActiveMarketTab] = useState("ALL"); // Crypto, Spot, Future
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
        url = `https://api.fluxcoin.tech/api/v1/coins?apikey=5lPMMw7mIuyzQQDjlKJbe0dY`;
      } else {
        const apiMarketType = marketType === "POS" ? "is_spot" : "is_future";
        url = `https://api.fluxcoin.tech/api/v1/fetch-market?apikey=5lPMMw7mIuyzQQDjlKJbe0dY&pair_type=All&market_type=${apiMarketType}`;
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
    <div className="w-full min-h-screen bg-black text-white pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title and Subtitle */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
          Markets
        </h1>
        <p className="text-gray-400 mb-8 text-base md:text-lg max-w-2xl">
          Live prices, changes, and trading actions for all available markets.
        </p>

        {/* Market Type Tabs */}
        <div className="flex space-x-1 border-b border-gray-800 mb-6">
          {["ALL", "POS", "POW"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMarketTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeMarketTab === tab
                  ? "border-b-2 border-orange-500 text-white"
                  : "text-gray-400 hover:text-white"
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
            className="bg-gray-800 text-white border border-gray-700 rounded-lg py-2 px-4 w-full max-w-xs focus:outline-none focus:ring-1 focus:ring-orange-500 placeholder-gray-500"
            placeholder="Search by symbol or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            onClick={() => fetchMarketData(activeMarketTab, true)}
            disabled={refreshing}
            className="ml-4 flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
        <div className="overflow-x-auto rounded-lg shadow-md bg-black/70">
          <table className="min-w-full divide-y divide-gray-800">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Pair
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Last Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  24H Change
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading && (
                <>
                  {/* Loading skeleton rows */}
                  {Array.from({ length: 8 }).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="animate-pulse">
                      <td className="flex items-center gap-3 py-3 px-4">
                        <div className="w-7 h-7 bg-gray-700 rounded-full"></div>
                        <div className="h-4 w-20 bg-gray-700 rounded"></div>
                      </td>
                      <td className="text-right px-4">
                        <div className="h-4 w-16 bg-gray-700 rounded ml-auto"></div>
                      </td>
                      <td className="text-right px-4">
                        <div className="h-4 w-12 bg-gray-700 rounded ml-auto"></div>
                      </td>
                      <td className="text-center px-4">
                        <div className="h-6 w-20 bg-gray-700 rounded mx-auto"></div>
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
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
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
                    <td colSpan={4} className="py-8 text-center text-gray-400">
                      No coins match your search "{search}".
                    </td>
                  </tr>
                )}
              {!loading && !error && coins.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-400">
                    No market data available.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                filteredCoins.map((coin, idx) => (
                  <tr key={coin.symbol + (coin.pair_name || "") || idx}>
                    <td className="flex items-center gap-3 py-2 px-4 min-w-0">
                      {coin.logo_path ? (
                        <img
                          src={coin.logo_path}
                          alt={coin.symbol}
                          className="w-7 h-7 rounded-full bg-gray-800 object-contain shadow"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://via.placeholder.com/28/222/fff?text=?";
                          }}
                        />
                      ) : (
                        <div className="w-7 h-7 bg-gray-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-white">
                            {coin.symbol?.slice(0, 1)}
                          </span>
                        </div>
                      )}
                      <span className="text-white font-medium truncate max-w-[110px]">
                        {coin.symbol && coin.pair_name
                          ? `${coin.symbol}/${coin.pair_name}`
                          : coin.symbol || coin.name || "-"}
                      </span>
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
                    <td className="text-center px-4">
                      <button
                        className="text-orange-500 text-xs font-semibold hover:text-orange-400 transition-colors px-3 py-1 rounded-full bg-white/5 border border-orange-500/20 shadow-sm mr-2"
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
                        className="text-blue-500 text-xs font-semibold hover:text-blue-400 transition-colors px-3 py-1 rounded-full bg-white/5 border border-blue-500/20 shadow-sm"
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
      </div>
    </div>
  );
};

export default Market;
