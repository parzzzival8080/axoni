import React from 'react';
import defaultCoinLogo from '../../assets/coin/bitcoin-2136339_640.webp';

const SubHeader = ({ cryptoData, coinPairId }) => {
  if (!cryptoData) {
    return (
      <div className="sub-header skeleton-loading">
        <div className="loading-message">Loading coin data...</div>
      </div>
    );
  }

  const { 
    cryptoName, 
    cryptoSymbol, 
    cryptoPrice, 
    cryptoLogoPath,
    usdtSymbol 
  } = cryptoData;
  
  // Format the price for display
  const formattedPrice = parseFloat(cryptoPrice).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  // Use the logo from API or default to the static image
  const logoSrc = cryptoLogoPath || defaultCoinLogo;

  return (
    <div className="sub-header">
      <div className="coin-info">
        <div className="coin-icon">
          <img 
            src={logoSrc} 
            alt={cryptoSymbol} 
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = defaultCoinLogo;
            }}
          />
        </div>
        <div className="coin-pair">{cryptoSymbol}/{usdtSymbol}</div>
        <div className="leverage">10x</div>
        <div className="favorite"><i className="far fa-star"></i></div>
      </div>
      <div className="price-stats">
        <div className="stat">
          <div className="value green">{formattedPrice}</div>
          <div className="label">{cryptoName} price <i className="fas fa-external-link-alt"></i></div>
          <div className="sub-value">${formattedPrice}</div>
        </div>
        <div className="stat">
          <div className="value">--</div>
          <div className="label">24h low</div>
        </div>
        <div className="stat">
          <div className="value">--</div>
          <div className="label">24h high</div>
        </div>
        <div className="stat">
          <div className="value">--</div>
          <div className="label">24h volume ({cryptoSymbol})</div>
        </div>
        <div className="stat">
          <div className="value">--</div>
          <div className="label">24h turnover ({usdtSymbol})</div>
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