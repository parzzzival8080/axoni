import React, { useState, useRef, useEffect, useMemo } from 'react';
import axios from 'axios';

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
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
  </svg>
);

const InfoIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
  </svg>
);

const ArrowsIcon = () => (
  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path>
  </svg>
);

// Image fallback component
const ImageWithFallback = ({ src, alt, className, symbol }) => {
  const [error, setError] = useState(false);
  const handleImageError = () => setError(true);
  useEffect(() => setError(false), [src]); // Reset error on src change

  if (error || !src) {
    return (
      <span className={`${className} flex items-center justify-center bg-gray-300 text-gray-600 font-bold text-xs rounded-full`}>
        {symbol?.substring(0, 1)?.toUpperCase() || '?'}
      </span>
    );
  }
  return <img src={src} alt={alt} className={className} onError={handleImageError} />;
};

const Transfer = () => {
  // State variables
  const [activeHeaderTab, setActiveHeaderTab] = useState('Funding');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [isAssetDropdownOpen, setIsAssetDropdownOpen] = useState(false);
  const [fromAccount, setFromAccount] = useState('Spot');
  const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
  const [toAccount, setToAccount] = useState('Future');
  const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [availableBalance, setAvailableBalance] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Refs for dropdowns
  const assetDropdownRef = useRef(null);
  const fromDropdownRef = useRef(null);
  const toDropdownRef = useRef(null);

  // State for coins data
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch coins data from API
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get('https://apiv2.bhtokens.com/api/v1/coins?apikey=A20RqFwVktRxxRqrKBtmi6ud');
        setCoins(response.data);
      } catch (error) {
        console.error('Error fetching coins:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoins();
  }, []);

  // Header tabs
  const headerTabs = [
    'Overview', 'Funding', 'Trading', 'Grow', 'Analysis', 
    'Order center', 'Fees', 'Account statement', 'PoR reports'
  ];

  // Account options
  const accountOptions = ['Spot', 'Future'];

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target)) {
        setIsAssetDropdownOpen(false);
      }
      if (fromDropdownRef.current && !fromDropdownRef.current.contains(event.target)) {
        setIsFromDropdownOpen(false);
      }
      if (toDropdownRef.current && !toDropdownRef.current.contains(event.target)) {
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
      const selectedCoin = coins.find(coin => coin.symbol === selectedAsset);
      if (selectedCoin) {
        const price = parseFloat(selectedCoin.price);
        const randomMultiplier = 0.1 + Math.random() * 4.9; // Between 0.1 and 5
        setAvailableBalance(price > 100 ? randomMultiplier : price * randomMultiplier);
      } else {
        setAvailableBalance(Math.random() * 10);
      }
    } else {
      setAvailableBalance(0);
    }
  }, [selectedAsset, coins]);

  // Get details of the currently selected asset
  const selectedAssetDetails = useMemo(() => {
    if (!selectedAsset || !Array.isArray(coins)) return null;
    return coins.find(coin => coin.symbol === selectedAsset);
  }, [selectedAsset, coins]);

  // Handle asset selection
  const handleAssetSelect = (symbol) => {
    setSelectedAsset(symbol);
    setIsAssetDropdownOpen(false);
    setTransferAmount('');
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
    setTransferAmount(availableBalance.toFixed(8));
    setError(null);
  };

  // Handle transfer submission
  const handleTransfer = () => {
    // Validate inputs
    if (!selectedAsset) {
      setError('Please select an asset');
      return;
    }
    if (fromAccount === toAccount) {
      setError('From and To accounts cannot be the same');
      return;
    }
    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (parseFloat(transferAmount) > availableBalance) {
      setError('Insufficient balance');
      return;
    }

    // Submit transfer (mock)
    setIsSubmitting(true);
    setError(null);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      setTransferAmount('');
      // In a real app, you would update the balance after transfer
    }, 1500);
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
        {/* Header Navigation */}
        <header className="bg-white border-b border-gray-200 relative z-0">
          <div className="flex overflow-x-auto scrollbar-hide">
            {['Overview', 'Funding', 'Trading', 'Grow', 'Analysis', 'Order center', 'Fees', 'Account statement', 'PoR reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveHeaderTab(tab)}
                className={`px-4 py-4 text-sm font-medium focus:outline-none border-b-2 ${
                  activeHeaderTab === tab
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-8 text-black">Transfer</h1>

          <div className="flex flex-col gap-8">
            {/* Transfer Form - Half Width */}
            <div className="max-w-md">
              {/* Asset Dropdown */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Asset</label>
                <div className="relative" ref={assetDropdownRef}>
                  <button
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-gray-200"
                    onClick={() => setIsAssetDropdownOpen(!isAssetDropdownOpen)}
                  >
                    {selectedAsset ? (
                      <div className="flex items-center">
                        {coins.find(c => c.symbol === selectedAsset)?.logo_path ? (
                          <ImageWithFallback 
                            src={coins.find(c => c.symbol === selectedAsset)?.logo_path} 
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
                      <div className="max-h-60 overflow-y-auto custom-scrollbar">
                        {isLoading ? (
                          <div className="p-4 text-center text-gray-500">Loading assets...</div>
                        ) : (
                          Array.isArray(coins) && coins.map((coin) => (
                            <button
                              key={coin.symbol}
                              className="w-full flex items-center px-4 py-3 hover:bg-gray-100 transition-colors text-left"
                              onClick={() => handleAssetSelect(coin.symbol)}
                            >
                              <ImageWithFallback 
                                src={coin.logo_path} 
                                alt={coin.symbol}
                                className="w-6 h-6 rounded-full mr-2"
                                symbol={coin.symbol}
                              />
                              <span>{coin.symbol}</span>
                              <span className="ml-2 text-xs text-gray-500">{coin.name}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* From/To Accounts */}
              <div className="flex items-center mb-6">
                {/* From Account */}
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">From</label>
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
                              account === fromAccount ? 'bg-gray-100' : ''
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">To</label>
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
                              account === toAccount ? 'bg-gray-100' : ''
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
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
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
                <div className="text-sm mt-2 text-gray-500">
                  Available: {availableBalance.toFixed(8)} {selectedAsset}
                </div>
              </div>

              {/* Transfer Button */}
              <button
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting || !selectedAsset || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > availableBalance
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-900 hover:bg-gray-300'
                }`}
                onClick={handleTransfer}
                disabled={isSubmitting || !selectedAsset || !transferAmount || parseFloat(transferAmount) <= 0 || parseFloat(transferAmount) > availableBalance}
              >
                {isSubmitting ? 'Processing...' : 'Transfer'}
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
          <div className="mt-12">
            <div className="flex border-b border-gray-200 mb-6">
              <button
                className="py-4 mr-6 text-sm font-medium border-b-2 border-black text-black"
              >
                {selectedAsset ? `${selectedAsset} transfers` : 'USDT transfers'}
              </button>
              <button
                className="py-4 mr-6 text-sm font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              >
                Transfer history <InfoIcon />
              </button>
            </div>

            {/* Table Headers */}
            <div className="grid grid-cols-6 gap-4 py-3 border-b border-gray-200 text-sm text-gray-500">
              <div>Crypto</div>
              <div>Amount</div>
              <div>From</div>
              <div>To</div>
              <div>Date</div>
              <div>Status</div>
            </div>

            {/* No Records Found */}
            <div className="flex flex-col items-center justify-center py-16">
              <img
                src="/assets/img/no-records-found.webp"
                alt="No records found"
                className="w-20 h-20 mb-4"
              />
              <h3 className="text-base font-medium text-black mb-1">No records found</h3>
              <p className="text-sm text-gray-500">Get started with your first transaction</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Transfer;
