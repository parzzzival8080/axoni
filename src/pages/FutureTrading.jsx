import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import SubHeader from '../components/futureTrading/SubHeader';
import FavoritesBar from '../components/futureTrading/FavoritesBar';
import TradingChartDynamic from '../components/futureTrading/TradingChartDynamic';
import OrderBook from '../components/futureTrading/OrderBook';
import TradeForm from '../components/futureTrading/TradeForm';
import OrdersSection from '../components/futureTrading/OrdersSection';
import { fetchTradableCoins, fetchWalletData } from '../services/futureTradingApi';
import '../components/futureTrading/FutureTrading.css';
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
    const loadWalletData = async () => {
      if (!uid) {
        setError("Please log in to access trading features");
        setLoading(false);
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
    
    loadWalletData();
  }, [coinPairId, uid]);
  
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
    const refreshWalletData = async () => {
      if (!uid) return;
      
      try {
        console.log('FutureTrading: Refreshing wallet data for coin pair ID:', coinPairId);
        const data = await fetchWalletData(uid, coinPairId);
        
        if (!data.error) {
          console.log('FutureTrading: Wallet data refreshed successfully:', data);
          setWalletData(data);
        } else {
          console.error('FutureTrading: Error refreshing wallet data:', data.message);
        }
      } catch (err) {
        console.error('FutureTrading: Exception refreshing wallet data:', err);
      }
    };
    
    refreshWalletData();
    
    // Refresh order history
    setOrderHistoryRefreshTrigger(prev => prev + 1);
  }, [coinPairId, uid]);
  
  // Format wallet data for SubHeader component
  const getSubHeaderData = () => {
    if (!walletData) return null;
    
    return {
      cryptoName: walletData.name,
      cryptoSymbol: walletData.symbol,
      cryptoPrice: walletData.price,
      cryptoLogoPath: walletData.cryptoWallet?.logo_path,
      usdtSymbol: walletData.usdtWallet?.crypto_symbol || 'USDT'
    };
  };
  
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
      <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
        <div className="notification-content">
          <div className="notification-icon">
            <FontAwesomeIcon 
              icon={notification.type === 'success' ? faCheckCircle : faTimesCircle} 
            />
          </div>
          <div className="notification-message">
            {notification.message}
          </div>
        </div>
        <button 
          className="notification-close" 
          onClick={() => setNotification(prev => ({ ...prev, show: false }))}
        >
          ×
        </button>
      </div>
    );
  };
  
  // Error state
  if (error && !walletData) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="future-trading-container">
      <SubHeader 
        cryptoData={getSubHeaderData()} 
        coinPairId={coinPairId}
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
            cryptoData={getSubHeaderData()}
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
    </div>
  );
};

export default FutureTrading;