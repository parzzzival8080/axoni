import React from 'react'
import SubHeader from '../components/futureTrading/SubHeader'
import FavoritesBar from '../components/futureTrading/FavoritesBar'
import TradingChart from '../components/futureTrading/TradingChart'
import OrderBook from '../components/futureTrading/OrderBook'
import TradeForm from '../components/futureTrading/TradeForm'
function FutureTrading() {
  return (
    <div className="future-trading-container">
        <SubHeader/>
        <FavoritesBar/>
        <div className="main-container">
          <TradingChart/>
          <OrderBook/>
          <TradeForm/>
        </div>
        {/* <div className="quick-start">
            Quick start <i className="fas fa-times close-quickstart"></i>
        </div> */}
    </div>
  )
}

export default FutureTrading