import React, { useState, useEffect, useCallback } from 'react';
import TradeForm from './TradeForm';
import OrderHistory from './OrderHistory';
import FavoritesBar from './FavoritesBar';
import { getSpotBalance, getCoins } from '../../services/spotTradingApi';

// Cache configuration
const CACHE_KEY = 'spot_trading_coins';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const TradingPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [availableCoins, setAvailableCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCoinPair, setSelectedCoinPair] = useState({
    id: 1,
    symbol: 'BTC/USDT',
    cryptoSymbol: 'BTC',
    cryptoPrice: 80000,
    priceChange24h: 0,
    cryptoLogoPath: '/images/btc.png',
    usdtSymbol: 'USDT',
    usdtLogoPath: '/images/usdt.png'
  });
  const [userBalance, setUserBalance] = useState({
    cryptoBalance: 0.5,
    usdtBalance: 10000
  });
  const [mobileTradeTab, setMobileTradeTab] = useState(''); // '' | 'buy' | 'sell'
  const [statsLoading, setStatsLoading] = useState(false);

  // Load coins from cache or API
  const loadCoins = useCallback(async () => {
    try {
      // Try to load from cache first
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < CACHE_EXPIRY) {
          setAvailableCoins(data);
          setLoading(false);
          return;
        }
      }

      // Fetch fresh data if cache is expired or missing
      const response = await getCoins();
      if (response.success && response.data) {
        const coins = response.data.map(coin => ({
          id: coin.coin_pair,
          symbol: coin.symbol,
          pair_name: coin.pair_name,
          is_tradable: coin.is_tradable === 'yes',
          logo_path: coin.logo_path,
          cryptoPrice: parseFloat(coin.price),
          priceChange24h: parseFloat(coin.price_change_24h)
        }));

        // Update cache
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: coins,
          timestamp: Date.now()
        }));

        setAvailableCoins(coins);
      }
    } catch (error) {
      console.error('Error loading coins:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load coins on mount and refresh trigger
  useEffect(() => {
    loadCoins();
  }, [loadCoins, refreshTrigger]);

  const handleTradeSuccess = () => setRefreshTrigger(prev => prev + 1);

  const handleCoinPairChange = (coinPairId) => {
    const coin = availableCoins.find(c => c.id === coinPairId);
    if (coin) {
      setSelectedCoinPair({
        id: coin.id,
        symbol: `${coin.symbol}/${coin.pair_name}`,
        cryptoSymbol: coin.symbol,
        cryptoPrice: coin.cryptoPrice,
        priceChange24h: coin.priceChange24h,
        cryptoLogoPath: coin.logo_path,
        usdtSymbol: coin.pair_name,
        usdtLogoPath: '/images/usdt.png'
      });
    }
  };

  useEffect(() => {
    const fetchBalance = async () => {
      const uid = localStorage.getItem('uid') || 'yE8vKBNw';
      const res = await getSpotBalance(uid);
      if (res && res.success && res.balance) {
        setUserBalance({
          cryptoBalance: res.balance[selectedCoinPair.cryptoSymbol.toLowerCase()] || 0,
          usdtBalance: res.balance.usdt || 0
        });
      }
    };
    fetchBalance();
  }, [selectedCoinPair]);

  // Mobile app bar buy/sell buttons
  const renderMobileTradeBar = () => (
    <div className="mobile-trade-bar">
      <button
        className={`mobile-trade-btn buy${mobileTradeTab === 'buy' ? ' active' : ''}`}
        onClick={() => setMobileTradeTab(mobileTradeTab === 'buy' ? '' : 'buy')}
      >
        Buy
      </button>
      <button
        className={`mobile-trade-btn sell${mobileTradeTab === 'sell' ? ' active' : ''}`}
        onClick={() => setMobileTradeTab(mobileTradeTab === 'sell' ? '' : 'sell')}
      >
        Sell
      </button>
    </div>
  );

  // Mobile bottom sheet trade form
  const renderMobileTradeForm = () => (
    <>
      <div className={`mobile-trade-overlay${mobileTradeTab ? ' open' : ''}`} 
           onClick={() => setMobileTradeTab('')}></div>
      <div className={`mobile-trade-form-sheet${mobileTradeTab ? ' open' : ''}`}>
        <div className="mobile-trade-form-header">
          <div className="mobile-trade-form-title">
            {mobileTradeTab === 'buy' ? 'Buy' : 'Sell'} {selectedCoinPair.cryptoSymbol}
          </div>
          <button className="mobile-trade-form-close" onClick={() => setMobileTradeTab('')}>
            ×
          </button>
        </div>
        <div className="mobile-trade-form-content">
          <TradeForm
            cryptoData={selectedCoinPair}
            userBalance={userBalance}
            coinPairId={selectedCoinPair.id}
            onTradeSuccess={handleTradeSuccess}
            isBuy={mobileTradeTab === 'buy'}
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="trading-page">
      <FavoritesBar
        activeCoinPairId={selectedCoinPair.id}
        availableCoins={availableCoins}
      />
      <div className="trading-layout">
        <div className="trade-form-container desktop-only">
          <TradeForm
            cryptoData={selectedCoinPair}
            userBalance={userBalance}
            coinPairId={selectedCoinPair.id}
            onTradeSuccess={handleTradeSuccess}
          />
        </div>
        <div className="order-history-container">
          <h2>Order History</h2>
          <OrderHistory refreshTrigger={refreshTrigger} />
        </div>
      </div>
      
      {/* Mobile app bar and bottom sheet trade form */}
      {renderMobileTradeBar()}
      {renderMobileTradeForm()}
    </div>
  );
};

export default TradingPage;