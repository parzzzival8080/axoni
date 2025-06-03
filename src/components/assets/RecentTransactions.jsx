import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const TRANSACTION_LIMIT = 6;

const RecentTransactions = () => {
  const [spotOrders, setSpotOrders] = useState([]);
  const [futureOrders, setFutureOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecentTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const uid = localStorage.getItem("uid") || "gSq3oxfi";
        const apiKey = localStorage.getItem("apiKey") || "A20RqFwVktRxxRqrKBtmi6ud";
        const spotUrl = `https://apiv2.bhtokens.com/api/v1/order-history/${uid}?apikey=${apiKey}`;
        const futureUrl = `https://apiv2.bhtokens.com/api/v1/user-futures/${uid}?apikey=${apiKey}`;
        const [spotRes, futureRes] = await Promise.all([
          axios.get(spotUrl),
          axios.get(futureUrl),
        ]);
        setSpotOrders(Array.isArray(spotRes.data) ? spotRes.data : []);
        setFutureOrders(Array.isArray(futureRes.data) ? futureRes.data : []);
      } catch (err) {
        setError("Failed to load recent transactions.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecentTransactions();
  }, []);

  // Unified, formatted, and sorted transactions
  const transactions = useMemo(() => {
    const formatSpot = (order) => ({
      id: order.order_id,
      type: (order.order_type || order.orde_type || '').toLowerCase() === 'buy' ? 'Buy' : 'Sell',
      side: (order.order_type || order.orde_type || '').toLowerCase(),
      pair: `${order.coin_name || order.symbol || order.asset}/USDT`,
      price: parseFloat(order.price || order.amount || 0),
      amount: parseFloat(order.amount || 0),
      total: parseFloat(order.account_balance || order.total || 0),
      date: order.date,
      status: order.status,
      source: 'Spot',
    });
    const formatFuture = (order) => ({
      id: order.future_id || order.order_id,
      type: order.position_type || order.type || '',
      side: order.side || '',
      pair: order.symbol || order.asset || '',
      price: parseFloat(order.entry_price || order.price || 0),
      amount: parseFloat(order.amount || order.size || 0),
      total: parseFloat(order.total || 0),
      date: order.date || order.created_at,
      status: order.status || '',
      source: 'Futures',
    });
    const all = [
      ...spotOrders.map(formatSpot),
      ...futureOrders.map(formatFuture),
    ].filter((tx) => tx.date);
    return all.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, TRANSACTION_LIMIT);
  }, [spotOrders, futureOrders]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        Recent Transactions
        <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-600">Live</span>
      </h3>
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mr-3"></div>
          <span className="text-gray-500">Loading recent transactions...</span>
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : transactions.length === 0 ? (
        <div className="text-gray-400 text-center py-4">No recent transactions found.</div>
      ) : (
        <div className="overflow-x-auto hide-scrollbar" style={{ maxHeight: '400px' }}>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Date</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Pair</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Type</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Price</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Amount</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Total</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Status</th>
                <th className="px-3 py-2 text-left text-gray-500 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-orange-50 transition-colors">
                  <td className="px-3 py-2 whitespace-nowrap text-gray-700">{tx.date ? new Date(tx.date).toLocaleString() : '-'}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-gray-900 font-medium">{tx.pair}</td>
                  <td className={`px-3 py-2 whitespace-nowrap font-semibold ${tx.side === 'buy' ? 'text-green-600' : 'text-red-500'}`}>{tx.type}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{tx.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{tx.amount?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-3 py-2 whitespace-nowrap">{tx.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tx.status?.toLowerCase() === 'pending' ? 'bg-orange-100 text-orange-600' : tx.status?.toLowerCase() === 'canceled' ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>{tx.status}</span>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.source === 'Spot' ? 'bg-orange-50 text-orange-500' : 'bg-blue-50 text-blue-500'}`}>{tx.source}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
