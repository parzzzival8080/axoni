import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import axios from "axios";
import TransferWalkthroughTrigger from "../../components/transfer/TransferWalkthroughTrigger";

// Custom scrollbar styles
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #ffffff;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #f5f5f5;
  }
`;

// SVG Icons
const ChevronDownIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
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

const InfoIcon = () => (
  <svg
    className="w-4 h-4 text-gray-400"
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

const ArrowsIcon = () => (
  <svg
    className="w-5 h-5 text-gray-500"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
    ></path>
  </svg>
);

// Image fallback component with lazy loading
const ImageWithFallback = ({ src, alt, className, symbol }) => {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef(null);

  const handleImageError = () => setError(true);
  const handleImageLoad = () => setLoaded(true);

  useEffect(() => {
    setError(false);
    setLoaded(false);
  }, [src]); // Reset states on src change

  useEffect(() => {
    // Set up intersection observer for lazy loading
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute("data-src");
            }
            observer.unobserve(img);
          }
        });
      },
      { rootMargin: "100px" }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) observer.unobserve(imgRef.current);
    };
  }, []);

  if (error || !src) {
    return (
      <span
        className={`${className} flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xs rounded-full`}
      >
        {symbol?.substring(0, 1)?.toUpperCase() || "?"}
      </span>
    );
  }

  return (
    <>
      {!loaded && (
        <span
          className={`${className} flex items-center justify-center bg-gray-200 text-gray-600 font-bold text-xs rounded-full`}
        >
          {symbol?.substring(0, 1)?.toUpperCase() || "?"}
        </span>
      )}
      <img
        ref={imgRef}
        data-src={src}
        src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" // Tiny transparent placeholder
        alt={alt}
        className={`${className} ${
          loaded ? "opacity-100" : "opacity-0 absolute"
        }`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        loading="lazy"
      />
    </>
  );
};

// Cache key for local storage
const COINS_CACHE_KEY = "transfer_coins_cache";
const CACHE_EXPIRY_TIME = 7 * 24 * 60 * 60 * 1000;

const Transfer = () => {
  // State variables
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState("Spot");
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [toAccount, setToAccount] = useState("Future");
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [availableBalance, setAvailableBalance] = useState(0);
  const [spotBalance, setSpotBalance] = useState(0);
  const [futureBalance, setFutureBalance] = useState(0);
  const [isBalanceLoading, setIsBalanceLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Transfer history state
  const [transferHistory, setTransferHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [activeHistoryTab, setActiveHistoryTab] = useState("asset");

  // Refs for dropdowns
  const assetDropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  // State for coins data
  const [coins, setCoins] = useState([]);
  const [filteredCoins, setFilteredCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(false); // Start with false to show cached data immediately
  const [searchTerm, setSearchTerm] = useState("");

  // State for virtual scrolling
  const [visibleCoinsRange, setVisibleCoinsRange] = useState({
    start: 0,
    end: 30,
  });

  // Load coins from cache first, then fetch from API
  useEffect(() => {
    // Try to load from cache first
    const loadFromCache = () => {
      try {
        const cachedData = localStorage.getItem(COINS_CACHE_KEY);
        if (cachedData) {
          const { data, timestamp } = JSON.parse(cachedData);
          const now = new Date().getTime();

          // Check if cache is still valid (less than 24 hours old)
          if (
            now - timestamp < CACHE_EXPIRY_TIME &&
            Array.isArray(data) &&
            data.length > 0
          ) {
            console.log("Loading coins from cache:", data.length, "coins");
            setCoins(data);
            setFilteredCoins(data);
            return true; // Successfully loaded from cache
          }
        }
        return false; // Cache not available or expired
      } catch (e) {
        console.error("Error loading from cache:", e);
        return false;
      }
    };

    // If we couldn't load from cache, prepare a placeholder list
    if (!loadFromCache()) {
      // Create placeholder data while we fetch the real data
      const placeholderCoins = Array(20)
        .fill(null)
        .map((_, i) => ({
          id: `placeholder-${i}`,
          symbol: `...${"".padEnd(i % 3)}`,
          name: "Loading...",
          isPlaceholder: true,
        }));
      setCoins(placeholderCoins);
      setFilteredCoins(placeholderCoins);
    }

    // Always fetch fresh data regardless of cache
    fetchCoins();
  }, []);

  // Fetch coins data from API - using useCallback to memoize the function
  const fetchCoins = useCallback(async () => {
    if (coins.length > 0 && !coins[0]?.isPlaceholder) return; // Don't fetch if we already have real coins

    try {
      // Don't set loading to true if we have placeholder data
      if (coins.length === 0) {
        setIsLoading(true);
      }

      console.log("Fetching fresh coins data...");
      const response = await axios.get(
        "https://api.kinecoin.co/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud"
      );
      const coinsData = response.data;
      console.log("Fresh coins data loaded:", coinsData.length, "coins");

      // Save to cache
      try {
        localStorage.setItem(
          COINS_CACHE_KEY,
          JSON.stringify({
            data: coinsData,
            timestamp: new Date().getTime(),
          })
        );
        console.log("Coins data saved to cache");
      } catch (e) {
        console.error("Error saving to cache:", e);
      }

      setCoins(coinsData);
      setFilteredCoins(coinsData);
    } catch (error) {
      console.error("Error fetching coins:", error);
    } finally {
      setIsLoading(false);
    }
  }, [coins]);

  // Filter coins based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCoins(coins);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = coins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(term) ||
        (coin.name && coin.name.toLowerCase().includes(term))
    );

    setFilteredCoins(filtered);
  }, [searchTerm, coins]);

  // Fetch transfer history function
  const fetchTransferHistory = async () => {
    try {
      setIsHistoryLoading(true);
      setHistoryError(null);

      // Always use uid from localStorage
      const uid = localStorage.getItem("uid");
      if (!uid) {
        setHistoryError("User not logged in.");
        setTransferHistory([]);
        setIsHistoryLoading(false);
        return;
      }

      console.log("Fetching transfer history for uid:", uid);

      // Fetch transfer history from API
      const response = await axios.get(
        `https://api.kinecoin.co/api/v1/transfer-history/${uid}?apikey=A20RqFwVktRxxRqrKBtmi6ud`
      );

      console.log("Transfer history response status:", response.status);
      console.log("Transfer history response:", response.data);
      console.log("Is response.data an array?", Array.isArray(response.data));
      console.log("Response data length:", response.data?.length);

      // Clear any previous errors since the API call was successful
      setHistoryError(null);

      // Handle the response - API returns an array (could be empty)
      if (Array.isArray(response.data)) {
        // Use the API response directly for transfer history (empty array is valid)
        setTransferHistory(response.data);
        console.log("Transfer history set to:", response.data);
      } else if (
        response.data &&
        response.data.message === "Something went wrong"
      ) {
        // API returns this specific message when there's no transfer history
        console.log(
          'API returned "Something went wrong" - treating as empty transfer history'
        );
        setTransferHistory([]);
        setHistoryError(null);
      } else {
        // If API returns unexpected format (not an array), set empty array
        console.log("Unexpected response format, setting empty array");
        setTransferHistory([]);
      }
    } catch (error) {
      console.error("Error fetching transfer history:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      // Check if the error response contains the "Something went wrong" message
      if (
        error.response?.data &&
        error.response.data.message === "Something went wrong"
      ) {
        // This is the API's way of saying no transfer history exists
        console.log(
          "API error response indicates no transfer history - treating as empty array"
        );
        setTransferHistory([]);
        setHistoryError(null);
      } else if (
        error.response?.status === 404 ||
        error.response?.status === 204 ||
        (error.response?.data &&
          typeof error.response.data === "string" &&
          error.response.data.toLowerCase().includes("no data")) ||
        (error.response?.data &&
          typeof error.response.data === "string" &&
          error.response.data.toLowerCase().includes("not found"))
      ) {
        // Treat 404 or "no data" responses as valid empty results
        console.log(
          "API returned no data (404 or similar), treating as empty array"
        );
        setTransferHistory([]);
        setHistoryError(null);
      } else {
        // Only set error for actual network/server errors
        setHistoryError(
          "Failed to load transfer history. Please try again later."
        );
        setTransferHistory([]);
      }
    } finally {
      setIsHistoryLoading(false);
    }
  };

  // Fetch transfer history on component mount and when selected asset changes
  useEffect(() => {
    // Clear any existing error state when asset changes
    setHistoryError(null);
    fetchTransferHistory();
  }, [selectedAsset]);

  // Fetch spot and future balances for selected coin
  useEffect(() => {
    if (!selectedAsset) {
      setSpotBalance(0);
      setFutureBalance(0);
      setAvailableBalance(0);
      return;
    }
    const fetchCoinBalance = async () => {
      setIsBalanceLoading(true);
      try {
        const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
        const uid = localStorage.getItem("uid");
        const url = `https://api.kinecoin.co/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=${selectedAsset}`;
        const response = await axios.get(url);
        setSpotBalance(Number(response.data.spot_wallet) || 0);
        setFutureBalance(Number(response.data.future_wallet) || 0);
        // Set availableBalance based on fromAccount
        setAvailableBalance(
          fromAccount.toLowerCase() === "spot"
            ? Number(response.data.spot_wallet) || 0
            : Number(response.data.future_wallet) || 0
        );
      } catch (err) {
        setSpotBalance(0);
        setFutureBalance(0);
        setAvailableBalance(0);
      } finally {
        setIsBalanceLoading(false);
      }
    };
    fetchCoinBalance();
  }, [selectedAsset, fromAccount]);

  // Refetch balances after a successful transfer
  useEffect(() => {
    if (success && selectedAsset) {
      const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
      const uid = localStorage.getItem("uid");
      const url = `https://api.kinecoin.co/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=${selectedAsset}`;
      axios.get(url).then((response) => {
        setSpotBalance(Number(response.data.spot_wallet) || 0);
        setFutureBalance(Number(response.data.future_wallet) || 0);
        setAvailableBalance(
          fromAccount.toLowerCase() === "spot"
            ? Number(response.data.spot_wallet) || 0
            : Number(response.data.future_wallet) || 0
        );
      });
    }
  }, [success, selectedAsset, fromAccount]);

  // Header tabs
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

  // Account options
  const accountOptions = ["Spot", "Future"];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        assetDropdownRef.current &&
        !assetDropdownRef.current.contains(event.target)
      ) {
        setIsAssetDropdownOpen(false);
      }
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target)
      ) {
        setIsFromDropdownOpen(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target)
      ) {
        setIsToDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Set available balance when asset changes (mock data)
  useEffect(() => {
    if (selectedAsset) {
      // const selectedCoin = coins.find(coin => coin.symbol === selectedAsset);
      // if (selectedCoin) {
      //   const price = parseFloat(selectedCoin.price);
      //   const randomMultiplier = 0.1 + Math.random() * 4.9; // Between 0.1 and 5
      //   setAvailableBalance(price > 100 ? randomMultiplier : price * randomMultiplier);
      // } else {
      //   setAvailableBalance(Math.random() * 10);
      // }
      if (fromAccount == "Spot") {
        setAvailableBalance(spotBalance);
      } else {
        setAvailableBalance(futureBalance);
      }
    } else {
      setAvailableBalance(0);
    }
  }, [selectedAsset, coins]);

  // Get details of the currently selected asset
  const selectedAssetDetails = useMemo(() => {
    if (!selectedAsset || !Array.isArray(coins)) return null;
    return coins.find((coin) => coin.symbol === selectedAsset);
  }, [selectedAsset, coins]);

  // Handle asset selection
  const handleAssetSelect = (symbol) => {
    setSelectedAsset(symbol);
    setIsAssetDropdownOpen(false);
    setTransferAmount(""); // Reset amount when changing asset
    setSearchTerm(""); // Reset search term when selecting an asset
    setError(null);
    setSuccess(false);
  };

  // Handle account selection
  const handleFromAccountSelect = (account) => {
    if (account === toAccount) {
      setToAccount(fromAccount); // Swap accounts if same selected
    }
    setFromAccount(account);
    setIsFromDropdownOpen(false);
    setError(null);
    setSuccess(false);
  };

  const handleToAccountSelect = (account) => {
    if (account === fromAccount) {
      setFromAccount(toAccount); // Swap accounts if same selected
    }
    setToAccount(account);
    setIsToDropdownOpen(false);
    setError(null);
    setSuccess(false);
  };

  // Handle max amount
  const handleMaxAmount = () => {
    setTransferAmount(availableBalance);
    setError(null);
  };

  // Handle transfer submission
  const handleTransfer = () => {
    // Validate inputs
    if (!selectedAsset) {
      setError("Please select an asset");
      return;
    }
    if (fromAccount === toAccount) {
      setError("From and To accounts cannot be the same");
      return;
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }
    if (parseFloat(transferAmount) > availableBalance) {
      setError("Insufficient balance");
      return;
    }

    // Submit transfer via API
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const apiKey = "A20RqFwVktRxxRqrKBtmi6ud";
    const uid = localStorage.getItem("uid");
    const transfer_from =
      fromAccount.toLowerCase() === "future"
        ? "futures"
        : fromAccount.toLowerCase();
    const transfer_to =
      toAccount.toLowerCase() === "future"
        ? "futures"
        : toAccount.toLowerCase();
    const symbol = selectedAsset;
    const amount = parseFloat(transferAmount);
    const url = `https://api.kinecoin.co/api/v1/transfers`;
    const data = {
      apikey: apiKey,
      uid: uid,
      transfer_from: transfer_from,
      transfer_to: transfer_to,
      symbol: symbol,
      amount: amount,
    };

    axios
      .post(url, data, { headers: { "Content-Type": "application/json" } })
      .then((response) => {
        setIsSubmitting(false);
        setSuccess(true);
        setTransferAmount("");
        fetchTransferHistory(); // Refresh transfer history after successful transfer
        // Optionally update balances here
      })
      .catch((err) => {
        setIsSubmitting(false);
        setError(
          err.response?.data?.message || "Transfer failed. Please try again."
        );
      });
  };

  // Swap from and to accounts
  const handleSwapAccounts = () => {
    const temp = fromAccount;
    setFromAccount(toAccount);
    setToAccount(temp);
    setError(null);
    setSuccess(false);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="min-h-screen bg-white text-gray-900 font-sans">
        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8 text-black">Transfer</h1>

          <div className="flex flex-col gap-8">
            {/* Transfer Form - Half Width */}
            <div className="max-w-md">
              {/* Asset Dropdown */}
              <div className="transfer-asset-section mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Asset
                </label>
                <div className="relative" ref={assetDropdownRef}>
                  <button
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-200"
                    onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                  >
                    {selectedAsset ? (
                      <div className="flex items-center">
                        {coins.find((c) => c.symbol === selectedAsset)
                          ?.logo_path ? (
                          <ImageWithFallback
                            src={
                              coins.find((c) => c.symbol === selectedAsset)
                                ?.logo_path
                            }
                            alt={selectedAsset}
                            className="w-6 h-6 rounded-full mr-2"
                            symbol={selectedAsset}
                          />
                        ) : (
                          <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                            {selectedAsset.substring(0, 1)}
                          </span>
                        )}
                        <span>{selectedAsset}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select an asset</span>
                    )}
                    <ChevronDownIcon />
                  </button>
                  {isAssetDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      <style>{scrollbarStyles}</style>

                      {/* Search input */}
                      <div className="p-2 border-b border-gray-200">
                        <input
                          type="text"
                          placeholder="Search assets..."
                          className="w-full h-11 flex items-center justify-center px-4 py-2 bg-[#F88726] text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F88726] hover:bg-[#ff9c44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onClick={(e) => e.stopPropagation()} // Prevent dropdown from closing
                          autoFocus // Auto focus on the search input when dropdown opens
                        />
                      </div>

                      <div
                        className="max-h-60 overflow-y-auto custom-scrollbar"
                        onScroll={(e) => {
                          // Virtual scrolling - update visible range based on scroll position
                          const container = e.target;
                          const scrollTop = container.scrollTop;
                          const viewportHeight = container.clientHeight;
                          const itemHeight = 48; // Approximate height of each item (px-4 py-3)

                          const startIndex = Math.floor(scrollTop / itemHeight);
                          const visibleItems = Math.ceil(
                            viewportHeight / itemHeight
                          );
                          const endIndex = startIndex + visibleItems + 10; // Add buffer

                          setVisibleCoinsRange({
                            start: Math.max(0, startIndex - 5), // Add buffer at top
                            end: Math.min(filteredCoins.length, endIndex),
                          });
                        }}
                      >
                        {isLoading && coins.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading assets...
                          </div>
                        ) : filteredCoins.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            No assets found
                          </div>
                        ) : (
                          <>
                            {/* Total height placeholder to maintain scrollbar size */}
                            <div
                              style={{
                                height: `${filteredCoins.length * 48}px`,
                                position: "relative",
                              }}
                            >
                              {/* Only render visible items */}
                              {filteredCoins
                                .slice(
                                  visibleCoinsRange.start,
                                  visibleCoinsRange.end
                                )
                                .map((coin, index) => (
                                  <button
                                    key={coin.id || coin.symbol}
                                    className="w-full flex items-center px-4 py-3 hover:bg-gray-100 transition-colors text-left absolute left-0 right-0"
                                    style={{
                                      top: `${
                                        (index + visibleCoinsRange.start) * 48
                                      }px`,
                                    }}
                                    onClick={() =>
                                      !coin.isPlaceholder &&
                                      handleAssetSelect(coin.symbol)
                                    }
                                    disabled={coin.isPlaceholder}
                                  >
                                    {coin.isPlaceholder ? (
                                      <>
                                        <div className="w-6 h-6 rounded-full bg-gray-200 animate-pulse mr-2"></div>
                                        <div className="h-4 bg-gray-200 animate-pulse rounded w-16"></div>
                                        <div className="ml-2 h-3 bg-gray-200 animate-pulse rounded w-24"></div>
                                      </>
                                    ) : (
                                      <>
                                        <ImageWithFallback
                                          src={coin.logo_path}
                                          alt={coin.symbol}
                                          className="w-6 h-6 rounded-full mr-2"
                                          symbol={coin.symbol}
                                        />
                                        <span>{coin.symbol}</span>
                                        <span className="ml-2 text-xs text-gray-500">
                                          {coin.name}
                                        </span>
                                      </>
                                    )}
                                  </button>
                                ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* From/To Accounts */}
              <div className="transfer-accounts-section flex items-center mb-6">
                {/* From Account */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    From
                  </label>
                  <div className="relative" ref={fromDropdownRef}>
                    <button
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-between px-4 py-3 text-left"
                      onClick={() => setIsFromDropdownOpen(!isFromDropdownOpen)}
                    >
                      <span className="font-medium">{fromAccount}</span>
                      <ChevronDownIcon />
                    </button>

                    {/* From Dropdown */}
                    {isFromDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {accountOptions.map((account) => (
                          <button
                            key={account}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                              account === fromAccount ? "bg-gray-100" : ""
                            }`}
                            onClick={() => handleFromAccountSelect(account)}
                          >
                            {account}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap Button */}
                <button
                  className="mx-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  onClick={handleSwapAccounts}
                  aria-label="Swap accounts"
                >
                  <ArrowsIcon />
                </button>

                {/* To Account */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    To
                  </label>
                  <div className="relative" ref={toDropdownRef}>
                    <button
                      className="w-full bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-between px-4 py-3 text-left"
                      onClick={() => setIsToDropdownOpen(!isToDropdownOpen)}
                    >
                      <span className="font-medium">{toAccount}</span>
                      <ChevronDownIcon />
                    </button>

                    {/* To Dropdown */}
                    {isToDropdownOpen && (
                      <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                        {accountOptions.map((account) => (
                          <button
                            key={account}
                            className={`w-full text-left px-4 py-3 hover:bg-gray-100 transition-colors ${
                              account === toAccount ? "bg-gray-100" : ""
                            }`}
                            onClick={() => handleToAccountSelect(account)}
                          >
                            {account}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amount Input */}
              <div className="transfer-amount-section mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder="0.00"
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 pr-16 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    disabled={!selectedAsset}
                    min="0"
                    step="any"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center">
                    <span className="text-gray-500 mr-2">{selectedAsset}</span>
                    <button
                      className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                      onClick={handleMaxAmount}
                      disabled={!selectedAsset || availableBalance <= 0}
                    >
                      Max
                    </button>
                  </div>
                </div>
                <div className="transfer-balance-display flex flex-row gap-4 mt-2">
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 min-w-[150px]">
                    <svg
                      className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M8 12h8" strokeWidth="2" />
                    </svg>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold mr-1">
                      Spot
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-bold">
                      {isBalanceLoading ? "..." : spotBalance}
                    </span>
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedAsset}
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 shadow-sm border border-gray-200 dark:border-gray-700 min-w-[150px]">
                    <svg
                      className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="12" r="10" strokeWidth="2" />
                      <path d="M16 12H8" strokeWidth="2" />
                    </svg>
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-semibold mr-1">
                      Future
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-bold">
                      {isBalanceLoading ? "..." : futureBalance}
                    </span>
                    <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                      {selectedAsset}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transfer Button */}
              <button
                className={`transfer-execute-button w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting ||
                  !selectedAsset ||
                  !transferAmount ||
                  parseFloat(transferAmount) <= 0 ||
                  parseFloat(transferAmount) > availableBalance
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-[#F88726] text-white hover:bg-[#ff9c44]"
                }`}
                onClick={handleTransfer}
                disabled={
                  isSubmitting ||
                  !selectedAsset ||
                  !transferAmount ||
                  parseFloat(transferAmount) <= 0 ||
                  parseFloat(transferAmount) > availableBalance
                }
              >
                {isSubmitting ? "Processing..." : "Transfer"}
              </button>

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg">
                  {error}
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg">
                  Transfer successful!
                </div>
              )}
            </div>
          </div>

          {/* Transfer History */}
          <div className="transfer-history-section mt-12">
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
              <button
                className={`py-4 mr-6 text-sm font-medium border-b-2 border-blue-500 text-blue-500 dark:text-blue-400`}
                style={{ pointerEvents: "none" }}
              >
                Transfer history <InfoIcon />
              </button>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
              <div>Asset</div>
              <div>Amount</div>
              <div>From</div>
              <div>To</div>
              <div>Status</div>
            </div>

            {/* Loading State */}
            {isHistoryLoading && (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 dark:border-blue-400"></div>
              </div>
            )}

            {/* Error State */}
            {historyError && !isHistoryLoading && (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="text-red-500 dark:text-red-400 mb-2">
                  <svg
                    className="w-12 h-12"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Error loading transfer history
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  {historyError}
                </p>
                <button
                  onClick={fetchTransferHistory}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors dark:bg-blue-600 dark:hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* No Records Found */}
            {!isHistoryLoading &&
              !historyError &&
              transferHistory.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="w-20 h-20 mb-4 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full">
                    <svg
                      className="w-10 h-10 text-gray-400 dark:text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      ></path>
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                    No records found
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Get started with your first transaction
                  </p>
                </div>
              )}

            {/* Transfer History List */}
            {!isHistoryLoading &&
              !historyError &&
              transferHistory.length > 0 && (
                <div className="overflow-hidden">
                  {transferHistory.map((transfer, index) => {
                    // Find coin details for the symbol
                    const coin = coins.find(
                      (c) => c.symbol === transfer.symbol
                    );
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-5 gap-4 py-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                      >
                        {/* Asset */}
                        <div className="flex items-center">
                          {coin?.logo_path ? (
                            <ImageWithFallback
                              src={coin.logo_path}
                              alt={transfer.symbol}
                              className="w-6 h-6 rounded-full mr-2"
                              symbol={transfer.symbol}
                            />
                          ) : (
                            <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mr-2">
                              {transfer.symbol?.substring(0, 1) || "?"}
                            </span>
                          )}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {transfer.symbol || "—"}
                          </span>
                        </div>
                        {/* Amount */}
                        <div className="text-gray-900 dark:text-gray-100 font-medium">
                          {parseFloat(transfer.amount)}
                        </div>
                        {/* From */}
                        <div className="text-gray-700 dark:text-gray-300 capitalize">
                          {transfer.transfer_from || "—"}
                        </div>
                        {/* To */}
                        <div className="text-gray-700 dark:text-gray-300 capitalize">
                          {transfer.transfer_to || "—"}
                        </div>
                        {/* Status */}
                        <div>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              transfer.status === "completed" ||
                              transfer.status === "success" ||
                              transfer.status === "approved"
                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                : transfer.status === "pending"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            }`}
                          >
                            {(transfer.status || "completed")
                              .charAt(0)
                              .toUpperCase() +
                              (transfer.status || "completed").slice(1)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Walkthrough Trigger */}
      <TransferWalkthroughTrigger />
    </>
  );
};

export default Transfer;
