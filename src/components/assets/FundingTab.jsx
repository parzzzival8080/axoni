import React, { useState, useEffect } from "react";
import { useCurrency } from "../../context/CurrencyContext";
import axios from "axios";

const FundingTab = () => {
  const [fundingData, setFundingData] = useState({
    funding_wallet: 0,
    available_balance: 0,
    locked_balance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedCurrency, formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchFundingData = async () => {
      try {
        setLoading(true);
        const uid = localStorage.getItem("uid") || "QEaIjLlY";
        const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
        const apiUrl = `https://api.fluxcoin.tech/api/v1/user-wallets/${uid}?apikey=${apiKey}`;

        const response = await axios.get(apiUrl);

        if (response.data) {
          setFundingData({
            funding_wallet: response.data.funding_wallet || 0,
            available_balance: response.data.funding_wallet || 0,
            locked_balance: 0,
          });
        }
      } catch (err) {
        console.error("Error fetching funding data:", err);
        setError("Failed to load funding data.");
        setFundingData({
          funding_wallet: 0,
          available_balance: 0,
          locked_balance: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchFundingData();
  }, [selectedCurrency]);

  const formatNumber = (num) => {
    return formatCurrency(num, "USD", true);
  };

  return (
    <div className="bg-gray-50 text-gray-900 p-6 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-500 text-sm mb-6">
        <span className="text-gray-900 font-medium">Funding</span>
        <span className="mx-2">/</span>
        <span>{selectedCurrency}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Funding Wallet Overview */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Funding Wallet
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-8">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Total Balance:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatNumber(fundingData.funding_wallet)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Available:</span>
                <span className="text-gray-900 font-medium">
                  {formatNumber(fundingData.available_balance)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Locked:</span>
                <span className="text-gray-900 font-medium">
                  {formatNumber(fundingData.locked_balance)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-colors">
              Deposit
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300">
              Withdraw
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300">
              Transfer
            </button>
            <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors border border-gray-300">
              Convert
            </button>
          </div>
        </div>

        {/* Recent Funding Activity */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activity
          </h3>
          <div className="text-center py-8 text-gray-500">
            <i className="fas fa-history text-4xl mb-4"></i>
            <p>No recent funding activity</p>
            <p className="text-sm">
              Your funding transactions will appear here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FundingTab;
