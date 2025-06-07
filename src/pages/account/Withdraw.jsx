import React, {useRef , useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight, faSearch, faChevronDown, faCopy, faQuestionCircle, faInfoCircle, faTimes
} from '@fortawesome/free-solid-svg-icons';
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
// Simple SVG Loader/Spinner
const Spinner = () => (
  <div className="flex justify-center items-center p-4">
    <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  </div>
);

// Simple SVG Icon Components
const ChevronDownIcon = () => (
    <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
);

const ChevronRightIcon = () => (
     <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
);

const SearchIcon = () => (
    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
);

const TimesIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
);

// Fallback Image Component
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


// --- Main Withdrawal Component ---

function withdraw() { // Using App as the main exportable component name

  // --- State Variables ---

  const [coins, setCoins] = useState([]);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [coinsError, setCoinsError] = useState(null);
  const [selectedCryptoSymbol, setSelectedCryptoSymbol] = useState(null); // Start null
  const [searchTerm, setSearchTerm] = useState('');
  const [isCryptoDropdownOpen, setIsCryptoDropdownOpen] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isNetworkDropdownOpen, setIsNetworkDropdownOpen] = useState(false);
  const [withdrawalDestination, setWithdrawalDestination] = useState('on-chain'); // 'on-chain' or 'internal'
  const [withdrawalAddress, setWithdrawalAddress] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [comment, setComment] = useState(''); // Optional comment for withdrawal API
  const [availableBalance, setAvailableBalance] = useState(0); // Placeholder
  const [networkFee, setNetworkFee] = useState(0); // Calculated based on network
  const [amountReceived, setAmountReceived] = useState(0);
  const [selectedAccount, setSelectedAccount] = useState('Funding'); // Default account
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for withdrawal API call
  const [submitError, setSubmitError] = useState(null); // Error state for withdrawal API call
  const [submitSuccess, setSubmitSuccess] = useState(false); // Success state for withdrawal
  const [availableLimit] = useState(9999200.06); // Placeholder 24h limit
  const [isAddressBookOpen, setIsAddressBookOpen] = useState(false); // For address book modal

  // --- Refs ---
  const cryptoDropdownRef = useRef(null);
  const networkDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const addressBookDropdownRef = useRef(null); // Ref for address book dropdown/modal

  // --- Constants ---
  // No COIN_API_URL or WITHDRAW_API_URL; use dynamic API URL for coin details only

  const headerTabs = [
    'Overview', 'Funding', 'Trading', 'Grow', 'Analysis', 'Order center', 'Fees', 'Account statement', 'PoR reports'
  ];

  const faqQuestions = [
    { id: 1, question: "How do I make a withdrawal?", slug: "how-to-make-withdrawal" },
    { id: 2, question: "Why have I still not received my withdrawal?", slug: "withdrawal-not-received" },
    { id: 3, question: "How do I select the correct network for my crypto withdrawals and deposits?", slug: "select-correct-network" },
    { id: 4, question: "Do I need to pay fees for deposit and withdrawal?", slug: "withdrawal-deposit-fees" },
  ];

  

  // Placeholder account options
  const accountOptions = ['Funding', 'Trading'];
  // Placeholder address book entries
  const addressBookEntries = [
    { label: 'My Binance ETH', address: '0x123...', network: 'ethereum' },
    { label: 'Friend BTC Wallet', address: 'bc1q...', network: 'bitcoin' },
    { label: 'Work USDT TRC20', address: 'TRX123...', network: 'tron' }
  ];


  // --- Effects ---

  // Fetch Coins
  useEffect(() => {
    const fetchCoins = async () => {
      setIsLoadingCoins(true);
      setCoinsError(null);

      try {
        const uid = localStorage.getItem('uid');
        if (!uid) {
          setCoinsError('User ID not found. Please log in again.');
          setCoins([]);
          setIsLoadingCoins(false);
          return;
        }
        const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
        const apiUrl = `https://apiv2.bhtokens.com/api/v1/coin-transaction?apikey=${apiKey}&uid=${uid}&transaction_type=withdrawal`;
        const response = await axios.get(apiUrl);
        setCoins(response.data);
      } catch (error) {
        if (error.response && error.response.status === 400) {
          setCoinsError('Bad request to API (400). Please check your credentials or try again later.');
        } else {
          setCoinsError('Failed to load cryptocurrencies. Please try again.');
        }
        setCoins([]);
      } finally {
        setIsLoadingCoins(false);
      }
    };

    fetchCoins();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cryptoDropdownRef.current && !cryptoDropdownRef.current.contains(event.target)) setIsCryptoDropdownOpen(false);
      if (networkDropdownRef.current && !networkDropdownRef.current.contains(event.target)) setIsNetworkDropdownOpen(false);
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) setIsAccountDropdownOpen(false);
      if (addressBookDropdownRef.current && !addressBookDropdownRef.current.contains(event.target)) setIsAddressBookOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calculate Amount Received
  useEffect(() => {
    const amountNum = parseFloat(withdrawalAmount) || 0;
    const feeNum = parseFloat(networkFee) || 0;
    setAmountReceived(amountNum > feeNum ? amountNum - feeNum : 0);
  }, [withdrawalAmount, networkFee]);

  // Set Network Fee from selected network object
  useEffect(() => {
    if (selectedNetwork && typeof selectedNetwork.fee !== 'undefined') {
      setNetworkFee(Number(selectedNetwork.fee));
    } else {
      setNetworkFee(0);
    }
  }, [selectedNetwork]);

  // --- Memoized Values ---

  // Filter coins based on search term
  const filteredCoins = useMemo(() => {
    if (!searchTerm.trim()) return coins;
    return coins.filter(coin => 
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (coin.name && coin.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [coins, searchTerm]);

  // Details of Selected Coin
  const selectedCoinDetails = useMemo(() => {
    if (!selectedCryptoSymbol || !Array.isArray(coins)) return null;
    return coins.find(coin => coin.symbol === selectedCryptoSymbol);
  }, [selectedCryptoSymbol, coins]);

  // Network Options based on Selected Coin (from API)
  const networkOptions = useMemo(() => {
    if (!selectedCoinDetails || !Array.isArray(selectedCoinDetails.network)) return [];
    return selectedCoinDetails.network.map(net => ({ ...net, value: net.symbol, label: net.name }));
  }, [selectedCoinDetails]);

  // Determine active step
  const activeStep = useMemo(() => {
      if (selectedCryptoSymbol && selectedNetwork && withdrawalAddress && withdrawalAmount) return 3;
      if (selectedCryptoSymbol && selectedNetwork && withdrawalAddress) return 3; // Allow entering amount
      if (selectedCryptoSymbol) return 2;
      return 1;
  }, [selectedCryptoSymbol, selectedNetwork, withdrawalAddress, withdrawalAmount]);

  // --- Keep availableBalance in sync with selected coin ---
  useEffect(() => {
    if (!selectedCryptoSymbol || !Array.isArray(coins)) {
      setAvailableBalance(0);
      return;
    }
    const coin = coins.find(c => c.symbol === selectedCryptoSymbol);
    setAvailableBalance(coin && coin.balance && coin.balance.spot_wallet ? Number(coin.balance.spot_wallet) : 0);
  }, [selectedCryptoSymbol, coins]);

  // --- Event Handlers ---

  const handleCryptoSelect = useCallback((symbol) => {
    setSelectedCryptoSymbol(symbol);
    setSelectedNetwork(null); // Reset network
    setWithdrawalAddress(''); // Reset address
    setWithdrawalAmount(''); // Reset amount
    setIsCryptoDropdownOpen(false);
    setSearchTerm('');
    // availableBalance is now set by useEffect below
  }, []);

  const handleNetworkSelect = useCallback((network) => { // network is now the full network object
    setSelectedNetwork(network);
    setIsNetworkDropdownOpen(false);
  }, []);

  const handleDestinationChange = useCallback((destination) => {
    setWithdrawalDestination(destination);
    setSelectedNetwork(null);
    setWithdrawalAddress('');
    setWithdrawalAmount('');
  }, []);

  const handleMaxAmount = useCallback(() => {
    setWithdrawalAmount(availableBalance.toString());
  }, [availableBalance]);

  const handleAccountSelect = useCallback((account) => {
    setSelectedAccount(account);
    setIsAccountDropdownOpen(false);
  }, []);

  const handleAddressBookSelect = useCallback((addressEntry) => {
    setWithdrawalAddress(addressEntry.address);
    // Optionally, try to match network if address book entry has it
    const matchingNetwork = networkOptions.find(n => n.value === addressEntry.network);
    if (matchingNetwork) {
        setSelectedNetwork(matchingNetwork);
    }
    setIsAddressBookOpen(false);
  }, [networkOptions]);


  // Handle Withdrawal Submission
  const handleSubmitWithdrawal = useCallback(async () => {
    // Basic Validation
    if (!selectedCryptoSymbol || !selectedNetwork || !withdrawalAddress || !withdrawalAmount) {
        setSubmitError("Please complete all required fields.");
        return;
    }
    const amountNum = parseFloat(withdrawalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
        setSubmitError("Please enter a valid withdrawal amount.");
        return;
    }
    if (amountNum < networkFee) {
        setSubmitError(`Withdrawal amount must be greater than the network fee (${networkFee} ${selectedCryptoSymbol}).`);
        return;
    }
    if (amountNum > availableBalance) {
        setSubmitError("Insufficient balance.");
        return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Build new API URL for withdrawal submission
    const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
    const wallet_id = selectedCoinDetails?.balance?.id;
    const initial_amount = amountNum;
    const network_id = selectedNetwork?.id;
    const apiUrl = `https://apiv2.bhtokens.com/api/v1/submit-withdrawal?wallet_id=${wallet_id}&initial_amount=${initial_amount}&apikey=${apiKey}&network_id=${network_id}`;

    console.log("Submitting withdrawal with:", { wallet_id, initial_amount, network_id, apiKey });

    try {
        // Use POST as required by backend
        const response = await axios.post(
          apiUrl,
          {}, // If your backend expects data in the body, put it here; otherwise, keep it empty
          { headers: { 'Content-Type': 'application/json' } }
        );
        const result = response.data;
        console.log('Withdrawal successful:', result);
        setSubmitSuccess(true);
    } catch (err) {
        console.error('Withdrawal submission error:', err);
        setSubmitError(err.message || 'An unexpected error occurred during withdrawal.');
    } finally {
        setIsSubmitting(false);
    }
  }, [
      selectedCryptoSymbol, selectedNetwork, withdrawalAddress, withdrawalAmount,
      comment, availableBalance, networkFee, selectedCoinDetails
  ]);


  // --- Withdrawal History Table Component ---
const WithdrawalHistoryTable = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const uid = localStorage.getItem('uid');
        if (!uid) {
          setError('User ID not found. Please log in again.');
          setHistory([]);
          setIsLoading(false);
          return;
        }
        const url = `https://apiv2.bhtokens.com/api/v1/transaction-history/${uid}?apikey=${apiKey}&transaction_type=withdraw`;
        const response = await axios.get(url);
        setHistory(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        setError('Failed to load withdrawal history.');
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <section className="w-full">
      <div className="flex justify-between items-center border-b border-gray-200 mb-6 pb-2 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Withdrawal History</h2>
        <button
          className="text-sm px-3 py-1 rounded bg-gray-800 text-white hover:bg-gray-700 transition"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-900 rounded shadow-md">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Coin</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center text-gray-500 dark:text-gray-400 py-8">No withdrawal history found.</td>
                </tr>
              ) : (
                history.map((item, idx) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">{item.date ? new Date(item.date).toLocaleString() : '-'}</td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap flex items-center gap-2">
                      {item.image_path && <img src={item.image_path} alt={item.coin_name} className="w-5 h-5 rounded-full" />}
                      <span>{item.coin_name || '-'}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-200 whitespace-nowrap">{item.final_amount || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

// --- Render ---
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="min-h-screen bg-white text-gray-900 font-sans">


      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6 text-gray-900">Withdrawal</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Withdrawal Steps */}
          <div className="lg:col-span-2 space-y-8">

            {/* Step 1: Select Crypto */}
            <section>
              <div className={`flex items-center mb-4 ${activeStep >= 1 ? 'opacity-100' : 'opacity-50'}`}>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${activeStep >= 1 ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>1</span>
                <span className={`font-medium ${activeStep >= 1 ? 'text-gray-900' : 'text-gray-500'}`}>Select crypto</span>
              </div>
              <div className="relative" ref={cryptoDropdownRef}>
                 <button
                    onClick={() => setIsCryptoDropdownOpen(!isCryptoDropdownOpen)}
                    disabled={isLoadingCoins}
                    className="flex items-center justify-between w-full h-12 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                  >
                    {isLoadingCoins ? (
                        <span className="text-gray-500">Loading coins...</span>
                    ) : selectedCoinDetails ? (
                      <div className="flex items-center">
                        <ImageWithFallback
                            src={selectedCoinDetails.logo_path}
                            alt={`${selectedCoinDetails.name} logo`}
                            className="w-5 h-5 mr-2 rounded-full"
                            symbol={selectedCoinDetails.symbol}
                        />
                        <span className="font-medium text-gray-800">{selectedCoinDetails.symbol}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">Select crypto</span>
                    )}
                    <ChevronDownIcon />
                  </button>
                  {isCryptoDropdownOpen && (
                     <div className="absolute top-full left-0 mt-1 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                       <div className="p-3 border-b border-gray-200">
                           <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5">
                               <SearchIcon />
                               <input
                                type="text" placeholder="Search crypto" value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent text-sm text-gray-900 placeholder-gray-500 focus:outline-none ml-1"
                                autoFocus
                              />
                           </div>
                       </div>
                       <div className="max-h-60 overflow-y-auto custom-scrollbar">
                           {isLoadingCoins ? <Spinner /> : coinsError ? <p className="text-red-600 text-sm p-4 text-center">Error: {coinsError}</p> :
                           filteredCoins.length > 0 ? (
                               filteredCoins.map((coin) => (
                                   <div key={coin.symbol} onClick={() => handleCryptoSelect(coin.symbol)}
                                       className={`flex items-center px-4 py-2.5 cursor-pointer hover:bg-gray-100 ${selectedCryptoSymbol === coin.symbol ? 'bg-gray-100' : ''}`}>
                                       <ImageWithFallback src={coin.logo_path} alt={`${coin.name} logo`} className="w-6 h-6 mr-3 rounded-full" symbol={coin.symbol}/>
                                       <span className="font-medium text-sm text-gray-800 mr-2">{coin.symbol}</span>
                                       <span className="text-sm text-gray-500">{coin.name}</span>
                                   </div>
                               ))
                           ) : <p className="text-sm text-gray-500 p-4 text-center">No matching crypto found.</p>}
                       </div>
                    </div>
                  )}
              </div>
            </section>

            {/* Step 2: Set Destination */}
            <section>
              <div className={`flex items-center mb-4 ${activeStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${activeStep >= 2 ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>2</span>
                <span className={`font-medium ${activeStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>Set destination</span>
              </div>
              <div className={`${activeStep >= 2 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div className="flex border-b border-gray-200 mb-6"> {/* Increased mb */}
                      <button
                          onClick={() => handleDestinationChange('on-chain')}
                          className={`py-2.5 px-4 text-sm font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-all after:duration-200 ${
                              withdrawalDestination === 'on-chain'
                                  ? 'text-gray-900 after:bg-gray-900 after:w-full' // Active tab style
                                  : 'text-gray-500 hover:text-gray-700 after:bg-gray-700 after:w-0 hover:after:w-full' // Inactive tab style
                          }`}
                      >
                          On-chain withdrawal
                      </button>
                      <button
                          onClick={() => handleDestinationChange('internal')}
                          className={`py-2.5 px-4 text-sm font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-all after:duration-200 ${
                              withdrawalDestination === 'internal'
                                  ? 'text-gray-900 after:bg-gray-900 after:w-full'
                                  : 'text-gray-500 hover:text-gray-700 after:bg-gray-700 after:w-0 hover:after:w-full'
                          }`}
                      >
                          Internal withdrawal
                      </button>
                  </div>

                  <div className="mb-6"> {/* Increased mb */}
                      <label htmlFor="networkSelect" className="block text-sm font-medium text-gray-700 mb-1.5">Network</label> {/* Adjusted label style */}
                      <div className="relative" ref={networkDropdownRef}>
                          <button
                              id="networkSelect"
                              onClick={() => setIsNetworkDropdownOpen(!isNetworkDropdownOpen)}
                              disabled={!selectedCryptoSymbol || networkOptions.length === 0}
                              className="flex items-center justify-between w-full h-12 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300"
                          >
                              <span className={selectedNetwork ? "text-gray-900" : "text-gray-500"}>
                                  {selectedNetwork ? selectedNetwork.label : 'Select network'}
                              </span>
                              <ChevronDownIcon />
                          </button>
                          {isNetworkDropdownOpen && networkOptions.length > 0 && (
                              <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                  {networkOptions.map((option) => (
                                      <div key={option.value} onClick={() => handleNetworkSelect(option)}
                                          className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedNetwork?.value === option.value ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}>
                                          {option.label}
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>
                  </div>

                   <div className="mb-4">
                      <div className="flex justify-between items-center mb-1.5">
                          <label htmlFor="withdrawalAddress" className="block text-sm font-medium text-gray-700">Address</label>
                          <button 
                            onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
                            className="text-sm text-black hover:text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center" 
                            disabled={!selectedNetwork}
                          >
                              Manage address book <ChevronRightIcon />
                          </button>
                      </div>
                       <div className="relative" ref={addressBookDropdownRef}>
                           <input
                              id="withdrawalAddress" type="text"
                              placeholder="Enter address or select from address book"
                              value={withdrawalAddress}
                              onChange={(e) => setWithdrawalAddress(e.target.value)}
                              disabled={!selectedNetwork}
                              className="flex items-center justify-between w-full h-12 px-3 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                           />
                           {/* Simple Chevron for visual cue, actual dropdown is separate for address book */}
                            {!withdrawalAddress && ( // Show chevron only if input is empty, implying selection
                                <button 
                                    onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                    disabled={!selectedNetwork}
                                >
                                    <ChevronDownIcon />
                                </button>
                            )}
                            {withdrawalAddress && ( // Show clear button if address is entered
                               <button onClick={() => setWithdrawalAddress('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                   <TimesIcon />
                               </button>
                           )}
                           {/* Address Book Dropdown */}
                           {isAddressBookOpen && (
                               <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                                   {addressBookEntries.filter(entry => !selectedNetwork || entry.network === selectedNetwork.value).length > 0 ?
                                    addressBookEntries
                                        .filter(entry => !selectedNetwork || entry.network === selectedNetwork.value) // Filter by selected network if any
                                        .map(entry => (
                                            <div key={entry.address} onClick={() => handleAddressBookSelect(entry)}
                                                className="px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 text-gray-700">
                                                <span className="font-medium">{entry.label}</span>: {entry.address.substring(0,15)}...
                                            </div>
                                    )) : <p className="p-3 text-sm text-gray-500">No addresses for this network or add new.</p>}
                                    {/* Add "Add new address" option here if needed */}
                               </div>
                           )}
                       </div>
                  </div>
              </div>
            </section>

            {/* Step 3: Set Withdrawal Amount */}
            <section>
               <div className={`flex items-center mb-4 ${activeStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                 <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${activeStep >= 3 ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>3</span>
                 <span className={`font-medium ${activeStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>Set withdrawal amount</span>
               </div>
               <div className={`${activeStep >= 3 ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <div className="mb-4">
                      <div className="relative">
                           <input
                              type="number"
                              placeholder={`Enter a minimum of ${networkFee > 0 ? networkFee : '...'}`}
                              value={withdrawalAmount}
                              onChange={(e) => setWithdrawalAmount(e.target.value)}
                              disabled={!withdrawalAddress}
                              min={networkFee > 0 ? networkFee : 0}
                              step="any"
                              className="w-full h-12 px-3 pr-24 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                           />
                           <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                               <span className="text-sm font-medium text-gray-500">{selectedCryptoSymbol || '---'}</span>
                               <button
                                   onClick={handleMaxAmount}
                                   disabled={!withdrawalAddress || availableBalance <= 0}
                                   className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   Max
                               </button>
                           </div>
                       </div>
                       <div className="flex justify-between items-center text-sm mt-2">
                           <span className="text-gray-500">Available: {availableBalance.toFixed(4)} {selectedCryptoSymbol || ''}</span>
                           <div className="relative" ref={accountDropdownRef}>
                               <button
                                   onClick={() => setIsAccountDropdownOpen(!isAccountDropdownOpen)}
                                   disabled={!withdrawalAddress}
                                   className="text-black hover:text-gray-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   {selectedAccount} ({accountOptions.length}) <ChevronDownIcon />
                               </button>
                               {isAccountDropdownOpen && (
                                   <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                       {accountOptions.map(acc => (
                                           <div key={acc} onClick={() => handleAccountSelect(acc)}
                                                className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-100 ${selectedAccount === acc ? 'bg-gray-100 font-medium' : 'text-gray-700'}`}>
                                                {acc}
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                       </div>
                   </div>

                   <div className="space-y-2 text-sm mb-6">
                       <div className="flex justify-between py-2 border-b border-gray-100">
                           <span className="text-gray-500">Network fee</span>
                           <span className="font-medium text-gray-900">{networkFee > 0 ? `${networkFee} ${selectedCryptoSymbol || ''}` : '-'}</span>
                       </div>
                       <div className="flex justify-between py-2">
                           <span className="text-gray-500">Amount received</span>
                           <span className="font-medium text-gray-900">{amountReceived > 0 ? `${amountReceived.toFixed(4)} ${selectedCryptoSymbol || ''}` : '-'}</span>
                       </div>
                   </div>

                   <button
                       onClick={handleSubmitWithdrawal}
                       disabled={isSubmitting || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > availableBalance || parseFloat(withdrawalAmount) < networkFee}
                       className="w-full h-11 flex items-center justify-center px-4 py-2 bg-[#F88726] text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#F88726] hover:bg-[#ff9c44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                   >
                       {isSubmitting ? <Spinner /> : 'Next'}
                   </button>

                   {submitError && <p className="mt-3 text-sm text-red-600">{submitError}</p>}
                   {submitSuccess && <p className="mt-3 text-sm text-green-600">Withdrawal submitted successfully!</p>}
               </div>
            </section>

          </div>

          {/* Right Column: FAQ & Limits */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
              <h2 className="text-base font-semibold mb-4 text-gray-900">FAQ</h2>
              <ul className="space-y-3">
                {faqQuestions.map((faq) => (
                  <li key={faq.id}>
                    <a href={`/help/withdrawal/${faq.slug}`} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:text-gray-900 hover:underline">
                      {faq.question}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            
          </aside>

        </div>

        {/* Withdrawal History Section */}
        <section className="mt-12">
          <WithdrawalHistoryTable />
        </section>

      </main>
    </div>
    </>
  );
}

export default withdraw;
