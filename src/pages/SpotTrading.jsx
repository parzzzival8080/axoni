import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import OrdersSection from '../components/spotTrading/OrdersSection';
import { 
  getSpotWallet, 
  fetchAllCoins, 
  getCoinFromCache,
  getCacheStats 
} from '../services/spotTradingApi';
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
  const [statsLoading, setStatsLoading] = useState(false);
  const [coinsLoading, setCoinsLoading] = useState(true);

  // Refs for preventing multiple API calls
  const lastFetchTimestamp = useRef(0);
  const isInitialized = useRef(false);
  const currentCoinPairId = useRef(null);
  const fetchTimeoutRef = useRef(null);

  // Constants
  const FETCH_COOLDOWN = 1000;

  // Get coin_pair_id from URL params, default to 1 if not provided
  const coinPairId = searchParams.get('coin_pair_id') || '1';
  
  console.log('Current coinPairId from URL:', coinPairId);

  // Initialize cryptoData with null - will be set from cache/API data
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

  // Load coins from cache or API on mount
  useEffect(() => {
    let isMounted = true;
    
    const loadCoins = async () => {
      setCoinsLoading(true);
      setError(null);
      
      try {
        console.log('Loading coins...');
        const response = await fetchAllCoins();
        
        if (isMounted) {
          if (response.success) {
            setAvailableCoins(response.coins || []);
            console.log(`Loaded ${response.coins?.length || 0} coins`, response.fromCache ? 'from cache' : 'from API');
            
            // Log cache stats
            const stats = getCacheStats();
            console.log('Cache stats:', stats);
          } else {
            setAvailableCoins([]);
            setError(response.message || 'Failed to load coins');
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error loading coins:', error);
          setAvailableCoins([]);
          setError(error.message || 'Failed to load coins');
        }
      } finally {
        if (isMounted) {
          setCoinsLoading(false);
          setLoading(false);
        }
      }
    };
    
    loadCoins();
    return () => { isMounted = false; };
  }, []);

  // Memoized function to get coin data from cache
  const getCoinDataFromCache = useCallback((coinIdentifier) => {
    const coin = getCoinFromCache(coinIdentifier);
    if (!coin) return null;
    
    return {
      cryptoName: coin.name,
      cryptoSymbol: coin.symbol,
      cryptoPrice: coin.price,
      cryptoLogoPath: coin.logo_path,
      priceChange24h: coin.price_change_24h,
      usdtName: 'USDT',
      usdtSymbol: coin.pair_name || 'USDT',
      usdtLogoPath: '',
      '24_high': coin['24_high'],
      '24_low': coin['24_low'],
      'volume_24h': coin.volume_24h,
      // Additional properties for SubHeader compatibility
      crypto_logo_path: coin.logo_path,
      crypto_symbol: coin.symbol,
      crypto_name: coin.name,
      price: coin.price,
      usdt_symbol: coin.pair_name || 'USDT'
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
            priceChange24h: 0, // Will be updated by cache data
            // Additional properties for SubHeader compatibility
            crypto_logo_path: cryptoWallet?.logo_path || '',
            crypto_symbol: cryptoWallet?.crypto_symbol || '',
            crypto_name: cryptoWallet?.crypto_name || '',
            price: cryptoWallet?.price || 0,
            usdt_symbol: usdtWallet?.crypto_symbol || 'USDT'
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

  // Main data fetching function with cache integration
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

    // Check if coin pair actually changed
    if (!forceFetch && currentCoinPairId.current === coinPairId && isInitialized.current) {
      console.log('SpotTrading: Skipping fetch - same coin pair ID already processed');
      return;
    }

    console.log('SpotTrading: Fetching data for coin pair ID from URL:', coinPairId);
    setLoading(true);
    setStatsLoading(true);

    let selectedCoin = null;
    let coinPairIdForAPI = coinPairId;

    // Find coin from available coins (which are now cached)
    if (availableCoins.length > 0) {
      // Priority 1: If coinPairId from URL is '1', try to get BTC by symbol
      if (coinPairId === '1') {
        selectedCoin = availableCoins.find(c => c.symbol === 'BTC');
        if (selectedCoin) {
          coinPairIdForAPI = (selectedCoin.coin_pair || selectedCoin.id).toString();
          console.log('SpotTrading: Found BTC by symbol:', selectedCoin);
          
          if (coinPairIdForAPI !== '1' && searchParams.get('coin_pair_id') === '1') {
            console.log(`SpotTrading: Normalizing URL for BTC. Canonical ID: ${coinPairIdForAPI}`);
            setSearchParams({ coin_pair_id: coinPairIdForAPI }, { replace: true });
            
            const tempBtcData = getCoinDataFromCache('BTC');
            if (tempBtcData) {
              setCryptoDataWithLog(tempBtcData);
            }
            return;
          }
        }
      }

      // Priority 2: Find by coinPairId from URL
      if (!selectedCoin) {
        selectedCoin = availableCoins.find(coin =>
          (coin.coin_pair && coin.coin_pair.toString() === coinPairId) ||
          (coin.id && coin.id.toString() === coinPairId)
        );
        if (selectedCoin) {
          coinPairIdForAPI = (selectedCoin.coin_pair || selectedCoin.id).toString();
          console.log('SpotTrading: Found coin by coinPairId from URL:', selectedCoin);
        }
      }

      // Priority 3: Default to BTC or first coin
      if (!selectedCoin) {
        console.warn(`SpotTrading: Coin with ID [${coinPairId}] not found. Attempting to default.`);
        const defaultBtc = availableCoins.find(c => c.symbol === 'BTC');
        selectedCoin = defaultBtc || availableCoins[0];

        if (selectedCoin) {
          coinPairIdForAPI = (selectedCoin.coin_pair || selectedCoin.id).toString();
          console.log(`SpotTrading: Defaulting to coin: ${selectedCoin.symbol}, ID: ${coinPairIdForAPI}`);
          setSearchParams({ coin_pair_id: coinPairIdForAPI }, { replace: true });
          
          const tempDefaultData = getCoinDataFromCache(selectedCoin.symbol);
          if (tempDefaultData) {
            setCryptoDataWithLog(tempDefaultData);
          }
          return;
        }
      }
    }

    if (!selectedCoin) {
      console.log('SpotTrading: No coin could be selected');
      if (availableCoins.length === 0 && coinsLoading) {
        console.log("SpotTrading: availableCoins is empty, likely still loading them.");
      } else {
        setError(`Coin data for ID ${coinPairId} could not be loaded.`);
        setCryptoData(null);
      }
      setLoading(false);
      setStatsLoading(false);
      return;
    }
    
    console.log('SpotTrading: Processing selected coin:', selectedCoin.symbol, 'with API ID:', coinPairIdForAPI);
    currentCoinPairId.current = coinPairIdForAPI;

    try {
      const token = localStorage.getItem('authToken');
      const userId = localStorage.getItem('user_id');
      let uid = localStorage.getItem('uid');
      const isLoggedIn = token && userId;

      // Get coin data from cache first
      const coinDataFromCache = getCoinDataFromCache(selectedCoin.symbol);

      if (!isLoggedIn) {
        if (coinDataFromCache) {
          setCryptoDataWithLog(coinDataFromCache);
          setError(null);
        } else {
          setError(`Failed to load details for ${selectedCoin.symbol}`);
        }
        setUserBalance({ cryptoSpotBalance: 0, usdtSpotBalance: 0 });
      } else {
        if (!uid && userId) {
          try {
            const userInfoResponse = await axios.get(
              `https://django.bhtokens.com/api/user_account/getUserInformation/?user_id=${userId}`,
              { headers: { 'Authorization': `Bearer ${token}` } }
            );
            uid = userInfoResponse.data?.user?.uid || 'yE8vKBNw';
            localStorage.setItem('uid', uid);
          } catch (apiError) {
            console.error("SpotTrading: Error fetching UID", apiError);
            uid = 'yE8vKBNw';
          }
        }

        const walletResponse = await fetchWalletData(uid, coinPairIdForAPI);
        let finalCryptoData;

        if (walletResponse && walletResponse.cryptoData) {
          // Merge wallet data with cached coin data
          finalCryptoData = {
            ...(coinDataFromCache || {}),
            ...walletResponse.cryptoData,
            // Prioritize cached data for price and market info
            cryptoPrice: coinDataFromCache?.cryptoPrice ?? walletResponse.cryptoData.cryptoPrice,
            priceChange24h: coinDataFromCache?.priceChange24h ?? 0,
            '24_high': coinDataFromCache?.['24_high'],
            '24_low': coinDataFromCache?.['24_low'],
            'volume_24h': coinDataFromCache?.['volume_24h'],
            // Ensure compatibility fields
            price: coinDataFromCache?.price ?? walletResponse.cryptoData.price,
            crypto_symbol: coinDataFromCache?.crypto_symbol || walletResponse.cryptoData.crypto_symbol,
            crypto_name: coinDataFromCache?.crypto_name || walletResponse.cryptoData.crypto_name,
            crypto_logo_path: coinDataFromCache?.crypto_logo_path || walletResponse.cryptoData.crypto_logo_path,
          };

          setUserBalance(walletResponse.balance || { cryptoSpotBalance: 0, usdtSpotBalance: 0 });
        } else if (coinDataFromCache) {
          console.warn("SpotTrading: Wallet data failed or empty, using cached coin data.");
          finalCryptoData = coinDataFromCache;
          setUserBalance({ cryptoSpotBalance: 0, usdtSpotBalance: 0 });
        } else {
          setError(`Failed to load data for ${selectedCoin.symbol}.`);
          setCryptoData(null);
          setLoading(false);
          setStatsLoading(false);
          return;
        }
        
        setCryptoDataWithLog(finalCryptoData);
        setError(null);
        setStatsLoading(false);
      }

      isInitialized.current = true;
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
    getCoinDataFromCache, 
    fetchWalletData,
    setSearchParams,
    coinsLoading
  ]);

  // Effect to handle coin pair changes
  useEffect(() => {
    if (availableCoins.length > 0 && !coinsLoading) {
      fetchTimeoutRef.current = setTimeout(() => {
        fetchCryptoData(false);
      }, 100);
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [coinPairId, availableCoins.length, fetchCryptoData, coinsLoading]);

  // Fetch user balance after trade
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

  // Handle coin selection from FavoritesBar
  const handleCoinSelect = useCallback((selectedCoinPairId) => {
    const selectedId = selectedCoinPairId.toString();
    const currentId = coinPairId.toString();
    
    console.log('handleCoinSelect called with:', selectedCoinPairId, 'current:', currentId);
    
    if (selectedId !== currentId) {
      console.log('Switching coin from', currentId, 'to', selectedId);
      
      // Get coin data from cache immediately for instant UI update
      const selectedCoin = availableCoins.find(coin => 
        (coin.coin_pair && coin.coin_pair.toString() === selectedId) ||
        (coin.id && coin.id.toString() === selectedId)
      );
      
      if (selectedCoin) {
        const cachedCoinData = getCoinDataFromCache(selectedCoin.symbol);
        if (cachedCoinData) {
          setCryptoDataWithLog(cachedCoinData);
          console.log('Immediately updated UI with cached data for:', selectedCoin.symbol);
        }
      }
      
      setSearchParams({ coin_pair_id: selectedId });
    }
  }, [coinPairId, setSearchParams, availableCoins, getCoinDataFromCache]);

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

  // Format subHeaderData for consistency
  const subHeaderData = useMemo(() => {
    if (!cryptoData) return null;
    
    return {
      crypto_symbol: cryptoData.crypto_symbol || cryptoData.cryptoSymbol,
      crypto_name: cryptoData.crypto_name || cryptoData.cryptoName,
      price: cryptoData.price || cryptoData.cryptoPrice,
      crypto_logo_path: cryptoData.crypto_logo_path || cryptoData.cryptoLogoPath,
      usdt_symbol: cryptoData.usdt_symbol || cryptoData.usdtSymbol || 'USDT',
      priceChange24h: cryptoData.priceChange24h || cryptoData.price_change_24h || 0,
      '24_high': cryptoData['24_high'],
      '24_low': cryptoData['24_low'],
      volume_24h: cryptoData.volume_24h
    };
  }, [cryptoData]);

  return (
    <div className="spot-trading-container">
      <SubHeader
        cryptoData={subHeaderData}
        coinPairId={coinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
        loading={(loading && !isInitialized.current) || coinsLoading}
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