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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const itemsPerPage = 10;
  
  // Check if user is authenticated
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('user_id');
    setIsAuthenticated(!!token && !!userId);
  }, []);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
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
      const uid = localStorage.getItem('uid') || 'gSq3oxfi';
      const apiKey = localStorage.getItem('apiKey') || '5lPMMw7mIuyzQQDjlKJbe0dY';
      
      // API endpoint for order history
      const apiUrl = `https://api.COINCHIcoin.tech/api/v1/order-history/${uid}?apikey=${apiKey}`;
      
      const response = await axios.get(apiUrl);
      
      if (response.data) {
        // Set the order history data
        setOrderHistoryData(response.data);
      }
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchOrderHistory();
  }, [isAuthenticated]);
  
  // Refetch data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger > 0) {
      console.log('OrderHistory: Refresh triggered', refreshTrigger);
      fetchOrderHistory();
    }
  }, [refreshTrigger]);
  
  // Format the API response data for display
  const formatOrderData = (order) => {
    return {
      id: order.order_id,
      date: order.date,
      pair: `${order.coin_name || order.symbol || order.asset}/USDT`,
      type: (order.order_type || order.orde_type || '').toLowerCase() === 'buy' ? 'Buy' : 'Sell',
      side: (order.order_type || order.orde_type || '').toLowerCase(),
      price: parseFloat(order.price || order.amount || 0),
      amount: parseFloat(order.amount || 0),
      total_in_usdt: parseFloat(order.total_in_usdt || 0),
      excecution_type: order.excecution_type || order.excecution_type || '',
      filled: '100%',
      total: parseFloat(order.account_balance || order.total || 0),
      status: order.status,
      logo_path: order.logo_path || order.image_path || '',
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
      // If current page is among the last 3, show last 4 pages with "..." at beginning
      else if (currentPage >= totalPages - 2) {
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } 
      // Otherwise show current page with neighbors and "..." on both sides
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

  if (loading && orderHistoryData.length === 0) {
    return (
      <div className="order-history-container">
        <div className="loading-message">Loading order history...</div>
      </div>
    );
  }

  if (error && orderHistoryData.length === 0) {
    return (
      <div className="order-history-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="order-history-container">
      <div className="order-history-filters">
        <div 
          className={`filter-option ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('all');
            setCurrentPage(1);
          }}
        >
          All
        </div>
        <div 
          className={`filter-option ${activeFilter === 'buy' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('buy');
            setCurrentPage(1);
          }}
        >
          Buy
        </div>
        <div 
          className={`filter-option ${activeFilter === 'sell' ? 'active' : ''}`}
          onClick={() => {
            setActiveFilter('sell');
            setCurrentPage(1);
          }}
        >
          Sell
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
        {!isAuthenticated ? (
          <div className="login-message" style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
            Please login to view your order history
          </div>
        ) : (
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
                    <td>
                      <span className="mobile-date">
                        {isMobile 
                          ? new Date(order.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : new Date(order.date).toLocaleString()
                        }
                      </span>
                    </td>
                    <td>{order.pair}</td>
                    <td className={order.side === 'buy' ? 'buy-color' : 'sell-color'}>{order.type}</td>
                    <td>{order.excecution_type} ({order.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</td>
                    <td>{order.amount.toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</td>
                    <td>{order.filled}</td>
                    <td>{(order.total_in_usdt).toFixed(2)}</td>
                    <td>
                      <span className={
                        order.status.toLowerCase() === 'pending' ? 'pending-status' : 
                        order.status.toLowerCase() === 'canceled' ? 'canceled-status' : 
                        'filled-status'
                      }>
                        {order.status}
                      </span>
                    </td>
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
        )}
      </div>
      
      {isAuthenticated && filteredData.length > 0 && (
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

// Export both the component and the refresh function
OrderHistory.refreshOrderHistory = () => {};

export default OrderHistory; 