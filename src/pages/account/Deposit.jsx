import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
// Import QRCodeSVG component
// Make sure to install this library: npm install qrcode.react
import { QRCodeSVG } from "qrcode.react";

// --- Helper Components ---

// Simple SVG Loader/Spinner
const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg
      className="animate-spin h-6 w-6 text-gray-600"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  </div>
);

// Simple SVG Icon Components
const ChevronDownIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500 ml-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
);

const CopyIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    ></path>
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
);

const InfoCircleIcon = () => (
  <svg
    className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

const QuestionCircleIcon = () => (
  <svg
    className="w-4 h-4 text-gray-500 mr-1"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    ></path>
  </svg>
);

const SearchIcon = () => (
  <svg
    className="w-5 h-5 text-gray-400 mr-2"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    ></path>
  </svg>
);

// Fallback Image Component
const ImageWithFallback = ({ src, alt, className, symbol }) => {
  const [error, setError] = useState(false);

  const handleImageError = () => {
    setError(true);
  };

  useEffect(() => {
    // Reset error state when src changes
    setError(false);
  }, [src]);

  if (error || !src) {
    // Display symbol initial in a colored circle as fallback
    return (
      <span
        className={`${className} flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xs rounded-full`}
      >
        {symbol?.substring(0, 1)?.toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <img src={src} alt={alt} className={className} onError={handleImageError} />
  );
};

// --- Main Deposit Component ---

function App() {
  // Renamed to App for standard React export
  const navigate = useNavigate();

  // --- State Variables ---

  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState(null); // Start with null
  const [searchTerm, setSearchTerm] = useState(""); // Search term for crypto dropdown
  const [isCryptoDropdownOpen, setIsCryptoDropdownOpen] = useState(false); // State for crypto dropdown
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [depositAddress, setDepositAddress] = useState(""); // Start empty
  const [copySuccess, setCopySuccess] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState(null);
  
  // Deposit History State
  const [depositHistory, setDepositHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // --- Refs ---
  const cryptoDropdownRef = useRef(null); // Ref for crypto dropdown
  const networkDropdownRef = useRef(null); // Ref for network dropdown

  // --- Constants ---
  const API_KEY = "A20RqFwVktRxxRqrKBtmi6ud";
  const headerTabs = [
    "Overview",
    "Funding",
    "Trading",
    "Grow",
    "Analysis",
    "Order center",
    "Fees",
    "Account statement",
    "PoR reports",
  ];

  const faqQuestions = [
    {
      id: 1,
      question: "How do I make a deposit?",
      slug: "how-to-make-deposit",
    },
    {
      id: 2,
      question: "Why have I still not received my deposit?",
      slug: "deposit-not-received",
    },
    {
      id: 3,
      question: "How do I find my deposit address and tag/memos?",
      slug: "find-deposit-address-tag-memos",
    },
    {
      id: 4,
      question: "How to check the deposit progress?",
      slug: "check-deposit-progress",
    },
  ];

  // Popular coins for quick selection (based on screenshot)
  const popularCoins = ["USDT", "BTC", "ETH", "PI", "SOL"];

  // --- Get details of the currently selected coin ---
  const selectedCoinDetails = useMemo(() => {
    if (!selectedCryptoSymbol || !Array.isArray(coins)) return null;
    return coins.find((coin) => coin.symbol === selectedCryptoSymbol);
  }, [selectedCryptoSymbol, coins]);
  const selectedCoinBalance = selectedCoinDetails?.balance || "0.00";

  // Dynamically generate network options from selected coin details
  const networkOptions = useMemo(() => {
    if (!selectedCoinDetails || !selectedCoinDetails.network) return [];
    return selectedCoinDetails.network.map((net) => ({
      value: net.symbol || net.name,
      label: `${net.name} (${net.symbol})`,
      fee: net.fee,
      id: net.id,
    }));
  }, [selectedCoinDetails]);

  // Pagination logic for deposit history
  const paginatedDepositHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return depositHistory.slice(startIndex, endIndex);
  }, [depositHistory, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(depositHistory.length / itemsPerPage);

  // --- Authentication Check ---
  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const uid = localStorage.getItem('uid');
    
    if (!authToken || !uid) {
      // User is not logged in, redirect to login page
      navigate('/login');
      return;
    }
  }, [navigate]);

  // --- API Fetching Effect ---
  useEffect(() => {
    const fetchCoins = async () => {
      setIsLoading(true);
      setError(null);
      setSelectedCryptoSymbol(null);
      setSelectedNetwork(null);
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setError("User ID not found. Please log in again.");
          setCoins([]);
          setIsLoading(false);
          return;
        }
        const apiUrl = `https://api.axoni.co/api/v1/coin-transaction?apikey=${API_KEY}&uid=${uid}&transaction_type=deposit`;
        const response = await fetch(apiUrl);
        if (!response.ok) {
          if (response.status === 400) {
            setError(
              "Bad request to API (400). Please check your credentials or try again later."
            );
          } else {
            setError(
              `HTTP error! status: ${response.status} - ${response.statusText}`
            );
          }
          setCoins([]);
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setCoins(data);
          // Set default selected crypto to USDT if available, otherwise first coin
          const defaultCoin =
            data.find((coin) => coin.symbol === "USDT") || data[0];
          if (defaultCoin) {
            setSelectedCryptoSymbol(defaultCoin.symbol);
          }
        } else {
          setError("Unexpected data format received from API.");
          setCoins([]);
        }
      } catch (err) {
        setError(err.message || "Failed to load coin data. Please try again.");
        setCoins([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCoins();
  }, []); // Only run on mount

  // --- Fetch deposit address when coin/network changes ---
  useEffect(() => {
    const fetchDepositAddress = async () => {
      if (!selectedCryptoSymbol || !selectedNetwork) {
        setDepositAddress("");
        setAddressError(null);
        return;
      }

      setIsLoadingAddress(true);
      setAddressError(null);
      setDepositAddress("");

      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setAddressError("User ID not found. Please log in again.");
          setIsLoadingAddress(false);
          return;
        }

        const apiUrl = `https://api.axoni.co/api/v1/address/${uid}?apikey=A20RqFwVktRxxRqrKBtmi6ud&symbol=${selectedNetwork}`;
        console.log(
          `Fetching deposit address for ${selectedCryptoSymbol} on ${selectedNetwork}:`,
          apiUrl
        );

        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(
            `HTTP error! status: ${response.status} - ${response.statusText}`
          );
        }

        const data = await response.json();

        if (data && data.wallet_address) {
          setDepositAddress(data.wallet_address);
          setAddressError(null);
        } else {
          setAddressError("No deposit address found for this cryptocurrency.");
        }
      } catch (err) {
        console.error("Error fetching deposit address:", err);
        setAddressError(
          err.message || "Failed to fetch deposit address. Please try again."
        );
      } finally {
        setIsLoadingAddress(false);
      }
    };

    fetchDepositAddress();
  }, [selectedCryptoSymbol, selectedNetwork, API_KEY]);

  // --- Fetch Deposit History ---
  useEffect(() => {
    const fetchDepositHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setHistoryError("User ID not found. Please log in again.");
          setDepositHistory([]);
          setIsLoadingHistory(false);
          return;
        }
        
        const apiUrl = `https://api.axoni.co/api/v1/transaction-history/${uid}?apikey=${API_KEY}&transaction_type=deposit`;
        console.log("Fetching deposit history:", apiUrl);
        
        const response = await fetch(apiUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        const historyData = Array.isArray(data) ? data : [];
        setDepositHistory(historyData);
        console.log("Deposit history loaded:", historyData.length, "transactions");
      } catch (err) {
        console.error("Error fetching deposit history:", err);
        setHistoryError(err.message || "Failed to load deposit history. Please try again.");
        setDepositHistory([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchDepositHistory();
  }, [API_KEY]);

  // --- Close dropdowns when clicking outside ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        cryptoDropdownRef.current &&
        !cryptoDropdownRef.current.contains(event.target)
      ) {
        setIsCryptoDropdownOpen(false);
      }
      if (
        networkDropdownRef.current &&
        !networkDropdownRef.current.contains(event.target)
      ) {
        setIsNetworkDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this runs once on mount and cleanup on unmount

  // --- Memoized Filtering for Crypto Dropdown ---
  const filteredCoinsForDropdown = useMemo(() => {
    if (!Array.isArray(coins)) return [];
    return coins.filter(
      (coin) =>
        coin.symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [coins, searchTerm]);

  // --- Get details of the currently selected coin ---

  // --- Event Handlers ---
  const handleCryptoSelect = useCallback((symbol) => {
    setSelectedCryptoSymbol(symbol);
    setSelectedNetwork(null); // Reset network
    setIsCryptoDropdownOpen(false); // Close crypto dropdown
    setDepositAddress(""); // Reset deposit address
    setSearchTerm(""); // Clear search term
    setAddressError(null); // Clear address error
    setCopySuccess(false); // Reset copy success state
  }, []);

  const handleNetworkSelect = useCallback((networkValue) => {
    setSelectedNetwork(networkValue);
    setIsNetworkDropdownOpen(false);
    setAddressError(null); // Clear address error
    setCopySuccess(false); // Reset copy success state
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleCopyAddress = useCallback(async () => {
    if (!depositAddress) return;
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy address: ", err);
      setAddressError("Failed to copy address.");
    }
  }, [depositAddress]);

  // Pagination handlers
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  const handlePreviousPage = useCallback(() => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  // --- Render Logic ---
  const activeStep = selectedNetwork ? 3 : selectedCryptoSymbol ? 2 : 1;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Deposit</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Deposit Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Step 1: Select Crypto */}
            <section>
              {/* Step Indicator */}
              <div
                className={`flex items-center mb-4 ${
                  activeStep >= 1 ? "opacity-100" : "opacity-50"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                    activeStep >= 1
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  1
                </span>
                <span
                  className={`font-medium ${
                    activeStep >= 1 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Select crypto
                </span>
              </div>

              {/* Main Crypto Selector Input */}
              {activeStep >= 1 && (
                <div className="relative mb-4" ref={cryptoDropdownRef}>
                  <button
                    onClick={() =>
                      setIsCryptoDropdownOpen(!isCryptoDropdownOpen)
                    }
                    disabled={isLoading}
                    className="flex items-center justify-between w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    {isLoading ? (
                      <span className="text-gray-500">Loading...</span>
                    ) : selectedCoinDetails ? (
                      <div className="flex items-center">
                        <ImageWithFallback
                          src={selectedCoinDetails.logo_path}
                          alt={`${selectedCoinDetails.name} logo`}
                          className="w-5 h-5 mr-2 rounded-full"
                          symbol={selectedCoinDetails.symbol}
                        />
                        <span className="font-medium text-gray-800">
                          {selectedCoinDetails.symbol}
                        </span>
                        <span className="text-gray-500 ml-2 hidden sm:inline">
                          {selectedCoinDetails.name}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select crypto</span>
                    )}
                    <ChevronDownIcon />
                  </button>

                  {/* Crypto Selection Dropdown Modal */}
                  {isCryptoDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      {/* Search Input inside Dropdown */}
                      <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5">
                          <SearchIcon />
                          <input
                            type="text"
                            placeholder="Search crypto"
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none ml-1"
                            autoFocus // Focus on search when dropdown opens
                          />
                        </div>
                      </div>

                      {/* Coin List */}
                      <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                          <Spinner />
                        ) : error ? (
                          <p className="text-red-600 text-sm p-4 text-center">
                            Error: {error}
                          </p>
                        ) : filteredCoinsForDropdown.length > 0 ? (
                          filteredCoinsForDropdown.map((coin) => (
                            <div
                              key={coin.symbol}
                              onClick={() => handleCryptoSelect(coin.symbol)}
                              className={`flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${
                                selectedCryptoSymbol === coin.symbol
                                  ? "bg-gray-100"
                                  : ""
                              }`}
                            >
                              <ImageWithFallback
                                src={coin.logo_path}
                                alt={`${coin.name} logo`}
                                className="w-6 h-6 mr-3 rounded-full"
                                symbol={coin.symbol}
                              />
                              <span className="font-medium text-sm text-gray-800 mr-2">
                                {coin.symbol}
                              </span>
                              <span className="text-sm text-gray-500">
                                {coin.name}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 p-4 text-center">
                            No matching crypto found.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Popular Coin Buttons (Show only if not loading/error) */}
              {!isLoading && !error && activeStep >= 1 && (
                <div className="flex flex-wrap gap-3 mt-4">
                  {popularCoins.map((symbol) => {
                    const coin = coins.find((c) => c.symbol === symbol);
                    if (!coin) return null; // Skip if coin not found in API data
                    return (
                      <button
                        key={symbol}
                        onClick={() => handleCryptoSelect(symbol)}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-full text-sm font-medium transition-colors duration-150 focus:outline-none ${
                          selectedCryptoSymbol === symbol
                            ? "bg-indigo-100 border-indigo-300 text-indigo-800"
                            : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        }`}
                      >
                        <ImageWithFallback
                          src={coin.logo_path}
                          alt={`${coin.name} logo`}
                          className="w-4 h-4 mr-1.5 rounded-full"
                          symbol={coin.symbol}
                        />
                        {symbol}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Step 2: Select Network */}
            <section>
              <div
                className={`flex items-center mb-4 ${
                  activeStep >= 2 ? "opacity-100" : "opacity-50"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                    activeStep >= 2
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  2
                </span>
                <span
                  className={`font-medium ${
                    activeStep >= 2 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Select network
                </span>
              </div>
              {activeStep >= 2 && (
                <div className="relative" ref={networkDropdownRef}>
                  <button
                    onClick={() =>
                      setIsNetworkDropdownOpen(!isNetworkDropdownOpen)
                    }
                    disabled={
                      !selectedCryptoSymbol || networkOptions.length === 0
                    } // Disable if no crypto or no networks
                    className="flex items-center justify-between w-full h-12 px-3 bg-gray-50 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    <span
                      className={
                        selectedNetwork ? "text-gray-900" : "text-gray-500"
                      }
                    >
                      {selectedNetwork
                        ? networkOptions.find(
                            (opt) => opt.value === selectedNetwork
                          )?.label
                        : "Select network"}
                    </span>
                    <ChevronDownIcon />
                  </button>

                  {/* Network Dropdown */}
                  {isNetworkDropdownOpen && networkOptions.length > 0 && (
                    <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                      {networkOptions.map((option) => (
                        <div
                          key={option.value}
                          onClick={() => handleNetworkSelect(option.value)}
                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                            selectedNetwork === option.value
                              ? "bg-gray-100 font-medium"
                              : "text-gray-700"
                          }`}
                        >
                          {option.label}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center mt-2 text-gray-500 text-xs cursor-pointer hover:text-gray-700 w-fit">
                    <QuestionCircleIcon />
                    <span>What's network?</span>
                  </div>
                </div>
              )}
            </section>

            {/* Step 3: Deposit Details */}
            <section>
              <div
                className={`flex items-center mb-4 ${
                  activeStep >= 3 ? "opacity-100" : "opacity-50"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                    activeStep >= 3
                      ? "bg-gray-900 text-white"
                      : "border border-gray-300 bg-white text-gray-500"
                  }`}
                >
                  3
                </span>
                <span
                  className={`font-medium ${
                    activeStep >= 3 ? "text-gray-900" : "text-gray-500"
                  }`}
                >
                  Deposit details
                </span>
              </div>
              {activeStep === 3 && selectedCoinDetails && (
                <div className="border border-gray-200 rounded-lg p-4 md:p-6 space-y-4">
                  {/* Warning Message */}
                  <div className="flex items-start p-3 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800 text-sm">
                    <InfoCircleIcon />
                    <span>
                      Only use this address to deposit {selectedCryptoSymbol}.
                      Please don't deposit inscriptions, NFTs, or any other non-
                      {selectedCryptoSymbol} assets, as they can't be credited
                      or returned.
                    </span>
                  </div>

                  {/* Loading State */}
                  {isLoadingAddress && (
                    <div className="flex flex-col items-center justify-center py-8">
                      <Spinner />
                      <p className="text-sm text-gray-600 mt-2">
                        Generating deposit address...
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {addressError && !isLoadingAddress && (
                    <div className="flex items-start p-3 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
                      <svg
                        className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <div className="flex-1">
                        <span>{addressError}</span>
                        <button
                          onClick={() => {
                            setAddressError(null);
                            // This will trigger the useEffect to refetch the address
                            setSelectedNetwork(selectedNetwork);
                          }}
                          className="ml-2 text-red-600 hover:text-red-800 underline font-medium"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* QR Code and Address (only show when address is available) */}
                  {depositAddress && !isLoadingAddress && !addressError && (
                    <>
                      {/* QR Code */}
                      <div className="flex justify-center py-4">
                        <QRCodeSVG
                          value={depositAddress}
                          size={160}
                          level="H"
                          bgColor="#ffffff"
                          fgColor="#000000"
                          // Add selected coin logo in the middle (optional)
                          // imageSettings={{
                          //   src: selectedCoinDetails.logo_path,
                          //   x: undefined,
                          //   y: undefined,
                          //   height: 30,
                          //   width: 30,
                          //   excavate: true,
                          // }}
                        />
                      </div>

                      {/* Deposit Address and Copy Button */}
                      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md p-3">
                        <span className="font-mono text-sm text-gray-800 break-all mr-2">
                          {depositAddress}
                        </span>
                        <button
                          onClick={handleCopyAddress}
                          className={`flex items-center justify-center px-3 py-1.5 rounded-md text-xs font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                            copySuccess
                              ? "bg-green-600 text-white focus:ring-green-500"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-gray-400"
                          }`}
                        >
                          {copySuccess ? <CheckIcon /> : <CopyIcon />}
                          <span className="ml-1">
                            {copySuccess ? "Copied" : "Copy"}
                          </span>
                        </button>
                      </div>
                    </>
                  )}

                  {/* Deposit Information (only show when address is available) */}
                  {depositAddress && !isLoadingAddress && !addressError && (
                    <div className="space-y-2 text-sm">
                      {/* Replace with dynamic data */}
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Minimum deposit</span>
                        <span className="font-medium text-gray-900">
                          0.00003 {selectedCryptoSymbol}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">Deposit account</span>
                        <span className="font-medium text-gray-900">
                          Funding
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <span className="text-gray-500">
                          Deposit arrival time
                        </span>
                        <span className="font-medium text-gray-900">
                          ~18 minutes
                        </span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-gray-500">
                          Withdrawal enabled time
                        </span>
                        <span className="font-medium text-gray-900">
                          ~27 minutes
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>

          {/* Right Column: FAQ */}
          <aside className="lg:col-span-1">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-base font-semibold mb-4 text-gray-900">
                FAQ
              </h2>
              <ul className="space-y-3">
                {faqQuestions.map((faq) => (
                  <li key={faq.id}>
                    <a
                      href={`/help/deposit/${faq.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-700 hover:text-gray-900 hover:underline"
                    >
                      {faq.question}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>

        {/* Deposit History Section */}
        <section className="mt-12">
          <div className="flex justify-between items-center border-b border-gray-200 mb-6 pb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              All deposits
            </h2>
            <button
              onClick={() => {
                // Refresh deposit history
                const fetchDepositHistory = async () => {
                  setIsLoadingHistory(true);
                  setHistoryError(null);
                  setCurrentPage(1); // Reset to first page
                  try {
                    const uid = localStorage.getItem("uid");
                    if (!uid) return;
                    
                    const apiUrl = `https://api.axoni.co/api/v1/transaction-history/${uid}?apikey=${API_KEY}&transaction_type=deposit`;
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    
                    const data = await response.json();
                    setDepositHistory(Array.isArray(data) ? data : []);
                  } catch (err) {
                    setHistoryError(err.message || "Failed to refresh deposit history.");
                  } finally {
                    setIsLoadingHistory(false);
                  }
                };
                fetchDepositHistory();
              }}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
            >
              Refresh history
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                ></path>
              </svg>
            </button>
          </div>

          {/* Loading State */}
          {isLoadingHistory && (
            <div className="flex justify-center items-center py-8">
              <Spinner />
              <span className="ml-2 text-gray-600">Loading deposit history...</span>
            </div>
          )}

          {/* Error State */}
          {historyError && !isLoadingHistory && (
            <div className="flex items-start p-4 bg-red-50 border border-red-200 rounded-md text-red-800 text-sm">
              <svg
                className="w-5 h-5 text-red-600 mr-2 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <div className="flex-1">
                <span>{historyError}</span>
                <button
                  onClick={() => {
                    setHistoryError(null);
                    // Trigger refetch
                    const fetchDepositHistory = async () => {
                      setIsLoadingHistory(true);
                      try {
                        const uid = localStorage.getItem("uid");
                        if (!uid) return;
                        
                        const apiUrl = `https://api.axoni.co/api/v1/transaction-history/${uid}?apikey=${API_KEY}&transaction_type=deposit`;
                        const response = await fetch(apiUrl);
                        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                        
                        const data = await response.json();
                        setDepositHistory(Array.isArray(data) ? data : []);
                      } catch (err) {
                        setHistoryError(err.message || "Failed to load deposit history.");
                      } finally {
                        setIsLoadingHistory(false);
                      }
                    };
                    fetchDepositHistory();
                  }}
                  className="ml-2 text-red-600 hover:text-red-800 underline font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Deposit History Table */}
          {!isLoadingHistory && !historyError && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded shadow-md">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Coin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {depositHistory.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-gray-500 dark:text-gray-400 py-8">
                        No deposit history found.
                      </td>
                    </tr>
                  ) : (
                    paginatedDepositHistory.map((transaction, index) => (
                      <tr key={transaction.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          {transaction.date ? new Date(transaction.date).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {transaction.image_path && (
                              <img 
                                src={transaction.image_path} 
                                alt={transaction.coin_name} 
                                className="w-5 h-5 rounded-full"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <span>{transaction.coin_name || '-'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap font-medium">
                          {transaction.final_amount ? 
                            (transaction.coin_name === 'USDT' || transaction.coin_name === 'FBC' ? 
                              parseFloat(transaction.final_amount).toFixed(2) : 
                              parseFloat(transaction.final_amount).toFixed(8)
                            ) : '-'
                          }
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaction.status === 'approved' || transaction.status === 'completed' || transaction.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : transaction.status === 'failed' || transaction.status === 'rejected'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Controls */}
          {!isLoadingHistory && !historyError && depositHistory.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 px-4">
              {/* Pagination Info */}
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, depositHistory.length)} of {depositHistory.length} results
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Previous
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md border transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </section>
      </main>
    </div>
  );
}

export default App;
