import React, { useState, useEffect, useCallback } from 'react';
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
  const [searchParams] = useSearchParams();
  const [cryptoData, setCryptoData] = useState(null);
  const [userBalance, setUserBalance] = useState({
    cryptoSpotBalance: 0,
    usdtSpotBalance: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [orderHistoryRefreshTrigger, setOrderHistoryRefreshTrigger] = useState(0);
  const [mobileTradeTab, setMobileTradeTab] = useState(''); // '' | 'buy' | 'sell'

  // Get coin_pair_id from URL params, default to 1 if not provided
  const coinPairId = searchParams.get('coin_pair_id') || 1;
  
  // Fetch all available coins
  useEffect(() => {
    const fetchAvailableCoinsData = async () => {
      try {
        // Use the fetchAllCoins function from spotTradingApi.js
        const response = await fetchAllCoins();
        
        if (response.success && Array.isArray(response)) {
          setAvailableCoins(response);
          console.log('Available coins:', response);
        }
      } catch (error) {
        console.error('Error fetching available coins:', error);
      }
    };
    
    fetchAvailableCoinsData();
  }, []);
  
  // Cache configuration
  const CACHE_KEY = 'spot_trading_data';
  const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the auth token and user ID from localStorage
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');
      let uid = localStorage.getItem('uid');
      
      // Check if user is logged in
      const isLoggedIn = token && userId;

      // Try to load from cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setCryptoData(data);
          setLoading(false);
          return;
        }
      }

      // If user is not logged in, fetch only the crypto data without wallet info
      if (!isLoggedIn) {
        try {
          // Use BTC as default symbol if we don't have specific coin info
          const defaultSymbol = 'BTC';
          
          // Use the fetchCoinDetails function from spotTradingApi.js
          const coinResponse = await fetchCoinDetails(defaultSymbol);
          
          if (coinResponse.success) {
            const coinData = coinResponse.data;
            const cryptoDataObj = {
              cryptoName: coinData?.name || 'Bitcoin',
              cryptoSymbol: coinData?.symbol || 'BTC',
              cryptoPrice: coinData?.price || 0,
              cryptoLogoPath: coinData?.logo_path || '',
              priceChange24h: parseFloat(coinData?.price_change_24h || 0),
              usdtName: 'USDT',
              usdtSymbol: 'USDT',
              usdtLogoPath: '',
              '24_high': coinData?.['24_high'] || null,
              '24_low': coinData?.['24_low'] || null,
              '24_high_formatted': coinData?.['24_high_formatted'] || null,
              '24_low_formatted': coinData?.['24_low_formatted'] || null,
              'volume_24h': coinData?.volume_24h || null
            };

            // Update cache
            localStorage.setItem(CACHE_KEY, JSON.stringify({
              data: cryptoDataObj,
              timestamp: Date.now()
            }));

            setCryptoData(cryptoDataObj);
            
            // Set empty balances for non-logged in users
            setUserBalance({
              cryptoSpotBalance: 0,
              usdtSpotBalance: 0
            });
          } else {
            // If we can't get coin details, set default values
            setCryptoData({
              cryptoName: 'Bitcoin',
              cryptoSymbol: 'BTC',
              cryptoPrice: 20000,
              cryptoLogoPath: '',
              usdtName: 'USDT',
              usdtSymbol: 'USDT',
              usdtLogoPath: '',
              priceChange24h: 0,
              '24_high': 20500,
              '24_low': 19500,
              'volume_24h': 1250.75
            });
            
            setUserBalance({
              cryptoSpotBalance: 0,
              usdtSpotBalance: 0
            });
          }
          setLoading(false);
        } catch (err) {
          console.error('Error fetching coin data:', err);
          // Don't set error, just use default values
          setCryptoData({
            cryptoName: 'Bitcoin',
            cryptoSymbol: 'BTC',
            cryptoPrice: 20000,
            cryptoLogoPath: '',
            usdtName: 'USDT',
            usdtSymbol: 'USDT',
            usdtLogoPath: ''
          });
          
          setUserBalance({
            cryptoSpotBalance: 0,
            usdtSpotBalance: 0
          });
          setLoading(false);
        }
        return;
      }

      // If we don't have a uid, try to fetch one
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

      // Use the new getSpotWallet function to fetch wallet data
      const walletData = await getSpotWallet(uid, coinPairId);
      
      if (walletData.success) {
        const { cryptoWallet, usdtWallet } = walletData;
        
        setCryptoData({
          cryptoName: cryptoWallet?.crypto_name || '',
          cryptoSymbol: cryptoWallet?.crypto_symbol || '',
          cryptoPrice: cryptoWallet?.price || 0,
          cryptoLogoPath: cryptoWallet?.logo_path || '',
          usdtName: usdtWallet?.crypto_name || 'USDT',
          usdtSymbol: usdtWallet?.crypto_symbol || 'USDT',
          usdtLogoPath: usdtWallet?.logo_path || ''
        });
        
        setUserBalance({
          cryptoSpotBalance: cryptoWallet?.spot_wallet || 0,
          usdtSpotBalance: usdtWallet?.spot_wallet || 0
        });
        
        console.log('Spot wallet data loaded:', {
          cryptoSymbol: cryptoWallet?.crypto_symbol,
          cryptoBalance: cryptoWallet?.spot_wallet,
          usdtBalance: usdtWallet?.spot_wallet
        });
      } else {
        throw new Error(walletData.message || 'Failed to fetch wallet data');
      }
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load trading data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [coinPairId]);

  // Only update balance (not loading state) after a trade
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
      
      // Use the new getSpotWallet function to fetch wallet data
      const walletData = await getSpotWallet(uid, coinPairId);
      
      if (walletData.success) {
        const { cryptoWallet, usdtWallet } = walletData;
        
        setUserBalance({
          cryptoSpotBalance: cryptoWallet?.spot_wallet || 0,
          usdtSpotBalance: usdtWallet?.spot_wallet || 0
        });
        
        console.log('Updated spot wallet balances:', {
          cryptoSymbol: cryptoWallet?.crypto_symbol,
          cryptoBalance: cryptoWallet?.spot_wallet,
          usdtBalance: usdtWallet?.spot_wallet
        });
      }
      
      // Trigger order history refresh without affecting the chart
      setOrderHistoryRefreshTrigger(prev => prev + 1);
    } catch (err) {
      // Optionally handle error
      console.error('Error fetching user balance:', err);
    }
  }, [coinPairId]);

  useEffect(() => {
    fetchCryptoData();
    
    // Direct API call to fetch coin data with 24h high/low values
    const fetchDirectCoinData = async () => {
      try {
        const response = await fetch('https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud');
        const data = await response.json();
        
        // Find the current coin or use BTC as default
        const symbol = cryptoData?.cryptoSymbol || 'BTC';
        const coinData = data.find(coin => coin.symbol === symbol) || data.find(coin => coin.symbol === 'BTC');
        
        if (coinData) {
          console.log('Direct API coin data:', coinData);
          
          // Update crypto data with the direct API response
          const updatedData = {
            ...cryptoData,
            cryptoPrice: parseFloat(coinData.price || cryptoData.cryptoPrice),
            priceChange24h: parseFloat(coinData.price_change_24h || 0),
            '24_high': parseFloat(coinData['24_high']) || 20500,
            '24_low': parseFloat(coinData['24_low']) || 19500,
            'volume_24h': parseFloat(coinData.volume_24h || 1250.75)
          };
          
          console.log('Updated crypto data:', updatedData); // Debug log

          // Update cache with new data
          localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: updatedData,
            timestamp: Date.now()
          }));

          setCryptoData(updatedData);
        }
      } catch (error) {
        console.error('Error fetching direct coin data:', error);
      }
    };
    
    fetchDirectCoinData();
    
    // Log when cryptoData changes for debugging
    if (cryptoData?.cryptoSymbol) {
      console.log('SpotTrading: Current crypto symbol:', cryptoData.cryptoSymbol);
      console.log('SpotTrading: Full crypto data:', cryptoData);
    }
  }, [fetchCryptoData, cryptoData?.cryptoSymbol]);

  // Mobile app bar buy/sell buttons handler
  const handleMobileTradeTab = (tab) => {
    setMobileTradeTab(mobileTradeTab === tab ? '' : tab);
  };

  // Mobile bottom sheet trade form
  const renderMobileTradeForm = () => (
    <>
      <div className={`mobile-trade-overlay${mobileTradeTab ? ' open' : ''}`} 
           onClick={() => setMobileTradeTab('')}></div>
      <div className={`mobile-trade-form-sheet${mobileTradeTab ? ' open' : ''}`}>
        <div className="mobile-trade-form-header">
          <div className="mobile-trade-form-title">
            {mobileTradeTab === 'buy' ? 'Buy' : 'Sell'} {cryptoData?.cryptoSymbol}
          </div>
          <button className="mobile-trade-form-close" onClick={() => setMobileTradeTab('')}>
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
  );

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="spot-trading-container">
      <SubHeader 
        cryptoData={cryptoData} 
        coinPairId={coinPairId}
      />
      <FavoritesBar 
        activeCoinPairId={coinPairId} 
        availableCoins={availableCoins}
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
      
      {/* Mobile app bar with buy/sell buttons */}
      <div className="mobile-trade-bar">
        <button className="mobile-trade-btn buy" onClick={() => handleMobileTradeTab('buy')}>Buy</button>
        <button className="mobile-trade-btn sell" onClick={() => handleMobileTradeTab('sell')}>Sell</button>
      </div>
      {renderMobileTradeForm()}
    </div>
  );
};

export default SpotTrading;