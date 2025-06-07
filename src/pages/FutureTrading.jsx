import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import SubHeader from '../components/futureTrading/SubHeader';
import FavoritesBar from '../components/futureTrading/FavoritesBar';
import TradingChartDynamic from '../components/futureTrading/TradingChartDynamic';
import OrderBook from '../components/futureTrading/OrderBook';
import TradeForm from '../components/futureTrading/TradeForm';
import OrdersSection from '../components/futureTrading/OrdersSection';
import FutureTradingWalkthroughTrigger from '../components/futureTrading/FutureTradingWalkthroughTrigger';
import { fetchTradableCoins, fetchWalletData } from '../services/futureTradingApi';
import '../components/futureTrading/FutureTrading.css';
import '../components/futureTrading/FutureNotification.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons';

/**
 * Future Trading Page Component
 * Manages the overall state and data flow for the futures trading interface
 */
const FutureTrading = () => {
  // URL parameters
  const [searchParams, setSearchParams] = useSearchParams();
  const coinPairId = Number(searchParams.get('coin_pair_id')) || 1;
  
  // Core state
  const [tradableCoins, setTradableCoins] = useState([]);
  const [walletData, setWalletData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderHistoryRefreshTrigger, setOrderHistoryRefreshTrigger] = useState(0);
  const [mobileTradeTab, setMobileTradeTab] = useState(''); // '' | 'buy' | 'sell'
  
  // Notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  
  // User authentication
  const [uid, setUid] = useState(localStorage.getItem('uid') || '');
  
  // Fetch available tradable coins on component mount
  useEffect(() => {
    const loadTradableCoins = async () => {
      const coins = await fetchTradableCoins();
      setTradableCoins(coins);
    };
    
    loadTradableCoins();
  }, []);
  
  // Fetch wallet data when coinPairId or uid changes
  useEffect(() => {
    const loadInitialWalletData = async () => {
      if (!uid) {
        setError("Please log in to access trading features");
        setLoading(false);
        setWalletData(null); // Clear previous wallet data
        return;
      }
      
      setLoading(true);
      
      try {
        // Get wallet data for the selected coin
        const data = await fetchWalletData(uid, coinPairId);
        
        if (data.error) {
          setError(data.message);
          setWalletData(null);
        } else {
          setWalletData(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load trading data. Please try again.');
        setWalletData(null);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialWalletData();
  }, [coinPairId, uid]);

  // --- Real-time polling for live futures price and 24h change ---
  useEffect(() => {
    if (!walletData?.symbol) return;
    let isMounted = true;
    let pollingRef = { current: null };

    const pollPrice = async () => {
      try {
        // Always fetch the freshest tradable coins (bypass cache)
        const coins = await fetchTradableCoins(true); // forceRefresh=true
        if (!isMounted || !Array.isArray(coins)) return;
        const coin = coins.find(c => c.symbol === walletData.symbol);
        if (coin) {
          const { price, price_change_24h } = coin;
          setWalletData(prev => {
            if (!prev) return prev;
            if (
              prev.price !== price ||
              prev.price_change_24h !== price_change_24h
            ) {
              return {
                ...prev,
                price,
                price_change_24h
              };
            }
            return prev;
          });
        }
      } catch (err) {
        // Optionally handle polling error
      }
    };
    pollingRef.current = setInterval(pollPrice, 1000);
    pollPrice(); // Initial call
    return () => {
      isMounted = false;
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [walletData?.symbol]);

  // Refresh wallet data function, memoized with useCallback
  const refreshWalletData = useCallback(async () => {
    if (!uid) return;

    console.log('FutureTrading: Refreshing wallet data for coin pair ID:', coinPairId);
    try {
      const data = await fetchWalletData(uid, coinPairId);
      if (!data.error) {
        setWalletData(data);
        setError(null); // Clear previous errors on successful refresh
      } else {
        // Optionally set error from refresh if needed, or just log
        console.error('Error refreshing wallet data:', data.message);
        // setError(data.message); // Uncomment if you want to show refresh errors prominently
      }
    } catch (err) {
      console.error('Failed to refresh wallet data:', err);
      // setError('Failed to refresh data.'); // Uncomment if you want to show refresh errors prominently
    }
  }, [uid, coinPairId]);
  
  // Handle coin selection from FavoritesBar
  const handleCoinSelect = useCallback((selectedCoinPairId) => {
    if (selectedCoinPairId !== coinPairId) {
      console.log('FutureTrading: Changing coin to pair ID:', selectedCoinPairId);
      setSearchParams({ coin_pair_id: selectedCoinPairId });
    }
  }, [coinPairId, setSearchParams]);
  
  // Handle successful trade execution
  const handleTradeSuccess = useCallback((message) => {
    console.log('FutureTrading: Trade successful, refreshing data...');
    
    // Show success notification
    setNotification({
      show: true,
      message: message || 'Future trade executed successfully',
      type: 'success'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
    
    // Refresh wallet data
    refreshWalletData(); // Call the memoized refresh function
    
    // Trigger refresh for orders section (if it relies on a separate trigger)
    setOrderHistoryRefreshTrigger(prev => prev + 1);
    
  }, [refreshWalletData]); // Add refreshWalletData to dependencies
  
  // Format wallet data for SubHeader component, memoized with useMemo
  const subHeaderData = useMemo(() => {
    if (!walletData) return null;
    
    return {
      cryptoName: walletData.name,
      cryptoSymbol: walletData.symbol,
      cryptoPrice: walletData.price,
      cryptoLogoPath: walletData.cryptoWallet?.logo_path,
      usdtSymbol: walletData.usdtWallet?.crypto_symbol || 'USDT'
    };
  }, [walletData]);
  
  // Mobile app bar buy/sell buttons handler
  const handleMobileTradeTab = (tab) => {
    setMobileTradeTab(mobileTradeTab === tab ? '' : tab);
  };

  // Mobile bottom sheet trade form
  const renderMobileTradeForm = () => (
    <>
      <div className={`future-mobile-trade-overlay${mobileTradeTab ? ' open' : ''}`} 
           onClick={() => setMobileTradeTab('')}></div>
      <div className={`future-mobile-trade-form-sheet${mobileTradeTab ? ' open' : ''}`}>
        <div className="future-mobile-trade-form-header">
          <div className="future-mobile-trade-form-title">
            {mobileTradeTab === 'buy' ? 'Buy / Long' : 'Sell / Short'} {walletData?.symbol}
          </div>
          <button className="future-mobile-trade-form-close" onClick={() => setMobileTradeTab('')}>
            ×
          </button>
        </div>
        <div className="future-mobile-trade-form-content">
          <TradeForm
            walletData={walletData}
            coinPairId={coinPairId}
            tradableCoins={tradableCoins}
            onTradeSuccess={handleTradeSuccess}
            uid={uid}
            positionType={mobileTradeTab === 'buy' ? 'open' : 'close'}
          />
        </div>
      </div>
    </>
  );
  
  // Render notification
  const renderNotification = () => {
    if (!notification.show) return null;
    
    return (
      <div className={`future-notification ${notification.type === 'error' ? 'error' : ''}`}>
        <div className="future-notification-content">
          <div className="future-notification-icon">
            <FontAwesomeIcon 
              icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} 
            />
          </div>
          <div className="future-notification-message">
            {notification.message}
          </div>
        </div>
        <button 
          className="future-notification-close" 
          onClick={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          ×
        </button>
      </div>
    );
  };
  
  // Optionally: show a non-blocking inline warning (never block the UI)
  // Example: {error && !walletData && <div className="inline-warning">{error}</div>}

  return (
    <div className="future-trading-container">
      <SubHeader 
        cryptoData={subHeaderData} // Use memoized data
        coinPairId={coinPairId}
        tradableCoins={tradableCoins} // Pass tradableCoins as a prop
      />
      <FavoritesBar 
        activeCoinPairId={coinPairId} 
        tradableCoins={tradableCoins}
        onCoinSelect={handleCoinSelect}
      />
      <>
        <div className="main-container">
          <TradingChartDynamic 
            selectedSymbol={walletData?.symbol} 
          />
          <OrderBook 
            cryptoData={subHeaderData} // Use memoized data for OrderBook too if it consumes similar props
          />
          <div className="trade-form-container desktop-only">
            <TradeForm 
              walletData={walletData}
              coinPairId={coinPairId}
              tradableCoins={tradableCoins}
              onTradeSuccess={handleTradeSuccess}
              uid={uid}
            />
          </div>
        </div>
        <div className="orders-container">
          <OrdersSection refreshTrigger={orderHistoryRefreshTrigger} />
        </div>
        {/* Mobile app bar with buy/sell buttons */}
        <div className="future-mobile-trade-bar">
          <button 
            className="future-mobile-trade-btn buy" 
            onClick={() => handleMobileTradeTab('buy')}
          >
            Buy / Long
          </button>
          <button 
            className="future-mobile-trade-btn sell" 
            onClick={() => handleMobileTradeTab('sell')}
          >
            Sell / Short
          </button>
        </div>
        {renderMobileTradeForm()}
        {renderNotification()}
      </>
      
      {/* Walkthrough Trigger */}
      <FutureTradingWalkthroughTrigger />
    </div>
  );
};

export default FutureTrading;