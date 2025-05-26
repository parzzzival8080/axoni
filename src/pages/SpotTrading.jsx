import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import OrdersSection from '../components/spotTrading/OrdersSection';
import { getSpotWallet, fetchAllCoins, fetchCoinDetails } from '../services/spotTradingApi';
import '../components/spotTrading/SpotTrading.css';

const SpotTrading = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [userBalance, setUserBalance] = useState({
    cryptoSpotBalance: 0,
    usdtSpotBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [orderHistoryRefreshTrigger, setOrderHistoryRefreshTrigger] = useState(0);
  const [mobileTradeTab, setMobileTradeTab] = useState('');

  // Refs for preventing multiple API calls
  const lastFetchTimestamp = useRef(0);
  const isInitialized = useRef(false);
  const currentCoinPairId = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Constants
  const FETCH_COOLDOWN = 1000; // Reduced cooldown for better responsiveness

  // Get coin_pair_id from URL params, default to 1 if not provided
  const coinPairId = searchParams.get('coin_pair_id') || '1';

  // Initialize cryptoData with null - will be set from API data
  const [cryptoData, setCryptoData] = useState(null);

  // Fetch available coins only once on mount
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    const fetchAvailableCoinsData = async () => {
      try {
        const response = await fetchAllCoins();
        if (isMounted && response.success) {
          setAvailableCoins(response.coins || []);
        } else if (isMounted) {
          setAvailableCoins([]);
          setError(response.message || 'Failed to load coins');
        }
      } catch (error) {
        if (isMounted) {
          setAvailableCoins([]);
          setError(error.message || 'Failed to load coins');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchAvailableCoinsData();
    return () => { isMounted = false; };
  }, []);

  // Memoized function to fetch coin details
  const fetchCoinData = useCallback(async (selectedCoin) => {
    if (!selectedCoin) return null;
    
    try {
      console.log('Fetching coin details for:', selectedCoin.symbol);
      const coinResponse = await fetchCoinDetails(selectedCoin.symbol);
      
      if (coinResponse.success && coinResponse.data) {
        const coinData = coinResponse.data;
        return {
          cryptoName: selectedCoin.name,
          cryptoSymbol: selectedCoin.symbol,
          cryptoPrice: parseFloat(coinData.price || selectedCoin.price || 0),
          cryptoLogoPath: selectedCoin.logo_path,
          priceChange24h: parseFloat(coinData.price_change_24h || 0),
          usdtName: 'USDT',
          usdtSymbol: 'USDT',
          usdtLogoPath: '',
          '24_high': coinData['24_high'] || null,
          '24_low': coinData['24_low'] || null,
          '24_high_formatted': coinData['24_high_formatted'] || null,
          '24_low_formatted': coinData['24_low_formatted'] || null,
          'volume_24h': coinData.volume_24h || null
        };
      }
    } catch (error) {
      console.error('Error fetching coin data:', error);
    }
    
    // Return basic data from selectedCoin if API fails
    return {
      cryptoName: selectedCoin.name,
      cryptoSymbol: selectedCoin.symbol,
      cryptoPrice: parseFloat(selectedCoin.price || 0),
      cryptoLogoPath: selectedCoin.logo_path,
      priceChange24h: parseFloat(selectedCoin.price_change_24h || 0),
      usdtName: 'USDT',
      usdtSymbol: 'USDT',
      usdtLogoPath: '',
      '24_high': null,
      '24_low': null,
      '24_high_formatted': null,
      '24_low_formatted': null,
      'volume_24h': null
    };
  }, []);

  // Memoized function to fetch wallet data
  const fetchWalletData = useCallback(async (uid, coinId) => {
    try {
      const walletData = await getSpotWallet(uid, coinId);
      
      if (walletData.success) {
        const { cryptoWallet, usdtWallet } = walletData;
        
        return {
          cryptoData: {
            cryptoName: cryptoWallet?.crypto_name || '',
            cryptoSymbol: cryptoWallet?.crypto_symbol || '',
            cryptoPrice: cryptoWallet?.price || 0,
            cryptoLogoPath: cryptoWallet?.logo_path || '',
            usdtName: usdtWallet?.crypto_name || 'USDT',
            usdtSymbol: usdtWallet?.crypto_symbol || 'USDT',
            usdtLogoPath: usdtWallet?.logo_path || '',
            priceChange24h: 0 // Will be updated by price fetch
          },
          balance: {
            cryptoSpotBalance: cryptoWallet?.spot_wallet || 0,
            usdtSpotBalance: usdtWallet?.spot_wallet || 0
          }
        };
      }
    } catch (error) {
      console.error('Error fetching wallet data:', error);
    }
    return null;
  }, []);

  // Main data fetching function with proper debouncing
  const fetchCryptoData = useCallback(async (forceFetch = false) => {
    // Prevent multiple rapid calls
    const now = Date.now();
    if (!forceFetch && now - lastFetchTimestamp.current < FETCH_COOLDOWN) {
      console.log('Skipping fetch due to cooldown');
      return;
    }
    lastFetchTimestamp.current = now;

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check if coin pair actually changed
    if (!forceFetch && currentCoinPairId.current === coinPairId && isInitialized.current) {
      console.log('Skipping fetch - same coin pair');
      return;
    }

    console.log('Fetching data for coin pair ID:', coinPairId);
    currentCoinPairId.current = coinPairId;
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');
      let uid = localStorage.getItem('uid');
      
      const isLoggedIn = token && userId;

      // Find the selected coin from available coins
      const selectedCoin = availableCoins.find(coin => 
        (coin.coin_pair && coin.coin_pair.toString() === coinPairId.toString()) ||
        (coin.id && coin.id.toString() === coinPairId.toString())
      );

      console.log('Selected coin:', selectedCoin);

      if (!selectedCoin && availableCoins.length > 0) {
        console.log('Coin not found, using first available coin');
        const fallbackCoin = availableCoins[0];
        const fallbackId = fallbackCoin.coin_pair || fallbackCoin.id;
        setSearchParams({ coin_pair_id: fallbackId.toString() });
        return;
      }

      if (!selectedCoin) {
        console.log('No coins available yet');
        setLoading(false);
        return;
      }

      if (!isLoggedIn) {
        // For non-logged in users, just fetch coin data
        const coinData = await fetchCoinData(selectedCoin);
        if (coinData) {
          setCryptoData(coinData);
          console.log('Set crypto data for non-logged in user:', coinData.cryptoSymbol);
        }
        
        setUserBalance({
          cryptoSpotBalance: 0,
          usdtSpotBalance: 0
        });
      } else {
        // For logged in users, fetch wallet data
        if (!uid) {
          try {
            const userInfoResponse = await axios.get(
              `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            uid = userInfoResponse.data?.user?.uid || 'yE8vKBNw';
            localStorage.setItem('uid', uid);
          } catch {
            uid = 'yE8vKBNw';
          }
        }

        const walletData = await fetchWalletData(uid, coinPairId);
        
        if (walletData) {
          // Merge wallet data with coin data
          let finalCryptoData = walletData.cryptoData;
          
          // Get additional details from coin API
          const coinDetails = await fetchCoinData(selectedCoin);
          if (coinDetails) {
            finalCryptoData = {
              ...finalCryptoData,
              ...coinDetails,
              // Keep wallet-specific data if available
              cryptoName: walletData.cryptoData.cryptoName || coinDetails.cryptoName,
              cryptoSymbol: walletData.cryptoData.cryptoSymbol || coinDetails.cryptoSymbol,
              cryptoPrice: coinDetails.cryptoPrice || walletData.cryptoData.cryptoPrice
            };
          }
          
          setCryptoData(finalCryptoData);
          setUserBalance(walletData.balance);
          
          console.log('Set crypto data for logged in user:', finalCryptoData.cryptoSymbol);
        } else {
          // Fallback to coin data if wallet fetch fails
          const coinData = await fetchCoinData(selectedCoin);
          if (coinData) {
            setCryptoData(coinData);
            console.log('Set fallback crypto data:', coinData.cryptoSymbol);
          }
          setUserBalance({
            cryptoSpotBalance: 0,
            usdtSpotBalance: 0
          });
        }
      }

      isInitialized.current = true;
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load trading data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [
    coinPairId, 
    availableCoins, 
    fetchCoinData, 
    fetchWalletData,
    setSearchParams
  ]);

  // Effect to handle coin pair changes - only when necessary
  useEffect(() => {
    if (availableCoins.length > 0) {
      // Use timeout to debounce rapid changes
      fetchTimeoutRef.current = setTimeout(() => {
        fetchCryptoData(false);
      }, 100);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [coinPairId, availableCoins.length]); // Only depend on coinPairId and availableCoins length

  // Fetch user balance after trade (without affecting main data)
  const fetchUserBalance = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');
      let uid = localStorage.getItem('uid');
      
      if (!userId || !token) return;
      
      if (!uid) {
        try {
          const userInfoResponse = await axios.get(
            `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          uid = userInfoResponse.data?.user?.uid || 'yE8vKBNw';
          localStorage.setItem('uid', uid);
        } catch {
          uid = 'yE8vKBNw';
        }
      }
      
      const walletData = await getSpotWallet(uid, coinPairId);
      
      if (walletData.success) {
        const { cryptoWallet, usdtWallet } = walletData;
        
        setUserBalance({
          cryptoSpotBalance: cryptoWallet?.spot_wallet || 0,
          usdtSpotBalance: usdtWallet?.spot_wallet || 0
        });
        
        console.log('Updated balances after trade:', {
          crypto: cryptoWallet?.spot_wallet,
          usdt: usdtWallet?.spot_wallet
        });
      }
      
      setOrderHistoryRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error fetching user balance:', err);
    }
  }, [coinPairId]);

  // Handle coin selection from FavoritesBar with proper debouncing
  const handleCoinSelect = useCallback((selectedCoinPairId) => {
    const selectedId = selectedCoinPairId.toString();
    const currentId = coinPairId.toString();
    
    if (selectedId !== currentId) {
      console.log('Switching coin from', currentId, 'to', selectedId);
      setSearchParams({ coin_pair_id: selectedId });
    }
  }, [coinPairId, setSearchParams]);

  // Mobile trade tab handlers
  const handleMobileTradeTab = useCallback((tab) => {
    setMobileTradeTab(prev => prev === tab ? '' : tab);
  }, []);

  // Mobile bottom sheet trade form
  const renderMobileTradeForm = useCallback(() => (
    <>
      <div 
        className={`mobile-trade-overlay${mobileTradeTab ? ' open' : ''}`} 
        onClick={() => setMobileTradeTab('')}
      />
      <div className={`mobile-trade-form-sheet${mobileTradeTab ? ' open' : ''}`}>
        <div className="mobile-trade-form-header">
          <div className="mobile-trade-form-title">
            {mobileTradeTab === 'buy' ? 'Buy' : 'Sell'} {cryptoData?.cryptoSymbol}
          </div>
          <button 
            className="mobile-trade-form-close" 
            onClick={() => setMobileTradeTab('')}
          >
            ×
          </button>
        </div>
        <div className="mobile-trade-form-content">
          <TradeForm
            cryptoData={cryptoData}
            userBalance={userBalance}
            coinPairId={coinPairId}
            onTradeSuccess={fetchUserBalance}
            isBuy={mobileTradeTab === 'buy'}
          />
        </div>
      </div>
    </>
  ), [mobileTradeTab, cryptoData, userBalance, coinPairId, fetchUserBalance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="spot-trading-container">
      <SubHeader 
        cryptoData={cryptoData} 
        coinPairId={coinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
        loading={loading}
        error={error}
      />
      <FavoritesBar 
        activeCoinPairId={coinPairId} 
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
      />
      <div className="main-container">
        <div className="chart-section">
          <TradingChart 
            selectedSymbol={cryptoData?.cryptoSymbol} 
          />
        </div>
        <div className="orderbook-section">
          <OrderBook 
            cryptoData={cryptoData}
          />
        </div>
        <div className="trade-section">
          <TradeForm 
            cryptoData={cryptoData} 
            userBalance={userBalance}
            coinPairId={coinPairId}
            onTradeSuccess={fetchUserBalance}
          />
        </div>
      </div>
      <div className="orders-container">
        <OrdersSection refreshTrigger={orderHistoryRefreshTrigger} />
      </div>
      
      <div className="mobile-trade-bar">
        <button 
          className="mobile-trade-btn buy" 
          onClick={() => handleMobileTradeTab('buy')}
        >
          Buy
        </button>
        <button 
          className="mobile-trade-btn sell" 
          onClick={() => handleMobileTradeTab('sell')}
        >
          Sell
        </button>
      </div>
      {renderMobileTradeForm()}
    </div>
  );
};

export default SpotTrading;