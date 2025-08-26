import React, { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import axios from 'axios';

// A simple spinner component
const Spinner = () => (
  <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
);

// The component logic, wrapped in forwardRef
const WithdrawalHistoryTableBase = forwardRef((props, ref) => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Fetch withdrawal history data
  const fetchHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const uid = localStorage.getItem('uid');
      if (!uid) {
        setError('User ID not found. Please log in again.');
        setHistory([]);
        return;
      }
      const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
      const url = `https://api.fluxcoin.tech/api/v1/transaction-history/${uid}?apikey=${apiKey}&transaction_type=withdraw`;
      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
      setError('Failed to load withdrawal history.');
      setHistory([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, []); // Stable function

  // Load data on initial component mount
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Expose a `refresh` method to the parent component
  useImperativeHandle(ref, () => ({
    refresh: () => {
      setTimeout(() => {
        fetchHistory();
      }, 1500); // Delay to allow API to update
    }
  }));

  const handleRefresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <section className="w-full">
      <div className="flex justify-between items-center border-b border-gray-200 mb-6 pb-2 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Withdrawal History</h2>
      </div>
      {isLoading && !hasLoaded ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={handleRefresh}
            className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded shadow-md">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Coin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 dark:text-gray-400 py-8">
                    {hasLoaded ? 'No withdrawal history found.' : 'Loading...'}
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={item.id || `history-${idx}`} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.image_path && (
                          <img 
                            src={item.image_path} 
                            alt={item.coin_name} 
                            className="w-5 h-5 rounded-full"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <span>{item.coin_name || '-'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap font-medium">
                      {item.final_amount || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
});

// Memoize the component
const WithdrawalHistoryTable = React.memo(WithdrawalHistoryTableBase);

export default WithdrawalHistoryTable;
