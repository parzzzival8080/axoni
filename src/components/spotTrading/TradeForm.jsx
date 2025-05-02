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

  const handleSliderChange = (e) => {
    const value = parseInt(e.target.value);
    setSliderValue(value);
    
    // Calculate amount based on available balance
    const maxAmount = isBuy 
      ? parseFloat(userBalance?.usdtBalance || 0) / price 
      : parseFloat(userBalance?.cryptoBalance || 0);
    
    const calculatedAmount = (value / 100 * maxAmount).toFixed(5);
    setAmount(calculatedAmount);
    setTotal((calculatedAmount * price).toFixed(2));
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setAmount(value);
    
    // Calculate total based on amount
    setTotal((value * price).toFixed(2));
    
    // Update slider position
    const maxAmount = isBuy 
      ? parseFloat(userBalance?.usdtBalance || 0) / price 
      : parseFloat(userBalance?.cryptoBalance || 0);
    
    if (maxAmount > 0) {
      setSliderValue((value / maxAmount * 100) > 100 ? 100 : (value / maxAmount * 100));
    }
  };

  const handleTotalChange = (e) => {
    const value = e.target.value;
    // Validate number input
    if (!/^(\d*\.?\d*)?$/.test(value)) return;
    
    setTotal(value);
    
    // Calculate amount based on total
    const calculatedAmount = (value / price).toFixed(5);
    setAmount(calculatedAmount);
    
    // Update slider position
    const maxAmount = isBuy 
      ? parseFloat(userBalance?.usdtBalance || 0) / price 
      : parseFloat(userBalance?.cryptoBalance || 0);
    
    if (maxAmount > 0) {
      setSliderValue((calculatedAmount / maxAmount * 100) > 100 ? 100 : (calculatedAmount / maxAmount * 100));
    }
  };

  // Format price for display
  const formatPrice = (value) => {
    if (value === null || value === undefined || isNaN(Number(value))) {
      return '0.00';
    }
    return formatNumber(value, 2, true);
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
        excecution_type: activeOrderType, // <-- correct spelling for API
        price: price,
        amount: parseFloat(amount),
      };
      const result = await executeSpotTradeOrder(params);
      setIsLoading(false);
      if (result.success) {
        setNotification({ message: `${isBuy ? 'Buy' : 'Sell'} order placed successfully`, type: 'success' });
        setAmount('');
        setTotal('');
        setSliderValue(0);
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      } else {
        setNotification({ message: result.message || 'Trade failed', type: 'error' });
      }
    } catch (error) {
      setIsLoading(false);
      setNotification({ message: error.message || 'An error occurred while processing your trade', type: 'error' });
    }
  };

  // Extract symbols and format balances for display
  const cryptoSymbol = cryptoData?.cryptoSymbol || 'BTC';
  const usdtSymbol = cryptoData?.usdtSymbol || 'USDT';
  
  const cryptoBalance = parseFloat(userBalance?.cryptoBalance || 0);
  const usdtBalance = parseFloat(userBalance?.usdtBalance || 0);
  
  const formattedCryptoBalance = formatNumber(cryptoBalance, 5);
  const formattedUsdtBalance = formatNumber(usdtBalance, 2);

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
        <span style={{flex:1, textAlign:'right', fontFamily:'monospace', fontWeight:500}}>{total}</span>
      </div>

      {/* Balance info */}
      <div className="balance-info">
        <span>Available: {isBuy 
          ? formatNumber(userBalance?.usdtBalance || 0, 2) 
          : formatNumber(userBalance?.cryptoBalance || 0, 5)} {isBuy 
            ? cryptoData?.usdtSymbol || 'USDT' 
            : cryptoData?.cryptoSymbol || 'BTC'}</span>
        <span>Max {isBuy ? 'buy' : 'sell'}: {
          isBuy 
            ? formatNumber((userBalance?.usdtBalance || 0) / (price || 1), 5) 
            : formatNumber(userBalance?.cryptoBalance || 0, 5)
        } {cryptoData?.cryptoSymbol || 'BTC'}</span>
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