import React, { useState, useEffect } from 'react'
import coinLogo from '../../assets/coin/bitcoin-2136339_640.webp';
import { fetchCoinDetails } from '../../services/futureTradingApi.js';

function SubHeader({ symbol = 'BTC' }) {
  const [coinDetails, setCoinDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely convert price to number and format it
  const formatPrice = (price, decimals = 1) => {
    if (price === undefined || price === null) return "0.0";
    
    let numPrice;
    if (typeof price === 'string') {
      numPrice = parseFloat(price);
    } else if (typeof price === 'number') {
      numPrice = price;
    } else {
      numPrice = 0;
    }
    
    if (isNaN(numPrice)) return "0.0";
    return numPrice.toFixed(decimals);
  };

  useEffect(() => {
    const getCoinDetails = async () => {
      setLoading(true);
      try {
        const response = await fetchCoinDetails(symbol);
        if (response.success && response.data) {
          setCoinDetails(response.data);
          setError(null);
          
          // Log the received data for debugging
          console.log("Received coin details:", response.data);
          console.log("Price type:", typeof response.data.price);
        } else {
          setError(response.message || 'Failed to fetch coin details');
          setCoinDetails(null);
        }
      } catch (err) {
        setError('An error occurred while fetching coin details');
        setCoinDetails(null);
      } finally {
        setLoading(false);
      }
    };

    getCoinDetails();
  }, [symbol]);

  // Calculate derived values safely
  const price = coinDetails?.price ? parseFloat(coinDetails.price) : 0;
  const volume24h = coinDetails?.volume_24h ? parseFloat(coinDetails.volume_24h) : 0;
  const low24h = price * 0.97;
  const high24h = price * 1.03;
  const volumeK = volume24h / 1000;
  const turnoverM = (volume24h * price) / 1000000;

  return (
    <div className="sub-header">
      <div className="coin-info">
        <div className="coin-icon">
          {coinDetails?.logo ? (
            <img src={coinDetails.logo} alt={symbol} />
          ) : (
            <img src={coinLogo} alt={symbol} />
          )}
        </div>
        <div className="coin-pair">{symbol}/USDT</div>
        <div className="leverage">10x</div>
        <div className="favorite"><i className="far fa-star"></i></div>
      </div>
      
      {loading ? (
        <div className="price-stats">
          <div className="stat">
            <div className="value">Loading...</div>
          </div>
        </div>
      ) : error ? (
        <div className="price-stats">
          <div className="stat">
            <div className="value red">{error}</div>
          </div>
        </div>
      ) : (
        <div className="price-stats">
          <div className="stat">
            <div className={`value ${coinDetails?.price_change_is_positive ? 'green' : 'red'}`}>
              {formatPrice(price)}
            </div>
            <div className="label">{coinDetails?.name} price <i className="fas fa-external-link-alt"></i></div>
            <div className="sub-value">{coinDetails?.formatted_price || `$${formatPrice(price, 2)}`}</div>
          </div>
          <div className="stat">
            <div className="value">{formatPrice(low24h)}</div>
            <div className="label">24h low</div>
          </div>
          <div className="stat">
            <div className="value">{formatPrice(high24h)}</div>
            <div className="label">24h high</div>
          </div>
          <div className="stat">
            <div className="value">{formatPrice(volumeK, 2)}K</div>
            <div className="label">24h volume ({symbol})</div>
          </div>
          <div className="stat">
            <div className="value">{formatPrice(turnoverM, 2)}M</div>
            <div className="label">24h turnover (USDT)</div>
          </div>
        </div>
      )}
      
      <div className="trading-actions">
        <button className="data-btn"><i className="fas fa-chart-line"></i> Trading data</button>
        <button className="info-btn"><i className="far fa-file-alt"></i> Information</button>
        <div className="settings"><i className="fas fa-cog"></i></div>
      </div>
    </div>
  )
}

export default SubHeader