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
  const handleTradeSuccess = useCallback(() => {
    console.log('FutureTrading: Trade successful, refreshing data...');
    
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
  
  // Loading state
  if (loading && !walletData) {
    return <div className="loading-screen">Loading trading data...</div>;
  }
  
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
      {loading ? (
        <div className="loading-overlay">
          <div className="loading-spinner">Loading trading data...</div>
        </div>
      ) : (
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
        </>
      )}
    </div>
  );
};

export default FutureTrading;