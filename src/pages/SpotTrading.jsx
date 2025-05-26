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
  
  console.log('Current coinPairId from URL:', coinPairId, 'searchParams:', searchParams.toString());

  // Initialize cryptoData with null - will be set from API data
  const [cryptoData, setCryptoData] = useState(null);
  
  // Wrapper function to log setCryptoData calls
  const setCryptoDataWithLog = useCallback((data) => {
    console.log('setCryptoData called with:', {
      symbol: data?.cryptoSymbol || data?.crypto_symbol,
      logo: data?.cryptoLogoPath || data?.crypto_logo_path,
      data: data
    });
    setCryptoData(data);
  }, []);

  // Track stats loading state
  const [statsLoading, setStatsLoading] = useState(false);

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
          'volume_24h': coinData.volume_24h || null,
          // Additional properties for SubHeader compatibility
          crypto_logo_path: selectedCoin.logo_path,
          crypto_symbol: selectedCoin.symbol,
          crypto_name: selectedCoin.name,
          price: parseFloat(coinData.price || selectedCoin.price || 0),
          usdt_symbol: 'USDT'
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
      'volume_24h': null,
      // Additional properties for SubHeader compatibility
      crypto_logo_path: selectedCoin.logo_path,
      crypto_symbol: selectedCoin.symbol,
      crypto_name: selectedCoin.name,
      price: parseFloat(selectedCoin.price || 0),
      usdt_symbol: 'USDT'
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
      console.log('SpotTrading: Skipping fetch due to cooldown');
      return;
    }
    lastFetchTimestamp.current = now;

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Check if coin pair actually changed (based on currentCoinPairId.current which is set after successful fetch)
    if (!forceFetch && currentCoinPairId.current === coinPairId && isInitialized.current) {
      console.log('SpotTrading: Skipping fetch - same coin pair ID already processed');
      return;
    }

    console.log('SpotTrading: Fetching data for coin pair ID from URL:', coinPairId);
    setLoading(true);
    setStatsLoading(true);
    // Don't set error to null here, allow previous errors to persist until success

    let SCM_selectedCoin = null; // SCM = Selected Coin Master
    let SCM_coinPairIdForAPI = coinPairId; // This will be the ID used for API calls like wallet

    if (availableCoins.length > 0) {
      // Priority 1: If coinPairId from URL is '1' (conventional BTC), try to get BTC by symbol.
      if (coinPairId === '1') {
        const btcCoin = availableCoins.find(c => c.symbol === 'BTC');
        if (btcCoin) {
          SCM_selectedCoin = btcCoin;
          SCM_coinPairIdForAPI = (btcCoin.coin_pair || btcCoin.id).toString();
          console.log('SpotTrading: Found BTC by symbol:', SCM_selectedCoin);
          // If BTC's actual ID from list is different from '1', normalize URL.
          if (SCM_coinPairIdForAPI !== '1' && searchParams.get('coin_pair_id') === '1') {
            console.log(`SpotTrading: Normalizing URL for BTC. Canonical ID from list: ${SCM_coinPairIdForAPI}`);
            setSearchParams({ coin_pair_id: SCM_coinPairIdForAPI }, { replace: true });
            // Data will be refetched due to searchParams change, set temp data for BTC.
             const tempBtcData = {
                cryptoName: SCM_selectedCoin.name,
                cryptoSymbol: SCM_selectedCoin.symbol,
                cryptoPrice: parseFloat(SCM_selectedCoin.price || 0),
                cryptoLogoPath: SCM_selectedCoin.logo_path,
                priceChange24h: parseFloat(SCM_selectedCoin.price_change_24h || 0),
                usdtSymbol: SCM_selectedCoin.pair_name || 'USDT',
                crypto_symbol: SCM_selectedCoin.symbol, // for setCryptoDataWithLog
                crypto_name: SCM_selectedCoin.name,
                crypto_logo_path: SCM_selectedCoin.logo_path,
                price: parseFloat(SCM_selectedCoin.price || 0),
                usdt_symbol: SCM_selectedCoin.pair_name || 'USDT'
            };
            setCryptoDataWithLog(tempBtcData);
            // setLoading(false) //
            return; // Exit because setSearchParams will trigger a new fetch.
          }
        } else {
          console.warn("SpotTrading: coinPairId is '1' but BTC not found by symbol in availableCoins.");
        }
      }

      // Priority 2: If not resolved by BTC specific logic, try to find by coinPairId from URL.
      if (!SCM_selectedCoin) {
        SCM_selectedCoin = availableCoins.find(coin =>
          (coin.coin_pair && coin.coin_pair.toString() === coinPairId) ||
          (coin.id && coin.id.toString() === coinPairId)
        );
        if (SCM_selectedCoin) {
          SCM_coinPairIdForAPI = (SCM_selectedCoin.coin_pair || SCM_selectedCoin.id).toString();
           console.log('SpotTrading: Found coin by coinPairId from URL:', SCM_selectedCoin);
        }
      }

      // Priority 3: If still not found (coinPairId from URL is invalid).
      // Default to BTC if available, else first coin from the list. Update URL.
      if (!SCM_selectedCoin) {
        console.warn(`SpotTrading: Coin with ID [${coinPairId}] not found. Attempting to default.`);
        const defaultBtc = availableCoins.find(c => c.symbol === 'BTC');
        SCM_selectedCoin = defaultBtc || availableCoins[0]; // Default to BTC, or first coin

        if (SCM_selectedCoin) {
          SCM_coinPairIdForAPI = (SCM_selectedCoin.coin_pair || SCM_selectedCoin.id).toString();
          console.log(`SpotTrading: Defaulting to coin: ${SCM_selectedCoin.symbol}, ID: ${SCM_coinPairIdForAPI}. Updating URL.`);
          setSearchParams({ coin_pair_id: SCM_coinPairIdForAPI }, { replace: true });
          // Set temporary data for the default coin and return, as setSearchParams will trigger a re-fetch.
          const tempDefaultData = {
            cryptoName: SCM_selectedCoin.name,
            cryptoSymbol: SCM_selectedCoin.symbol,
            cryptoPrice: parseFloat(SCM_selectedCoin.price || 0),
            cryptoLogoPath: SCM_selectedCoin.logo_path,
            priceChange24h: parseFloat(SCM_selectedCoin.price_change_24h || 0),
            usdtSymbol: SCM_selectedCoin.pair_name || 'USDT',
            crypto_symbol: SCM_selectedCoin.symbol, // for setCryptoDataWithLog
            crypto_name: SCM_selectedCoin.name,
            crypto_logo_path: SCM_selectedCoin.logo_path,
            price: parseFloat(SCM_selectedCoin.price || 0),
            usdt_symbol: SCM_selectedCoin.pair_name || 'USDT'
          };
          setCryptoDataWithLog(tempDefaultData);
          // setLoading(false); //
          return; // Exit because setSearchParams will trigger a new fetch.
        }
      }
    }

    // If, after all attempts, SCM_selectedCoin is still null (e.g., availableCoins is empty)
    if (!SCM_selectedCoin) {
      console.log('SpotTrading: No coin could be selected (availableCoins might be empty). Current coinPairId from URL:', coinPairId);
      if (availableCoins.length === 0 && loading) { // Still waiting for available coins
         console.log("SpotTrading: availableCoins is empty, likely still loading them.");
      } else { // availableCoins is loaded, but still no coin found (should be rare with defaults)
         setError(`Coin data for ID ${coinPairId} could not be loaded.`);
         setCryptoData(null); // Clear any stale data
      }
      setLoading(false);
      setStatsLoading(false);
      return;
    }
    
    // Successfully identified a coin to process
    console.log('SpotTrading: Processing selected coin:', SCM_selectedCoin.symbol, 'with API ID:', SCM_coinPairIdForAPI);
    currentCoinPairId.current = SCM_coinPairIdForAPI; // Update ref to reflect the coin being processed

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');
      let uid = localStorage.getItem('uid');
      const isLoggedIn = token && userId;

      if (!isLoggedIn) {
        const coinData = await fetchCoinData(SCM_selectedCoin);
        if (coinData) {
          setCryptoDataWithLog(coinData);
          setError(null); // Clear previous errors
        } else {
          setError(`Failed to load details for ${SCM_selectedCoin.symbol}`);
        }
        setUserBalance({ cryptoSpotBalance: 0, usdtSpotBalance: 0 });
      } else {
        if (!uid && userId) { // Fetch uid if missing
          try {
            const userInfoResponse = await axios.get(
              `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            uid = userInfoResponse.data?.user?.uid || 'yE8vKBNw'; // Use a fallback if needed
            localStorage.setItem('uid', uid);
          } catch (apiError) {
            console.error("SpotTrading: Error fetching UID", apiError);
            uid = 'yE8vKBNw'; // Fallback UID
          }
        }

        const walletResponse = await fetchWalletData(uid, SCM_coinPairIdForAPI); // Use SCM_coinPairIdForAPI
        let finalCryptoData;

        const coinDetails = await fetchCoinData(SCM_selectedCoin);

        if (walletResponse && walletResponse.cryptoData) {
          finalCryptoData = {
            ...(coinDetails || {}), // Start with coinDetails, provides better price, 24h etc.
            ...walletResponse.cryptoData, // Wallet data might have name/symbol from wallet's perspective
             // Prioritize details from coinDetails if they exist
            cryptoName: coinDetails?.cryptoName || walletResponse.cryptoData.cryptoName || SCM_selectedCoin.name,
            cryptoSymbol: coinDetails?.cryptoSymbol || walletResponse.cryptoData.cryptoSymbol || SCM_selectedCoin.symbol,
            cryptoPrice: coinDetails?.cryptoPrice ?? parseFloat(SCM_selectedCoin.price || 0), // Ensure price is number
            cryptoLogoPath: coinDetails?.cryptoLogoPath || walletResponse.cryptoData.logo_path || SCM_selectedCoin.logo_path,
            // Ensure SubHeader compatible fields are present from the most reliable source
            crypto_name: coinDetails?.crypto_name || walletResponse.cryptoData.crypto_name || SCM_selectedCoin.name,
            crypto_symbol: coinDetails?.crypto_symbol || walletResponse.cryptoData.crypto_symbol || SCM_selectedCoin.symbol,
            price: coinDetails?.price ?? parseFloat(SCM_selectedCoin.price || 0),
            crypto_logo_path: coinDetails?.crypto_logo_path || walletResponse.cryptoData.logo_path || SCM_selectedCoin.logo_path,
            usdt_symbol: coinDetails?.usdt_symbol || walletResponse.cryptoData.usdt_symbol || 'USDT',
          };
          if (coinDetails) { // If coinDetails were fetched, merge them carefully
            finalCryptoData.priceChange24h = coinDetails.priceChange24h;
            finalCryptoData['24_high'] = coinDetails['24_high'];
            finalCryptoData['24_low'] = coinDetails['24_low'];
            finalCryptoData['volume_24h'] = coinDetails['volume_24h'];
          }

          setUserBalance(walletResponse.balance || { cryptoSpotBalance: 0, usdtSpotBalance: 0 });
        } else if (coinDetails) { // Wallet fetch failed or no data, but coin details exist
           console.warn("SpotTrading: Wallet data failed or empty, using coinDetails as primary source.");
          finalCryptoData = coinDetails;
          setUserBalance({ cryptoSpotBalance: 0, usdtSpotBalance: 0 });
        } else { // Both wallet and coin details failed for SCM_selectedCoin
          setError(`Failed to load data for ${SCM_selectedCoin.symbol}.`);
          setCryptoData(null); // Clear data
          setLoading(false);
          setStatsLoading(false);
          return;
        }
        
        setCryptoDataWithLog(finalCryptoData);
        setError(null); // Clear previous errors on successful data load
        setStatsLoading(false); // Ensure statsLoading is cleared on success
      }

      isInitialized.current = true; // Mark as initialized after first successful load
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to load trading data. Please try again later.');
      setStatsLoading(false);
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
  }, [coinPairId, availableCoins.length, fetchCryptoData]); // Include fetchCryptoData to ensure updates

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
    
    console.log('handleCoinSelect called with:', selectedCoinPairId, 'current:', currentId);
    
    if (selectedId !== currentId) {
      console.log('Switching coin from', currentId, 'to', selectedId);
      
      // Immediately update the UI with basic coin data
      const selectedCoin = availableCoins.find(coin => 
        (coin.coin_pair && coin.coin_pair.toString() === selectedId) ||
        (coin.id && coin.id.toString() === selectedId)
      );
      
      console.log('Found selected coin for', selectedId, ':', selectedCoin);
      
      if (selectedCoin) {
        // Immediately set the basic crypto data for instant UI update
        const basicCryptoData = {
          cryptoName: selectedCoin.name,
          cryptoSymbol: selectedCoin.symbol,
          cryptoPrice: parseFloat(selectedCoin.price || 0),
          cryptoLogoPath: selectedCoin.logo_path,
          priceChange24h: parseFloat(selectedCoin.price_change_24h || 0),
          usdtName: 'USDT',
          usdtSymbol: selectedCoin.pair_name || 'USDT',
          usdtLogoPath: '',
          '24_high': selectedCoin['24_high'] || null,
          '24_low': selectedCoin['24_low'] || null,
          'volume_24h': selectedCoin.volume_24h || null,
          // Keep price and other data from the coin list
          price: parseFloat(selectedCoin.price || 0),
          crypto_symbol: selectedCoin.symbol,
          crypto_name: selectedCoin.name,
          crypto_logo_path: selectedCoin.logo_path,
          usdt_symbol: selectedCoin.pair_name || 'USDT'
        };
        
        setCryptoDataWithLog(basicCryptoData);
        console.log('Immediately updated UI with:', basicCryptoData.cryptoSymbol, basicCryptoData.cryptoLogoPath);
      } else {
        console.log('No coin found for selectedId:', selectedId);
      }
      
      setSearchParams({ coin_pair_id: selectedId });
    } else {
      console.log('Same coin selected, no change needed');
    }
  }, [coinPairId, setSearchParams, availableCoins]);

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

  return (
    <div className="spot-trading-container">
      <SubHeader
        cryptoData={cryptoData}
        coinPairId={coinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
        loading={loading && !isInitialized.current}
        error={error}
        statsLoading={statsLoading}
      />
      <FavoritesBar
        activeCoinPairId={coinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
      />
      <div className="main-container">
        <TradingChart
          selectedSymbol={cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC'}
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