import React, { useState, useEffect } from 'react';
import { formatNumber } from '../../utils/numberFormatter';
import { executeSpotTradeOrder } from '../../services/spotTradingApi';
import './TradeForm.css';

const TradeForm = ({ cryptoData, userBalance, coinPairId, onTradeSuccess, isBuy }) => {
  // If isBuy prop is provided, use it; otherwise default to internal state
  const [localIsBuy, setLocalIsBuy] = useState(true);
  const [activeOrderType, setActiveOrderType] = useState('limit');
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationTimeout, setNotificationTimeout] = useState(null);
  const [uid, setUid] = useState('');

  // Use external isBuy prop if provided (for mobile), otherwise use local state
  const effectiveIsBuy = isBuy !== undefined ? isBuy : localIsBuy;

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token && !!userId);
    setUid(localStorage.getItem('uid') || '');
  }, []);

  // Update price when cryptoData changes
  useEffect(() => {
    if (cryptoData && cryptoData.cryptoPrice) {
      setPrice(parseFloat(cryptoData.cryptoPrice));
    }
  }, [cryptoData]);

  // Format price for display
  const formatPrice = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.00';
    }
    return formatNumber(value, 2, true);
  };

  // Format crypto amount with 5 decimal places
  const formatCryptoAmount = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.00000';
    }
    // Use exactly 5 decimal places for crypto amounts
    return formatNumber(value, 5, false);
  };

  // Calculate total with proper precision
  const calculateTotal = (amount) => {
    const amountValue = parseFloat(amount) || 0;
    const priceValue = parseFloat(price) || 0;
    return (amountValue * priceValue).toFixed(5);
  };

  // Calculate max amount based on available balance with consistent precision
  const getMaxAmount = () => {
    if (effectiveIsBuy) {
      // For buying, max amount is USDT balance divided by price
      const usdtSpotBalance = parseFloat(userBalance?.usdtSpotBalance || userBalance?.usdtBalance || 0);
      // Ensure we return with full precision for buying
      return price > 0 ? parseFloat((usdtSpotBalance / price).toFixed(5)) : 0;
    } else {
      // For selling, max amount is crypto balance
      return parseFloat(userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || 0);
    }
  };

  // Handle slider change with precise calculations
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    // Calculate amount based on available balance with full precision
    const maxAmount = getMaxAmount();
    
    // Use full precision for calculations and ensure 5 decimal places
    const calculatedAmount = (value / 100 * maxAmount);
    const formattedAmount = calculatedAmount.toFixed(5);
    setAmount(formattedAmount);
    setTotal(calculateTotal(formattedAmount));
  };

  // Handle amount change with precise calculations
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setAmount(value);
    
    // Calculate total based on amount
    setTotal(calculateTotal(value));
    
    // Update slider position
    const maxAmount = getMaxAmount();
    
    if (maxAmount > 0) {
      const sliderPercentage = (parseFloat(value) / maxAmount) * 100;
      setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
    }
  };

  // Handle total change with precise calculations
  const handleTotalChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setTotal(value);
    
    // Calculate amount based on total with full precision
    const calculatedAmount = price > 0 ? parseFloat(value) / price : 0;
    setAmount(calculatedAmount.toFixed(5));
    
    // Update slider position
    const maxAmount = getMaxAmount();
    
    if (maxAmount > 0) {
      const sliderPercentage = (calculatedAmount / maxAmount) * 100;
      setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
    }
  };

  const handleTradeSubmit = async () => {
    // Clear any existing notification timeout
    if (notificationTimeout) {
      clearTimeout(notificationTimeout);
      setNotificationTimeout(null);
    }

    if (!isAuthenticated) {
      showNotification('error', 'Please login to trade');
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      showNotification('error', 'Please enter a valid amount');
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      showNotification('error', 'Please enter a valid price');
      return;
    }
    
    // Check if user has enough balance
    const maxAmount = getMaxAmount();
    if (parseFloat(amount) > maxAmount) {
      showNotification('error', `Insufficient balance. Max ${effectiveIsBuy ? 'buy' : 'sell'} amount: ${maxAmount.toFixed(5)}`);
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Execute trade order
      const orderData = {
        uid: uid,
        coin_pair_id: coinPairId,
        price: parseFloat(price),
        amount: parseFloat(amount),
        order_type: effectiveIsBuy ? 'buy' : 'sell', // Using buy or sell for order_type
        side: effectiveIsBuy ? 'buy' : 'sell',
        excecution_type: 'limit' // Using excecution_type as per API requirements
      };
      
      console.log('Submitting trade order:', orderData);
      
      const response = await executeSpotTradeOrder(orderData);
      
      if (response.success) {
        showNotification('success', `${effectiveIsBuy ? 'Buy' : 'Sell'} order placed successfully!`);
        
        // Reset form
        setAmount('');
        setTotal('');
        setSliderValue(0);
        
        // Trigger refresh of balances
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      } else {
        showNotification('error', response.message || 'Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting trade:', error);
      showNotification('error', 'An error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to show notification with auto-dismiss
  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
      icon: type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'
    });
    
    // Auto-dismiss notification after 5 seconds
    const timeout = setTimeout(() => {
      setNotification(null);
    }, 5000);
    
    setNotificationTimeout(timeout);
  };

  return (
    <div className="trade-form">
      {/* Buy/Sell toggle - only show in desktop mode when isBuy prop is not provided */}
      {isBuy === undefined && (
        <div className="trade-type-toggle">
          <button
            className={`toggle-btn ${localIsBuy ? 'active' : ''}`}
            onClick={() => setLocalIsBuy(true)}
            style={localIsBuy ? { backgroundColor: '#F88726', color: 'white', fontWeight: 'bold' } : {}}
          >
            Buy
          </button>
          <button
            className={`toggle-btn ${!localIsBuy ? 'active' : ''}`}
            onClick={() => setLocalIsBuy(false)}
          >
            Sell
          </button>
        </div>
      )}

      {/* Order type tabs */}
      <div className="order-type-tabs">
        <button
          className={`tab-btn ${activeOrderType === 'limit' ? 'active' : ''}`}
          onClick={() => setActiveOrderType('limit')}
        >
          Limit
        </button>
        <button
          className={`tab-btn ${activeOrderType === 'market' ? 'active' : ''}`}
          onClick={() => setActiveOrderType('market')}
        >
          Market
        </button>
        <button
          className={`tab-btn ${activeOrderType === 'stop_limit' ? 'active' : ''}`}
          onClick={() => setActiveOrderType('stop_limit')}
        >
          Stop-Limit
        </button>
      </div>

      {/* Price input */}
      <div className="form-group">
        <label>Price ({cryptoData?.usdtSymbol || 'USDT'})</label>
        <input
          type="text"
          value={formatPrice(price)}
          onChange={(e) => setPrice(e.target.value)}
          className="form-input"
          disabled={activeOrderType === 'market'}
        />
      </div>

      {/* Amount input */}
      <div className="form-group">
        <label>Amount ({cryptoData?.cryptoSymbol || 'BTC'})</label>
        <input
          type="text"
          value={amount}
          onChange={handleAmountChange}
          className="form-input"
        />
      </div>

      {/* Slider */}
      <div className="slider-container">
        <input 
          type="range" 
          min="0"
          max="100"
          step="1"
          value={sliderValue}
          onChange={handleSliderChange}
          className={`slider-range appearance-none w-full h-2 rounded-lg outline-none ${effectiveIsBuy ? 'bg-[#F88726]' : 'bg-[#F23645]'}`}
          style={{
            background: `linear-gradient(90deg, ${effectiveIsBuy ? '#F88726' : '#F23645'} ${sliderValue}%, #232323 ${sliderValue}%) !important`
          }}
        />
        <div className="slider-labels">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>
      </div>

      {/* Total display */}
      <div className="form-group total-container" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <label>Total ({cryptoData?.usdtSymbol || 'USDT'})</label>
        <span style={{flex:1, textAlign:'right', fontFamily:'monospace', fontWeight:500}}>
          {formatNumber(total, 5, false)}
        </span>
      </div>

      {/* Balance info */}
      <div className="balance-info">
        {isAuthenticated ? (
          <>
            <span>Available: {effectiveIsBuy 
              ? formatNumber(userBalance?.usdtSpotBalance || userBalance?.usdtBalance || 0, 5) 
              : formatNumber(userBalance?.cryptoSpotBalance || userBalance?.cryptoBalance || 0, 5)} {effectiveIsBuy 
                ? cryptoData?.usdtSymbol || 'USDT' 
                : cryptoData?.cryptoSymbol || 'BTC'}</span>
            <span>Max {effectiveIsBuy ? 'buy' : 'sell'}: {formatNumber(getMaxAmount(), 5)} {cryptoData?.cryptoSymbol || 'BTC'}</span>
          </>
        ) : (
          <span>Login to view your balance</span>
        )}
      </div>

      {/* Buy/Sell Button */}
      {isAuthenticated ? (
        <button
          className={`buy-btn${effectiveIsBuy ? '' : ' sell-btn'}`}
          disabled={isLoading}
          onClick={handleTradeSubmit}
          style={{
            marginTop: 10, 
            width: '100%', 
            fontWeight: 600, 
            fontSize: 18, 
            padding: '12px 0', 
            borderRadius: '4px',
            background: effectiveIsBuy ? '#F88726 !important' : '#F23645 !important',
            backgroundImage: effectiveIsBuy ? 'none !important' : 'none !important',
            color: 'white !important'
          }}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Processing...
            </>
          ) : (
            effectiveIsBuy ? `Buy ${cryptoData?.cryptoSymbol || 'BTC'}` : `Sell ${cryptoData?.cryptoSymbol || 'BTC'}`
          )}
        </button>
      ) : (
        <button 
          className="spot-login-pill-btn"
          onClick={() => window.location.href = '/login'}
          style={{
            width: '100% !important',
            padding: '12px 0 !important',
            fontSize: '16px !important',
            fontWeight: '600 !important',
            backgroundColor: '#ffffff !important',
            color: '#000000 !important',
            border: 'none !important',
            borderRadius: '50px !important', /* Pill shape */
            cursor: 'pointer !important',
            transition: 'all 0.2s !important',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1) !important',
            margin: '10px 0 !important',
            display: 'block !important'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#f5f5f5 !important';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff !important';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          LOGIN TO TRADE
        </button>
      )}

      {/* Price info */}
      <div className="price-info">
        <span>Max price: {formatPrice(price * 1.05)}</span>
        <span>Fees: 0.1%</span>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <div className="notification-icon">{notification.icon}</div>
            <div className="notification-message">{notification.message}</div>
            <button 
              className="notification-close" 
              onClick={() => {
                if (notificationTimeout) {
                  clearTimeout(notificationTimeout);
                  setNotificationTimeout(null);
                }
                setNotification(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeForm;