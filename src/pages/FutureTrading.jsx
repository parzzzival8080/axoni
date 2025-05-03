import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import SubHeader from '../components/futureTrading/SubHeader';
import FavoritesBar from '../components/futureTrading/FavoritesBar';
import TradingChartDynamic from '../components/futureTrading/TradingChartDynamic';
import OrderBook from '../components/futureTrading/OrderBook';
import TradeForm from '../components/futureTrading/TradeForm';
import OrdersSection from '../components/futureTrading/OrdersSection';
import '../components/futureTrading/FutureTrading.css';

const FutureTrading = () => {
  const [searchParams, setSearchParams] = useSearchParams();
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
  const coinPairId = Number(searchParams.get('coin_pair_id')) || 1;
  
  // Fetch all available coins
  useEffect(() => {
    const fetchAvailableCoins = async () => {
      try {
        // First try to get from API
        const token = localStorage.getItem('authToken');
        const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
        
        // Try to fetch from the coins API directly
        const response = await axios.get(
          `https://apiv2.bhtokens.com/api/v1/coins?apikey=${apiKey}`
        );
        
        if (response.data && Array.isArray(response.data)) {
          console.log('Available coins from API:', response.data);
          setAvailableCoins(response.data);
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

      // Ensure we have a valid coinPairId
      const validCoinPairId = Number(coinPairId) || 1;
      console.log(`FutureTrading: Using coin pair ID: ${validCoinPairId}`);

      const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallet/${uid}/${validCoinPairId}?apikey=${apiKey}`;
      console.log(`FutureTrading: Fetching from API URL: ${apiUrl}`);

      const response = await axios.get(apiUrl);
      if (response.data) {
        // Log the full response for debugging
        console.log('FutureTrading: API Response:', response.data);
        
        // Ensure we have valid data
        if (!response.data.cryptoWallet) {
          console.error('FutureTrading: Missing cryptoWallet in API response');
          setError('Invalid data received from server');
          setLoading(false);
          return;
        }
        
        setCryptoData({
          cryptoName: response.data.cryptoWallet?.crypto_name || '',
          cryptoSymbol: response.data.cryptoWallet?.crypto_symbol || '',
          cryptoPrice: response.data.cryptoWallet?.price || 0,
          cryptoLogoPath: response.data.cryptoWallet?.logo_path || '',
          usdtName: response.data.usdtWallet?.crypto_name || 'USDT',
          usdtSymbol: response.data.usdtWallet?.crypto_symbol || 'USDT',
          usdtLogoPath: response.data.usdtWallet?.logo_path || '',
          // Add these to ensure TradeForm has access to the full data
          cryptoWallet: response.data.cryptoWallet,
          usdtWallet: response.data.usdtWallet,
          coinId: response.data.cryptoWallet?.coin_id || validCoinPairId
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
      
      // Ensure we have a valid coinPairId
      const validCoinPairId = Number(coinPairId) || 1;
      console.log(`FutureTrading.fetchUserBalance: Using coin pair ID: ${validCoinPairId}`);
      
      const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallet/${uid}/${validCoinPairId}?apikey=${apiKey}`;
      console.log(`FutureTrading.fetchUserBalance: Fetching from API URL: ${apiUrl}`);
      
      const response = await axios.get(apiUrl);
      if (response.data) {
        console.log('FutureTrading.fetchUserBalance: Got response:', response.data);
        setUserBalance({
          cryptoBalance: response.data.cryptoWallet?.spot_wallet || 0,
          usdtBalance: response.data.usdtWallet?.spot_wallet || 0
        });
        
        // Update cryptoData as well to ensure consistency
        setCryptoData({
          cryptoName: response.data.cryptoWallet?.crypto_name || '',
          cryptoSymbol: response.data.cryptoWallet?.crypto_symbol || '',
          cryptoPrice: response.data.cryptoWallet?.price || 0,
          cryptoLogoPath: response.data.cryptoWallet?.logo_path || '',
          usdtName: response.data.usdtWallet?.crypto_name || 'USDT',
          usdtSymbol: response.data.usdtWallet?.crypto_symbol || 'USDT',
          usdtLogoPath: response.data.usdtWallet?.logo_path || '',
          cryptoWallet: response.data.cryptoWallet,
          usdtWallet: response.data.usdtWallet,
          coinId: response.data.cryptoWallet?.coin_id || validCoinPairId
        });
      }
      
      // Trigger order history refresh without affecting the chart
      setOrderHistoryRefreshTrigger(prev => prev + 1);
    } catch (err) {
      // Optionally handle error
      console.error('Error fetching user balance:', err);
    }
  }, [coinPairId]);

  // Handle coin selection from FavoritesBar
  const handleCoinSelect = useCallback((selectedCoinPairId) => {
    if (selectedCoinPairId !== coinPairId) {
      console.log('FutureTrading: Changing coin to pair ID:', selectedCoinPairId);
      
      // Force a refresh of crypto data when coin changes
      setLoading(true); // Show loading state
      
      // Update URL params
      setSearchParams({ coin_pair_id: selectedCoinPairId });
      
      // Force immediate data refresh
      setTimeout(() => {
        fetchCryptoData();
      }, 100);
    }
  }, [coinPairId, setSearchParams, fetchCryptoData]);

  // Fetch crypto data when coinPairId changes
  useEffect(() => {
    console.log('FutureTrading: Fetching data for coin pair ID:', coinPairId);
    
    // Reset state before fetching new data
    setCryptoData(null);
    setUserBalance({
      cryptoBalance: 0,
      usdtBalance: 0
    });
    
    // Show loading state
    setLoading(true);
    
    // Fetch new data with a slight delay to ensure UI updates
    setTimeout(() => {
      fetchCryptoData();
    }, 200);
  }, [fetchCryptoData, coinPairId]);

  if (loading && !cryptoData) {
    return <div className="loading-screen">Loading trading data...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="future-trading-container">
      <SubHeader 
        cryptoData={cryptoData} 
        coinPairId={coinPairId}
      />
      <FavoritesBar 
        activeCoinPairId={coinPairId} 
        availableCoins={availableCoins}
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
              selectedSymbol={cryptoData?.cryptoSymbol} 
            />
            <OrderBook 
              cryptoData={cryptoData}
            />
            <TradeForm 
              key={`trade-form-${coinPairId}`} // Force component remount on coin change
              cryptoData={cryptoData} 
              userBalance={userBalance}
              coinPairId={coinPairId}
              favorites={availableCoins}
              onTradeSuccess={fetchUserBalance}
            />
          </div>
          <div className="orders-container">
            <OrdersSection refreshTrigger={orderHistoryRefreshTrigger} />
          </div>
        </>
      )}
    </div>
  );
};

export default FutureTrading;