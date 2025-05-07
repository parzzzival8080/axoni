import React, { useState, useEffect } from 'react';
import { executeFutureTrade, fetchWalletData, formatPrice, calculateMaxAmount } from '../../services/futureTradingApi';
import './TradeForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faCaretUp, faCaretDown, faSyncAlt, faSpinner, faChevronDown, 
  faChartLine, faCheckCircle, faExclamationCircle, faInfoCircle, 
  faExclamationTriangle, faTimes, faQuestionCircle 
} from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

// Fixed action bar for mobile
const MobileTradeActionBar = styled.div`
  display: none;
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: #101010;
    z-index: 10001;
    box-shadow: 0 -2px 16px rgba(0,0,0,0.4);
    padding: 10px 16px 16px 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
  }
`;

// Scrollable content wrapper for the trade form (OKX dark mode, responsive)
const ScrollableFormContent = styled.div`
  flex: 1 1 auto;
  overflow-y: auto;
  max-height: 420px;
  min-height: 0;
  padding-right: 4px;
  scrollbar-width: thin;
  scrollbar-color: #222 #101010;

  &::-webkit-scrollbar {
    width: 8px;
    background: #101010;
  }
  &::-webkit-scrollbar-thumb {
    background: #222;
    border-radius: 8px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: #333;
  }

  @media (max-width: 900px) {
    max-height: 45vh;
  }
  @media (max-width: 768px) {
    max-height: calc(100vh - 90px);
  }
  @media (max-width: 600px) {
    max-height: 38vh;
  }
`;

/**
 * Get coin ID from coin pair ID using the favorites array
 * @param {number} coinPairId - Coin pair ID
 * @param {Array} tradableCoins - Array of tradable coins
 * @returns {number} - Coin ID (defaults to 1 for BTC if not found)
 */
const getCoinIdFromPair = (coinPairId, tradableCoins) => {
  if (!coinPairId || !Array.isArray(tradableCoins) || tradableCoins.length === 0) {
    return 1; // Default to BTC
  }
  
  const coinPairIdNum = Number(coinPairId);
  const coinObj = tradableCoins.find(f => f.coin_pair === coinPairIdNum);
  
  return coinObj ? coinObj.coin_id : 1;
};

/**
 * TradeForm Component
 * Handles futures trading form inputs, calculations, and order submission
 */
function TradeForm({ walletData, coinPairId, tradableCoins = [], onTradeSuccess, uid, isBottomSheet = false }) {
  // Form state
  const [activeTab, setActiveTab] = useState('trade');
  const [positionType, setPositionType] = useState('open');
  const [leverageMode, setLeverageMode] = useState('isolated');
  const [leverage, setLeverage] = useState('20');
  const [orderType, setOrderType] = useState('limit');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [tpslEnabled, setTpslEnabled] = useState(false);
  
  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [notification, setNotification] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token && !!userId);
  }, []);
  
  // Extract data from wallet
  const symbol = walletData?.symbol || 'BTC';
  const availableBalance = walletData?.available || '0';
  
  // Set initial price from wallet data when it changes
  useEffect(() => {
    if (walletData?.price) {
      setPrice(walletData.price);
    }
  }, [walletData]);
  
  // Calculate max amount based on wallet balance and leverage
  const calculateMaxTradeAmount = () => {
    if (!availableBalance || !price) return 0;
    
    return calculateMaxAmount(
      availableBalance,
      price,
      leverage
    );
  };
  
  // Format the max amount for display
  const formattedMaxAmount = calculateMaxTradeAmount();
  
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
    setLeverageMode(prev => prev === 'isolated' ? 'cross' : 'isolated');
  };
  
  // Handle leverage change
  const toggleLeverage = () => {
    // Cycle through common leverage values: 10x, 20x, 50x, 100x
    const leverageValues = ['10', '20', '50', '100'];
    const currentIndex = leverageValues.indexOf(leverage);
    const nextIndex = (currentIndex + 1) % leverageValues.length;
    setLeverage(leverageValues[nextIndex]);
  };
  
  // Handle order type change
  const handleOrderTypeClick = (type) => {
    setOrderType(type);
  };
  
  // Handle slider change
  const handleSliderChange = (e) => {
    const newSliderValue = parseFloat(e.target.value);
    setSliderValue(newSliderValue);
    
    // Calculate amount based on slider percentage
    const maxAmount = calculateMaxTradeAmount();
    const newAmount = (maxAmount * newSliderValue / 100).toFixed(6);
    setAmount(newAmount);
  };
  
  // Handle amount change
  const handleAmountChange = (e) => {
    const newAmount = e.target.value;
    setAmount(newAmount);
    
    // Update slider based on amount
    const maxAmount = calculateMaxTradeAmount();
    if (maxAmount > 0) {
      const newSliderValue = (parseFloat(newAmount) / maxAmount) * 100;
      setSliderValue(isNaN(newSliderValue) ? 0 : Math.min(newSliderValue, 100));
    } else {
      setSliderValue(0);
    }
  };
  
  // Calculate USDT value
  const calculateUsdtValue = () => {
    if (!amount || !price) return '0.00 USDT';
    
    const amountValue = parseFloat(amount) || 0;
    const priceValue = parseFloat(price) || 0;
    const usdtValue = amountValue * priceValue;
    
    return `${usdtValue.toFixed(2)} USDT`;
  };
  
  // Format number for display
  const formatNumber = (value, decimals = 2) => {
    if (!value || isNaN(value)) return '0.00';
    
    return parseFloat(value).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  // Refresh wallet balance
  const refreshWalletBalance = async () => {
    if (!uid) {
      setNotification({
        message: 'Authentication required to view balance',
        type: 'error'
      });
      return;
    }
    
    setIsLoadingBalance(true);
    
    try {
      // Use symbol directly instead of trying to get a coin ID
      console.log(`Refreshing wallet balance for user ${uid} with symbol ${symbol}`);
      
      // Fetch updated wallet data using the symbol instead of coin ID
      const data = await fetchWalletData(uid, symbol);
      
      if (data.error) {
        setNotification({
          message: data.message || 'Failed to refresh balance',
          type: 'error'
        });
      } else {
        // Clear any existing notifications
        setNotification(null);
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
      setNotification({
        message: error.message || 'Failed to refresh balance',
        type: 'error'
      });
    } finally {
      setIsLoadingBalance(false);
    }
  };
  
  // Handle trade submission
  const handleTradeSubmit = async () => {
    if (!uid) {
      setNotification({
        message: 'Authentication required. Please log in to trade.',
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
    
    if (!price || parseFloat(price) <= 0) {
      setNotification({
        message: 'Please enter a valid price',
        type: 'error'
      });
      return;
    }
    
    setIsLoading(true);
    setNotification(null);
    
    try {
      // Log the trade attempt
      console.log(`Attempting to execute ${positionType === 'open' ? 'Buy/Long' : 'Sell/Short'} order for ${amount} ${symbol} at ${price} USDT with ${leverage}x leverage`);
      
      // Prepare trade parameters with the exact parameters shown in the API screenshot
      const transaction_type = positionType === 'open' ? 'BUY MORE' : 'SELL SHORT';
      const tradeParams = {
        uid,
        symbol,
        entry_price: price, // Using entry_price instead of price to match API
        amount,
        leverage,
        transaction_type
      };
      
      console.log('Trade parameters:', tradeParams);
      
      // Execute the trade
      const result = await executeFutureTrade(tradeParams);
      
      console.log('Trade result:', result);
      
      if (result.error) {
        setNotification({
          message: result.message || 'Trade execution failed',
          type: 'error'
        });
      } else {
        // Show success notification
        setNotification({
          message: result.message || `${positionType === 'open' ? 'Buy' : 'Sell'} order placed for ${amount} ${symbol} with ${leverage}x leverage`,
          type: 'success'
        });
        
        // Notify parent component of successful trade to trigger wallet refresh
        if (typeof onTradeSuccess === 'function') {
          console.log('Notifying parent of successful trade to refresh wallet data');
          onTradeSuccess();
        }
        
        // Reset form
        setAmount('');
        setSliderValue(0);
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
  
  return (
    <div className="trade-form">
      <ScrollableFormContent className={isBottomSheet ? 'bottom-sheet-mode' : ''}>
      {/* Tabs */}
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

      {/* Notification */}
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

      {/* Position Type */}
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

      {/* Leverage */}
      <div className="leverage-section">
        <div className="leverage-mode">
          <button
            className={`leverage-mode-btn ${leverageMode === 'isolated' ? 'active' : ''}`}
            onClick={toggleLeverageMode}
          >
            Isolated
          </button>
          <button
            className={`leverage-mode-btn ${leverageMode === 'cross' ? 'active' : ''}`}
            onClick={toggleLeverageMode}
          >
            Cross
          </button>
        </div>
        <div className="leverage-value" onClick={toggleLeverage}>
          <span>{leverage}</span>×
          <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: '4px', fontSize: '10px' }} />
        </div>
      </div>

      {/* Order Type */}
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
            placeholder="0.00"
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
            {isAuthenticated ? (
              <>
                <div className="available-balance">
                  {isLoadingBalance ? (
                    <div className="loading-balance">
                      <span className="loading-text">Loading balance</span>
                      <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                      <FontAwesomeIcon icon={faSpinner} spin style={{ marginLeft: '8px' }} />
                    </div>
                  ) : (
                    <>
                      <span>Available {formatNumber(availableBalance, 6)} {symbol}</span>
                      <button 
                        className="info-btn" 
                        onClick={refreshWalletBalance}
                        disabled={isLoadingBalance}
                      >
                        {isLoadingBalance ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSyncAlt} />}
                      </button>
                    </>
                  )}
                </div>
                <div className="max-values">
                  <span className="max-long">
                    Max long {formatNumber(formattedMaxAmount, 6)} {symbol}
                  </span>
                  <span className="max-short">
                    Max short {formatNumber(formattedMaxAmount, 6)} {symbol}
                  </span>
                </div>
              </>
            ) : (
              <div className="login-message" style={{ textAlign: 'center', padding: '10px', color: '#999' }}>
                Login to view your balance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Button (now directly above cost section) */}
      <div className="trade-action-btn-row" style={{ margin: '16px 0 8px 0', display: 'flex', justifyContent: 'center' }}>
        {isAuthenticated ? (
          <button
            className={`action-btn ${positionType === 'open' ? 'buy-more' : 'sell'}`}
            onClick={handleTradeSubmit}
            disabled={isLoading}
            style={{ width: '100%', maxWidth: 480 }}
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
        ) : (
          <button 
            className="future-login-pill-btn"
            onClick={() => window.location.href = '/login'}
            style={{ width: '100%', maxWidth: 480 }}
          >
            LOGIN TO TRADE
          </button>
        )}
      </div>

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
      </ScrollableFormContent>


    </div>
  );
}

export default TradeForm;