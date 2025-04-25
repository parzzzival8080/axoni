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

  // Custom notification component
  const CustomNotification = ({ message, type, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className={`notification ${type || ''}`} style={{
        position: 'fixed',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        minWidth: '320px',
        maxWidth: '450px',
        padding: '16px 20px',
        borderRadius: '8px',
        backgroundColor: 'rgba(33, 33, 33, 0.97)',
        color: '#fff',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backdropFilter: 'blur(10px)',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        fontSize: '14px',
        lineHeight: '1.5',
        border: type === 'error' ? '1px solid rgba(242, 54, 69, 0.2)' :
          type === 'success' ? '1px solid rgba(0, 184, 151, 0.2)' :
            type === 'info' ? '1px solid rgba(0, 122, 255, 0.2)' :
              '1px solid rgba(255, 255, 255, 0.05)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {type === 'error' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#F23645' }}>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor" />
              </svg>
            )}
            {type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#00B897' }}>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor" />
              </svg>
            )}
            {type === 'info' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#007AFF' }}>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-11v6h2v-6h-2zm0-4v2h2V7h-2z" fill="currentColor" />
              </svg>
            )}
            <span style={{
              fontWeight: '500',
              color: type === 'error' ? '#F23645' :
                type === 'success' ? '#00B897' :
                  type === 'info' ? '#007AFF' :
                    '#ffffff'
            }}>{message}</span>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '6px 12px',
              borderRadius: '4px',
              backgroundColor: '#000000',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500',
              transition: 'background-color 0.2s',
              flexShrink: 0,
              marginLeft: '12px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#333333'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#000000'}
          >
            OK
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="trade-form dark-theme">
      {notification && (
        <CustomNotification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Tabs: Trade/Tools */}
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

      {/* Open/Close Position Buttons */}
      <div className="position-buttons">
        <button
          className={`position-btn ${positionType === 'open' ? 'active' : ''}`}
          onClick={() => handlePositionTypeClick('open')}
        >
          Open
        </button>
        <button
          className={`position-btn ${positionType === 'close' ? 'active' : ''}`}
          onClick={() => handlePositionTypeClick('close')}
        >
          Close
        </button>
      </div>

      {/* Leverage Selection */}
      <div className="leverage-selection">
        <div className="leverage-mode" onClick={toggleLeverageMode}>
          {leverageMode === 'isolated' ? 'Isolated' : 'Cross'} <i className="fas fa-caret-down"></i>
        </div>
        <div className="leverage-value" onClick={toggleLeverage}>
          <span className="green-text">{leverage}x</span> {leverage}x <i className="fas fa-caret-down"></i>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="order-type-selection">
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
          TP/SL <i className="fas fa-chevron-down"></i>
        </div>
        <div className="help-icon">
          <i className="fas fa-question-circle"></i>
        </div>
      </div>

      {/* Price Input */}
      <div className="price-input-section">
        <div className="price-label">Price</div>
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
          Amount ({symbol}) <i className="fas fa-chevron-down"></i>
        </div>
        <div className="amount-input-container">
          <input
            type="text"
            className="amount-input"
            value={amount}
            onChange={handleAmountChange}
            placeholder=""
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
                <i className={isLoadingBalance ? "fas fa-spinner fa-spin" : "fas fa-plus-circle"}></i>
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
        {isLoading ? 'Processing...' : positionType === 'open' ? 'Buy / Long' : 'Sell / Short'}
      </button>

      {/* Cost Section */}
      <div className="cost-section">
        <div className="cost-item">
          <div className="cost-label">Margin</div>
          <div className="max-price">{calculateUsdtValue().replace(' USDT', '')}</div>
        </div>
        <div className="cost-item">
          <div className="cost-label">Fees</div>
          <div className="min-price">{(parseFloat(calculateUsdtValue().replace(' USDT', '')) * 0.0005).toFixed(2)}</div>
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
          <i className="fas fa-chart-line"></i> Position builder
        </div>
      </div>
    </div>
  );
}

export default TradeForm;