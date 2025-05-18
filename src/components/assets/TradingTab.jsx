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
    
  // Calculate pagination
  const coinsPerPage = 10;
  const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
  const startIndex = (page - 1) * coinsPerPage;
  const endIndex = startIndex + coinsPerPage;
  const paginatedCoins = filteredCoins.slice(startIndex, endIndex);

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
                className="search-input-white"
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
                  </tr>
                </thead>
                <tbody>
                  {paginatedCoins.map((coin) => (
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
                    </tr>
                  ))}
                  {filteredCoins.length === 0 && (
                    <tr>
                      <td colSpan="5" className="empty-message">No coins found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          
          <div className="pagination">
            {totalPages > 0 && (
              <>
                {/* Previous page button */}
                <button 
                  className="page-button nav-button" 
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  &lt;
                </button>
                
                {/* Generate page buttons dynamically */}
                {[...Array(Math.min(totalPages, 5)).keys()].map(i => {
                  // Show pages around the current page
                  let pageNum;
                  if (totalPages <= 5) {
                    // If 5 or fewer pages, show all pages
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    // If near the start, show first 5 pages
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    // If near the end, show last 5 pages
                    pageNum = totalPages - 4 + i;
                  } else {
                    // Otherwise show 2 pages before and 2 after current page
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button 
                      key={pageNum} 
                      className={page === pageNum ? "page-button active" : "page-button"} 
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {/* Next page button */}
                <button 
                  className="page-button nav-button" 
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  &gt;
                </button>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default TradingTab;
