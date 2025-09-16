import React, { useState, useEffect } from "react";
import "./Assets.css";
import axios from "axios";
import { useCurrency } from "../context/CurrencyContext";
import OverviewTab from "../components/assets/OverviewTab";
import FundingTab from "../components/assets/FundingTab";
import TradingTab from "../components/assets/TradingTab";

export default function Assets() {
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState("trading");
  const [searchTerm, setSearchTerm] = useState("");
  const [showZeroBalance, setShowZeroBalance] = useState(true);
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overviewData, setOverviewData] = useState({
    overview: 0,
    spot_wallet: 0,
    future_wallet: 0,
    funding_wallet: 0,
  });
  const { selectedCurrency } = useCurrency();

  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get UID from localStorage
        const uid =
          localStorage.getItem("uid") || localStorage.getItem("user_id");

        if (!uid) {
          setError("User ID not found. Please log in again.");
          setLoading(false);
          return;
        }

        // API key
        const apiKey = "5lPMMw7mIuyzQQDjlKJbe0dY";

        // Construct the API URL
        const apiUrl = `https://api.COINCHIcoin.tech/api/v1/user-wallets/${uid}?apikey=${apiKey}`;

        const response = await axios.get(apiUrl);

        if (response.data && response.data["0"]) {
          // Format the coin data with proper value calculations
          const formattedCoins = response.data["0"].map((coin) => {
            const price = parseFloat(coin.price) || 0;
            const spotWallet = parseFloat(coin.spot_wallet) || 0;
            const futureWallet = parseFloat(coin.future_wallet) || 0;
            const fundingWallet = parseFloat(coin.funding_wallet) || 0;
            const totalValue = price * spotWallet;

            return {
              id: coin.coin_id,
              symbol: coin.crypto_symbol,
              name: coin.crypto_name,
              logo: coin.logo_path,
              price: price,
              balance: spotWallet,
              value: totalValue,
              raw_balance: spotWallet,
              raw_value: totalValue,
              future_wallet: futureWallet,
              funding_wallet: fundingWallet,
              formatted_price: price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              }),
              formatted_balance: spotWallet.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 8,
              }),
              formatted_value: totalValue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            };
          });

          setCoins(formattedCoins);

          // Set overview data
          if (response.data.overview !== undefined) {
            setOverviewData({
              overview: parseFloat(response.data.overview) || 0,
              spot_wallet: parseFloat(response.data.spot_wallet) || 0,
              future_wallet: parseFloat(response.data.future_wallet) || 0,
              funding_wallet: parseFloat(response.data.funding_wallet) || 0,
            });
          }
        } else {
          setCoins([]);
          console.warn("No wallet data found in response");
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data. Please try refreshing the page.");
        setCoins([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
  }, [selectedCurrency]);

  // Content for different tabs
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "funding":
        return <FundingTab />;
      case "trading":
        return (
          <TradingTab
            coins={coins}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showZeroBalance={showZeroBalance}
            setShowZeroBalance={setShowZeroBalance}
            page={page}
            setPage={setPage}
            loading={loading}
            error={error}
            overviewData={overviewData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="assets-container">
      <div className="assets-header">
        <div className="header-tabs">
          <div
            className={
              activeTab === "overview" ? "header-tab active" : "header-tab"
            }
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </div>

          <div
            className={
              activeTab === "trading" ? "header-tab active" : "header-tab"
            }
            onClick={() => setActiveTab("trading")}
          >
            Trading
          </div>
        </div>
      </div>

      <div className="assets-content">{renderTabContent()}</div>
    </div>
  );
}
