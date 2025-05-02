import React, { useState, useEffect } from 'react';
import { getFutureBalance, executeFutureTradeOrder } from '../../services/futureTradingApi';
import './TradeForm.css';

function TradeForm({ symbol = 'BTC' }) {
  const [activeTab, setActiveTab] = useState('trade'); // 'trade' or 'tools'
  const [positionType, setPositionType] = useState('open'); // 'open' or 'close'
  const [leverageMode, setLeverageMode] = useState('isolated'); // 'isolated' or 'cross'
  const [leverage, setLeverage] = useState('20'); // leverage value from image
  const [orderType, setOrderType] = useState('limit'); // 'limit', 'market', or 'tp/sl'
  const [price, setPrice] = useState('83169.80'); // entry_price from image
  const [amount, setAmount] = useState(''); // remove default value
  const [sliderValue, setSliderValue] = useState(0); // reset to 0 to match empty amount
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to logged in
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uid, setUid] = useState(''); // Start with empty UID, will be populated from localStorage
  const [walletBalance, setWalletBalance] = useState({
    availableBalance: '0.00',
    cryptoBalance: '0.00',
    cryptoSymbol: symbol
  });
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // API constants
  const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
  const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';

  // Check if user is authenticated on component mount
  useEffect(() => {
    // First check for user authentication
    const userUid = localStorage.getItem('uid');

    if (userUid) {
      console.log('User UID from localStorage:', userUid);
      setUid(userUid);
      setIsLoggedIn(true);

      // Fetch wallet balance after setting UID
      setTimeout(() => {
        fetchWalletBalance();
      }, 100);
    } else {
      console.log('No user authenticated. Please login to trade.');
      setIsLoggedIn(false);
      setNotification({
        message: 'Please log in to access future trading features',
        type: 'info'
      });
    }
  }, []);

  // Update price and reset amount when symbol changes
  useEffect(() => {
    console.log(`Symbol changed to ${symbol}`);

    // Reset values on symbol change
    setAmount('');
    setSliderValue(0);

    // Fetch wallet balance when symbol changes - with slight delay to ensure UID is set
    if (uid) {
      setTimeout(() => {
        fetchWalletBalance();
      }, 100);
    }
  }, [symbol, uid]);

  // Fetch wallet balance from API using the getFutureBalance service
  const fetchWalletBalance = async () => {
    // Require authentication
    if (!uid) {
      console.error('Cannot fetch wallet balance: No user ID available');
      setNotification({
        message: 'Authentication required. Please log in to view your wallet balance.',
        type: 'error'
      });
      return;
    }

    console.log('Fetching wallet balance for UID:', uid);

    try {
      setIsLoadingBalance(true);

      // Use the getFutureBalance service function with the current UID
      const result = await getFutureBalance(uid);

      console.log('Future balance result:', result);

      // Get the balance data from the result
      const balanceData = result.balance;

      // Use future_wallet as available balance for future trading
      const availableBalance = balanceData.available_balance || balanceData.future_wallet || 0;
      const cryptoBalance = balanceData.btc || 0;

      // Update wallet balance state with the structure expected by the component
      setWalletBalance({
        availableBalance: parseFloat(availableBalance).toFixed(6),
        cryptoBalance: parseFloat(cryptoBalance).toFixed(6),
        cryptoSymbol: symbol
      });

      console.log('Updated wallet balance:', {
        availableBalance: parseFloat(availableBalance).toFixed(6),
        cryptoBalance: parseFloat(cryptoBalance).toFixed(6),
        cryptoSymbol: symbol
      });

      // If it was a real, successful API call, clear any error notifications
      if (result.success) {
        setNotification(null);
      }

    } catch (error) {
      console.error('Wallet balance fetch error:', error);
      // Show error notification
      setNotification({
        message: 'Failed to fetch wallet balance: ' + (error.message || 'Unknown error'),
        type: 'error'
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Handle position type change
  const handlePositionTypeClick = (type) => {
    setPositionType(type);
  };

  // Handle leverage mode change
  const toggleLeverageMode = () => {
    setLeverageMode(leverageMode === 'isolated' ? 'cross' : 'isolated');
  };

  // Handle leverage change
  const toggleLeverage = () => {
    setLeverage(leverage === '20' ? '10' : '20');
  };

  // Handle order type change
  const handleOrderTypeClick = (type) => {
    setOrderType(type);
  };

  // Calculate max amount based on wallet balance and leverage
  const calculateMaxAmount = () => {
    // Use availableBalance for calculation
    const available = parseFloat(walletBalance.availableBalance);
    const lev = parseFloat(leverage);
    const entryPrice = parseFloat(price);
    if (!available || !lev || !entryPrice) return 0;
    return (available * lev) / entryPrice;
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);

    // Calculate amount based on slider value using actual max amount
    const maxAmount = calculateMaxAmount();
    const newAmount = (e.target.value / 100 * maxAmount).toFixed(6);
    setAmount(newAmount);
  };

  // Handle amount change
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === '') {
      setAmount(value);

      // Update slider if amount is entered directly
      if (value) {
        const maxAmount = calculateMaxAmount();
        if (maxAmount > 0) {
          const percent = (parseFloat(value) / maxAmount) * 100;
          setSliderValue(Math.min(100, Math.max(0, percent)));
        }
      } else {
        setSliderValue(0);
      }
    }
  };

  // Calculate USDT value based on amount and price
  const calculateUsdtValue = () => {
    if (!amount) return "0.00";

    // Remove commas from price string and convert to number
    const numericPrice = parseFloat(price.replace(/,/g, ''));
    const numericAmount = parseFloat(amount);

    if (isNaN(numericPrice) || isNaN(numericAmount)) return "0.00";

    const usdtValue = numericPrice * numericAmount;

    // Format with commas and 2 decimal places
    return usdtValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Format number for display
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.00';
    }
    return Number(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  // Handle trade submission
  const handleTradeSubmit = async () => {
    if (!uid) {
      // If no UID, user must login
      setNotification({
        message: 'Authentication required. Please log in to trade.',
        type: 'error'
      });
      return;
    }

    try {
      // Clear any existing notifications
      setNotification(null);

      if (!amount || parseFloat(amount) <= 0) {
        setNotification({
          message: 'Please enter a valid amount',
          type: 'error'
        });
        return;
      }

      setIsLoading(true);

      // Determine order_type and execution_type based on UI state
      // Use "BUY MORE" for transaction_type when buying, as required by the API
      const order_type = positionType === 'open' ? 'BUY MORE' : 'SELL SHORT';
      const execution_type = orderType === 'market' ? 'market' : 'limit';

      // Parse the price to remove commas
      const cleanedPrice = parseFloat(price.replace(/,/g, ''));

      // Use the executeFutureTradeOrder service function
      const result = await executeFutureTradeOrder({
        uid,
        symbol,
        order_type,
        execution_type,
        price: cleanedPrice,
        amount: parseFloat(amount),
        leverage: parseInt(leverage)
      });

      console.log('Future trade result:', result);

      // Determine notification type based on result
      const notificationType = 'success';

      // Trade was successful
      setNotification({
        message: result.message || `${order_type.toUpperCase()} order placed for ${amount} ${symbol} with ${leverage}x leverage`,
        type: notificationType
      });

      // Refresh wallet balance after trade
      fetchWalletBalance();

      // Reset form
      setAmount('');
      setSliderValue(0);

    } catch (error) {
      console.error('Trade error:', error);
      setNotification({
        message: error.message || 'An error occurred during trade execution',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="trade-form">
      {/* Notification Component */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' && <i className="fas fa-check-circle"></i>}
            {notification.type === 'error' && <i className="fas fa-exclamation-circle"></i>}
            {notification.type === 'info' && <i className="fas fa-info-circle"></i>}
            {notification.type === 'warning' && <i className="fas fa-exclamation-triangle"></i>}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {/* Trade/Tools Tabs */}
      <div className="trade-tabs">
        <div
          className={`tab ${activeTab === 'trade' ? 'active' : ''}`}
          onClick={() => handleTabClick('trade')}
        >
          Trade
        </div>
        <div
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`}
          onClick={() => handleTabClick('tools')}
        >
          Tools
        </div>
      </div>

      {/* Position Type Buttons */}
      <div className="position-type">
        <button
          className={`position-btn ${positionType === 'open' ? 'active buy-more' : ''}`}
          onClick={() => handlePositionTypeClick('open')}
        >
          Open
        </button>
        <button
          className={`position-btn ${positionType === 'close' ? 'active sell' : ''}`}
          onClick={() => handlePositionTypeClick('close')}
        >
          Close
        </button>
      </div>

      {/* Leverage Section */}
      <div className="leverage-section">
        <div className="leverage-mode">
          <button
            className={`leverage-mode-btn ${leverageMode === 'isolated' ? 'active' : ''}`}
            onClick={() => toggleLeverageMode('isolated')}
          >
            Isolated
          </button>
          <button
            className={`leverage-mode-btn ${leverageMode === 'cross' ? 'active' : ''}`}
            onClick={() => toggleLeverageMode('cross')}
          >
            Cross
          </button>
        </div>
        <div className="leverage-value" onClick={toggleLeverage}>
          <span>{leverage}</span>×
          <i className="fas fa-chevron-down" style={{ marginLeft: '4px', fontSize: '10px' }}></i>
        </div>
      </div>

      {/* Order Type Section */}
      <div className="order-type-section">
        <div className="order-types">
          <div
            className={`order-type ${orderType === 'limit' ? 'active' : ''}`}
            onClick={() => handleOrderTypeClick('limit')}
          >
            Limit
          </div>
          <div
            className={`order-type ${orderType === 'market' ? 'active' : ''}`}
            onClick={() => handleOrderTypeClick('market')}
          >
            Market
          </div>
          <div
            className={`order-type ${orderType === 'tp/sl' ? 'active' : ''}`}
            onClick={() => handleOrderTypeClick('tp/sl')}
          >
            TP/SL
          </div>
          <div className="order-type-help">
            <i className="fas fa-question-circle"></i>
          </div>
        </div>
      </div>

      {/* Price Input */}
      <div className="price-input-section">
        <div className="price-label">Price (USDT)</div>
        <div className="price-input-container">
          <input
            type="text"
            className="price-input"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="price-controls">
            <button className="price-control up"><i className="fas fa-caret-up"></i></button>
            <button className="price-control down"><i className="fas fa-caret-down"></i></button>
          </div>
          <button className="market-price-btn">BBO</button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="amount-input-section">
        <div className="amount-label">
          Amount ({symbol}) <i className="fas fa-chevron-down" style={{ fontSize: '10px' }}></i>
        </div>
        <div className="amount-input-container">
          <input
            type="text"
            className="amount-input"
            value={amount}
            onChange={handleAmountChange}
            placeholder="0"
          />
        </div>

        {/* Slider Container */}
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={sliderValue}
            onChange={handleSliderChange}
            className="range-slider"
          />
          <div className="slider-labels">
            <span>0</span>
            <span>100%</span>
          </div>
          <div className="balance-info">
            <div className="available-balance">
              Available {walletBalance.availableBalance} USDT
              <button className="info-btn" onClick={fetchWalletBalance}>
                <i className={isLoadingBalance ? "fas fa-spinner fa-spin" : "fas fa-sync-alt"}></i>
              </button>
            </div>
            <div className="max-values">
              <span className="max-long">
                Max long {formatNumber(calculateMaxAmount(), 6)} {symbol}
              </span>
              <span className="max-short">
                Max short {formatNumber(calculateMaxAmount(), 6)} {symbol}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* TP/SL Checkbox */}
      <div className="tp-sl-container">
        <label className="tp-sl-checkbox">
          <input
            type="checkbox"
            checked={tpslEnabled}
            onChange={() => setTpslEnabled(!tpslEnabled)}
          />
          <span className="checkbox-text">TP/SL</span>
        </label>
      </div>

      {/* Action Button */}
      <button
        className={`action-btn ${positionType === 'open' ? 'buy-more' : 'sell'}`}
        onClick={handleTradeSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
            Processing...
          </>
        ) : (
          positionType === 'open' ? 'Buy / Long' : 'Sell / Short'
        )}
      </button>

      {/* Cost Section */}
      <div className="cost-section">
        <div className="cost-item">
          <div className="cost-label">Cost</div>
          <div className="max-price">{calculateUsdtValue().replace(' USDT', '')} USDT</div>
        </div>
        <div className="cost-item">
          <div className="cost-label">Fees</div>
          <div className="min-price">{(parseFloat(calculateUsdtValue().replace(' USDT', '')) * 0.0005).toFixed(2)} USDT</div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section">
        <div className="tool-item">
          <span className="percent-icon">%</span> Calculator
        </div>
        <div className="tool-item">
          <span className="percent-icon">%</span> Fees
        </div>
        <div className="tool-item">
          <i className="fas fa-chart-line" style={{ marginRight: '4px' }}></i> Position builder
        </div>
      </div>
    </div>
  );
}

export default TradeForm;