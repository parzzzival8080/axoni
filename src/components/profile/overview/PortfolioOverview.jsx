import React, { useState } from 'react';
import './PortfolioOverview.css';

const PortfolioOverview = () => {
  const [isValueVisible, setIsValueVisible] = useState(true);

  const actionButtons = [
    { label: 'Deposit', isPrimary: true },
    { label: 'Convert', isPrimary: false },
    { label: 'Withdraw', isPrimary: false },
    { label: 'Transfer', isPrimary: false }
  ];

  return (
    <div className="portfolio-overview">
      <div className="portfolio-card">
        <div className="portfolio-header">
          <div className="estimated-value">
            <div className="value-header">
              <span className="value-label">Estimated total value
                <button className="visibility-toggle" onClick={() => setIsValueVisible(!isValueVisible)}>
                  {isValueVisible ? <i className="fas fa-eye"></i> : <i className="fas fa-eye-slash"></i>}
                </button>
              </span>
            </div>
            
            <div className="value-display">
              <span className="value-amount">{isValueVisible ? '0.23' : '***'}</span>
              <select className="currency-selector">
                <option value="USDT">USDT</option>
                <option value="USD">USD</option>
                <option value="BTC">BTC</option>
              </select>
            </div>
            
            <div className="value-change">
              <span className="pnl-label">Today's PnL</span>
              <span className="pnl-value">
                {isValueVisible ? '10.00' : '***'} <span className="pnl-percentage">({isValueVisible ? '0.00%' : '***'})</span>
              </span>
            </div>

            <div className="action-buttons">
            {actionButtons.map((button, index) => (
              <button 
                key={index}
                className={`action-button ${button.isPrimary ? 'primary' : 'secondary'}`}
              >
                {button.label}
              </button>
            ))}
          </div>
          </div>

          
        </div>

        {/* Chart placeholder - Add your graph component here */}
        <div className="chart-container-placeholder">
          {/* Your chart component will go here */}
        </div>

        <div className="view-assets-section">
          <button className="view-assets-button">
            View my assets
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioOverview;