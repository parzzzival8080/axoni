import React, {
  useMemo,
  memo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  executeSpotTradeOrder,
  getSpotBalance,
  fetchAllCoins,
  fetchCoinDetails,
} from "../../services/spotTradingApi.js";
import { Notification } from "../common/Notification";
import "./SpotTrading.css";

// Import the real OrderBook component
import OrderBook from "./OrderBook";
// Import OrderHistory component
import OrderHistory from "./OrderHistory";
// Import SubHeader component
import SubHeader from "./SubHeader";

const formatNumber = (num, decimals = 2) => {
  return num.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

// Memoized row component for better performance
const OrderRow = ({ type, price, amount, total }) => {
  return (
    <div className={`order-row ${type}`}>
      <span>{price}</span>
      <span>{amount}</span>
      <span>{total}</span>
    </div>
  );
};

// Memoized section component
const OrderBookSection = ({ type, orders }) => {
  return (
    <div className="order-book-section">
      {orders.map((order, index) => (
        <OrderRow
          key={index}
          type={type}
          price={formatNumber(order.price, 1)}
          amount={formatNumber(order.amount, 8)}
          total={formatNumber(order.total, 8)}
        />
      ))}
    </div>
  );
};

const TradeForm = ({
  uid,
  isAuthenticated = true,
  cryptoSymbol = "BTC",
  userBalance,
  onTradeComplete,
}) => {
  // Allow both buy and sell tabs
  const [activeTab, setActiveTab] = useState("buy");
  // Allow both limit and market order types
  const [orderType, setOrderType] = useState("limit");
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [tpsl, setTpsl] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Calculate total based on price and amount
  const calculateTotal = useCallback((priceValue, amountValue) => {
    const p = parseFloat(priceValue) || 0;
    const a = parseFloat(amountValue) || 0;
    return (p * a).toFixed(8);
  }, []);

  const total = useMemo(() => calculateTotal(price, amount), [price, amount, calculateTotal]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!price || !amount) {
      setNotification({
        type: "error",
        message: "Please enter both price and amount",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const orderData = {
        uid,
        symbol: cryptoSymbol,
        side: activeTab, // 'buy' or 'sell'
        type: orderType, // 'limit' or 'market'
        price: parseFloat(price),
        amount: parseFloat(amount),
        total: parseFloat(total),
      };

      console.log("Submitting order:", orderData);
      
      const result = await executeSpotTradeOrder(orderData);
      
      if (result.success) {
        setNotification({
          type: "success",
          message: `${activeTab.toUpperCase()} order placed successfully!`,
        });
        
        // Reset form
        setPrice("");
        setAmount("");
        
        // Notify parent component
        if (onTradeComplete) {
          onTradeComplete();
        }
      } else {
        setNotification({
          type: "error",
          message: result.message || "Failed to place order",
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      setNotification({
        type: "error",
        message: "An error occurred while placing the order",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const availableBalance = activeTab === "buy" 
    ? userBalance?.usdt || 0 
    : userBalance?.[cryptoSymbol.toLowerCase()] || 0;

  return (
    <div className="trade-form">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="trade-tabs">
        <button
          className={`tab ${activeTab === "buy" ? "active buy" : ""}`}
          onClick={() => setActiveTab("buy")}
        >
          Buy {cryptoSymbol}
        </button>
        <button
          className={`tab ${activeTab === "sell" ? "active sell" : ""}`}
          onClick={() => setActiveTab("sell")}
        >
          Sell {cryptoSymbol}
        </button>
      </div>

      <div className="order-type-tabs">
        <button
          className={`order-type ${orderType === "limit" ? "active" : ""}`}
          onClick={() => setOrderType("limit")}
        >
          Limit
        </button>
        <button
          className={`order-type ${orderType === "market" ? "active" : ""}`}
          onClick={() => setOrderType("market")}
        >
          Market
        </button>
      </div>

      <form onSubmit={handleSubmit} className="trade-form-content">
        {orderType === "limit" && (
          <div className="input-group">
            <label>Price (USDT)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
            />
          </div>
        )}

        <div className="input-group">
          <label>Amount ({cryptoSymbol})</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00000000"
            step="0.00000001"
            min="0"
          />
        </div>

        {orderType === "limit" && (
          <div className="input-group">
            <label>Total (USDT)</label>
            <input
              type="text"
              value={total}
              readOnly
              className="readonly" 
            />
          </div>
        )}

        <div className="balance-info">
          <span>Available: {formatNumber(availableBalance, 8)} {activeTab === "buy" ? "USDT" : cryptoSymbol}</span>
        </div>

        <div className="advanced-options">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={tpsl}
              onChange={(e) => setTpsl(e.target.checked)}
            />
            TP/SL
          </label>
        </div>

        <button
          type="submit"
          className={`submit-btn ${activeTab}`}
          disabled={isLoading || !price || !amount}
        >
          {isLoading ? "Placing Order..." : `${activeTab.toUpperCase()} ${cryptoSymbol}`}
        </button>
      </form>
    </div>
  );
};

// FavoriteItem atom for favorites bar
const FavoriteItem = memo(({ coin, isActive }) => {
  const priceChange = parseFloat(coin.price_change_24h?.toString() || "0");
  const changeClass = priceChange >= 0 ? "positive" : "negative";
  const changeSymbol = priceChange >= 0 ? "+" : "";

  return (
    <div className={`favorite-item ${isActive ? "active" : ""}`}>
      <div className="fav-symbol">{coin.symbol}</div>
      <div className="fav-price">${formatNumber(parseFloat(coin.price), 2)}</div>
      <div className={`fav-change ${changeClass}`}>
        {changeSymbol}{priceChange.toFixed(2)}%
      </div>
    </div>
  );
});

// Main component
const SpotTrading = () => {
  // Enhanced crypto data state with proper structure
  const [cryptoData, setCryptoData] = useState({
    symbol: "BTC",
    name: "Bitcoin",
    websocket_name: "BTC",
    pair_name: "USDT",
    coin_pair: 1,
    price: "117280.69",
    price_change_24h: -0.5573436417996136,
    volume_24h: null,
    last_updated: new Date().toISOString(),
    "24_low": "115881.52",
    "24_high": "118692.99",
    crypto_description: null,
    is_tradable: "yes",
    logo_path: "https://hxqlhqyvoarlbcljjtgn.supabase.co/storage/v1/object/public/uploads//btc.png",
    is_favorite: false,
    // Legacy compatibility
    cryptoSymbol: "BTC",
    usdtSymbol: "USDT",
    cryptoPrice: 117280.69,
  });

  // Available coins state
  const [availableCoins, setAvailableCoins] = useState([]);
  const [coinsLoading, setCoinsLoading] = useState(true);
  const [coinsError, setCoinsError] = useState(null);
  const [selectedCoinPairId, setSelectedCoinPairId] = useState(1); // Default to BTC

  const [refreshOrderBook, setRefreshOrderBook] = useState(0);
  const [refreshOrderHistory, setRefreshOrderHistory] = useState(0);
  const [refreshBalance, setRefreshBalance] = useState(0);
  // Set default active tab to history so it's visible immediately
  const [activeTab, setActiveTab] = useState("history");

  // Add balance state
  const [userBalance, setUserBalance] = useState({
    usdt: 50000.0,
    btc: 1.23456,
    eth: 15.7891,
    xrp: 10000.0,
  });

  // Fetch user balance
  const fetchUserBalance = useCallback(async () => {
    console.log("Fetching user balance...");
    const balanceResponse = await getSpotBalance();

    if (balanceResponse.success && balanceResponse.balance) {
      console.log("Balance updated:", balanceResponse.balance);
      setUserBalance(balanceResponse.balance);
    } else {
      console.error("Failed to fetch balance:", balanceResponse.message);
    }
  }, []);

  // Fetch available coins
  const fetchCoins = useCallback(async () => {
    try {
      setCoinsLoading(true);
      setCoinsError(null);
      
      console.log('Fetching available coins...');
      const response = await fetchAllCoins();
      
      if (response.success && response.coins) {
        console.log('Coins fetched successfully:', response.coins.length);
        setAvailableCoins(response.coins);
        
        // Set default coin if not already set
        if (response.coins.length > 0) {
          const defaultCoin = response.coins.find(coin => coin.symbol === 'BTC') || response.coins[0];
          if (defaultCoin) {
            setCryptoData({
              ...defaultCoin,
              // Legacy compatibility
              cryptoSymbol: defaultCoin.symbol,
              usdtSymbol: defaultCoin.pair_name || "USDT",
              cryptoPrice: parseFloat(defaultCoin.price || "0"),
            });
            setSelectedCoinPairId(defaultCoin.coin_pair);
          }
        }
      } else {
        console.error('Failed to fetch coins:', response.message);
        setCoinsError(response.message || 'Failed to fetch coins');
      }
    } catch (error) {
      console.error('Error fetching coins:', error);
      setCoinsError(error.message || 'Failed to fetch coins');
    } finally {
      setCoinsLoading(false);
    }
  }, []);

  // Handle coin selection
  const handleCoinSelect = useCallback(async (coinPairId) => {
    try {
      console.log('Selecting coin with pair ID:', coinPairId);
      
      // Find the coin in available coins
      const selectedCoin = availableCoins.find(coin => coin.coin_pair === coinPairId);
      
      if (selectedCoin) {
        console.log('Selected coin:', selectedCoin);
        setCryptoData({
          ...selectedCoin,
          // Legacy compatibility
          cryptoSymbol: selectedCoin.symbol,
          usdtSymbol: selectedCoin.pair_name || "USDT",
          cryptoPrice: parseFloat(selectedCoin.price || "0"),
        });
        setSelectedCoinPairId(coinPairId);
        
        // Force refresh order book with new symbol
        setRefreshOrderBook(prev => prev + 1);
      } else {
        console.error('Coin not found in available coins');
      }
    } catch (error) {
      console.error('Error selecting coin:', error);
    }
  }, [availableCoins]);

  // Initial data fetch
  useEffect(() => {
    fetchUserBalance();
    fetchCoins();
  }, [fetchUserBalance, fetchCoins]);

  // Refresh balance when refreshBalance state changes
  useEffect(() => {
    if (refreshBalance > 0) {
      fetchUserBalance();
    }
  }, [refreshBalance, fetchUserBalance]);

  // Enhanced callback for when trades are completed
  const handleTradeComplete = useCallback(() => {
    console.log("Trade completed, refreshing order book and history");
    // Force a refresh by incrementing counters with a small delay to ensure API has updated
    setRefreshOrderBook((prevCount) => prevCount + 1);

    // Delay order history refresh slightly to ensure server has processed the order
    setTimeout(() => {
      console.log("Refreshing order history after trade completion");
      setRefreshOrderHistory((prevCount) => prevCount + 1);

      // Refresh user balance as well
      setRefreshBalance((prevCount) => prevCount + 1);

      // Force the active tab to 'history' to show updated orders
      setActiveTab("history");
    }, 1000); // 1 second delay for API to process
  }, []);

  // Debug effect to log when refreshOrderHistory changes
  useEffect(() => {
    if (refreshOrderHistory > 0) {
      console.log("Order history refresh triggered:", refreshOrderHistory);
    }
  }, [refreshOrderHistory]);

  // Dynamic favorites from available coins
  const favorites = useMemo(() => {
    if (!availableCoins || availableCoins.length === 0) return [];
    
    // Get user's favorite coins from localStorage
    const localFavorites = JSON.parse(localStorage.getItem('localFavorites') || '[]');
    
    // Filter available coins to show only favorites, or show top 5 coins if no favorites
    const favoriteCoins = availableCoins.filter(coin => 
      localFavorites.includes(coin.coin_pair?.toString())
    );
    
    // If no favorites, show top 5 popular coins (BTC, ETH, XRP, SOL, ADA)
    if (favoriteCoins.length === 0) {
      const popularSymbols = ['BTC', 'ETH', 'XRP', 'SOL', 'ADA'];
      return availableCoins
        .filter(coin => popularSymbols.includes(coin.symbol))
        .slice(0, 5);
    }
    
    return favoriteCoins.slice(0, 8); // Limit to 8 favorites
  }, [availableCoins]);

  return (
    <div className="spot-trading-container">
      {/* SUBHEADER - Coin Selection and Stats */}
      <SubHeader 
        cryptoData={cryptoData}
        coinPairId={selectedCoinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
        loading={coinsLoading}
        error={coinsError}
        statsLoading={false}
        pricePollingError={null}
        isPolling={false}
      />
      
      {/* FAVORITES BAR */}
      {favorites.length > 0 && (
        <div className="favorites-bar-atomic">
          <span className="fav-label">Favorites:</span>
          {favorites.map((coin, idx) => (
            <div 
              key={coin.symbol + coin.pair_name}
              onClick={() => handleCoinSelect(coin.coin_pair)}
              style={{ cursor: 'pointer' }}
            >
              <FavoriteItem
                coin={coin}
                isActive={selectedCoinPairId === coin.coin_pair}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* MAIN CONTENT AREA */}
      <div className="trading-content">
        <div className="trading-column chart-column">
          <div className="chart-placeholder">
            <span>Price Chart will be displayed here</span>
          </div>
        </div>
        <div className="trading-column order-column">
          <OrderBook 
            cryptoData={{
              ...cryptoData,
              // Ensure websocket_name is available for OrderBook
              websocket_name: cryptoData.websocket_name || cryptoData.symbol || 'BTC',
              symbol: cryptoData.symbol || cryptoData.cryptoSymbol || 'BTC',
              selectedSymbol: cryptoData.symbol || cryptoData.cryptoSymbol || 'BTC',
              instId: `${cryptoData.websocket_name || cryptoData.symbol || 'BTC'}-USDT`
            }} 
            forceRefresh={refreshOrderBook} 
          />
          <div className="trade-form-wrapper">
            <TradeForm
              uid="yE8vKBNw"
              isAuthenticated={true}
              cryptoSymbol={cryptoData.cryptoSymbol}
              userBalance={userBalance}
              onTradeComplete={handleTradeComplete}
            />
          </div>
        </div>
      </div>
      
      {/* TABS */}
      <div className="trading-tabs">
        <div
          className={`tab ${activeTab === "trade" ? "active" : ""}`}
          onClick={() => setActiveTab("trade")}
        >
          Trade
        </div>
        <div
          className={`tab ${activeTab === "orders" ? "active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Orders
        </div>
        <div
          className={`tab ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Order History
        </div>
        <div
          className={`tab ${activeTab === "assets" ? "active" : ""}`}
          onClick={() => setActiveTab("assets")}
        >
          Assets
        </div>
      </div>
      
      {/* TAB CONTENT */}
      <div className="tab-content">
        <div style={{ display: activeTab === "history" ? "block" : "none" }}>
          <OrderHistory refreshTrigger={refreshOrderHistory} />
        </div>
        {activeTab === "orders" && (
          <div className="orders-placeholder">
            <p>Your active orders will appear here</p>
          </div>
        )}
        {activeTab === "assets" && (
          <div className="assets-placeholder">
            <p>Your asset information will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpotTrading;
