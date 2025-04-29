import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar as farStar } from '@fortawesome/free-regular-svg-icons';
import { faExternalLinkAlt, faChartLine, faCog } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
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
  
  // Calculate derived values for 24h stats
  const price = parseFloat(cryptoPrice) || 0;
  const low24h = (price * 0.97).toFixed(2);
  const high24h = (price * 1.03).toFixed(2);
  const volumeK = ((Math.random() * 100) + 50).toFixed(2); // Placeholder
  const turnoverM = ((price * (Math.random() * 100) + 50) / 1000).toFixed(2); // Placeholder

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
        <div className="coin-pair">{cryptoSymbol}/{usdtSymbol || 'USDT'}</div>
        <div className="leverage">20x</div>
        <div className="favorite">
          <FontAwesomeIcon icon={farStar} />
        </div>
      </div>
      <div className="price-stats">
        <div className="stat">
          <div className="value green">{formattedPrice}</div>
          <div className="label">
            {cryptoName || cryptoSymbol} price <FontAwesomeIcon icon={faExternalLinkAlt} />
          </div>
          <div className="sub-value">${formattedPrice}</div>
        </div>
        <div className="stat">
          <div className="value">{low24h}</div>
          <div className="label">24h low</div>
        </div>
        <div className="stat">
          <div className="value">{high24h}</div>
          <div className="label">24h high</div>
        </div>
        <div className="stat">
          <div className="value">{volumeK}K</div>
          <div className="label">24h volume ({cryptoSymbol})</div>
        </div>
        <div className="stat">
          <div className="value">{turnoverM}M</div>
          <div className="label">24h turnover ({usdtSymbol || 'USDT'})</div>
        </div>
      </div>
      <div className="trading-actions">
        <button className="data-btn">
          <FontAwesomeIcon icon={faChartLine} /> Trading data
        </button>
        <button className="info-btn">
          <FontAwesomeIcon icon={faFileAlt} /> Information
        </button>
        <div className="settings">
          <FontAwesomeIcon icon={faCog} />
        </div>
      </div>
    </div>
  );
};

export default SubHeader;