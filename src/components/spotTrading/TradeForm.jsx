import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatNumber } from '../../utils/numberFormatter';

// Using relative imports to match the existing file structure
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
      const effectiveUid = uid || 'yE8vKBNw';
      const numPrice = parseFloat(price);
      const numAmount = parseFloat(amount);
      
      // IMPORTANT: Always use 'limit' as the execution type
      const executionType = 'limit';
      
      console.log('Executing trade:', {
        uid: effectiveUid,
        order_type: isBuy ? 'buy' : 'sell',
        excecution_type: executionType,
        price: numPrice,
        amount: numAmount
      });
      
      // Call the API directly since we can't import the trading service
      const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
      const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';
      const total_in_usdt = (numPrice * numAmount).toFixed(6);
      
      // Use the exact query format from the working example with corrected parameter name
      const url = `${API_BASE_URL}/orders?uid=${effectiveUid}&coin_id=1&order_type=${isBuy ? 'buy' : 'sell'}&excecution_type=${executionType}&price=${numPrice}&amount=${numAmount}&total_in_usdt=${total_in_usdt}&apikey=${API_KEY}`;
      
      console.log('Executing trade with URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error('Trade API error:', data);
        throw new Error(data.message || 'Trade execution failed');
      }
      
      console.log('Trade successful:', data);
      
      // Trade was successful
      setNotification({
        message: `${isBuy ? 'Buy' : 'Sell'} order placed for ${numAmount} ${cryptoData?.cryptoSymbol || 'BTC'}`,
        type: 'success'
      });
      
      // Reset form
      setAmount('');
      setTotal('');
      setSliderValue(0);
      
      // Trigger refresh of order history
      if (onTradeSuccess) {
        onTradeSuccess();
      }
      
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

  if (!cryptoData) {
    return <div className="trade-section loading">Loading trading form...</div>;
  }

  const { cryptoSymbol, cryptoLogoPath, usdtSymbol, usdtLogoPath } = cryptoData;
  
  // Safely convert balances to numbers and format them
  // This prevents the toFixed is not a function error
  const cryptoBalance = userBalance?.cryptoBalance !== undefined ? Number(userBalance.cryptoBalance) : 0;
  const usdtBalance = userBalance?.usdtBalance !== undefined ? Number(userBalance.usdtBalance) : 0;
  
  const formattedCryptoBalance = formatNumber(cryptoBalance, 5);
  const formattedUsdtBalance = formatNumber(usdtBalance, 2);

  // Custom notification component implementation
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
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v2h2v-2h-2zm0-8v6h2V7h-2z" fill="currentColor"/>
              </svg>
            )}
            {type === 'success' && (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#00B897' }}>
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-.997-6l7.07-7.071-1.414-1.414-5.656 5.657-2.829-2.829-1.414 1.414L11.003 16z" fill="currentColor"/>
              </svg>
            )}
            <span style={{ 
              fontWeight: '500',
              color: type === 'error' ? '#F23645' : 
                     type === 'success' ? '#00B897' : 
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
    <div className="trade-section">
      {notification && (
        <CustomNotification
          message={notification.message}
          onClose={() => setNotification(null)}
          type={notification.type}
        />
      )}
    
      <div className="trade-tabs">
        <div className="tab-actions">
          <div className="tab active">Trade</div>
          <div className="tab">Tools</div>
        </div>
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
        {['Limit', 'Market', 'TP/SL'].map((type) => (
          <div 
            key={type}
            className={`type ${activeOrderType.toLowerCase() === type.toLowerCase() ? 'active' : ''} ${type === 'TP/SL' ? 'dropdown' : ''}`}
            onClick={() => setActiveOrderType(type.toLowerCase())}
          >
            {type} {type === 'TP/SL' && <i className="fas fa-chevron-down"></i>}
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
            <span>0</span>
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
        <div className="available">
          Available: {isBuy ? formattedUsdtBalance : formattedCryptoBalance} {isBuy ? usdtSymbol : cryptoSymbol} <i className="fas fa-info-circle"></i>
        </div>
        <div className="max-buy">
          Max {isBuy ? 'buy' : 'sell'}: {
            isBuy 
              ? formatNumber(usdtBalance / (price || 1), 5) 
              : formattedCryptoBalance
          } {cryptoSymbol}
        </div>
      </div>

      <div className="tp-sl-check">
        <input 
          type="checkbox" 
          id="tp-sl-checkbox" 
          checked={tpslEnabled}
          onChange={() => setTpslEnabled(!tpslEnabled)}
        />
        <label htmlFor="tp-sl-checkbox">TP/SL</label>
      </div>

      {isAuthenticated ? (
        <button 
          className={`trade-button ${isBuy ? 'buy' : 'sell'}`}
          onClick={handleTradeSubmit}
          disabled={isLoading}
        >
          {isLoading ? 'Processing...' : isBuy ? `Buy ${cryptoSymbol}` : `Sell ${cryptoSymbol}`}
        </button>
      ) : (
        <Link to="/login" className="login-button">Log in/Sign up</Link>
      )}

      <div className="price-info">
        <div className="max-price">
          Max price <span>{formatPrice(price * 1.05)}</span>
        </div>
        <div className="fees">Fees <i className="fas fa-info-circle"></i></div>
      </div>

      <div className="assets">{usdtSymbol} assets</div>
    </div>
  );
};

export default TradeForm; 