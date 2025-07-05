import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { closePosition, addMargin } from '../../services/futureTradingApi';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronDown,
  faSyncAlt,
  faChevronLeft,
  faChevronRight,
  faEllipsisH,
  faTimes,
  faExclamationTriangle,
  faCheckCircle,
  faInfoCircle,
  faPlus
} from '@fortawesome/free-solid-svg-icons';

const OrderHistory = ({ refreshTrigger = 0, walletData }) => {
  const [orderHistoryData, setOrderHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showAddMarginModal, setShowAddMarginModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [closingPosition, setClosingPosition] = useState(false);
  const [closeSuccess, setCloseSuccess] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [marginAmount, setMarginAmount] = useState('');
  const [addingMargin, setAddingMargin] = useState(false);
  const [addMarginSuccess, setAddMarginSuccess] = useState(false);
  const [maxAvailableMargin, setMaxAvailableMargin] = useState(0);
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
      
      const apiUrl = `https://api.kinecoin.co/api/v1/user-futures/${uid}?apikey=${apiKey}`;
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
  
  // Handle position close
  const handleClosePosition = (position) => {
    setSelectedPosition(position);
    setShowPopup(true);
  };
  
  // Handle add margin
  const handleAddMargin = (position) => {
    setSelectedPosition(position);
    
    // Use the same available balance property as used in TradeForm component
    // This comes from the normalized wallet data in fetchWalletData function
    const availableBalance = walletData?.available 
      ? Number(walletData.available) 
      : 0;
    
    console.log('Wallet data for margin:', walletData);
    console.log('Available balance for margin:', availableBalance);
    
    setMaxAvailableMargin(availableBalance);
    setMarginAmount('');
    setAddMarginSuccess(false);
    setShowAddMarginModal(true);
  };
  
  // Close the popup
  const closePopup = () => {
    setShowPopup(false);
    setSelectedPosition(null);
    setCloseSuccess(false);
  };
  
  // Close the add margin modal
  const closeAddMarginModal = () => {
    setShowAddMarginModal(false);
    setSelectedPosition(null);
    setAddMarginSuccess(false);
    setMarginAmount('');
  };
  
  // Confirm position close
  const confirmClosePosition = async () => {
    if (!selectedPosition) return;
    
    try {
      setClosingPosition(true);
      
      // Call the close position API using the new service function
      const result = await closePosition(selectedPosition.future_id);
      
      console.log('Close position result:', result);
      
      // Store API response for notification
      setApiResponse(result);
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      if (result.success) {
        setCloseSuccess(true);
        // Refresh order history after successful close
        setTimeout(() => {
          fetchOrderHistory();
          closePopup();
        }, 2000);
      } else {
        // Handle error response with dynamic message from API
        setError(result.message || 'Failed to close position');
        
        // Show error notification
        setApiResponse({
          success: false,
          message: result.message || 'Failed to close position'
        });
      }
    } catch (err) {
      console.error('Error closing position:', err);
      setClosingPosition(false);
      setApiResponse({
        success: false,
        message: 'An error occurred while closing the position'
      });
      setShowNotification(true);
    }
  };
  
  // Handle max button click for add margin
  const handleMaxAmount = () => {
    setMarginAmount(maxAvailableMargin.toString());
  };
  
  // Confirm add margin
  const confirmAddMargin = async () => {
    if (!selectedPosition || !marginAmount) return;
    
    try {
      setAddingMargin(true);
      
      // Call the add margin API
      const result = await addMargin(selectedPosition.future_id, marginAmount);
      
      console.log('Add margin result:', result);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
      
      if (result.success) {
        // Store API success response for notification
        setApiResponse({
          success: true,
          message: result.message || 'Margin added successfully'
        });
        setShowNotification(true);
        
        setAddMarginSuccess(true);
        // Refresh order history after successful margin addition
        setTimeout(() => {
          fetchOrderHistory();
          closeAddMarginModal();
        }, 2000);
      } else {
        // Handle error response with dynamic message from API
        setAddingMargin(false);
        
        // Show error notification
        setApiResponse({
          success: false,
          message: result.message || 'Failed to add margin'
        });
        setShowNotification(true);
      }
    } catch (err) {
      console.error('Error adding margin:', err);
      setError('You cannot close position currently. Please contact customer service.');
      
      // Show info notification instead of error
      setApiResponse({
        success: false,
        message: 'You cannot close position currently. Please contact customer service.'
      });
      setShowNotification(true);
      
      // Auto-hide notification after 5 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 5000);
    } finally {
      setClosingPosition(false);
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
                <th>ID</th>
                <th>Date</th>
                <th>Coin</th>
                <th>Leverage</th>
                <th>Entry Price</th>
                <th>Margin</th>
                <th>Liquidation Price</th>
                <th>Cycle</th>
                <th>Asset</th>
                <th>Return %</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map(order => (
                  <tr key={order._id} className="order-row-fadein">
                    <td>{order.future_id || '-'}</td>
                    <td>{order.date ? new Date(order.date).toLocaleString() : '-'}</td>
                    <td>{order.coin}</td>
                    <td>{order.leverage}x</td>
                    <td>{Number(order.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{Number(order.margin).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</td>
                    <td>{Number(order.liquidation_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{order.cycle}d</td>
                    <td>{Number(order.asset).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td>{Number(order.return_percentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</td>
                    <td className={`status-${order.status || 'pending'}`}>{order.status || 'pending'}</td>
                    <td>
                      <div className="flex space-x-2">
                        {order.status !== 'close_position' && (
                          <button 
                            className="bg-[#00b897] text-black font-medium py-1 px-3 rounded-full hover:bg-opacity-90 transition-colors flex items-center"
                            onClick={() => handleAddMargin(order)}
                          >
                            <FontAwesomeIcon icon={faPlus} className="mr-1" size="xs" />
                            Add
                          </button>
                        )}
                        {order.status !== 'close_position' ? (
                          <button 
                            className="bg-white text-black font-medium py-1 px-3 rounded-full hover:bg-gray-100 transition-colors"
                            onClick={() => handleClosePosition(order)}
                          >
                            Close
                          </button>
                        ) : (
                          <span className="text-gray-500 text-sm">Closed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                !loading && (
                  <tr>
                    <td colSpan="12" className="no-data">
                      <div className="flex flex-col items-center justify-center py-8">
                        <img
                          src="/assets/img/no-records-found.webp"
                          alt="No records found"
                          className="w-16 h-16 mb-4"
                        />
                        <p className="text-base font-medium text-gray-400 mb-1">No records found</p>
                        <p className="text-sm text-gray-500">Get started with your first transaction</p>
                      </div>
                    </td>
                  </tr>
                )
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
    
      {/* Confirmation Popup */}
      {showPopup && selectedPosition && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-[#181A20] rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">
                {closeSuccess ? 'Position Closed' : 'Close Position'}
              </h3>
              <button 
                onClick={closePopup}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="p-5">
              {closeSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-900 bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-500" />
                  </div>
                  <p className="text-white text-lg mb-2">Position closed successfully</p>
                  <p className="text-gray-400 text-sm">Your position has been closed and funds have been returned to your wallet.</p>
                </div>
              ) : (
                <>
                  <div className="mb-5 text-center">
                    <div className="w-16 h-16 rounded-full bg-yellow-900 bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                      <FontAwesomeIcon icon={faExclamationTriangle} className="text-3xl text-yellow-500" />
                    </div>
                    <p className="text-white text-lg mb-2">Confirm Position Close</p>
                    <p className="text-gray-400 text-sm">Are you sure you want to close this position? This action cannot be undone.</p>
                  </div>
                  
                  <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-5">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-400">Position ID:</div>
                      <div className="text-white font-medium">{selectedPosition.future_id}</div>
                      
                      <div className="text-gray-400">Coin:</div>
                      <div className="text-white font-medium">{selectedPosition.coin}</div>
                      
                      <div className="text-gray-400">Entry Price:</div>
                      <div className="text-white font-medium">
                        ${Number(selectedPosition.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      
                      <div className="text-gray-400">Asset Value:</div>
                      <div className="text-white font-medium">
                        ${Number(selectedPosition.asset).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      
                      <div className="text-gray-400">Return:</div>
                      <div className="text-white font-medium">
                        {Number(selectedPosition.return_percentage).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-3">
                    <button 
                      onClick={closePopup}
                      className="px-4 py-2 bg-transparent border border-gray-600 text-gray-300 rounded-md hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={confirmClosePosition}
                      disabled={closingPosition}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {closingPosition ? 'Processing...' : 'Close Position'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    
      {/* Add Margin Modal */}
      {showAddMarginModal && selectedPosition && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-70">
          <div className="bg-[#181A20] rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden border border-gray-700">
            <div className="flex justify-between items-center p-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">
                {addMarginSuccess ? 'Margin Added' : 'Add Margin'}
              </h3>
              <button 
                onClick={closeAddMarginModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            
            <div className="p-5">
              {addMarginSuccess ? (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-green-900 bg-opacity-20 mx-auto flex items-center justify-center mb-4">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-3xl text-green-500" />
                  </div>
                  <p className="text-white text-lg mb-2">Margin added successfully</p>
                  <p className="text-gray-400 text-sm">Additional margin has been added to your position.</p>
                </div>
              ) : (
                <>
                  <div className="mb-5">
                    <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mb-5">
                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div className="text-gray-400">Position ID:</div>
                        <div className="text-white font-medium">{selectedPosition.future_id}</div>
                        
                        <div className="text-gray-400">Coin:</div>
                        <div className="text-white font-medium">{selectedPosition.coin}</div>
                        
                        <div className="text-gray-400">Current Margin:</div>
                        <div className="text-white font-medium">
                          {Number(selectedPosition.margin).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })} USDT
                        </div>
                        
                        <div className="text-gray-400">Entry Price:</div>
                        <div className="text-white font-medium">
                          ${Number(selectedPosition.entry_price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-gray-400 text-sm mb-2">Amount (USDT)</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={marginAmount}
                            onChange={(e) => setMarginAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full bg-[#12141C] border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={handleMaxAmount}
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-yellow-500 text-xs font-bold px-2 py-1 hover:text-yellow-400"
                          >
                            MAX
                          </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Max Available: {maxAvailableMargin.toFixed(2)} USDT
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-400">
                        <div className="mb-1">Currently Assigned Margin: {Number(selectedPosition.margin).toFixed(2)} USDT</div>
                        <div>Max addable: {maxAvailableMargin.toFixed(2)} USDT</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      onClick={confirmAddMargin}
                      disabled={addingMargin || !marginAmount || parseFloat(marginAmount) <= 0 || parseFloat(marginAmount) > maxAvailableMargin}
                      className="px-16 py-2 bg-[#00b897] text-white rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full"
                    >
                      {addingMargin ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* API Response Notification */}
      {showNotification && apiResponse && (
        <div className="fixed top-16 right-4 z-[9999] max-w-md w-full md:w-96 transition-all duration-300 transform">
          <div className={`p-5 rounded-lg shadow-xl border-l-4 ${apiResponse.success ? 'bg-[#181A20] border-green-500' : 'bg-[#181A20] border-red-500'} ${showNotification ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${apiResponse.success ? 'bg-green-500 bg-opacity-20' : 'bg-red-500 bg-opacity-20'} mr-3`}>
                <FontAwesomeIcon 
                  icon={apiResponse.success ? faCheckCircle : faExclamationTriangle} 
                  className={`${apiResponse.success ? 'text-green-500' : 'text-red-500'} text-xl`} 
                />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-white mb-1">
                  {apiResponse.success ? 'Position Updated Successfully' : 'Position Update Failed'}
                </h3>
                <p className="text-sm text-gray-300">
                  {apiResponse.message || (apiResponse.success ? 'Your position has been updated.' : 'Unable to update position. Please try again later.')}
                </p>
              </div>
              <button 
                onClick={() => setShowNotification(false)}
                className="ml-3 flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <FontAwesomeIcon icon={faTimes} className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Add CSS for status indicators
const statusStyles = `
  .status-pending {
    color: #f3c178;
  }
  .status-active {
    color: #00b897;
  }
  .status-closed {
    color: #8e8e8e;
  }
  .status-liquidated {
    color: #f23645;
  }
`;

// Add the status styles to the document
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = statusStyles;
  document.head.appendChild(styleElement);
}

export default OrderHistory;
