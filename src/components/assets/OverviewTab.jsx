import React, { useState, useEffect } from "react";
import "./OverviewTab.css";
import chartPlaceholder from "../../assets/assets/411B1865A7B26122.webp";
import earnIcon from "../../assets/assets/earn-icon.svg";
import axios from "axios";

const OverviewTab = () => {
  const [timeframe, setTimeframe] = useState("1D");
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // Get UID from localStorage (assuming it's stored there from login)
        const uid = localStorage.getItem('uid') || 'QEaIjLlY'; // Fallback to example UID
        
        // API key from your image
        const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
        
        // Construct the API URL
        const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallets/${uid}?apikey=${apiKey}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data) {
          // Set overview data
          setOverviewData({
            overview: response.data.overview || 0,
            spot_wallet: response.data.spot_wallet || 0,
            future_wallet: response.data.future_wallet || 0,
            funding_wallet: response.data.funding_wallet || 0
          });
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data.");
        // Set default overview data
        setOverviewData({
          overview: 972990894,
          spot_wallet: 972950894,
          future_wallet: 40000,
          funding_wallet: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);
  
  // Format large numbers with commas
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  return (
    <div className="overview-content">
      <div className="overview-breadcrumb">
        <span>Overview</span>
        <span className="breadcrumb-separator">/</span>
        <span className="coin-name">USDT</span>
      </div>
      
      <div className="overview-main-container">
        <div className="overview-left-section">
          <div className="estimated-value-section">
            <div className="value-header">
              <span>Estimated total value</span>
              <span className="eye-icon"><i className="fas fa-eye"></i></span>
            </div>
            
            {loading ? (
              <div className="loading-state">Loading...</div>
            ) : error ? (
              <div className="error-state">{error}</div>
            ) : (
              <>
                <div className="total-value">${formatNumber(overviewData.overview)}</div>
                <div className="coin-amount">Total assets in your account</div>
              </>
            )}
            
            <div className="action-buttons">
              <button className="action-button deposit-btn">Deposit</button>
              <button className="action-button convert-btn">Convert</button>
              <button className="action-button withdraw-btn">Withdraw</button>
              <button className="action-button transfer-btn">Transfer</button>
            </div>
          </div>
          
          <div className="chart-section">
            <div className="timeframe-selector">
              <button className={timeframe === "1D" ? "timeframe-btn active" : "timeframe-btn"} onClick={() => setTimeframe("1D")}>1D</button>
              <button className={timeframe === "1W" ? "timeframe-btn active" : "timeframe-btn"} onClick={() => setTimeframe("1W")}>1W</button>
              <button className={timeframe === "1M" ? "timeframe-btn active" : "timeframe-btn"} onClick={() => setTimeframe("1M")}>1M</button>
              <button className={timeframe === "6M" ? "timeframe-btn active" : "timeframe-btn"} onClick={() => setTimeframe("6M")}>6M</button>
            </div>
            
            <div className="empty-chart">
              <div className="chart-placeholder">
                <img src={chartPlaceholder} alt="Chart placeholder" className="chart-icon" />
                <div className="chart-message">Unable to load data</div>
                <div className="chart-submessage">We'll need more data to generate the chart for you</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overview-right-section">
          <div className="allocation-section">
            <h3 className="section-title">Allocation</h3>
            
            <div className="allocation-chart">
              <div className="donut-chart-container">
                <div className="donut-chart">
                  <div className="donut-inner">
                    <span className="donut-percent">100%</span>
                    <span className="donut-label">Trading</span>
                  </div>
                </div>
              </div>
              
              <div className="allocation-details">
                <div className="allocation-item">
                  <span className="allocation-label"><span className="color-indicator spot"></span>Spot Wallet:</span>
                  <span className="allocation-amount">${formatNumber(overviewData.spot_wallet)}</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label"><span className="color-indicator future"></span>Future Wallet:</span>
                  <span className="allocation-amount">${formatNumber(overviewData.future_wallet)}</span>
                </div>
                <div className="allocation-item">
                  <span className="allocation-label"><span className="color-indicator funding"></span>Funding Wallet:</span>
                  <span className="allocation-amount">${formatNumber(overviewData.funding_wallet)}</span>
                </div>
                <div className="allocation-item total">
                  <span className="allocation-label">Total:</span>
                  <span className="allocation-amount">${formatNumber(overviewData.overview)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="earn-section">
            <div className="earn-content">
              <div className="earn-text">
                <div className="earn-title">Earn POL for up to 3.92% APR!</div>
              </div>
              <div className="earn-icon">
                <img src={earnIcon} alt="Earn" />
              </div>
            </div>
            <div className="earn-action">
              <button className="view-details">View details →</button>
            </div>
          </div>
          
          <div className="transactions-section">
            <div className="transactions-header">
              <h3 className="section-title">Recent transactions</h3>
              <button className="view-more">View more →</button>
            </div>
            
            <div className="transactions-list">
              <div className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-type">To: Trading POL</div>
                  <div className="transaction-date">04/28/2025, 18:53:34</div>
                </div>
                <div className="transaction-amount negative">-1 POL</div>
              </div>
              
              <div className="transaction-item">
                <div className="transaction-details">
                  <div className="transaction-type">Deposit POL</div>
                  <div className="transaction-date">04/28/2025, 18:53:34</div>
                </div>
                <div className="transaction-amount positive">1 POL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
