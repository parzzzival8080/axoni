import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faSyncAlt,
  faChevronLeft,
  faChevronRight,
  faEllipsisH
} from '@fortawesome/free-solid-svg-icons';

const OrderHistory = ({ refreshTrigger = 0 }) => {
  const [orderHistoryData, setOrderHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const itemsPerPage = 10;

  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token && !!userId);
  }, []);

  // Fetch order history from API
  const fetchOrderHistory = async () => {
    try {
      // If user is not authenticated, don't fetch order history
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      // Get UID and API key values from localStorage if available
      const uid = localStorage.getItem('uid');
      const apiKey = localStorage.getItem('apiKey') || 'A20RqFwVktRxxRqrKBtmi6ud';
      
      // Only proceed if UID is available
      if (!uid) {
        setLoading(false);
        return;
      }
      
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-futures/${uid}?apikey=${apiKey}`;
      const response = await axios.get(apiUrl);

      if (response.data && Array.isArray(response.data)) {
        console.log("API Response:", response.data[0]); // Log first item for debugging
        setOrderHistoryData(response.data.map(order => ({ ...order, imgError: false })));
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, [isAuthenticated]);

  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated) {
      fetchOrderHistory();
    }
  }, [refreshTrigger, isAuthenticated]);

  // Process and sort data by date (newest first)
  const processedData = orderHistoryData
    .map((order, idx) => ({
      ...order,
      _id: idx + '-' + order.date,
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = processedData.slice(indexOfFirstItem, indexOfLastItem);

  // Debug: Show data structure in development
  {
    process.env.NODE_ENV === 'development' && (
      <pre style={{ color: '#fff', background: '#222', padding: 8, fontSize: 12, overflowX: 'auto' }}>
        {JSON.stringify(currentItems, null, 2)}
      </pre>
    )
  }

  // Pagination controls
  const goToPage = (pageNumber) => setCurrentPage(pageNumber);
  const goToPreviousPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const goToNextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      pageNumbers.push(1);
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...');
        for (let i = totalPages - 3; i < totalPages; i++) pageNumbers.push(i);
        pageNumbers.push(totalPages);
      } else {
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="order-history-container dark-mode">
     
      <div className="order-history-table-wrapper">
        {loading && <div className="overlay-loader">Loading...</div>}
        {error && <div className="order-history-error">{error}</div>}
        {!isAuthenticated ? (
          <div className="login-message" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Please login to view your order history
          </div>
        ) : (
          <table className="order-history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Coin</th>
                <th>Leverage</th>
                <th>Entry Price</th>
                <th>Margin</th>
                <th>Liquidation Price</th>
                <th>Cycle</th>
                <th>Asset</th>
                <th>Return %</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(order => (
                  <tr key={order._id} className="order-row-fadein">
                    <td>{order.date ? new Date(order.date).toLocaleString() : '-'}</td>
                    <td>{order.coin}</td>
                    <td>{order.leverage}x</td>
                    <td>{Number(order.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{Number(order.margin).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</td>
                    <td>{Number(order.liquidation_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{order.cycle}d</td>
                    <td>{Number(order.asset).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{Number(order.return_percentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                  </tr>
                ))
              ) : (
                !loading && <tr><td colSpan="9" className="no-data">No order history data available</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      {isAuthenticated && processedData.length > 0 && (
        <div className="order-history-pagination">
          <button className="order-history-prev-page" disabled={currentPage === 1} onClick={goToPreviousPage}>
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="order-history-page-numbers">
            {getPageNumbers().map((page, idx) => (
              page === '...'
                ? <span key={`ellipsis-${idx}`} className="ellipsis">...</span>
                : <span key={page} className={currentPage === page ? 'active' : ''} onClick={() => typeof page === 'number' && goToPage(page)}>{page}</span>
            ))}
          </div>
          <button className="order-history-next-page" disabled={currentPage === totalPages} onClick={goToNextPage}>
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}
      {isAuthenticated && (
        <div className="order-history-page-info">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, processedData.length)} of {processedData.length} orders
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
