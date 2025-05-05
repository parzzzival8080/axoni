import React, { useState } from "react";
import assetIcon from "../../assets/assets/411B1865A7B26122.webp";

const TradingTab = ({ 
  coins, 
  searchTerm, 
  setSearchTerm, 
  showZeroBalance, 
  setShowZeroBalance, 
  page, 
  setPage, 
  loading, 
  error, 
  overviewData 
}) => {
  const [activeSubTab, setActiveSubTab] = useState("coins");

  // Filter coins based on search term and zero balance filter
  const filteredCoins = coins
    .filter(coin => {
      // Filter by search term
      if (searchTerm && !coin.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
          !coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Filter by zero balance
      if (!showZeroBalance && coin.raw_balance <= 0) {
        return false;
      }
      
      return true;
    });

  return (
    <>
      {coins.length > 0 ? (
        <>
          <div className="assets-cards">
            <div className="asset-card">
              <div className="card-content">
                <div className="asset-value-container">
                  <div className="asset-title">Assets value</div>
                  <div className="asset-value">${overviewData.overview.toLocaleString()}</div>
                  <div className="asset-description">
                    Total assets value in account
                  </div>
                </div>
              </div>
            </div>
            <div className="asset-card">
              <div className="card-content">
                <div className="asset-title">Recent transactions</div>
                <div className="asset-description">No recent transactions</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="assets-cards">
          <div className="asset-card">
            <div className="card-content">
              <div className="asset-center">
                <img src={assetIcon} alt="Assets icon" className="card-icon" />
                <h3 className="card-heading">Add assets to start trading</h3>
                <p className="card-subtext">Your assets will appear once you make a deposit or buy crypto with cash.</p>
                <button className="deposit-button">Deposit</button>
              </div>
            </div>
          </div>
          <div className="asset-card">
            <div className="card-content">
              <div className="asset-center">
                <img src={assetIcon} alt="Assets icon" className="card-icon" />
                <h3 className="card-heading">Recent transactions</h3>
                <p className="card-subtext">Your recent transactions will appear here.</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="assets-tabs">
        <div 
          className={activeSubTab === "coins" ? "tab active" : "tab"}
          onClick={() => setActiveSubTab("coins")}
        >
          Coins
        </div>
        <div 
          className={activeSubTab === "earn" ? "tab active" : "tab"}
          onClick={() => setActiveSubTab("earn")}
        >
          Earn
        </div>
      </div>
      
      {activeSubTab === "coins" && (
        <>
          <div className="assets-filters">
            <div className="assets-search-box">
              <input 
                type="text" 
                placeholder="Search coin" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-buttons">
              <button 
                className="filter-button"
                onClick={() => setShowZeroBalance(true)}
              >
                All assets
              </button>
              <button 
                className="filter-button"
                onClick={() => setShowZeroBalance(false)}
              >
                Hide zero balance
              </button>
            </div>
          </div>
          
          <div className="assets-table">
            {loading ? (
              <p>Loading assets...</p>
            ) : error ? (
              <p>{error}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th className="coin-header">Coin</th>
                    <th>Full Name</th>
                    <th className="right-align">Last Price</th>
                    <th className="right-align">Balance</th>
                    <th className="right-align">Value</th>
                    <th className="action-header">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoins.map((coin) => (
                    <tr key={coin.symbol}>
                      <td className="coin-cell">
                        {coin.logo ? (
                          <img src={coin.logo} alt={coin.symbol} className="coin-logo" />
                        ) : (
                          <div className="coin-icon">{coin.symbol.charAt(0)}</div>
                        )}
                        <span>{coin.symbol}</span>
                      </td>
                      <td>{coin.name}</td>
                      <td className="right-align">${coin.price}</td>
                      <td className="right-align">{coin.balance}</td>
                      <td className="right-align">${coin.value}</td>
                      <td className="action-cell">
                        <button className="action-button">—</button>
                      </td>
                    </tr>
                  ))}
                  {filteredCoins.length === 0 && (
                    <tr>
                      <td colSpan="6" className="empty-message">No coins found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="pagination">
            <button className={page === 1 ? "page-button active" : "page-button"} onClick={() => setPage(1)}>1</button>
            <button className={page === 2 ? "page-button active" : "page-button"} onClick={() => setPage(2)}>2</button>
            <button className={page === 3 ? "page-button active" : "page-button"} onClick={() => setPage(3)}>3</button>
            <button className={page === 4 ? "page-button active" : "page-button"} onClick={() => setPage(4)}>4</button>
            <button className={page === 5 ? "page-button active" : "page-button"} onClick={() => setPage(5)}>5</button>
          </div>
        </>
      )}
    </>
  );
};

export default TradingTab;
