import React, { useState, useEffect } from 'react';
import { getFutureBalance, executeFutureTradeOrder, fetchWalletForCoin } from '../../services/futureTradingApi';
import './TradeForm.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretUp, faCaretDown, faSyncAlt, faSpinner, faChevronDown, faChartLine, faCheckCircle, faExclamationCircle, faInfoCircle, faExclamationTriangle, faTimes, faQuestionCircle } from '@fortawesome/free-solid-svg-icons';

// Utility: Get coinId from coinPairId (FavoritesBar and SubHeader pass coinPairId)
const getCoinIdFromPair = (coinPairId, favorites) => {
  // Try to find the coin object in favorites
  if (!coinPairId || !Array.isArray(favorites)) return 1; // Default to BTC
  
  // Convert coinPairId to number for comparison
  const coinPairIdNum = Number(coinPairId);
  console.log(`Looking for coin with coin_pair = ${coinPairIdNum} in favorites:`, favorites);
  
  // Find the coin object with matching coin_pair
  const coinObj = favorites.find(f => f.coin_pair === coinPairIdNum);
  console.log('Found coin object:', coinObj);
  
  // Return the coin_id if found, otherwise default to 1 (BTC)
  return coinObj ? coinObj.coin_id : 1;
};

function TradeForm({ cryptoData, userBalance, coinPairId, favorites = [], onTradeSuccess }) {
  console.log('TradeForm: Rendering with coinPairId:', coinPairId);
  console.log('TradeForm: cryptoData:', cryptoData);
  
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
  const [pairCoinId, setPairCoinId] = useState(Number(coinPairId) || 1); // 1=BTC, 2=USDT
  const [pairWallet, setPairWallet] = useState(null);
  const [isLoadingPairWallet, setIsLoadingPairWallet] = useState(false);
  const [pairWalletError, setPairWalletError] = useState(null);

  // API constants
  const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
  const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';

  // Check if user is authenticated on component mount
  useEffect(() => {
    console.log('TradeForm: Initial mount effect');
    // First check for user authentication
    const userUid = localStorage.getItem('uid');

    if (userUid) {
      console.log('User UID from localStorage:', userUid);
      setUid(userUid);
      setIsLoggedIn(true);
    } else {
      console.log('No user authenticated. Please login to trade.');
      setIsLoggedIn(false);
      setNotification({
        message: 'Please log in to access future trading features',
        type: 'info'
      });
    }
  }, []);

  // Reset state when coinPairId changes
  useEffect(() => {
    console.log('TradeForm: coinPairId changed to', coinPairId);
    
    // Reset state
    setPairWallet(null);
    setAmount('');
    setSliderValue(0);
    setPairWalletError(null);
    
    // Show loading state immediately
    setIsLoadingPairWallet(true);
    
    // Update pairCoinId directly from prop
    const newCoinId = Number(coinPairId) || 1;
    console.log(`TradeForm: Setting pairCoinId directly to ${newCoinId}`);
    setPairCoinId(newCoinId);
    
    // If we have a UID, fetch wallet data for the new coin
    if (uid) {
      console.log(`TradeForm: Fetching wallet data for new coin ID ${newCoinId}`);
      // Use a timeout to ensure state updates have propagated
      setTimeout(() => {
        fetchPairWallet(uid, newCoinId);
      }, 300);
    }
  }, [coinPairId, uid]);

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

  // Update pairCoinId when coinPairId changes (from FavoritesBar)
  useEffect(() => {
    console.log('TradeForm: coinPairId changed to', coinPairId);
    console.log('TradeForm: favorites:', favorites);
    
    if (coinPairId) {
      // First try to get coin_id from favorites
      if (favorites && favorites.length > 0) {
        const newCoinId = getCoinIdFromPair(coinPairId, favorites);
        console.log(`Setting pairCoinId to ${newCoinId} based on coinPairId ${coinPairId} from favorites`);
        setPairCoinId(newCoinId);
      } 
      // If we don't have favorites data, try to get coin_id from cryptoData
      else if (cryptoData?.cryptoWallet?.coin_id) {
        console.log(`Setting pairCoinId to ${cryptoData.cryptoWallet.coin_id} from cryptoData.cryptoWallet`);
        setPairCoinId(cryptoData.cryptoWallet.coin_id);
      }
      // If we don't have cryptoData.cryptoWallet, use the coinPairId directly
      else {
        // For many APIs, coin_pair_id is the same as coin_id
        console.log(`No favorites or cryptoData.cryptoWallet, using coinPairId ${coinPairId} directly`);
        setPairCoinId(Number(coinPairId));
      }
    } else if (cryptoData?.cryptoWallet?.coin_id) {
      console.log(`No coinPairId, setting pairCoinId to ${cryptoData.cryptoWallet.coin_id} from cryptoData.cryptoWallet`);
      setPairCoinId(cryptoData.cryptoWallet.coin_id);
    } else {
      console.log('No coinPairId or cryptoData.cryptoWallet, defaulting to 1 (BTC)');
      setPairCoinId(1); // Default BTC
    }
  }, [coinPairId, favorites, cryptoData]);

  // Force refresh when coinPairId changes directly
  useEffect(() => {
    console.log(`TradeForm: coinPairId prop changed to ${coinPairId}, forcing wallet refresh`);
    
    // If we have a UID, force refresh the wallet data
    if (uid && pairCoinId) {
      // Short timeout to ensure state updates have propagated
      setTimeout(() => {
        console.log(`TradeForm: Refreshing wallet data for coinId: ${pairCoinId}`);
        if (pairCoinId && !isNaN(pairCoinId) && pairCoinId !== undefined) {
          fetchPairWallet(uid, pairCoinId);
        } else {
          console.error(`TradeForm: Invalid coinId (${pairCoinId}), cannot fetch wallet`);
        }
      }, 300); // Increased timeout to ensure state is updated
    }
  }, [coinPairId]); // Only depend on coinPairId to avoid circular dependencies

  // Fetch pair wallet when pairCoinId changes
  useEffect(() => {
    if (uid && pairCoinId) {
      console.log(`Fetching wallet data for coinId: ${pairCoinId}`);
      if (pairCoinId && !isNaN(pairCoinId) && pairCoinId !== undefined) {
        fetchPairWallet(uid, pairCoinId);
      } else {
        console.error(`TradeForm: Invalid coinId (${pairCoinId}), cannot fetch wallet`);
      }
    }
  }, [uid, pairCoinId]);

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

  // Fetch wallet and price for the selected pair
  const fetchPairWallet = async (uid, coinId) => {
    // Validate inputs
    if (!uid) {
      console.error('TradeForm.fetchPairWallet: Missing UID');
      setPairWalletError('User ID is required');
      return;
    }
    
    if (!coinId || isNaN(coinId) || coinId === undefined) {
      console.error(`TradeForm.fetchPairWallet: Invalid coin ID: ${coinId}`);
      setPairWalletError('Invalid coin ID');
      return;
    }
    
    console.log(`TradeForm.fetchPairWallet: Fetching wallet for UID ${uid}, Coin ID ${coinId}`);
    setIsLoadingPairWallet(true);
    setPairWalletError(null);
    
    try {
      const result = await fetchWalletForCoin(uid, coinId);
      console.log('TradeForm.fetchPairWallet: API result:', result);
      
      if (result && !result.error) {
        console.log('TradeForm.fetchPairWallet: Successfully fetched wallet data:', result);
        
        // Verify we're still on the same coin before updating state
        // This prevents race conditions when changing coins quickly
        if (coinId === pairCoinId) {
          setPairWallet(result);
          
          // Update price from API data
          if (result.cryptoWallet?.price) {
            setPrice(result.cryptoWallet.price);
          }
          
          // Update symbol based on the fetched data
          if (result.cryptoWallet?.crypto_symbol) {
            console.log(`TradeForm: Updating symbol to ${result.cryptoWallet.crypto_symbol}`);
          }
        } else {
          console.log(`TradeForm: Ignoring stale wallet data for coin ${coinId}, current is ${pairCoinId}`);
        }
      } else {
        console.error('TradeForm.fetchPairWallet: Error in response:', result);
        setPairWallet(null);
        setPairWalletError(result.message || 'Failed to fetch pair wallet');
      }
    } catch (error) {
      console.error('TradeForm.fetchPairWallet: Exception:', error);
      setPairWallet(null);
      setPairWalletError(error.message || 'An error occurred');
    } finally {
      setIsLoadingPairWallet(false);
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

  // Calculate formatted values for display
  const formattedAvailable = walletBalance.availableBalance || '0.00';
  const formattedMaxAmount = calculateMaxAmount();

  // Get the correct future_wallet balance based on selected coin
  const getCryptoFutureWallet = () => {
    if (!pairWallet || !pairWallet.cryptoWallet) return '0.00';
    return pairWallet.cryptoWallet.future_wallet || '0.00';
  };

  // Format the future wallet balance for display
  const formatWalletBalance = (balance) => {
    if (!balance) return '0.00';
    const num = parseFloat(balance);
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
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
            value={pairWallet?.price || price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isLoadingPairWallet}
          />
          <div className="price-controls">
            <button className="price-control up"><FontAwesomeIcon icon={faCaretUp} /></button>
            <button className="price-control down"><FontAwesomeIcon icon={faCaretDown} /></button>
          </div>
          <button className="market-price-btn">BBO</button>
        </div>
        {isLoadingPairWallet && <div className="loading-state">Loading price...</div>}
        {pairWalletError && <div className="error-state">{pairWalletError}</div>}
      </div>

      {/* Amount Input */}
      <div className="amount-input-section">
        <div className="amount-label">
          Amount ({pairWallet?.cryptoWallet?.crypto_symbol || symbol}) <FontAwesomeIcon icon={faChevronDown} style={{ fontSize: '10px' }} />
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
              {isLoadingPairWallet ? (
                <div className="loading-balance">
                  <span className="loading-text">Loading balance</span>
                  <span className="loading-dots"><span>.</span><span>.</span><span>.</span></span>
                  <FontAwesomeIcon icon={faSpinner} spin style={{ marginLeft: '8px' }} />
                </div>
              ) : pairWalletError ? (
                <div className="error-balance">
                  Error loading balance <FontAwesomeIcon icon={faExclamationCircle} />
                </div>
              ) : (
                <>
                  Available {formatWalletBalance(getCryptoFutureWallet())} {pairWallet?.cryptoWallet?.crypto_symbol || symbol}
                </>
              )}
              <button 
                className="info-btn" 
                onClick={() => fetchPairWallet(uid, pairCoinId)}
                disabled={isLoadingPairWallet}
              >
                {isLoadingPairWallet ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faSyncAlt} />}
              </button>
            </div>
            <div className="pair-id-hint" style={{ color: '#8c8c8c', fontSize: '11px', marginTop: '2px' }}>
              Selected Coin ID: {pairWallet?.cryptoWallet?.coin_id || pairCoinId} | Symbol: {pairWallet?.cryptoWallet?.crypto_symbol || symbol}
            </div>
            <div className="max-values">
              <span className="max-long">
                Max long {formatNumber(formattedMaxAmount, 6)} {pairWallet?.cryptoWallet?.crypto_symbol || symbol}
              </span>
              <span className="max-short">
                Max short {formatNumber(formattedMaxAmount, 6)} {pairWallet?.cryptoWallet?.crypto_symbol || symbol}
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