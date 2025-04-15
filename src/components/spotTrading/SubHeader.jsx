import React from 'react';
import coinLogo from '../../assets/coin/bitcoin-2136339_640.webp';

const SubHeader = () => {
  return (
    <div className="sub-header">
      <div className="coin-info">
        <div className="coin-icon"><img src={coinLogo} alt="BTC" /></div>
        <div className="coin-pair">BTC/USDT</div>
        <div className="leverage">10x</div>
        <div className="favorite"><i className="far fa-star"></i></div>
      </div>
      <div className="price-stats">
        <div className="stat">
          <div className="value green">86,064.5</div>
          <div className="label">Bitcoin price <i className="fas fa-external-link-alt"></i></div>
          <div className="sub-value">$86,064.17</div>
        </div>
        <div className="stat">
          <div className="value">83,711.0</div>
          <div className="label">24h low</div>
        </div>
        <div className="stat">
          <div className="value">86,094.0</div>
          <div className="label">24h high</div>
        </div>
        <div className="stat">
          <div className="value">8.64K</div>
          <div className="label">24h volume (BTC)</div>
        </div>
        <div className="stat">
          <div className="value">734.87M</div>
          <div className="label">24h turnover (USDT)</div>
        </div>
      </div>
      <div className="trading-actions">
        <button className="data-btn"><i className="fas fa-chart-line"></i> Trading data</button>
        <button className="info-btn"><i className="far fa-file-alt"></i> Information</button>
        <div className="settings"><i className="fas fa-cog"></i></div>
      </div>
    </div>
  );
};

export default SubHeader; 