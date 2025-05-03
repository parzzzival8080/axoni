import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../utils/numberFormatter';
import { executeSpotTradeOrder } from '../../services/spotTradingApi';
import './TradeForm.css';

const TradeForm = ({ cryptoData, userBalance, coinPairId, onTradeSuccess }) => {
  const [isBuy, setIsBuy] = useState(true);
  const [activeOrderType, setActiveOrderType] = useState('limit');
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(0);
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [uid, setUid] = useState('');

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!token);
    setUid(userId || '');
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
    if (isBuy) {
      // For buying, max amount is USDT balance divided by price
      const usdtSpotBalance = parseFloat(userBalance?.usdtSpotBalance || 0);
      // Ensure we return with full precision for buying
      return price > 0 ? parseFloat((usdtSpotBalance / price).toFixed(5)) : 0;
    } else {
      // For selling, max amount is crypto balance
      return parseFloat(userBalance?.cryptoSpotBalance || 0);
    }
  };

  // Get max total (USDT) for buying
  const getMaxTotal = () => {
    if (isBuy) {
      // For buying, max total is simply the USDT balance
      return parseFloat(userBalance?.usdtSpotBalance || 0);
    } else {
      // For selling, max total is crypto balance * price
      const cryptoBalance = parseFloat(userBalance?.cryptoSpotBalance || 0);
      return parseFloat((cryptoBalance * price).toFixed(5));
    }
  };

  // Handle slider change with precise calculations
  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    if (isBuy) {
      // For buying, calculate based on max USDT total
      const maxTotal = getMaxTotal();
      const calculatedTotal = (value / 100 * maxTotal).toFixed(5);
      setTotal(calculatedTotal);
      
      // Calculate amount based on total
      const calculatedAmount = price > 0 ? parseFloat(calculatedTotal) / price : 0;
      setAmount(calculatedAmount.toFixed(5));
    } else {
      // For selling, calculate based on max crypto amount
      const maxAmount = getMaxAmount();
      const calculatedAmount = (value / 100 * maxAmount).toFixed(5);
      setAmount(calculatedAmount);
      
      // Calculate total based on amount
      setTotal(calculateTotal(calculatedAmount));
    }
  };

  // Handle amount change with precise calculations
  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setAmount(value);
    
    // Calculate total based on amount with 5 decimal precision
    const calculatedTotal = (parseFloat(value || 0) * price).toFixed(5);
    setTotal(calculatedTotal);
    
    // Update slider position
    if (isBuy) {
      const maxTotal = getMaxTotal();
      if (maxTotal > 0) {
        const sliderPercentage = (parseFloat(calculatedTotal) / maxTotal) * 100;
        setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
      }
    } else {
      const maxAmount = getMaxAmount();
      if (maxAmount > 0) {
        const sliderPercentage = (parseFloat(value) / maxAmount) * 100;
        setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
      }
    }
  };

  // Handle total change with precise calculations
  const handleTotalChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setTotal(value);
    
    // Calculate amount based on total with 5 decimal precision
    const calculatedAmount = price > 0 ? (parseFloat(value || 0) / price).toFixed(5) : 0;
    setAmount(calculatedAmount);
    
    // Update slider position
    if (isBuy) {
      const maxTotal = getMaxTotal();
      if (maxTotal > 0) {
        const sliderPercentage = (parseFloat(value) / maxTotal) * 100;
        setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
      }
    } else {
      const maxAmount = getMaxAmount();
      if (maxAmount > 0) {
        const sliderPercentage = (parseFloat(calculatedAmount) / maxAmount) * 100;
        setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
      }
    }
  };

  const handleTradeSubmit = async () => {
    try {
      setNotification(null);
      if (!isAuthenticated) {
        setNotification({ message: 'Please log in to trade', type: 'error' });
        return;
      }
      if (!amount || parseFloat(amount) <= 0) {
        setNotification({ message: 'Please enter a valid amount', type: 'error' });
        return;
      }
      if (parseFloat(amount) < 0.00001) {
        setNotification({ message: `Amount must be at least 0.00001 ${cryptoData?.cryptoSymbol || 'BTC'}`, type: 'error' });
        return;
      }
      setIsLoading(true);
      const effectiveUid = uid || localStorage.getItem('uid') || 'yE8vKBNw';
      const symbol = cryptoData?.cryptoSymbol || 'BTC';
      const params = {
        uid: effectiveUid,
        symbol,
        order_type: isBuy ? 'buy' : 'sell',
        excecution_type: activeOrderType,
        price: parseFloat(price),
        amount: parseFloat(amount)
      };
      
      const result = await executeSpotTradeOrder(params);
      
      if (result.success) {
        setNotification({ 
          message: `${isBuy ? 'Buy' : 'Sell'} order placed successfully!`, 
          type: 'success' 
        });
        // Reset form
        setAmount('');
        setTotal('');
        setSliderValue(0);
        // Refresh balances
        if (typeof onTradeSuccess === 'function') {
          onTradeSuccess();
        }
      } else {
        setNotification({ 
          message: result.message || 'Failed to place order', 
          type: 'error' 
        });
      }
    } catch (error) {
      console.error('Trade error:', error);
      setNotification({ 
        message: error.message || 'An error occurred', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Extract symbols and format balances for display
  const cryptoSymbol = cryptoData?.cryptoSymbol || 'BTC';
  const usdtSymbol = cryptoData?.usdtSymbol || 'USDT';
  
  const cryptoSpotBalance = parseFloat(userBalance?.cryptoSpotBalance || 0);
  const usdtSpotBalance = parseFloat(userBalance?.usdtSpotBalance || 0);
  
  const formattedCryptoSpotBalance = formatCryptoAmount(cryptoSpotBalance);
  const formattedUsdtSpotBalance = formatNumber(usdtSpotBalance, 2);

  return (
    <div className="trade-form">
      {/* Top controls */}
      <div className="top-controls">
        <div className="margin-toggle">
          <span>Margin</span>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="okx-form-tabs">
        <button
          className={`okx-tab buy${isBuy ? ' active' : ''}`}
          type="button"
          onClick={() => setIsBuy(true)}
        >
          Buy
        </button>
        <button
          className={`okx-tab sell${!isBuy ? ' active' : ''}`}
          type="button"
          onClick={() => setIsBuy(false)}
        >
          Sell
        </button>
      </div>

      {/* Order types */}
      <div className="order-types">
        {['Limit', 'Market', 'Stop-Limit'].map((type) => (
          <div 
            key={type}
            className={`type ${activeOrderType.toLowerCase() === type.toLowerCase() ? 'active' : ''}`}
            onClick={() => setActiveOrderType(type.toLowerCase())}
          >
            {type}
          </div>
        ))}
      </div>

      {/* Price input or display */}
      <div className="form-group price-container" style={{ borderRadius: '4px', overflow: 'hidden' }}>
        <label>Price ({cryptoData?.usdtSymbol || 'USDT'})</label>
        <span style={{flex:1, textAlign:'right', fontFamily:'monospace', fontWeight:500}}>{formatPrice(price)}</span>
      </div>

      {/* Amount input */}
      <div className="form-group">
        <label>Amount ({cryptoData?.cryptoSymbol || 'BTC'})</label>
        <input 
          type="text" 
          value={amount} 
          onChange={handleAmountChange}
          placeholder={`Min 0.00001 ${cryptoData?.cryptoSymbol || 'BTC'}`}
        />
        <div className="slider-row">
          <input 
            type="range" 
            min="0"
            max="100"
            step="1"
            value={sliderValue}
            onChange={handleSliderChange}
            className="slider-range"
            style={{
              background: `linear-gradient(90deg, #00B574 ${sliderValue}%, #232323 ${sliderValue}%)`
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
        <span>Available: {isBuy 
          ? formatNumber(userBalance?.usdtSpotBalance || 0, 5) 
          : formatNumber(userBalance?.cryptoSpotBalance || 0, 5)} {isBuy 
            ? cryptoData?.usdtSymbol || 'USDT' 
            : cryptoData?.cryptoSymbol || 'BTC'}</span>
        <span>Max {isBuy ? 'buy' : 'sell'}: {formatNumber(getMaxAmount(), 5)} {cryptoData?.cryptoSymbol || 'BTC'}</span>
      </div>

      {/* Buy/Sell Button */}
      {isAuthenticated ? (
        <button
          className={`buy-btn${isBuy ? '' : ' sell-btn'}`}
          disabled={isLoading}
          onClick={handleTradeSubmit}
          style={{marginTop: 10, width: '100%', fontWeight: 600, fontSize: 18, padding: '12px 0', borderRadius: '4px'}}
        >
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin" style={{ marginRight: '8px' }}></i>
              Processing...
            </>
          ) : (
            isBuy ? `Buy ${cryptoData?.cryptoSymbol || 'BTC'}` : `Sell ${cryptoData?.cryptoSymbol || 'BTC'}`
          )}
        </button>
      ) : (
        <Link to="/login" className="login-button">Log in/Sign up</Link>
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
            <div className="notification-message">{notification.message}</div>
            <button className="notification-close" onClick={() => setNotification(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeForm;