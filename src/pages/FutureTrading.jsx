import React, { useState } from 'react'
import SubHeader from '../components/futureTrading/SubHeader'
import FavoritesBar from '../components/futureTrading/FavoritesBar'
import TradingChart from '../components/futureTrading/TradingChart'
import OrderBook from '../components/futureTrading/OrderBook'
import TradeForm from '../components/futureTrading/TradeForm'
import OrderHistory from '../components/futureTrading/OrderHistory'

function FutureTrading() {
  const [selectedCoin, setSelectedCoin] = useState('BTC');

  const handleCoinSelect = (symbol) => {
    setSelectedCoin(symbol);
  };

  return (
    <div className="future-trading-container">
        <SubHeader symbol={selectedCoin} />
        <FavoritesBar onSelectCoin={handleCoinSelect} />
        <div className="main-container">
          <TradingChart symbol={selectedCoin} />
          <OrderBook symbol={selectedCoin} />
          <TradeForm symbol={selectedCoin} />
        </div>
        <OrderHistory />
        {/* <div className="quick-start">
            Quick start <i className="fas fa-times close-quickstart"></i>
        </div> */}
    </div>
  )
}

export default FutureTrading