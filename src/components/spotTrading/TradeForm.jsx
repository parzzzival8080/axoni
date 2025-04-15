import React, { useState } from 'react';

const TradeForm = () => {
  const [isBuy, setIsBuy] = useState(true);
  const [activeOrderType, setActiveOrderType] = useState('Limit');
  const [sliderValue, setSliderValue] = useState(0);
  const [price, setPrice] = useState(85855.8);
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [tpslEnabled, setTpslEnabled] = useState(false);

  const handleSliderChange = (e) => {
    setSliderValue(e.target.value);
    // In a real app, this would calculate the amount based on available balance
    setAmount((e.target.value / 100 * 0.05).toFixed(5));
    setTotal((e.target.value / 100 * 0.05 * price).toFixed(2));
  };

  const handleAmountChange = (e) => {
    setAmount(e.target.value);
    setTotal((e.target.value * price).toFixed(2));
    // Update slider position
    const maxAmount = 0.05; // This would come from user balance in real app
    setSliderValue((e.target.value / maxAmount * 100));
  };

  const handleTotalChange = (e) => {
    setTotal(e.target.value);
    const calculatedAmount = (e.target.value / price).toFixed(5);
    setAmount(calculatedAmount);
    // Update slider position
    const maxAmount = 0.05; // This would come from user balance in real app
    setSliderValue((calculatedAmount / maxAmount * 100));
  };

  return (
    <div className="trade-section">
      <div className="trade-tabs">
        <div className="tab-actions">
          <div className="tab active">Trade</div>
          <div className="tab">Tools</div>
        </div>
        <div className="margin-toggle">
          <span>Margin</span>
          <label className="switch">
            <input type="checkbox" />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      <div className="buy-sell-tabs">
        <div 
          className={`tab ${isBuy ? 'active' : ''}`} 
          onClick={() => setIsBuy(true)}
        >
          Buy
        </div>
        <div 
          className={`tab ${!isBuy ? 'active' : ''}`} 
          onClick={() => setIsBuy(false)}
        >
          Sell
        </div>
      </div>

      <div className="order-types">
        {['Limit', 'Market', 'TP/SL'].map((type) => (
          <div 
            key={type}
            className={`type ${activeOrderType === type ? 'active' : ''} ${type === 'TP/SL' ? 'dropdown' : ''}`}
            onClick={() => setActiveOrderType(type)}
          >
            {type} {type === 'TP/SL' && <i className="fas fa-chevron-down"></i>}
          </div>
        ))}
      </div>

      <div className="price-display">
        <div className="price-row">
          <div className="price-label">Price (USDT)</div>
          <div className="price-column">86,064.5</div>
          <div className="total-column">Total (BTC)</div>
        </div>
        <div className="price-data">
          <div className="price-cell">86,069.1</div>
          <div className="amount-cell">0.03507</div>
          <div className="total-cell">0.67155</div>
        </div>
        <div className="price-data">
          <div className="price-cell">86,066.0</div>
          <div className="amount-cell">0.02870</div>
          <div className="total-cell">0.63648</div>
        </div>
      </div>

      <div className="form-group">
        <label>Price (USDT)</label>
        <div className="input-wrapper">
          <input 
            type="text" 
            value={price.toLocaleString()} 
            onChange={(e) => setPrice(Number(e.target.value.replace(/,/g, '')))}
          />
          <span className="input-note">≈ ${price.toLocaleString()}</span>
        </div>
      </div>

      <div className="form-group">
        <label>Amount (BTC)</label>
        <input 
          type="text" 
          value={amount || "Min 0.00001 BTC"} 
          onChange={handleAmountChange}
          onFocus={() => amount === '' && setAmount('')}
          onBlur={() => amount === '' && setAmount('Min 0.00001 BTC')}
        />
        <div className="slider-container">
          <input 
            type="range" 
            min="0" 
            max="100" 
            value={sliderValue} 
            className="range-slider"
            onChange={handleSliderChange}
          />
          <div className="slider-labels">
            <span>0</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="form-group">
        <label>Total (USDT)</label>
        <input 
          type="text" 
          placeholder="0.00" 
          value={total}
          onChange={handleTotalChange}
        />
      </div>

      <div className="balance-info">
        <div className="available">Available — USDT <i className="fas fa-info-circle"></i></div>
        <div className="max-buy">Max buy — BTC</div>
      </div>

      <div className="tp-sl-check">
        <input 
          type="checkbox" 
          id="tp-sl-checkbox" 
          checked={tpslEnabled}
          onChange={() => setTpslEnabled(!tpslEnabled)}
        />
        <label htmlFor="tp-sl-checkbox">TP/SL</label>
      </div>

      <button className="login-button">Log in/Sign up</button>

      <div className="price-info">
        <div className="max-price">Max price <span>186,488.9</span></div>
        <div className="fees">Fees <i className="fas fa-info-circle"></i></div>
      </div>

      <div className="assets">USDT assets</div>
    </div>
  );
};

export default TradeForm; 