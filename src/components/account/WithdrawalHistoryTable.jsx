import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import axios from "axios";

// A simple spinner component
const Spinner = () => (
  <div className="border-4 border-gray-200 border-t-[#2EBD85] rounded-full w-8 h-8 animate-spin"></div>
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
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setError("User ID not found. Please log in again.");
        setHistory([]);
        return;
      }
      const apiKey = "5lPMMw7mIuyzQQDjlKJbe0dY";
      const url = `https://api.axoni.co/api/v1/transaction-history/${uid}?apikey=${apiKey}&transaction_type=withdraw`;
      const response = await axios.get(url);
      const data = Array.isArray(response.data) ? response.data : [];
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch withdrawal history:", err);
      setError("Failed to load withdrawal history.");
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
    },
  }));

  const handleRefresh = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <section className="w-full">
      <div className="flex justify-between items-center border-b border-gray-200 mb-6 pb-2 dark:border-[#2A2A2A]">
        <h2 className="text-lg font-semibold text-white dark:text-gray-100">
          Withdrawal History
        </h2>
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
            className="text-sm px-4 py-2 bg-[#2EBD85] text-white rounded hover:bg-[#259A6C] transition"
          >
            Try Again
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#2A2A2A] bg-[#0a0a0a] rounded shadow-md">
            <thead className="bg-[#1E1E1E]">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C] dark:text-[#848E9C] uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C] dark:text-[#848E9C] uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C] dark:text-[#848E9C] uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-[#848E9C] dark:text-[#848E9C] uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#0a0a0a] divide-y divide-[#1E1E1E]">
              {history.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-[#5E6673] dark:text-[#5E6673] py-8"
                  >
                    {hasLoaded ? "No withdrawal history found." : "Loading..."}
                  </td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr
                    key={item.id || `history-${idx}`}
                    className="hover:bg-[#1E1E1E] transition-colors"
                  >
                    <td className="px-4 py-3 text-xs text-[#848E9C] dark:text-gray-200 whitespace-nowrap">
                      {item.date ? new Date(item.date).toLocaleString() : "-"}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#848E9C] dark:text-gray-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {item.image_path && (
                          <img
                            src={item.image_path}
                            alt={item.coin_name}
                            className="w-5 h-5 rounded-full"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        )}
                        <span>{item.coin_name || "-"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#848E9C] dark:text-gray-200 whitespace-nowrap font-medium">
                      {item.final_amount || "-"}
                    </td>
                     <td className="px-4 py-3 text-xs text-[#848E9C] dark:text-gray-200 whitespace-nowrap font-medium">
                      {item.status || "-"}
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
