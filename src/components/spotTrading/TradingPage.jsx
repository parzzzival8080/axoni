import React, { useState, useEffect } from 'react';
import TradeForm from './TradeForm';
import OrderHistory from './OrderHistory';

const TradingPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [cryptoData, setCryptoData] = useState({
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
  
  // Additional logic for fetching user data, crypto prices, etc. would go here
  
  return (
    <div className="trading-page">
      <div className="trading-layout">
        <div className="trade-form-container">
          <TradeForm 
            cryptoData={cryptoData}
            userBalance={userBalance}
            coinPairId={1}
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