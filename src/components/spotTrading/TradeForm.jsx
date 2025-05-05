import React, { useState, useEffect } from 'react';
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
    const formattedAmount = calculatedAmount.toFixed(5);
    setAmount(formattedAmount);
    
    // Update slider position
    const maxAmount = getMaxAmount();
    
    if (maxAmount > 0) {
      const sliderPercentage = (calculatedAmount / maxAmount) * 100;
      setSliderValue(sliderPercentage > 100 ? 100 : sliderPercentage);
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
      
      // Validate coin pair ID
      if (!coinPairId) {
        setNotification({ message: 'Invalid coin pair selected', type: 'error' });
        return;
      }
      
      setIsLoading(true);
      const effectiveUid = uid || localStorage.getItem('uid') || 'yE8vKBNw';
      const symbol = cryptoData?.cryptoSymbol || 'BTC';
      
      console.log('Executing spot trade with coin pair ID:', coinPairId);
      console.log('Current crypto data:', cryptoData);
      
      const params = {
        uid: effectiveUid,
        symbol,
        coin_pair_id: coinPairId, // Add the coin pair ID to the params
        order_type: isBuy ? 'buy' : 'sell',
        excecution_type: activeOrderType,
        price: parseFloat(price),
        amount: parseFloat(amount)
      };
      
      console.log('Trade parameters:', params);
      
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
        {isAuthenticated ? (
          <>
            <span>Available: {isBuy 
              ? formatNumber(userBalance?.usdtSpotBalance || 0, 5) 
              : formatNumber(userBalance?.cryptoSpotBalance || 0, 5)} {isBuy 
                ? cryptoData?.usdtSymbol || 'USDT' 
                : cryptoData?.cryptoSymbol || 'BTC'}</span>
            <span>Max {isBuy ? 'buy' : 'sell'}: {formatNumber(getMaxAmount(), 5)} {cryptoData?.cryptoSymbol || 'BTC'}</span>
          </>
        ) : (
          <span>Login to view your balance</span>
        )}
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
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            borderRadius: '9999px',
            width: '100%',
            height: '48px',
            marginTop: '20px',
            marginBottom: '10px',
            fontWeight: '700',
            fontSize: '16px',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            backgroundColor: '#FFFFFF',
            color: '#000000',
            border: 'none',
            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
            cursor: 'pointer',
            outline: 'none'
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
            <div className="notification-message">{notification.message}</div>
            <button className="notification-close" onClick={() => setNotification(null)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeForm;