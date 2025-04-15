import React from 'react';
import TradingChart from '../components/spotTrading/TradingChart';
import OrderBook from '../components/spotTrading/OrderBook';
import TradeForm from '../components/spotTrading/TradeForm';
import Header from '../components/spotTrading/Header';
import SubHeader from '../components/spotTrading/SubHeader';
import FavoritesBar from '../components/spotTrading/FavoritesBar';
import '../components/spotTrading/SpotTrading.css';

const SpotTrading = () => {
  return (
    <div className="spot-trading-container">
      <Header />
      <SubHeader />
      <FavoritesBar />
      <div className="main-container">
        <TradingChart />
        <OrderBook />
        <TradeForm />
      </div>
      <div className="quick-start">
        Quick start <i className="fas fa-times close-quickstart"></i>
      </div>
    </div>
  );
};

export default SpotTrading; 