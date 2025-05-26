import React, { useState, useEffect } from "react";
import { FaEye, FaArrowRight } from "react-icons/fa";
import chartPlaceholder from "../../assets/assets/411B1865A7B26122.webp";
import earnIcon from "../../assets/assets/earn-icon.svg";
import axios from "axios";

const OverviewTab = () => {
  const [timeframe, setTimeframe] = useState("1D");
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const uid = localStorage.getItem('uid') || 'QEaIjLlY';
        const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
        const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallets/${uid}?apikey=${apiKey}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data) {
          setOverviewData({
            overview: response.data.overview || 0,
            spot_wallet: response.data.spot_wallet || 0,
            future_wallet: response.data.future_wallet || 0,
            funding_wallet: response.data.funding_wallet || 0
          });
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data.");
        setOverviewData({
          overview: 972990894,
          spot_wallet: 972950894,
          future_wallet: 40000,
          funding_wallet: 0
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);
  
  const formatNumber = (num) => {
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  return (
    <div className="bg-gray-50 text-gray-900 p-6 min-h-screen">
      {/* Breadcrumb */}
      <div className="flex items-center text-gray-500 text-sm mb-6">
        <span className="text-gray-900 font-medium">Overview</span>
        <span className="mx-2">/</span>
        <span>USDT</span>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estimated Value Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-600">Estimated total value</span>
              <FaEye className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" />
            </div>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                <p className="text-gray-500 mt-2">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${formatNumber(overviewData.overview)}
                </div>
                <div className="text-gray-500 mb-6">Total assets in your account</div>
              </>
            )}
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button className="bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors">
                Deposit
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors border border-gray-300">
                Convert
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors border border-gray-300">
                Withdraw
              </button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors border border-gray-300">
                Transfer
              </button>
            </div>
          </div>
          
          {/* Chart Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex space-x-2 mb-6">
              {["1D", "1W", "1M", "6M"].map((period) => (
                <button
                  key={period}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    timeframe === period
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 border border-gray-300"
                  }`}
                  onClick={() => setTimeframe(period)}
                >
                  {period}
                </button>
              ))}
            </div>
            
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <img src={chartPlaceholder} alt="Chart placeholder" className="w-16 h-16 mb-4 opacity-50" />
              <div className="text-gray-600 mb-2">Unable to load data</div>
              <div className="text-gray-400 text-sm">We'll need more data to generate the chart for you</div>
            </div>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="space-y-6">
          {/* Allocation Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Allocation</h3>
            
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full border-8 border-orange-500 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">100%</div>
                    <div className="text-sm text-gray-500">Trading</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Spot Wallet:</span>
                </div>
                <span className="text-gray-900 font-medium">${formatNumber(overviewData.spot_wallet)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Future Wallet:</span>
                </div>
                <span className="text-gray-900 font-medium">${formatNumber(overviewData.future_wallet)}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-gray-600">Funding Wallet:</span>
                </div>
                <span className="text-gray-900 font-medium">${formatNumber(overviewData.funding_wallet)}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Total:</span>
                <span className="text-gray-900 font-bold">${formatNumber(overviewData.overview)}</span>
              </div>
            </div>
          </div>
          
          {/* Earn Section */}
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="text-gray-900 font-semibold mb-1">Earn POL for up to 3.92% APR!</div>
              </div>
              <div className="ml-4">
                <img src={earnIcon} alt="Earn" className="w-8 h-8" />
              </div>
            </div>
            <button className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors">
              View details <FaArrowRight className="ml-2 text-sm" />
            </button>
          </div>
          
          {/* Transactions Section */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent transactions</h3>
              <button className="flex items-center text-orange-600 hover:text-orange-700 font-medium transition-colors">
                View more <FaArrowRight className="ml-2 text-sm" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <div className="text-gray-900 font-medium">To: Trading POL</div>
                  <div className="text-gray-500 text-sm">04/28/2025, 18:53:34</div>
                </div>
                <div className="text-red-500 font-medium">-1 POL</div>
              </div>
              
              <div className="flex items-center justify-between py-3">
                <div>
                  <div className="text-gray-900 font-medium">Deposit POL</div>
                  <div className="text-gray-500 text-sm">04/28/2025, 18:53:34</div>
                </div>
                <div className="text-green-500 font-medium">+1 POL</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;