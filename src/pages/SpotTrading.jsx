import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import OrdersSection from '../components/spotTrading/OrdersSection';
import WalkthroughTrigger from '../components/spotTrading/WalkthroughTrigger';
import { 
  getSpotWallet, 
  fetchAllCoins, 
  getCoinFromCache,
  getCacheStats,
  fetchCoinPriceData
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
  // For polling price/price_change_24h
  const pollingRef = useRef(null);
  const [pricePollingError, setPricePollingError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  
  // Wrapper function to log setCryptoData calls
  const setCryptoDataWithLog = useCallback((data) => {
    console.log('setCryptoData called with:', {
      symbol: data?.cryptoSymbol || data?.crypto_symbol,
      websocket_name: data?.websocket_name,
      instId: data?.instId,
      logo: data?.cryptoLogoPath || data?.crypto_logo_path,
      data: data
    });
    setCryptoData(data);
  }, []);

  // Load coins from cache or API on mount
  useEffect(() => {
    let isMounted = true;
    let loadingTimeout;
    
    const loadCoins = async () => {
      setCoinsLoading(true);
      setError(null);
      
      // Fallback timeout to prevent stuck loading state
      loadingTimeout = setTimeout(() => {
        if (isMounted) {
          console.warn('Coins loading timed out, clearing loading state');
          setCoinsLoading(false);
          setLoading(false);
          setError('Loading timed out. Please refresh the page.');
        }
      }, 15000); // 15 second timeout
      
      try {
        console.log('Loading coins...');
        const response = await fetchAllCoins();
        
        if (isMounted) {
          clearTimeout(loadingTimeout);
          
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
          clearTimeout(loadingTimeout);
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
    return () => { 
      isMounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
    };
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
      usdt_symbol: coin.pair_name || 'USDT',
      // OrderBook compatibility - preserve EXACT websocket_name from API
      websocket_name: coin.websocket_name, // This should be 'ETC' for SMT coin
      symbol: coin.symbol, // This should be 'SMT'
      selectedSymbol: coin.symbol, // This should be 'SMT' 
      instId: `${coin.websocket_name || coin.symbol}-USDT` // This should be 'ETC-USDT' for SMT
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
            // Preserve full precision from API (12 decimals) - store raw values
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
        return; // Don't clear loading states if coins are still loading
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
          setStatsLoading(false);
        } else {
          // If no cached data, try to fetch coins to populate cache
          console.log('No cached data for non-logged user, attempting to load from API...');
          try {
            const coinsResponse = await fetchAllCoins(false);
            if (coinsResponse.success) {
              const freshCoinData = getCoinDataFromCache(selectedCoin.symbol);
              if (freshCoinData) {
                setCryptoDataWithLog(freshCoinData);
                setError(null);
              } else {
                setError(`Failed to load details for ${selectedCoin.symbol}`);
              }
            } else {
              setError(`Failed to load coin data: ${coinsResponse.message}`);
            }
          } catch (fetchError) {
            console.error('Error fetching coins for non-logged user:', fetchError);
            setError(`Failed to load details for ${selectedCoin.symbol}`);
          }
          setStatsLoading(false);
        }
        setUserBalance({ cryptoSpotBalance: 0, usdtSpotBalance: 0 });
      } else {
        if (!uid && userId) {
          try {
            const userInfoResponse = await axios.get(
              `https://django.kinecoin.co/api/user_account/getUserInformation/?user_id=${userId}`,
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
            // CRITICAL: Preserve websocket_name from cached coin data (from API)
            websocket_name: coinDataFromCache?.websocket_name, // e.g., 'ETC' for SMT coin
            symbol: coinDataFromCache?.symbol,
            selectedSymbol: coinDataFromCache?.selectedSymbol,
            instId: coinDataFromCache?.instId,
          };

          // Preserve full precision from API (12 decimals) - don't parse to float
        const balanceData = walletResponse.balance || { cryptoSpotBalance: 0, usdtSpotBalance: 0 };
        console.log('Setting user balance with full precision:', {
          cryptoSpotBalance: balanceData.cryptoSpotBalance,
          usdtSpotBalance: balanceData.usdtSpotBalance,
          cryptoPrecision: typeof balanceData.cryptoSpotBalance,
          usdtPrecision: typeof balanceData.usdtSpotBalance
        });
        setUserBalance(balanceData);
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
    } else if (availableCoins.length === 0 && !coinsLoading) {
      // If no coins are available and not loading, ensure loading state is cleared
      setLoading(false);
      setStatsLoading(false);
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
            `https://django.kinecoin.co/api/user_account/getUserInformation/?user_id=${userId}`,
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
        
        // Preserve full precision from API (12 decimals) - store raw values
        const balanceData = {
          cryptoSpotBalance: cryptoWallet?.spot_wallet || 0,
          usdtSpotBalance: usdtWallet?.spot_wallet || 0
        };
        console.log('Updated balances after trade with full precision:', {
          crypto: cryptoWallet?.spot_wallet,
          usdt: usdtWallet?.spot_wallet,
          cryptoType: typeof cryptoWallet?.spot_wallet,
          usdtType: typeof usdtWallet?.spot_wallet
        });
        setUserBalance(balanceData);
        
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

  // Poll for price and price_change_24h every 5 seconds (optimized) - works for all users
  useEffect(() => {
    if (!cryptoData?.cryptoSymbol) return;
    let isMounted = true;
    setIsPolling(true);
    setPricePollingError(null);

    // Use optimized price fetching function
    const pollPrice = async () => {
      try {
        const response = await fetchCoinPriceData(cryptoData.cryptoSymbol);
        if (!isMounted) return;
        
        if (response.success && response.data) {
          const { price, price_change_24h } = response.data;
          setCryptoData(prev => {
            if (!prev) return prev;
            if (
              prev.cryptoPrice !== price ||
              prev.priceChange24h !== price_change_24h ||
              prev.price !== price ||
              prev.price_change_24h !== price_change_24h
            ) {
              return {
                ...prev,
                cryptoPrice: price,
                priceChange24h: price_change_24h,
                price,
                price_change_24h,
                '24_high': response.data['24_high'] || prev['24_high'],
                '24_low': response.data['24_low'] || prev['24_low'],
                volume_24h: response.data.volume_24h || prev.volume_24h
              };
            }
            return prev;
          });
          
          // Clear any previous errors
          setPricePollingError(null);
        } else if (response.message) {
          setPricePollingError(response.message);
        }
      } catch (err) {
        if (isMounted) setPricePollingError(err?.message || 'Error updating price');
      }
    };

    // Poll every 5 seconds instead of 1 second for better performance
    pollingRef.current = setInterval(pollPrice, 5000);
    
    // Initial call for immediate UI update
    pollPrice();
    
    return () => {
      isMounted = false;
      setIsPolling(false);
      setPricePollingError(null);
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [cryptoData?.cryptoSymbol, getCoinFromCache]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Format subHeaderData for consistency
  const subHeaderData = useMemo(() => {
    if (!cryptoData) return null;
    
    return {
      crypto_symbol: cryptoData.crypto_symbol || cryptoData.cryptoSymbol,
      crypto_name: cryptoData.crypto_name || cryptoData.cryptoName,
      price: cryptoData.price ?? cryptoData.cryptoPrice ?? 0,
      cryptoPrice: cryptoData.cryptoPrice ?? cryptoData.price ?? 0,
      crypto_logo_path: cryptoData.crypto_logo_path || cryptoData.cryptoLogoPath,
      usdt_symbol: cryptoData.usdt_symbol || cryptoData.usdtSymbol || 'USDT',
      priceChange24h: cryptoData.priceChange24h ?? cryptoData.price_change_24h ?? 0,
      price_change_24h: cryptoData.price_change_24h ?? cryptoData.priceChange24h ?? 0,
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
        loading={coinsLoading || (loading && !isInitialized.current && !subHeaderData)}
        error={error}
        statsLoading={statsLoading}
        pricePollingError={pricePollingError}
        isPolling={isPolling}
      />
      <FavoritesBar
        activeCoinPairId={coinPairId}
        availableCoins={availableCoins}
        onCoinSelect={handleCoinSelect}
      />
      <div className="main-container flex flex-col md:grid">
        <TradingChart
          selectedSymbol={cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC'}
        />
        <OrderBook
          cryptoData={{
            ...cryptoData,
            // Map the correct fields for OrderBook - PRESERVE websocket_name from API
            websocket_name: cryptoData?.websocket_name, // Keep original websocket_name (e.g., 'ETC' for SMT)
            symbol: cryptoData?.symbol || cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC',
            selectedSymbol: cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC',
            cryptoSymbol: cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC',
            instId: `${cryptoData?.websocket_name || cryptoData?.crypto_symbol || cryptoData?.cryptoSymbol || 'BTC'}-USDT`
          }}
        />
        <div className="hidden md:block">
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
      
      {/* Walkthrough Trigger */}
      <WalkthroughTrigger />
    </div>
  );
};

export default SpotTrading;