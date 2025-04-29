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
  const [activeFilter, setActiveFilter] = useState('all');
  const [orderHistoryData, setOrderHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const uid = localStorage.getItem('uid') || 'yE8vKBNw';
      const apiKey = localStorage.getItem('apiKey') || 'A20RqFwVktRxxRqrKBtmi6ud';
      const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-futures/${uid}?apikey=${apiKey}`;
      const response = await axios.get(apiUrl);
      if (response.data) {
        setOrderHistoryData(response.data);
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
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('FutureTrading OrderHistory: Refresh triggered', refreshTrigger);
      fetchOrderHistory();
    }
  }, [refreshTrigger]);

  // Spot-style formatting and filtering
  const formatOrderData = (order) => {
    return {
      id: order.id || `future-${Date.now()}-${Math.random()}`,
      date: order.date || '',
      pair: order.symbol || 'BTC/USDT',
      type: order.side ? (order.side.toLowerCase() === 'buy' ? 'Buy' : 'Sell') : '',
      side: order.side ? order.side.toLowerCase() : '',
      priceType: order.execution_type || 'limit',
      price: order.entry_price || order.price || '',
      amount: order.amount || order.margin || '',
      filled: order.filled || '100%',
      total: order.asset || order.total || '',
      status: order.status || order.return_percentage || '',
    };
  };

  // Process and sort data with newest orders first
  const processedData = orderHistoryData
    .map(formatOrderData)
    .sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date, newest first
  
  const filteredData = activeFilter === 'all' 
    ? processedData 
    : processedData.filter(order => order.side === activeFilter);

  // Calculate pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  
  // Manual refresh function that can be called from outside
  const refreshOrderHistory = () => {
    fetchOrderHistory();
  };
  
  // Handle page changes
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page numbers for display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5; // Show at most 5 page numbers
    
    if (totalPages <= maxPagesToShow) {
      // If there are few pages, show all of them
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show the first page
      pageNumbers.push(1);
      
      // If current page is among the first 3, show first 4 pages and then "..."
      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } 
      // If current page is among the last 3, show last 4 pages with "..." at the beginning
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...');
        for (let i = totalPages - 3; i < totalPages; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push(totalPages);
      } 
      // If current page is in the middle, show current page with one on each side and "..." at both ends
      else {
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="order-history-container">
      <div className="order-history-filters">
        <div 
          className="filter-option active"
        >
          All
        </div>
        <div className="filter-date">
          <span>Last 7 days</span>
          <FontAwesomeIcon icon={faChevronDown} />
        </div>
        <div className="refresh-button" onClick={refreshOrderHistory}>
          <FontAwesomeIcon icon={faSyncAlt} />
        </div>
      </div>

      <div className="order-history-table">
        {loading && <div className="overlay-loader">Refreshing...</div>}
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Pair</th>
              <th>Type</th>
              <th>Price/Execution</th>
              <th>Amount</th>
              <th>Filled</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map(order => (
                <tr key={order.id}>
                  <td>{order.date ? new Date(order.date).toLocaleString() : '-'}</td>
                  <td>{order.pair}</td>
                  <td className={order.side === 'buy' ? 'buy-color' : 'sell-color'}>{order.type}</td>
                  <td>{order.priceType} ({order.price})</td>
                  <td>{Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</td>
                  <td>{order.filled}</td>
                  <td>{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className={order.status.toLowerCase() === 'pending' ? 'pending-status' : 'filled-status'}>{order.status}</td>
                  <td className="actions">
                    <FontAwesomeIcon icon={faEllipsisH} />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="no-data">No order history data available</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {filteredData.length > 0 && (
        <div className="order-history-pagination">
          <button 
            className="order-history-prev-page" 
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <div className="order-history-page-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span key={`ellipsis-${index}`} className="ellipsis">...</span>
              ) : (
                <span 
                  key={page} 
                  className={currentPage === page ? 'active' : ''}
                  onClick={() => typeof page === 'number' && goToPage(page)}
                >
                  {page}
                </span>
              )
            ))}
          </div>
          <button 
            className="order-history-next-page"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        </div>
      )}

      <div className="order-history-page-info">
        Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} orders
      </div>
    </div>
  );
};

export default OrderHistory;
