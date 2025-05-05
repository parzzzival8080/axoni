import React, { useState, useEffect } from "react";
import "./Assets.css";
import axios from "axios";
import OverviewTab from "../components/assets/OverviewTab";
import FundingTab from "../components/assets/FundingTab";
import TradingTab from "../components/assets/TradingTab";

// Mock data as fallback
const mockCoins = [
  { symbol: "BTC", name: "Bitcoin", price: "64,000.00", balance: "0.00", value: "0.00" },
  { symbol: "ETH", name: "Ethereum", price: "3,200.00", balance: "0.00", value: "0.00" },
  { symbol: "XRP", name: "XRP", price: "0.60", balance: "0.00", value: "0.00" },
  { symbol: "DOGE", name: "Dogecoin", price: "0.12", balance: "0.00", value: "0.00" },
  { symbol: "DOT", name: "Polkadot", price: "6.50", balance: "0.00", value: "0.00" },
  { symbol: "SOL", name: "Solana", price: "120.00", balance: "0.00", value: "0.00" },
  { symbol: "ADA", name: "Cardano", price: "0.50", balance: "0.00", value: "0.00" },
  { symbol: "AVAX", name: "Avalanche", price: "35.00", balance: "0.00", value: "0.00" },
  { symbol: "LINK", name: "Chainlink", price: "15.00", balance: "0.00", value: "0.00" },
  { symbol: "MATIC", name: "Polygon", price: "0.80", balance: "0.00", value: "0.00" },
  { symbol: "UNI", name: "Uniswap", price: "8.00", balance: "0.00", value: "0.00" },
  { symbol: "LTC", name: "Litecoin", price: "80.00", balance: "0.00", value: "0.00" },
  { symbol: "ATOM", name: "Cosmos", price: "10.00", balance: "0.00", value: "0.00" },
  { symbol: "AAVE", name: "Aave", price: "90.00", balance: "0.00", value: "0.00" },
  { symbol: "SHIB", name: "Shiba Inu", price: "0.00002", balance: "0.00", value: "0.00" },
  { symbol: "FIL", name: "Filecoin", price: "5.00", balance: "0.00", value: "0.00" },
  { symbol: "ALGO", name: "Algorand", price: "0.15", balance: "0.00", value: "0.00" },
  { symbol: "BCH", name: "Bitcoin Cash", price: "300.00", balance: "0.00", value: "0.00" },
  { symbol: "XLM", name: "Stellar", price: "0.12", balance: "0.00", value: "0.00" },
  { symbol: "NEAR", name: "NEAR Protocol", price: "5.50", balance: "0.00", value: "0.00" },
];

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
    funding_wallet: 0
  });
  
  // Fetch wallet data from API
  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        setLoading(true);
        // Get UID from localStorage (assuming it's stored there from login)
        const uid = localStorage.getItem('uid') || 'QEaIjLlY'; // Fallback to example UID
        
        // API key from your image
        const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
        
        // Construct the API URL
        const apiUrl = `https://apiv2.bhtokens.com/api/v1/user-wallets/${uid}?apikey=${apiKey}`;
        
        const response = await axios.get(apiUrl);
        
        if (response.data && response.data["0"]) {
          // Format the coin data
          const formattedCoins = response.data["0"].map(coin => ({
            id: coin.coin_id,
            symbol: coin.crypto_symbol,
            name: coin.crypto_name,
            logo: coin.logo_path,
            price: parseFloat(coin.price).toLocaleString(),
            balance: parseFloat(coin.spot_wallet).toLocaleString(),
            value: (parseFloat(coin.price) * parseFloat(coin.spot_wallet)).toLocaleString(),
            raw_balance: parseFloat(coin.spot_wallet),
            raw_value: parseFloat(coin.price) * parseFloat(coin.spot_wallet)
          }));
          
          setCoins(formattedCoins);
          
          // Set overview data
          if (response.data.overview) {
            setOverviewData({
              overview: response.data.overview,
              spot_wallet: response.data.spot_wallet || 0,
              future_wallet: response.data.future_wallet || 0,
              funding_wallet: response.data.funding_wallet || 0
            });
          }
        }
      } catch (err) {
        console.error("Error fetching wallet data:", err);
        setError("Failed to load wallet data. Using mock data instead.");
        setCoins(mockCoins);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, []);
  
  // Content for different tabs
  const renderTabContent = () => {
    switch(activeTab) {
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
            className={activeTab === "overview" ? "header-tab active" : "header-tab"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </div>
          <div 
            className={activeTab === "funding" ? "header-tab active" : "header-tab"}
            onClick={() => setActiveTab("funding")}
          >
            Funding
          </div>
          <div 
            className={activeTab === "trading" ? "header-tab active" : "header-tab"}
            onClick={() => setActiveTab("trading")}
          >
            Trading
          </div>
          <div className="header-tab">Grow</div>
          <div className="header-tab">Analysis</div>
          <div className="header-tab">Order center</div>
          <div className="header-tab">Fees</div>
          <div className="header-tab">Account statement</div>
          <div className="header-tab">P&L reports</div>
        </div>
      </div>
      
      <div className="assets-content">
        {renderTabContent()}
      </div>
    </div>
  );
}
