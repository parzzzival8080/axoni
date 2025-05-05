import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import OrdersSection from '../components/spotTrading/OrdersSection';
import { getSpotWallet } from '../services/spotTradingApi';
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

  // Get coin_pair_id from URL params, default to 1 if not provided
  const coinPairId = searchParams.get('coin_pair_id') || 1;
  
  // Fetch all available coins
  useEffect(() => {
    const fetchAvailableCoins = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await axios.get(
          'https://django.bhtokens.com/api/trading/coins',
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        if (response.data && Array.isArray(response.data)) {
          setAvailableCoins(response.data);
          console.log('Available coins:', response.data);
        }
      } catch (error) {
        console.error('Error fetching available coins:', error);
      }
    };
    
    fetchAvailableCoins();
  }, []);
  
  const fetchCryptoData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the auth token and user ID from localStorage
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');

      // Get the user's UID for the wallet API
      let uid = localStorage.getItem('uid');

      if (!userId || !token) {
        setError("Please log in to access trading features");
        setLoading(false);
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
    
    // Log when cryptoData changes for debugging
    if (cryptoData?.cryptoSymbol) {
      console.log('SpotTrading: Current crypto symbol:', cryptoData.cryptoSymbol);
    }
  }, [fetchCryptoData, cryptoData?.cryptoSymbol]);

  if (loading) {
    return <div className="loading-screen">Loading trading data...</div>;
  }

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
    </div>
  );
};

export default SpotTrading;