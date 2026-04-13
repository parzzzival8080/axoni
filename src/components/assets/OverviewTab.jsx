import React, { useState, useEffect } from "react";
import { FaEye, FaArrowRight } from "react-icons/fa";
import chartPlaceholder from "../../assets/assets/411B1865A7B26122.webp";
import earnIcon from "../../assets/assets/earn-icon.svg";
import axios from "axios";
import RecentTransactions from "./RecentTransactions";
import { useNavigate } from "react-router-dom";
import { useCurrency } from "../../context/CurrencyContext";
import "./OverviewTab.css";

const OverviewTab = () => {
  const [timeframe, setTimeframe] = useState("1D");
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const { selectedCurrency, formatCurrency } = useCurrency();

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        const uid = localStorage.getItem("uid") || "QEaIjLlY";
        const apiKey = "5lPMMw7mIuyzQQDjlKJbe0dY";
        const apiUrl = `https://api.axoni.co/api/v1/user-wallets/${uid}?apikey=${apiKey}`;

        const response = await axios.get(apiUrl);

        if (response.data) {
          setOverviewData({
            overview: response.data.overview || 0,
            spot_wallet: response.data.spot_wallet || 0,
            future_wallet: response.data.future_wallet || 0,
            funding_wallet: response.data.funding_wallet || 0,
          });
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data.");
        setOverviewData({
          overview: 972990894,
          spot_wallet: 972950894,
          future_wallet: 40000,
          funding_wallet: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [selectedCurrency]);

  const formatNumber = (num) => {
    return formatCurrency(num, "USD", true);
  };

  return (
    <div className="bg-[#1E1E1E] text-white p-6">
      {/* Breadcrumb */}
      <div className="flex items-center text-[#5E6673] text-sm mb-6">
        <span className="text-white font-medium">Overview</span>
        <span className="mx-2">/</span>
        <span>{selectedCurrency}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Estimated Value Section */}
          <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-[#2A2A2A]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[#848E9C]">Estimated total value</span>
            </div>

            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2EBD85] mx-auto"></div>
                <p className="text-[#5E6673] mt-2">Loading...</p>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <>
                <div className="text-3xl font-bold text-white mb-2">
                  {formatNumber(overviewData.overview)}
                </div>
                <div className="text-[#5E6673] mb-6">
                  Total assets in your account
                </div>
              </>
            )}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                className="bg-[#2EBD85]/50 hover:bg-[#2EBD85] text-white py-2 px-4 rounded-lg font-medium transition-colors"
                onClick={() => navigate("/deposit")}
              >
                Deposit
              </button>

              <button
                className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#848E9C] py-2 px-4 rounded-lg font-medium transition-colors border border-[#2A2A2A]"
                onClick={() => navigate("/withdraw")}
              >
                Withdraw
              </button>
              <button
                className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#848E9C] py-2 px-4 rounded-lg font-medium transition-colors border border-[#2A2A2A]"
                onClick={() => navigate("/conversion")}
              >
                Convert
              </button>
              <button
                className="bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#848E9C] py-2 px-4 rounded-lg font-medium transition-colors border border-[#2A2A2A]"
                onClick={() => navigate("/transfer")}
              >
                Transfer
              </button>
            </div>
          </div>

          {/* Chart Section - REMOVED */}
          {/* Original Chart Section was here */}

          {/* Recent Transactions Section */}
          <RecentTransactions />
        </div>

        {/* Right Section */}
        <div className="space-y-6">
          {/* Allocation Section */}
          <div className="bg-[#121212] rounded-lg p-6 shadow-sm border border-[#2A2A2A]">
            <h3 className="text-lg font-semibold text-white mb-6">
              Allocation
            </h3>

            <div className="flex flex-col items-center mb-6">
              <div className="relative w-32 h-32 mb-4">
                <div className="w-full h-full rounded-full border-8 border-[#2EBD85] flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white">100%</div>
                    <div className="text-sm text-[#5E6673]">Trading</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#2EBD85]/50 rounded-full mr-2"></div>
                  <span className="text-[#848E9C]">Spot Wallet:</span>
                </div>
                <span className="text-white font-medium">
                  {formatNumber(overviewData.spot_wallet)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-[#2EBD85]/50 rounded-full mr-2"></div>
                  <span className="text-[#848E9C]">Future Wallet:</span>
                </div>
                <span className="text-white font-medium">
                  {formatNumber(overviewData.future_wallet)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-[#848E9C]">Funding Wallet:</span>
                </div>
                <span className="text-white font-medium">
                  {formatNumber(overviewData.funding_wallet)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-[#2A2A2A]">
                <span className="text-white font-medium">Total:</span>
                <span className="text-white font-bold">
                  {formatNumber(overviewData.overview)}
                </span>
              </div>
            </div>
          </div>

          {/* Original Recent Transactions Section - REMOVED */}
          {/* Was here: <RecentTransactions /> */}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
