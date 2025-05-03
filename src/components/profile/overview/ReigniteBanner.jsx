import React from 'react';
import './ReigniteBanner.css';

const ReigniteBanner = () => {
  return (
    <div className="reignite-banner">
      <div className="banner-content">
        <h2 className="banner-title">Re# and Refresh</h2>
        
        <p className="banner-message">
          Reignite your crypto journey —<br />
          Trade & win from 100K USDT!
        </p>
        
        <a href="/start-trading" className="start-button">
          Start now
        </a>
      </div>
      
      <div className="banner-visual">
        <div className="hashtag-symbol">#</div>
      </div>
    </div>
  );
};

export default ReigniteBanner;