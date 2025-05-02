import React, { useState, useEffect } from 'react';
import { getFutureBalance, executeFutureTradeOrder } from '../../services/futureTradingApi';
import './TradeForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown, faSyncAlt, faSpinner, faChevronDown, faChartLine, faCheckCircle, faExclamationCircle, faInfoCircle, faExclamationTriangle, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

function TradeForm({ cryptoData, userBalance, coinPairId, onTradeSuccess }) {
  const symbol = cryptoData?.cryptoSymbol || 'BTC';
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
    cryptoBalance: '0.00'
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
  }, [cryptoData?.cryptoSymbol, uid]);

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
        cryptoBalance: parseFloat(cryptoBalance).toFixed(6)
      });

      console.log('Updated wallet balance:', {
        availableBalance: parseFloat(availableBalance).toFixed(6),
        cryptoBalance: parseFloat(cryptoBalance).toFixed(6)
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

  // Calculate max amount based on wallet balance and leverage, with buffer for fees/margin
  const calculateMaxAmount = () => {
    // Parse all values as floats and use fallback defaults
    const available = parseFloat(walletBalance.availableBalance) || 0;
    const lev = parseFloat(leverage) || 1;
    const entryPrice = parseFloat(price) || 1;
    if (!available || !lev || !entryPrice) return 0;
    // Subtract a 0.5% buffer for fees/margin
    const buffer = 0.995;
    return (available * lev * buffer) / entryPrice;
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    const sliderVal = parseFloat(e.target.value) || 0;
    setSliderValue(sliderVal);
    // Calculate amount based on slider value using actual max amount (with buffer)
    const maxAmount = calculateMaxAmount();
    const newAmount = ((sliderVal / 100) * maxAmount).toFixed(6);
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
          setSliderValue(Math.min(100, Math.max(0, Math.round(percent * 1000) / 1000)));
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

      // Determine transaction_type based on positionType (BUY MORE for open/long, SELL SHORT for close/short)
      const transaction_type = positionType === 'open' ? 'BUY MORE' : 'SELL SHORT';
      const tradeParams = {
        symbol: cryptoData?.cryptoSymbol,
        coinPairId: coinPairId,
        price,
        amount,
        leverage,
        transaction_type,
        uid,
        // Do not send execution_type
      };

      const result = await executeFutureTradeOrder(tradeParams);

      console.log('Future trade result:', result);

      // Determine notification type based on result
      const notificationType = 'success';

      // Trade was successful
      setNotification({
        message: result.message || `${positionType === 'open' ? 'Buy' : 'Sell'} order placed for ${amount} ${cryptoData?.cryptoSymbol} with ${leverage}x leverage`,
        type: notificationType
      });

      // Refresh wallet balance after trade
      fetchWalletBalance();

      // Call onTradeSuccess callback to trigger order history refresh
      if (typeof onTradeSuccess === 'function') {
        onTradeSuccess();
      }

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

  // Ensure all displayed values are formatted and up-to-date
  const formattedAvailable = formatNumber(walletBalance.availableBalance, 6);
  const formattedMaxAmount = formatNumber(calculateMaxAmount(), 6);

  return (
    <div className="trade-form">
      {/* Notification Component */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-icon">
            {notification.type === 'success' && <FontAwesomeIcon icon={faCheckCircle} />}
            {notification.type === 'error' && <FontAwesomeIcon icon={faExclamationCircle} />}
            {notification.type === 'info' && <FontAwesomeIcon icon={faInfoCircle} />}
            {notification.type === 'warning' && <FontAwesomeIcon icon={faExclamationTriangle} />}
          </span>
          <span className="notification-message">{notification.message}</span>
          <button className="notification-close" onClick={() => setNotification(null)}>
            <FontAwesomeIcon icon={faTimes} />
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
          <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: '4px', fontSize: '10px' }} />
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
            <FontAwesomeIcon icon={faQuestionCircle} />
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
            <button className="price-control up"><FontAwesomeIcon icon={faCaretUp} /></button>
            <button className="price-control down"><FontAwesomeIcon icon={faCaretDown} /></button>
          </div>
          <button className="market-price-btn">BBO</button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="amount-input-section">
        <div className="amount-label">
          Amount ({symbol}) <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '10px' }} />
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
            step="0.01"
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
              Available {formattedAvailable} USDT
              <button className="info-btn" onClick={fetchWalletBalance}>
                {isLoadingBalance ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSyncAlt} />}
              </button>
            </div>
            <div className="max-values">
              <span className="max-long">
                Max long {formattedMaxAmount} {symbol}
              </span>
              <span className="max-short">
                Max short {formattedMaxAmount} {symbol}
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
            <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
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
          <FontAwesomeIcon icon={faChartLine} style={{ marginRight: '4px' }} />
          Position builder
        </div>
      </div>
    </div>
  );
}

export default TradeForm;