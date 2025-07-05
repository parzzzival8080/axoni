import React, { useState, useEffect, useCallback, useRef } from 'react';

// Custom hook for debugging re-renders
function useWhyDidYouUpdate(name, props) {
  const previousProps = useRef();

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj = {};
      allKeys.forEach(key => {
        if (previousProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: previousProps.current[key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changesObj).length) {
        console.log('[Why-Did-You-Update]', name, changesObj);
      }
    }

    previousProps.current = props;
  });
}
import axios from 'axios';

// A simple spinner component, you can replace with your actual Spinner component if it's different
const Spinner = () => (
  <div className="border-4 border-gray-200 border-t-blue-500 rounded-full w-8 h-8 animate-spin"></div>
);

// --- Withdrawal History Table Component ---
const WithdrawalHistoryTableBase = (props) => {
  useWhyDidYouUpdate('WithdrawalHistoryTable', props);
  const { refreshTrigger } = props;
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Use a ref to track the previous refresh trigger value to prevent unnecessary fetches
  const lastRefreshTriggerRef = useRef(refreshTrigger);

  // Fetch withdrawal history data
  const fetchHistory = useCallback(async () => {
    // No need to check isLoading here, as the effect dependencies will manage it.
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
      const url = `https://api.kinecoin.co/api/v1/transaction-history/${uid}?apikey=${apiKey}&transaction_type=withdraw`;

      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      
      setHistory(data);
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
      setError('Failed to load withdrawal history.');
      setHistory([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true); // Set hasLoaded in the finally block
    }
  }, []); // Empty dependency array makes this function stable

  // Load data on initial component mount
  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this only runs once

  // Only refresh when refreshTrigger prop changes
  useEffect(() => {
    // Skip if it's the initial render or the trigger hasn't changed
    if (refreshTrigger === 0 || refreshTrigger === lastRefreshTriggerRef.current) {
      return;
    }

    // Update the ref to the new trigger value
    lastRefreshTriggerRef.current = refreshTrigger;

    // Add a delay to ensure the API has time to register the new transaction
    const timer = setTimeout(() => {
      fetchHistory();
    }, 1500); // 1.5-second delay

    return () => clearTimeout(timer);
  }, [refreshTrigger, fetchHistory]);

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
};

// Custom equality function for React.memo to prevent unnecessary re-renders.
// Only re-render when the refreshTrigger prop changes.
const arePropsEqual = (prevProps, nextProps) => {
  return prevProps.refreshTrigger === nextProps.refreshTrigger;
};

// Apply React.memo with the custom equality function
const WithdrawalHistoryTable = React.memo(WithdrawalHistoryTableBase, arePropsEqual);

export default WithdrawalHistoryTable;
