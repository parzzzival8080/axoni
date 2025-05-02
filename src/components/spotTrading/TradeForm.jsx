import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../utils/numberFormatter';

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
      // Clear any existing notifications
      setNotification(null);
      
      if (!isAuthenticated) {
        setNotification({
          message: 'Please log in to trade',
          type: 'error'
        });
        return;
      }

      if (!amount || parseFloat(amount) <= 0) {
        setNotification({
          message: 'Please enter a valid amount',
          type: 'error'
        });
        return;
      }

      if (parseFloat(amount) < 0.00001) {
        setNotification({
          message: `Amount must be at least 0.00001 ${cryptoData?.cryptoSymbol || 'BTC'}`,
          type: 'error'
        });
        return;
      }

      setIsLoading(true);
      
      // Use the effective UID (either from localStorage or default)
      const effectiveUid = uid || localStorage.getItem('uid') || 'yE8vKBNw';
      
      // Simulate API call with a delay
      setTimeout(() => {
        console.log('Trade submitted:', {
          type: isBuy ? 'buy' : 'sell',
          orderType: activeOrderType,
          price,
          amount,
          total,
          coinPairId,
          uid: effectiveUid
        });
        
        // Simulate successful trade
        setIsLoading(false);
        setNotification({
          message: `${isBuy ? 'Buy' : 'Sell'} order placed successfully`,
          type: 'success'
        });
        
        // Reset form
        setAmount('');
        setTotal('');
        setSliderValue(0);
        
        // Notify parent component to refresh balances
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      }, 1500);
      
      // In a real implementation, you would make an API call here
      /*
      const response = await axios.post('https://api.example.com/trade', {
        type: isBuy ? 'buy' : 'sell',
        orderType: activeOrderType,
        price,
        amount,
        total,
        coinPairId,
        uid: effectiveUid
      });
      
      if (response.data.success) {
        setIsLoading(false);
        setNotification({
          message: `${isBuy ? 'Buy' : 'Sell'} order placed successfully`,
          type: 'success'
        });
        
        // Reset form
        setAmount('');
        setTotal('');
        setSliderValue(0);
        
        // Notify parent component to refresh balances
        if (onTradeSuccess) {
          onTradeSuccess();
        }
      } else {
        throw new Error(response.data.message || 'Trade failed');
      }
      */
    } catch (error) {
      console.error('Trade error:', error);
      setIsLoading(false);
      setNotification({
        message: error.message || 'An error occurred while processing your trade',
        type: 'error'
      });
    }
  };

  // Extract symbols and format balances for display
  const cryptoSymbol = cryptoData?.cryptoSymbol || 'BTC';
  const usdtSymbol = cryptoData?.usdtSymbol || 'USDT';
  
  const cryptoBalance = parseFloat(userBalance?.cryptoBalance || 0);
  const usdtBalance = parseFloat(userBalance?.usdtBalance || 0);
  
  const formattedCryptoBalance = formatNumber(cryptoBalance, 5);
  const formattedUsdtBalance = formatNumber(usdtBalance, 2);

  // Custom notification component implementation
  const CustomNotification = ({ message, type, onClose }) => {
    useEffect(() => {
      // Auto-close notification after 5 seconds
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, 5000);
      
      return () => clearTimeout(timer);
    }, [onClose]);
    
    return (
      <div className={`notification ${type}`}>
        <div className="notification-content">
          <div className="notification-message">{message}</div>
          <button className="notification-close" onClick={onClose}>×</button>
        </div>
      </div>
    );
  };

  return (
    <div className="trade-form">
      <div className="top-controls">
        <div className="margin-toggle">
          <span>Margin</span>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="buy-sell-tabs">
        <div 
          className={`tab ${isBuy ? 'buy active' : ''}`} 
          onClick={() => setIsBuy(true)}
        >
          Buy
        </div>
        <div 
          className={`tab ${!isBuy ? 'sell active' : ''}`} 
          onClick={() => setIsBuy(false)}
        >
          Sell
        </div>
      </div>

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

      <div className="form-group">
        <label>Price ({usdtSymbol})</label>
        <div className="input-wrapper">
          <input 
            type="text" 
            value={formatPrice(price)} 
            onChange={(e) => setPrice(Number(e.target.value.replace(/,/g, '')))}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                e.preventDefault();
              }
            }}
          />
          <span className="input-note">≈ ${formatPrice(price)}</span>
        </div>
      </div>

      <div className="form-group">
        <label>Amount ({cryptoSymbol})</label>
        <input 
          type="text" 
          value={amount} 
          onChange={handleAmountChange}
          placeholder={`Min 0.00001 ${cryptoSymbol}`}
        />
        <div className="slider-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue} 
            className="range-slider"
            onChange={handleSliderChange}
          />
          <div className="slider-labels">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Total ({usdtSymbol})</label>
        <input 
          type="text" 
          placeholder="0.00" 
          value={total}
          onChange={handleTotalChange}
        />
      </div>

      <div className="balance-info">
        <span>Available: {isBuy ? formattedUsdtBalance : formattedCryptoBalance} {isBuy ? usdtSymbol : cryptoSymbol}</span>
        <span>Max {isBuy ? 'buy' : 'sell'}: {
          isBuy 
            ? formatNumber(usdtBalance / (price || 1), 5) 
            : formattedCryptoBalance
        } {cryptoSymbol}</span>
      </div>

      {isAuthenticated ? (
        <button 
          className={`trade-button ${isBuy ? 'buy' : 'sell'}`}
          onClick={e => {
            e.preventDefault();
            handleTradeSubmit();
          }}
          disabled={isLoading}
          type="button"
        >
          {isLoading ? 'Processing...' : isBuy ? `Buy ${cryptoSymbol}` : `Sell ${cryptoSymbol}`}
        </button>
      ) : (
        <Link to="/login" className="login-button">Log in/Sign up</Link>
      )}

      <div className="price-info">
        <span>Max price: {formatPrice(price * 1.05)}</span>
        <span>Fees: 0.1%</span>
      </div>

      {notification && (
        <CustomNotification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
    </div>
  );
};

export default TradeForm;