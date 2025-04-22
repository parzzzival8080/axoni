import React, { useState } from 'react';
import './TradeForm.css';

function TradeForm({ symbol = 'BTC' }) {
  const [activeTab, setActiveTab] = useState('trade'); // 'trade' or 'tools'
  const [positionType, setPositionType] = useState('open'); // 'open' or 'close'
  const [leverageMode, setLeverageMode] = useState('isolated'); // 'isolated' or 'cross'
  const [leverage, setLeverage] = useState('5.00'); // leverage value
  const [orderType, setOrderType] = useState('limit'); // 'limit', 'market', or 'tp/sl'
  const [price, setPrice] = useState('88,087.7');
  const [amount, setAmount] = useState('');
  const [sliderValue, setSliderValue] = useState(0);
  const [tpslEnabled, setTpslEnabled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Show login button as in reference

  // Handle tab click
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // Handle position type change
  const handlePositionTypeClick = (type) => {
    setPositionType(type);
  };

  // Handle leverage mode change
  const toggleLeverageMode = () => {
    setLeverageMode(leverageMode === 'isolated' ? 'cross' : 'isolated');
  };

  // Handle leverage change
  const toggleLeverage = () => {
    setLeverage(leverage === '5.00' ? '10.00' : '5.00');
  };

  // Handle order type change
  const handleOrderTypeClick = (type) => {
    setOrderType(type);
  };

  // Handle slider change
  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    // Calculate amount based on slider value - this would use real balance in a real app
    const newAmount = (e.target.value / 100 * 0.05).toFixed(5);
    setAmount(newAmount);
  };

  return (
    <div className="trade-form dark-theme">
      {/* Tabs: Trade/Tools */}
      <div className="trade-tabs">
        <div 
          className={`tab ${activeTab === 'trade' ? 'active' : ''}`} 
          onClick={() => handleTabClick('trade')}
        >
          Trade
        </div>
        <div 
          className={`tab ${activeTab === 'tools' ? 'active' : ''}`} 
          onClick={() => handleTabClick('tools')}
        >
          Tools
        </div>
      </div>

      {/* Open/Close Position Buttons */}
      <div className="position-buttons">
        <button 
          className={`position-btn ${positionType === 'open' ? 'active' : ''}`}
          onClick={() => handlePositionTypeClick('open')}
        >
          Open
        </button>
        <button 
          className={`position-btn ${positionType === 'close' ? 'active' : ''}`}
          onClick={() => handlePositionTypeClick('close')}
        >
          Close
        </button>
      </div>

      {/* Leverage Selection */}
      <div className="leverage-selection">
        <div className="leverage-mode" onClick={toggleLeverageMode}>
          {leverageMode === 'isolated' ? 'Isolated' : 'Cross'} <i className="fas fa-caret-down"></i>
        </div>
        <div className="leverage-value" onClick={toggleLeverage}>
          <span className="green-text">{leverage}x</span> {leverage}x <i className="fas fa-caret-down"></i>
        </div>
      </div>

      {/* Order Type Selection */}
      <div className="order-type-selection">
        <div className={`order-type ${orderType === 'limit' ? 'active' : ''}`} 
             onClick={() => handleOrderTypeClick('limit')}>
          Limit
        </div>
        <div className={`order-type ${orderType === 'market' ? 'active' : ''}`} 
             onClick={() => handleOrderTypeClick('market')}>
          Market
        </div>
        <div className={`order-type ${orderType === 'tp/sl' ? 'active' : ''}`} 
             onClick={() => handleOrderTypeClick('tp/sl')}>
          TP/SL <i className="fas fa-chevron-down"></i>
        </div>
        <div className="help-icon">
          <i className="fas fa-question-circle"></i>
        </div>
      </div>

      {/* Price Input */}
      <div className="price-input-section">
        <div className="price-label">Price (USDT)</div>
        <div className="price-input-container">
          <input 
            type="text" 
            className="price-input" 
            value={price} 
            onChange={(e) => setPrice(e.target.value)}
          />
          <div className="price-controls">
            <button className="price-control up"><i className="fas fa-caret-up"></i></button>
            <button className="price-control down"><i className="fas fa-caret-down"></i></button>
          </div>
          <button className="market-price-btn">BBO</button>
        </div>
      </div>

      {/* Amount Input */}
      <div className="amount-input-section">
        <div className="amount-label">
          Amount (Contracts) <i className="fas fa-chevron-down"></i>
        </div>
        <div className="contract-value">
          Single contract value 0.01 {symbol}
        </div>
        
        {/* Slider */}
        <div className="amount-slider">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue} 
            onChange={handleSliderChange}
            className="slider"
          />
          <div className="slider-markers">
            <div className="slider-marker-point"></div>
            <div className="slider-marker-point"></div>
            <div className="slider-marker-point"></div>
            <div className="slider-marker-point"></div>
            <div className="slider-marker-point"></div>
          </div>
          <div className="slider-values">
            <span>0</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Balance Information */}
      <div className="balance-info">
        <div className="available">
          Available — USDT
          <button className="info-btn"><i className="fas fa-plus-circle"></i></button>
        </div>
        <div className="max-trade">
          Max long — Contracts
        </div>
        <div className="max-short">
          Max short — Contracts
        </div>
      </div>

      {/* Separator line */}
      <div className="separator-line"></div>

      {/* TP/SL Checkbox */}
      <div className="tp-sl-container">
        <label className="tp-sl-checkbox">
          <input 
            type="checkbox" 
            checked={tpslEnabled} 
            onChange={() => setTpslEnabled(!tpslEnabled)} 
          />
          <span className="checkbox-text">TP/SL</span>
        </label>
      </div>

      {/* Action Button */}
      {isLoggedIn ? (
        <button className="action-btn buy">Buy More</button>
      ) : (
        <button className="action-btn login">Buy More</button>
      )}

      {/* Cost Section */}
      <div className="cost-section">
        <div className="cost-item">
          <div className="cost-label">Cost — USDT</div>
          <div className="max-price">Max price 188,571.0</div>
        </div>
        <div className="cost-item">
          <div className="cost-label">Cost — USDT</div>
          <div className="min-price">Min price 187,689.6</div>
        </div>
      </div>

      {/* Tools Section */}
      <div className="tools-section">
        <div className="tool-item">
          <span className="percent-icon">%</span> Calculator
        </div>
        <div className="tool-item">
          <span className="percent-icon">%</span> Fees
        </div>
        <div className="tool-item">
          <i className="fas fa-chart-line"></i> Position builder
        </div>
      </div>
    </div>
  );
}

export default TradeForm; 