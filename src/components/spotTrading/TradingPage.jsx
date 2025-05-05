import React, { useState, useEffect } from 'react';
import TradeForm from './TradeForm';
import OrderHistory from './OrderHistory';
import FavoritesBar from './FavoritesBar';
import { getSpotBalance } from '../../services/spotTradingApi';

const TradingPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCoinPair, setSelectedCoinPair] = useState({
    id: 1,
    symbol: 'BTC/USDT',
    cryptoSymbol: 'BTC',
    cryptoPrice: 80000,
    cryptoLogoPath: '/images/btc.png',
    usdtSymbol: 'USDT',
    usdtLogoPath: '/images/usdt.png'
  });

  const [userBalance, setUserBalance] = useState({
    cryptoBalance: 0.5,
    usdtBalance: 10000
  });

  // Function to handle successful trade and refresh order history
  const handleTradeSuccess = () => {
    // Increment the refresh trigger to cause OrderHistory to reload
    setRefreshTrigger(prev => prev + 1);
  };

  const availableCoins = [
    { id: 1, symbol: 'BTC', pair_name: 'USDT', is_tradable: true, logo_path: '/images/btc.png', cryptoPrice: 80000 },
    { id: 4, symbol: 'ETH', pair_name: 'USDT', is_tradable: true, logo_path: '/images/eth.png', cryptoPrice: 4000 },
    { id: 13, symbol: 'XRP', pair_name: 'USDT', is_tradable: true, logo_path: '/images/xrp.png', cryptoPrice: 1.5 },
    // ...add more pairs as needed
  ];

  const handleCoinPairChange = (coinPairId) => {
    const coin = availableCoins.find(c => c.id === coinPairId);
    if (coin) {
      setSelectedCoinPair({
        id: coin.id,
        symbol: `${coin.symbol}/${coin.pair_name}`,
        cryptoSymbol: coin.symbol,
        cryptoPrice: coin.cryptoPrice,
        cryptoLogoPath: coin.logo_path,
        usdtSymbol: coin.pair_name,
        usdtLogoPath: '/images/usdt.png'
      });
    }
  };

  // Fetch wallet balance for selected coin
  useEffect(() => {
    const fetchBalance = async () => {
      const uid = localStorage.getItem('uid') || 'yE8vKBNw';
      const res = await getSpotBalance(uid);
      if (res && res.success && res.balance) {
        // Map balance to expected structure
        setUserBalance({
          cryptoBalance: res.balance[selectedCoinPair.cryptoSymbol.toLowerCase()] || 0,
          usdtBalance: res.balance.usdt || 0
        });
      }
    };
    fetchBalance();
  }, [selectedCoinPair]);

  // Additional logic for fetching user data, crypto prices, etc. would go here

  return (
    <div className="trading-page">
      <FavoritesBar
        activeCoinPairId={selectedCoinPair.id}
        availableCoins={availableCoins}
      />
      <div className="trading-layout">
        <div className="trade-form-container">
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
    </div>
  );
};

export default TradingPage;