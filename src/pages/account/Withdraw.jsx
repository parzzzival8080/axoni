import React, {useRef , useState, useEffect, useCallback, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChevronRight, faSearch, faChevronDown, faCopy, faCheck, faQuestionCircle, faInfoCircle, faTimes
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import WithdrawalHistoryTable from '../../components/account/WithdrawalHistoryTable';
import { validateAddress, getNetworkDescription } from '../../utils/addressValidation';

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

const ShieldCheckIcon = () => (
    <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
    </svg>
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

function withdraw() {

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
  const [isSendingOtp, setIsSendingOtp] = useState(false); // Loading state for OTP sending
  const [addressValidation, setAddressValidation] = useState({ isValid: true, error: null, warning: null }); // Address validation state

  // --- OTP State Variables ---
  const [showOtpStep, setShowOtpStep] = useState(false); // Controls whether to show OTP step
  const [otpCode, setOtpCode] = useState(''); // 6-digit OTP code
  const [otpError, setOtpError] = useState(null); // OTP verification error
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false); // Loading state for OTP verification
  const [otpTimer, setOtpTimer] = useState(0); // Countdown timer for resend OTP
  const [canResendOtp, setCanResendOtp] = useState(false); // Whether user can resend OTP

  // --- Refs ---
  const cryptoDropdownRef = useRef(null);
  const networkDropdownRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const addressBookDropdownRef = useRef(null); // Ref for address book dropdown/modal
  const otpInputRef = useRef(null); // Ref for OTP input focus

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

  // Add state for triggering history refresh
  const withdrawalHistoryRef = useRef();

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
        const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
        const apiUrl = `https://api.coinchi.co/api/v1/coin-transaction?apikey=${apiKey}&uid=${uid}&transaction_type=withdrawal`;
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

  // OTP Timer Effect
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(otpTimer - 1);
      }, 1000);
    } else if (otpTimer === 0 && showOtpStep) {
      setCanResendOtp(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [otpTimer, showOtpStep]);

  // Focus OTP input when OTP step is shown
  useEffect(() => {
    if (showOtpStep && otpInputRef.current) {
      otpInputRef.current.focus();
    }
  }, [showOtpStep]);

  // Validate address whenever address or network changes
  useEffect(() => {
    if (!withdrawalAddress.trim()) {
      setAddressValidation({ isValid: true, error: null, warning: null });
      return;
    }
    
    if (!selectedNetwork) {
      setAddressValidation({ isValid: true, error: null, warning: null });
      return;
    }
    
    const validation = validateAddress(withdrawalAddress, selectedNetwork.symbol || selectedNetwork.value);
    setAddressValidation(validation);
  }, [withdrawalAddress, selectedNetwork]);

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
    if (showOtpStep) return 4;
    if (selectedCryptoSymbol && selectedNetwork && withdrawalAddress && withdrawalAmount) return 3;
    if (selectedCryptoSymbol && selectedNetwork && withdrawalAddress) return 3; // Allow entering amount
    if (selectedCryptoSymbol) return 2;
    return 1;
  }, [selectedCryptoSymbol, selectedNetwork, withdrawalAddress, withdrawalAmount, showOtpStep]);

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
    setShowOtpStep(false); // Reset OTP step
    setOtpCode(''); // Reset OTP code
  }, []);

  const handleNetworkSelect = useCallback((network) => { // network is now the full network object
    setSelectedNetwork(network);
    setIsNetworkDropdownOpen(false);
    // Reset address validation when network changes
    setAddressValidation({ isValid: true, error: null, warning: null });
  }, []);

  const handleDestinationChange = useCallback((destination) => {
    setWithdrawalDestination(destination);
    setSelectedNetwork(null);
    setWithdrawalAddress('');
    setWithdrawalAmount('');
    setShowOtpStep(false); // Reset OTP step
    setOtpCode(''); // Reset OTP code
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

  // Handle proceeding to OTP step
  const handleProceedToOtp = useCallback(async () => {
    console.log('handleProceedToOtp called - starting validation');
    
    // Basic Validation
    if (!selectedCryptoSymbol || !selectedNetwork || !withdrawalAddress || !withdrawalAmount) {
      console.log('Validation failed: missing required fields');
      setSubmitError("Please complete all required fields.");
      return;
    }
    
    // Address validation
    if (!addressValidation.isValid || addressValidation.error) {
      console.log('Validation failed: invalid address');
      setSubmitError(addressValidation.error || "Please enter a valid address for the selected network.");
      return;
    }
    
    const amountNum = parseFloat(withdrawalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      console.log('Validation failed: invalid amount');
      setSubmitError("Please enter a valid withdrawal amount.");
      return;
    }
    if (amountNum < networkFee) {
      console.log('Validation failed: amount less than network fee');
      setSubmitError(`Withdrawal amount must be greater than the network fee (${networkFee} ${selectedCryptoSymbol}).`);
      return;
    }
    if (amountNum > availableBalance) {
      console.log('Validation failed: insufficient balance');
      setSubmitError("Insufficient balance.");
      return;
    }

    console.log('Validation passed, proceeding with OTP send');

    setIsSendingOtp(true); // Start loading state
    setSubmitError(null); // Clear previous errors

    try {
      const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
      const uid = localStorage.getItem('uid');
      if (!uid) {
        console.log('Error: UID not found in localStorage');
        throw new Error('User ID not found. Please log in again.');
      }

      console.log('Sending OTP request with UID:', uid);
      
      // Simplified API call - send everything in the request body
      const response = await axios.post(
        'https://api.coinchi.co/api/v1/send-otp',
        {
          uid: uid,
          apikey: apiKey
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OTP API Response:', response.data);

      // More lenient response handling - check for success or lack of explicit error
      if (response.data.error && response.data.status === 400) {
        let errorMessage = 'Failed to send verification code.';
        
        if (response.data.error === "Failed to send email.") {
          errorMessage = 'Failed to send verification code to your email. Please check your email address and try again.';
        } else if (response.data.data && response.data.data.Messages && response.data.data.Messages.length > 0) {
          const messageStatus = response.data.data.Messages[0].Status;
          if (messageStatus === 'error') {
            errorMessage = 'Email service error. Please contact support or try again later.';
          }
        } else {
          errorMessage = response.data.error;
        }
        
        throw new Error(errorMessage);
      }

      // If we get a response without explicit error, consider it successful
      console.log('OTP request completed, proceeding to OTP step');
      
      // Proceed to OTP step
    setSubmitSuccess(false);
    setShowOtpStep(true);
    setOtpTimer(60); // Start 60-second countdown for resend
    setCanResendOtp(false);
    setOtpError(null);
    setOtpCode('');
    
      console.log('OTP step displayed successfully');
    } catch (error) {
      console.error('Error sending OTP:', error);
      setSubmitError(error.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsSendingOtp(false); // Stop loading state
    }
  }, [
    selectedCryptoSymbol, selectedNetwork, withdrawalAddress, withdrawalAmount,
    availableBalance, networkFee, addressValidation
  ]);

  // Handle OTP input change (limit to 6 characters, allow letters and numbers)
  const handleOtpChange = useCallback((e) => {
    const value = e.target.value.replace(/[^a-zA-Z0-9]/g, ''); // Allow letters and numbers only
    if (value.length <= 6) {
      setOtpCode(value.toUpperCase()); // Convert to uppercase for consistency
      setOtpError(null); // Clear error when user types
    }
  }, []);

  // Handle OTP verification
  const handleVerifyOtp = useCallback(async () => {
    if (otpCode.length !== 6) {
      setOtpError('Please enter the complete 6-character verification code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);

    try {
      // TODO: Replace with actual OTP verification API call
      // For now, simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // TODO: Add actual API verification logic here
      // const response = await axios.post('your-otp-verify-endpoint', { otp: otpCode });
      
      // For demo purposes, accept any 6-character code
      console.log('Verifying OTP:', otpCode);
      
      // After successful OTP verification, proceed with withdrawal
      await handleSubmitWithdrawal();
      
      // Hide OTP step after successful withdrawal
      setShowOtpStep(false);
      
    } catch (error) {
      console.error('OTP verification error:', error);
      setOtpError('Invalid verification code. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [otpCode]);

  // Handle resending OTP
  const handleResendOtp = useCallback(async () => {
    if (!canResendOtp) return;

    setCanResendOtp(false);
    setOtpTimer(60); // Reset timer
    setOtpError(null);
    setOtpCode(''); // Clear current OTP

    try {
      const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
      const uid = localStorage.getItem('uid');
      if (!uid) {
        throw new Error('User ID not found');
      }

      console.log('Resending OTP request...');
      
      // Simplified API call for resend
      const response = await axios.post(
        'https://api.coinchi.co/api/v1/send-otp',
        {
          uid: uid,
          apikey: apiKey
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('OTP Resend API Response:', response.data);

      // More lenient response handling for resend
      if (response.data.error && response.data.status === 400) {
        let errorMessage = 'Failed to resend verification code.';
        
        if (response.data.error === "Failed to send email.") {
          errorMessage = 'Failed to resend verification code to your email. Please try again later.';
        } else {
          errorMessage = response.data.error;
        }
        
        throw new Error(errorMessage);
      }

      console.log('OTP resent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      setOtpError(error.message || 'Failed to resend verification code. Please try again.');
      setCanResendOtp(true);
    }
  }, [canResendOtp]);

  // Handle going back from OTP step
  const handleBackFromOtp = useCallback(() => {
    setShowOtpStep(false);
    setOtpCode('');
    setOtpError(null);
    setOtpTimer(0);
    setCanResendOtp(false);
  }, []);

  // Handle Withdrawal Submission (called after OTP verification)
  const handleSubmitWithdrawal = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    // Build new API URL for withdrawal submission
    const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
    const wallet_id = selectedCoinDetails?.balance?.id;
    const initial_amount = parseFloat(withdrawalAmount);
    const network_id = selectedNetwork?.id;
    const apiUrl = `https://api.coinchi.co/api/v1/submit-withdrawal?wallet_id=${wallet_id}&initial_amount=${initial_amount}&apikey=${apiKey}&network_id=${network_id}&otp=${otpCode}&wallet_address=${withdrawalAddress}`;

    // console.log("Submitting withdrawal with:", { wallet_id, initial_amount, network_id, apiKey, otp: otpCode });

    try {
      // Use POST as required by backend
      const response = await axios.post(
        apiUrl,
        {}, // Empty body as parameters are in URL
        { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
      );

      console.log('Withdrawal API Response:', response.data);

      if (
        response.data && (
          response.data.status === 'success' ||
          response.status === 200 ||
          (typeof response.data.message === 'string' && response.data.message.toLowerCase().includes('withdraw submitted')) ||
          (typeof response.data.message === 'string' && response.data.message.toLowerCase().includes('submitted')) ||
          (typeof response.data === 'string' && response.data.toLowerCase().includes('withdraw submitted')) ||
          (typeof response.data === 'string' && response.data.toLowerCase().includes('submitted'))
        )
      ) {
        setSubmitSuccess(true);
        setSubmitError(null);
        
        // Reset form state after successful withdrawal
        setTimeout(() => {
          setSelectedCryptoSymbol(null);
          setSelectedNetwork(null);
          setWithdrawalAddress('');
          setWithdrawalAmount('');
          setComment('');
          setShowOtpStep(false);
          setOtpCode('');
          setOtpError(null);
        }, 3000); // Reset after 3 seconds to allow user to see success message
        
        // Refresh withdrawal history table
        if (withdrawalHistoryRef.current) {
          withdrawalHistoryRef.current.refresh();
        }
      } else {
        setSubmitError(response.data.message || 'Withdrawal failed. Please try again.');
        setSubmitSuccess(false);
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      const message = error.response?.data?.message || 'An unexpected error occurred.';
      setSubmitError(message);
      setSubmitSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [
      selectedCryptoSymbol, selectedNetwork, withdrawalAddress, withdrawalAmount,
      comment, availableBalance, networkFee, selectedCoinDetails, otpCode
  ]);





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
              <div className={`${showOtpStep ? 'opacity-50 pointer-events-none' : ''}`}>
                <div className="relative" ref={cryptoDropdownRef}>
                   <button
                      onClick={() => setIsCryptoDropdownOpen(!isCryptoDropdownOpen)}
                      disabled={isLoadingCoins || showOtpStep}
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
             </div>
           </section>

           {/* Step 2: Set Destination */}
           <section>
             <div className={`flex items-center mb-4 ${activeStep >= 2 ? 'opacity-100' : 'opacity-50'}`}>
               <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${activeStep >= 2 ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>2</span>
               <span className={`font-medium ${activeStep >= 2 ? 'text-gray-900' : 'text-gray-500'}`}>Set destination</span>
             </div>
             <div className={`${activeStep >= 2 && !showOtpStep ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                 <div className="flex border-b border-gray-200 mb-6"> {/* Increased mb */}
                     <button
                         onClick={() => handleDestinationChange('on-chain')}
                         disabled={showOtpStep}
                         className={`py-2.5 px-4 text-sm font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-all after:duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                             withdrawalDestination === 'on-chain'
                                 ? 'text-gray-900 after:bg-gray-900 after:w-full' // Active tab style
                                 : 'text-gray-500 hover:text-gray-700 after:bg-gray-700 after:w-0 hover:after:w-full' // Inactive tab style
                         }`}
                     >
                         On-chain withdrawal
                     </button>
                     <button
                         onClick={() => handleDestinationChange('internal')}
                         disabled={showOtpStep}
                         className={`py-2.5 px-4 text-sm font-medium focus:outline-none relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:transition-all after:duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
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
                             disabled={!selectedCryptoSymbol || networkOptions.length === 0 || showOtpStep}
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
                           disabled={!selectedNetwork || showOtpStep}
                         >
                             Manage address book <ChevronRightIcon />
                         </button>
                     </div>
                     {selectedNetwork && (
                         <div className="mb-2 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                             <p className="text-xs text-gray-600">
                                 <FontAwesomeIcon icon={faInfoCircle} className="mr-2 text-gray-400" />
                                 {getNetworkDescription(selectedNetwork.symbol || selectedNetwork.value)}
                             </p>
                         </div>
                     )}
                      <div className="relative" ref={addressBookDropdownRef}>
                          <input
                             id="withdrawalAddress" type="text"
                             placeholder="Enter address or select from address book"
                             value={withdrawalAddress}
                             onChange={(e) => setWithdrawalAddress(e.target.value)}
                             disabled={!selectedNetwork || showOtpStep}
                             className={`flex items-center justify-between w-full h-12 px-3 bg-gray-100 border rounded-lg text-sm focus:outline-none focus:ring-1 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                                 addressValidation.error 
                                     ? 'border-red-200 focus:ring-red-100 focus:border-red-300 bg-red-50' 
                                     : addressValidation.warning 
                                     ? 'border-blue-200 focus:ring-blue-100 focus:border-blue-300 bg-blue-50'
                                     : withdrawalAddress && addressValidation.isValid && !addressValidation.error && !addressValidation.warning
                                     ? 'border-green-200 focus:ring-green-100 focus:border-green-300 bg-green-50'
                                     : 'border-gray-200 focus:ring-gray-100 focus:border-gray-300'
                             }`}
                          />
                          {/* Simple Chevron for visual cue, actual dropdown is separate for address book */}
                           {!withdrawalAddress && ( // Show chevron only if input is empty, implying selection
                               <button 
                                   onClick={() => setIsAddressBookOpen(!isAddressBookOpen)}
                                   className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                   disabled={!selectedNetwork || showOtpStep}
                               >
                                   <ChevronDownIcon />
                               </button>
                           )}
                           {withdrawalAddress && !showOtpStep && ( // Show clear button if address is entered
                              <button onClick={() => setWithdrawalAddress('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                                  <TimesIcon />
                              </button>
                          )}
                          {/* Address Book Dropdown */}
                          {isAddressBookOpen && !showOtpStep && (
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
                      {/* Address validation feedback */}
                      {withdrawalAddress && addressValidation.error && (
                          <div className="mt-2 flex items-start space-x-2">
                              <FontAwesomeIcon icon={faTimes} className="text-red-400 mt-0.5 text-xs flex-shrink-0" />
                              <p className="text-xs text-red-600 leading-relaxed">
                                  {addressValidation.error}
                              </p>
                          </div>
                      )}
                      {withdrawalAddress && addressValidation.warning && !addressValidation.error && (
                          <div className="mt-2 flex items-start space-x-2">
                              <FontAwesomeIcon icon={faQuestionCircle} className="text-blue-400 mt-0.5 text-xs flex-shrink-0" />
                              <p className="text-xs text-blue-600 leading-relaxed">
                                  {addressValidation.warning}
                              </p>
                          </div>
                      )}
                 </div>
             </div>
           </section>

           {/* Step 3: Set Withdrawal Amount */}
           <section>
              <div className={`flex items-center mb-4 ${activeStep >= 3 ? 'opacity-100' : 'opacity-50'}`}>
                <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${activeStep >= 3 ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-500'}`}>3</span>
                <span className={`font-medium ${activeStep >= 3 ? 'text-gray-900' : 'text-gray-500'}`}>Set withdrawal amount</span>
              </div>
              <div className={`${activeStep >= 3 && !showOtpStep ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <div className="mb-4">
                     <div className="relative">
                          <input
                             type="number"
                             placeholder={`Enter a minimum of ${networkFee > 0 ? networkFee : '...'}`}
                             value={withdrawalAmount}
                             onChange={(e) => setWithdrawalAmount(e.target.value)}
                             disabled={!withdrawalAddress || showOtpStep}
                             min={networkFee > 0 ? networkFee : 0}
                             step="any"
                             className="w-full h-12 px-3 pr-24 bg-gray-100 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-500">{selectedCryptoSymbol || '---'}</span>
                              <button
                                  onClick={handleMaxAmount}
                                  disabled={!withdrawalAddress || availableBalance <= 0 || showOtpStep}
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
                                  disabled={!withdrawalAddress || showOtpStep}
                                  className="text-black hover:text-gray-700 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  {selectedAccount} ({accountOptions.length}) <ChevronDownIcon />
                              </button>
                              {isAccountDropdownOpen && !showOtpStep && (
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

                  {!showOtpStep && (
                    <button
                        onClick={handleProceedToOtp}
                        disabled={isSubmitting || isSendingOtp || !withdrawalAmount || parseFloat(withdrawalAmount) <= 0 || parseFloat(withdrawalAmount) > availableBalance || parseFloat(withdrawalAmount) < networkFee || !withdrawalAddress || !addressValidation.isValid || addressValidation.error}
                        className="w-full h-11 flex items-center justify-center px-4 py-2 bg-[#014EB2] text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014EB2] hover:bg-[#ff9c44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {(isSubmitting || isSendingOtp) ? <Spinner /> : 'Next'}
                    </button>
                  )}

                  {submitError && !showOtpStep && (
                    <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}
                  {submitSuccess && !showOtpStep && (
                    <div className="mt-3 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-green-800">Withdrawal Submitted Successfully!</h3>
                          <p className="mt-1 text-sm text-green-700">Your withdrawal has been submitted and is being processed. You can track its progress in the withdrawal history below.</p>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
           </section>

           {/* Step 4: OTP Verification */}
           {showOtpStep && (
             <section>
               <div className="flex items-center mb-4">
                 <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 bg-gray-900 text-white">4</span>
                 <span className="font-medium text-gray-900">Verify your withdrawal</span>
               </div>
               
               <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                 <div className="flex items-start space-x-3">
                   <ShieldCheckIcon />
                   <div className="flex-1">
                     <h3 className="text-sm font-medium text-blue-900 mb-2">Security Verification Required</h3>
                     <p className="text-sm text-blue-700 mb-4">
                       For your security, we've sent a 6-character verification code to your registered email address. 
                       Please enter the code below to complete your withdrawal.
                     </p>
                     
                     <div className="space-y-4">
                       <div>
                         <label htmlFor="otpInput" className="block text-sm font-medium text-blue-900 mb-2">
                           Verification Code
                         </label>
                         <input
                           ref={otpInputRef}
                           id="otpInput"
                           type="text"
                           placeholder="Enter 6-character code"
                           value={otpCode}
                           onChange={handleOtpChange}
                           maxLength="6"
                           className="w-full h-12 px-4 text-center text-lg font-mono tracking-widest bg-white border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                         />
                         {otpError && (
                           <p className="mt-2 text-sm text-red-600">{otpError}</p>
                         )}
                       </div>

                       <div className="flex items-center justify-between text-sm">
                         <div className="text-blue-700">
                           {otpTimer > 0 ? (
                             <span>Resend code in {otpTimer}s</span>
                           ) : (
                             <button
                               onClick={handleResendOtp}
                               disabled={!canResendOtp}
                               className="text-blue-600 hover:text-blue-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                             >
                               Resend verification code
                             </button>
                           )}
                         </div>
                       </div>

                       <div className="flex space-x-3">
                         <button
                           onClick={handleBackFromOtp}
                           disabled={isVerifyingOtp}
                           className="flex-1 h-11 px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                           Back
                         </button>
                         <button
                           onClick={handleVerifyOtp}
                           disabled={isVerifyingOtp || otpCode.length !== 6}
                           className="flex-1 h-11 flex items-center justify-center px-4 py-2 bg-[#014EB2] text-white text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#014EB2] hover:bg-[#ff9c44] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                         >
                           {isVerifyingOtp ? <Spinner /> : 'Verify & Complete Withdrawal'}
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>

               {/* Withdrawal Summary in OTP Step */}
               <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                 <h4 className="text-sm font-medium text-gray-900 mb-3">Withdrawal Summary</h4>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-500">Cryptocurrency</span>
                     <span className="font-medium">{selectedCryptoSymbol}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Network</span>
                     <span>{selectedNetwork?.label}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Destination</span>
                     <span className="font-mono text-xs break-all">{withdrawalAddress}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Amount</span>
                     <span className="font-medium">{withdrawalAmount} {selectedCryptoSymbol}</span>
                   </div>
                   <div className="flex justify-between">
                     <span className="text-gray-500">Network Fee</span>
                     <span>{networkFee} {selectedCryptoSymbol}</span>
                   </div>
                   <div className="flex justify-between border-t border-gray-300 pt-2 font-medium">
                     <span>You will receive</span>
                     <span>{amountReceived.toFixed(4)} {selectedCryptoSymbol}</span>
                   </div>
                 </div>
               </div>
             </section>
           )}

          {/* Right Column: FAQ & Limits */}
          
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
       {!showOtpStep && (
         <section className="mt-12">
           <WithdrawalHistoryTable ref={withdrawalHistoryRef} />
         </section>
       )}

     </main>
   </div>
   </>
 );
}

export default withdraw;