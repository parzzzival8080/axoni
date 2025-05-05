import React, { useState } from 'react';
import './CryptoPriceSection.css';

const CryptoPriceSection = ({ cryptoData, isLoading }) => {
      // Current page state
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 12; // Based on the pagination shown in the image

  // Navigation functions
  const goToPage = (page) => setCurrentPage(page);
  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Loading indicator component
  const LoadingIndicator = () => (
    <div className="loading-indicator">
      <div className="loading-spinner"></div>
      <p>Loading cryptocurrency data...</p>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="empty-state">
      <p>No cryptocurrencies match the selected filters.</p>
    </div>
  );

  return (
    <div className="crypto-price-section">
      <h2 className="section-title">Today's cryptocurrency prices</h2>
      <p className="section-description">
        View the latest prices for the hundreds of digital assets listed on OKX, alongside their daily price change and market cap statistics.
      </p>

      <div className="crypto-table-container">
        {isLoading ? (
          <LoadingIndicator />
        ) : cryptoData.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="crypto-table">
            <thead>
              <tr>
                <th className="name-column">Name</th>
                <th className="price-column">Price</th>
                <th className="change-column">Change <span className="change-icon">↑</span></th>
                <th className="market-cap-column">Market cap <span className="sort-icon">▼</span></th>
                <th className="action-column">Action</th>
              </tr>
            </thead>
            <tbody>
              {cryptoData.map((crypto, index) => (
                <tr key={crypto.id} className="crypto-row">
                  <td className="name-cell">
                    <div className="rank-number">{index + 1}</div>
                    <div className="crypto-name">
                      <div className={`crypto-icon ${crypto.id}`}>{crypto.name.charAt(0)}</div>
                      <div className="crypto-labels">
                        <span className="crypto-symbol">{crypto.name}</span>
                        <span className="crypto-fullname">{crypto.fullName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="price-cell">${crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}</td>
                  <td className={`change-cell ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                    {crypto.change >= 0 ? '+' : ''}{crypto.change.toFixed(2)}%
                  </td>
                  <td className="market-cap-cell">${crypto.marketCap.toFixed(3)}B</td>
                  <td className="action-cell">
                    <div className="action-buttons-container">
                      <button className="action-button">Trade</button>
                      <button className="action-button">Convert</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!isLoading && cryptoData.length > 0 && (
        <div className="pagination">
          <button className="page-nav prev" onClick={goToPrevPage}>‹</button>
          <button className={`page-button ${currentPage === 1 ? 'active' : ''}`} onClick={() => goToPage(1)}>1</button>
          <button className={`page-button ${currentPage === 2 ? 'active' : ''}`} onClick={() => goToPage(2)}>2</button>
          <button className={`page-button ${currentPage === 3 ? 'active' : ''}`} onClick={() => goToPage(3)}>3</button>
          <button className={`page-button ${currentPage === 4 ? 'active' : ''}`} onClick={() => goToPage(4)}>4</button>
          <span className="page-ellipsis">...</span>
          <button className={`page-button ${currentPage === 12 ? 'active' : ''}`} onClick={() => goToPage(12)}>12</button>
          <button className="page-nav next" onClick={goToNextPage}>›</button>
        </div>
      )}
    </div>
  );
};

export default CryptoPriceSection;