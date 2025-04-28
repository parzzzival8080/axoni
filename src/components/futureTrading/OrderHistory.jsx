import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderHistory.css';

const OrderHistory = ({ refreshTrigger = 0 }) => {
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
      setError('Failed to load order history. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
    // eslint-disable-next-line
  }, [refreshTrigger]);

  // Spot-style formatting and filtering
  const formatOrderData = (order) => {
    return {
      date: order.date || '',
      pair: order.symbol || 'BTC/USDT',
      type: order.side ? (order.side.toLowerCase() === 'buy' ? 'Buy' : 'Sell') : '',
      priceType: order.execution_type || 'limit',
      price: order.entry_price || order.price || '',
      amount: order.amount || order.margin || '',
      filled: order.filled || '100%',
      total: order.asset || order.total || '',
      status: order.status || order.return_percentage || '',
    };
  };

  // No filtering needed, just reverse for latest first
  const processedData = orderHistoryData.map(formatOrderData).reverse();
  const filteredData = processedData;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };
  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };
  const goToPage = (pageNum) => setCurrentPage(pageNum);

  // Page numbers for pagination
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
        for (let i = totalPages - 3; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        pageNumbers.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pageNumbers.push(i);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  if (loading && orderHistoryData.length === 0) {
    return <div className="order-history-container"><div className="loading-message">Loading order history...</div></div>;
  }
  if (error && orderHistoryData.length === 0) {
    return <div className="order-history-container"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="order-history-container">
      <div className="order-history-filters">
        <div
          className={`filter-option active`}
          style={{ pointerEvents: 'none' }}
        >All</div>
        <div className="filter-date">
          Last 7 days <i className="fas fa-chevron-down"></i>
        </div>
        <div className="refresh-button" onClick={fetchOrderHistory}>
          <i className="fas fa-sync-alt"></i>
        </div>
      </div>
      <div className="order-history-table">
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
            {paginatedData.length === 0 ? (
              <tr><td colSpan="9" className="no-data">No order history found.</td></tr>
            ) : (
              paginatedData.map((order, idx) => (
                <tr key={idx}>
                  <td>{order.date ? new Date(order.date).toLocaleString() : '-'}</td>
                  <td>{order.pair}</td>
                  <td className={order.type === 'Buy' ? 'buy-color' : order.type === 'Sell' ? 'sell-color' : ''}>{order.type}</td>
                  <td>{order.priceType} ({order.price})</td>
                  <td>{Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 5, maximumFractionDigits: 5 })}</td>
                  <td>{order.filled}</td>
                  <td>{Number(order.total).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td className={order.status.toLowerCase() === 'pending' ? 'pending-status' : 'filled-status'}>{order.status}</td>
                  <td className="actions"><i className="fas fa-ellipsis-h"></i></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="pagination">
          <button className="prev-page" onClick={goToPreviousPage} disabled={currentPage === 1}>
            <i className="fas fa-chevron-left"></i>
          </button>
          <div className="page-numbers">
            {getPageNumbers().map((page, index) => (
              page === '...'
                ? <span key={`ellipsis-${index}`} className="ellipsis">...</span>
                : <span
                    key={page}
                    className={currentPage === page ? 'active' : ''}
                    onClick={() => typeof page === 'number' && goToPage(page)}
                  >{page}</span>
            ))}
          </div>
          <button className="next-page" onClick={goToNextPage} disabled={currentPage === totalPages}>
            <i className="fas fa-chevron-right"></i>
          </button>
        </div>
      )}
      <div className="page-info">
        Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredData.length)} of {filteredData.length} orders
      </div>
    </div>
  );
};

export default OrderHistory;
