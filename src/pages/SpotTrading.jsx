import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import OrdersSection from '../components/spotTrading/OrdersSection';
import '../components/spotTrading/SpotTrading.css';

const SpotTrading = () => {
  const [searchParams] = useSearchParams();
  const [cryptoData, setCryptoData] = useState(null);
  const [userBalance, setUserBalance] = useState({
    cryptoBalance: 0,
    usdtBalance: 0
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

      const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallet/${uid}/${coinPairId}?apikey=${apiKey}`;

      const response = await axios.get(apiUrl);
      if (response.data) {
        setCryptoData({
          cryptoName: response.data.cryptoWallet?.crypto_name || '',
          cryptoSymbol: response.data.cryptoWallet?.crypto_symbol || '',
          cryptoPrice: response.data.cryptoWallet?.price || 0,
          cryptoLogoPath: response.data.cryptoWallet?.logo_path || '',
          usdtName: response.data.usdtWallet?.crypto_name || 'USDT',
          usdtSymbol: response.data.usdtWallet?.crypto_symbol || 'USDT',
          usdtLogoPath: response.data.usdtWallet?.logo_path || ''
        });
        setUserBalance({
          cryptoBalance: response.data.cryptoWallet?.spot_wallet || 0,
          usdtBalance: response.data.usdtWallet?.spot_wallet || 0
        });
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
      const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallet/${uid}/${coinPairId}?apikey=${apiKey}`;
      const response = await axios.get(apiUrl);
      if (response.data) {
        setUserBalance({
          cryptoBalance: response.data.cryptoWallet?.spot_wallet || 0,
          usdtBalance: response.data.usdtWallet?.spot_wallet || 0
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
        <TradingChart 
          selectedSymbol={cryptoData?.cryptoSymbol} 
        />
        <OrderBook 
          cryptoData={cryptoData}
        />
        <TradeForm 
          cryptoData={cryptoData} 
          userBalance={userBalance}
          coinPairId={coinPairId}
          onTradeSuccess={fetchUserBalance}
        />
      </div>
      <div className="orders-container">
        <OrdersSection refreshTrigger={orderHistoryRefreshTrigger} />
      </div>
    </div>
  );
};

export default SpotTrading; 