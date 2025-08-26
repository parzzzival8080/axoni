import React, { useState, useEffect, useCallback, useMemo } from 'react';
import CurrencyModal from '../components/conversion/CurrencyModal';
import FromCurrencyModal from '../components/conversion/FromCurrencyModal';
import FAQAccordion from '../components/conversion/FAQAccordion';
import ConversionWalkthroughTrigger from '../components/conversion/ConversionWalkthroughTrigger';
import Coin from '../assets/img/BitCoin.png';
import ZeroTradingFees from '../assets/img/Convert_1-removebg-preview.png'
import NoSlippage from '../assets/img/convert-2-removebg-preview.png'
import MorePairs from '../assets/img/convert-3-removebg-preview.png'
import TetherLogo from '../assets/coin/usdt.png';

const Conversion = () => {
    const [isFromModalOpen, setIsFromModalOpen] = useState(false);
    const [isToModalOpen, setIsToModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conversionError, setConversionError] = useState(null);
    const [conversionSuccess, setConversionSuccess] = useState(false);
    const [conversionHistory, setConversionHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [historyError, setHistoryError] = useState(null);
    const [openFAQIndex, setOpenFAQIndex] = useState(null);
    
    const [fromCurrency, setFromCurrency] = useState({
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether',
      icon: TetherLogo,
      price: 1 
    });
    
    const [toCurrency, setToCurrency] = useState({
      id: 'btc',
      symbol: 'BTC',
      name: 'Bitcoin',
      icon: Coin,
      price: 0
    });
    
    const [fromAmount, setFromAmount] = useState('');
    const [toAmount, setToAmount] = useState('');
    const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
    const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);
    const [balance, setBalance] = useState({
      loading: false,
      error: null,
      spotWallet: '0'
    });

    const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
    const uid = localStorage.getItem('uid');
    const isAuthenticated = !!uid;

    useEffect(() => {
      if (isAuthenticated) {
        fetchBtcPrice();
      } else {
        // Use a fallback price for non-authenticated users
        setToCurrency(prev => ({ ...prev, price: 65000 })); // Example fallback price
      }
    }, [isAuthenticated]);

    const fetchBtcPrice = useCallback(async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(
          `https://api.fluxcoin.tech/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=BTC`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        if (data && data.price) {
          const btcPrice = parseFloat(data.price);
          setToCurrency(prev => ({ ...prev, price: btcPrice }));
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('BTC price fetch timeout');
        } else {
          console.error('Failed to fetch BTC price:', error);
        }
        // Use a fallback price if fetch fails
        setToCurrency(prev => prev.price === 0 ? { ...prev, price: 65000 } : prev);
      }
    }, [uid, apiKey]);

    useEffect(() => {
      if (isAuthenticated) {
        fetchBalance();
      }
    }, [isAuthenticated]);

    const fetchBalance = useCallback(async () => {
      if (!isAuthenticated) return;
      
      setBalance(prev => ({ ...prev, loading: true, error: null }));
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const url = `https://api.fluxcoin.tech/api/v1/user-wallet/${uid}/1?apikey=${apiKey}`;
        const response = await fetch(url, { signal: controller.signal });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        setBalance({
          loading: false,
          error: null,
          spotWallet: data.usdtWallet?.spot_wallet || '0'
        });
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error('Balance fetch timeout');
        } else {
          console.error('Failed to load balance:', error);
        }
        setBalance(prev => ({ ...prev, loading: false, error: 'Failed to load balance', spotWallet: '0' }));
      }
    }, [isAuthenticated, uid, apiKey]);

    const handleFromAmountChange = (e) => {
      const amount = e.target.value;
      if (amount === '' || /^[0-9]*\.?[0-9]*$/.test(amount)) {
        setFromAmount(amount);
        if (parseFloat(amount) > parseFloat(balance.spotWallet)) {
          setConversionError('Amount exceeds available balance.');
        } else {
          setConversionError(null);
        }
        if (fromCurrency.price && toCurrency.price && amount) {
          const calculatedToAmount = (parseFloat(amount) * fromCurrency.price) / toCurrency.price;
          setToAmount(formatNumber(calculatedToAmount));
        } else {
          setToAmount('');
        }
      }
    };

    const handleToAmountChange = (e) => {
      const amount = e.target.value;
      if (amount === '' || /^[0-9]*\.?[0-9]*$/.test(amount)) {
        setToAmount(amount);
        if (fromCurrency.price && toCurrency.price && amount) {
          const calculatedFromAmount = (parseFloat(amount) * toCurrency.price) / fromCurrency.price;
          setFromAmount(formatNumber(calculatedFromAmount));
          if (parseFloat(calculatedFromAmount) > parseFloat(balance.spotWallet)) {
            setConversionError('Required amount exceeds available balance.');
          } else {
            setConversionError(null);
          }
        } else {
          setFromAmount('');
        }
      }
    };

    const openFromModal = () => setIsFromModalOpen(true);
    const closeFromModal = () => setIsFromModalOpen(false);
    const openToModal = () => setIsToModalOpen(true);
    const closeToModal = () => setIsToModalOpen(false);
    
    const openHistoryModal = () => {
      setIsHistoryModalOpen(true);
      fetchConversionHistory();
    };
    
    const closeHistoryModal = () => {
      setIsHistoryModalOpen(false);
    };
    
    const fetchConversionHistory = async () => {
      if (!isAuthenticated) return;
      
      setHistoryLoading(true);
      setHistoryError(null);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        // Use the same API endpoint but with GET method to fetch history
        const url = `https://api.fluxcoin.tech/api/v1/conversions?apikey=${apiKey}&uid=${uid}`;
        
        console.log('Fetching conversion history:', url);
        
        const response = await fetch(url, {
          method: 'GET',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch conversion history');
        }
        
        const data = await response.json();
        console.log('Conversion history response:', data);
        
        if (Array.isArray(data)) {
          // Sort by ID in descending order (newest first)
          const sortedHistory = [...data].sort((a, b) => b.id - a.id);
          setConversionHistory(sortedHistory);
        } else {
          setConversionHistory([]);
        }
      } catch (error) {
        console.error('Error fetching conversion history:', error);
        setHistoryError(error.message || 'Failed to load conversion history');
      } finally {
        setHistoryLoading(false);
      }
    };

    const handleFromCurrencySelect = (currency) => {
      setFromCurrency(currency);
      setIsFromModalOpen(false);
    };

    const handleToCurrencySelect = (currency) => {
      setToCurrency(currency);
      setFromAmount('');
      setToAmount('');
      setIsToModalOpen(false);
    };

    const formatNumber = (num, decimals = 8) => {
      const number = parseFloat(num);
      if (isNaN(number)) return '';
      return number.toFixed(decimals).replace(/\.?0+$/, ""); // Remove trailing zeros after decimal
    };

    const handleConvert = async () => {
      if (!isAuthenticated) {
        window.location.href = '/login';
        return;
      }
      
      if (parseFloat(fromAmount) > parseFloat(balance.spotWallet)) {
        setConversionError('Insufficient balance to make this conversion.');
        return;
      }
      if (!fromAmount || !toAmount || parseFloat(fromAmount) <= 0) {
        setConversionError('Please enter a valid amount to convert.');
        return;
      }

      setIsSubmitting(true);
      setConversionError(null);
      setConversionSuccess(false);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for conversion
        
        // Use the URL format from the image but with POST method
        const url = 'https://api.fluxcoin.tech/api/v1/conversions';
        
        const params = {
          apikey: apiKey,
          uid: uid,
          convert_from: fromCurrency.symbol,
          convert_to: toCurrency.symbol,
          amount: parseFloat(fromAmount),
          converted_amount: parseFloat(toAmount)
        };
        
        console.log('Converting with params:', params);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        // The API returns "conversion submitted" when successful
        const responseData = await response.json();
        console.log('Conversion response:', responseData);
        
        // Check if we have a valid response
        // if (!response.status == 'error') {
        //   throw new Error('Conversion failed. Please try again.');
        // }
        // else
        // {

        // }
        
        // Check if the response contains the success message
        if (responseData.message === "Conversion Submitted" || 
            (responseData.message && responseData.message.includes("submitted")) ||
            (responseData.msg && responseData.msg.includes("submitted"))) {
          
          // Calculate the new balance (subtract the converted amount from current balance)
          const currentBalance = parseFloat(balance.spotWallet) || 0;
          const convertedAmount = parseFloat(fromAmount) || 0;
          const newBalance = Math.max(0, currentBalance - convertedAmount);
          
          // Update the balance immediately in the UI
          setBalance(prev => ({
            ...prev,
            spotWallet: newBalance.toString()
          }));
          
          // Show success message
          setConversionSuccess(true);
          setFromAmount('');
          setToAmount('');
          
          // Also fetch the latest balance from the server
          fetchBalance();
          
          setTimeout(() => {
            setConversionSuccess(false);
          }, 5000);
        } else {
          throw new Error('Conversion failed. Unexpected response format.');
        }

      } catch (error) {
        if (error.name === 'AbortError') {
          setConversionError('Conversion request timed out. Please try again.');
        } else {
          setConversionError(error.message || 'An unexpected error occurred.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center py-12 bg-black">
        <h1 className="text-5xl font-bold mb-3 text-[#F88726]">Convert</h1>
        <div className="flex items-center space-x-3 text-gray-500 text-sm">
          <span>Zero trading fees</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span>Lower limits</span>
          <span className="w-1 h-1 rounded-full bg-gray-500"></span>
          <span>Simple transactions</span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-xl mx-auto px-4 mb-16">
        {/* Success message */}
        {conversionSuccess && (
          <div className="bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg mb-4" role="alert">
            <span className="font-medium">Success!</span> Your conversion was processed.
          </div>
        )}
        
        {/* Error message */}
        {conversionError && (
          <div className="bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg mb-4">
            {conversionError}
          </div>
        )}
        
        {/* From section */}
        <div className="bg-gray-900 rounded-lg p-4 mb-4">
          <label className="block text-sm text-gray-400 mb-2">From</label>
          <div className="flex items-center">
            <input 
              className="w-full bg-transparent text-white text-xl font-medium focus:outline-none" 
              type="text" 
              placeholder="0.00001-0.6" 
              value={fromAmount}
              onChange={handleFromAmountChange}
            />
            <div 
              className="flex items-center space-x-1 cursor-pointer bg-gray-800 rounded-lg px-3 py-2"
              onClick={openFromModal}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src={fromCurrency.icon || TetherLogo}
                  alt={fromCurrency.symbol} 
                />
              </div>
              <span className="font-medium">{fromCurrency.symbol}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Balance info */}
          <div className="mt-2 text-xs text-gray-500">
            {balance.loading ? (
              <span>Loading balance...</span>
            ) : balance.error ? (
              <span className="text-red-400">{balance.error}</span>
            ) : (
              <div className="flex items-center">
                <span>Available: {formatNumber(balance.spotWallet)} {fromCurrency.symbol}</span>
                <button className="ml-2 text-[#F88726] hover:underline">Deposit</button>
              </div>
            )}
          </div>
        </div>
        
        {/* To section */}
        <div className="bg-gray-900 rounded-lg p-4 mb-6">
          <label className="block text-sm text-gray-400 mb-2">To</label>
          <div className="flex items-center">
            <input 
              className="w-full bg-transparent text-white text-xl font-medium focus:outline-none" 
              type="text" 
              placeholder="0.92116-50,000" 
              value={toAmount}
              onChange={handleToAmountChange}
            />
            <div 
              className="flex items-center space-x-1 cursor-pointer bg-gray-800 rounded-lg px-3 py-2"
              onClick={openToModal}
            >
              <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                <img 
                  className="w-full h-full object-cover" 
                  src={toCurrency.icon || Coin} 
                  alt={toCurrency.symbol} 
                />
              </div>
              <span className="font-medium">{toCurrency.symbol}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Exchange rate */}
          <div className="mt-2 text-xs text-gray-500">
            Exchange rate: 1 USDT = {formatNumber(0.000022)} BTC
          </div>
        </div>
        
        {/* Convert button */}
        <button 
          className={`w-full py-3.5 px-6 rounded-full font-medium text-white transition-colors duration-200 ${isSubmitting || (!isAuthenticated ? '' : (!fromAmount || !toAmount || !!conversionError)) ? 'bg-gray-700 cursor-not-allowed' : 'bg-[#F88726] hover:bg-[#e56700]'}`}
          onClick={handleConvert}
          disabled={isSubmitting || (!isAuthenticated ? false : (!fromAmount || !toAmount || !!conversionError))}
        >
          {isSubmitting ? 'Converting...' : (!isAuthenticated ? 'Login to Convert' : 'Convert')}
        </button>
        
        {/* Conversion history link */}
        {/* <div className="conversion-history-section mt-4 text-center">
          <button 
            className="flex items-center justify-center mx-auto text-sm text-gray-400 hover:text-gray-300"
            onClick={openHistoryModal}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Conversion history
          </button>
        </div> */}
      </div>
      
      {/* Features section */}
      <div className="max-w-4xl mx-auto px-4 mb-16">
        <div className="flex flex-wrap justify-center gap-16 md:gap-24">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F88726]/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F88726]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">Zero trading fees</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F88726]/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F88726]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-sm font-medium">No slippage</span>
          </div>
          
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-[#F88726]/10 flex items-center justify-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#F88726]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium">More pairs</span>
          </div>
        </div>
      </div>
      
      
      {/* FAQ section */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-center mb-8">FAQ</h2>
        
        <div className="space-y-4">
          {/* FAQ items */}
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 0 ? null : 0)}
            >
              <span className="text-base font-medium">How do I convert crypto on FLUX?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 0 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 0 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>To convert crypto on Flux, navigate to the 'Convert' page. Select the cryptocurrency you want to convert from (e.g., USDT) and the cryptocurrency you want to convert to (e.g., BTC). Enter the amount you wish to convert, review the exchange rate, and confirm the transaction. Conversion on Flux is designed to be quick and straightforward, with zero trading fees.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 1 ? null : 1)}
            >
              <span className="text-base font-medium">Which crypto can I convert on FLUX?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 1 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 1 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>Flux supports a wide range of cryptocurrencies for conversion, including major assets like BTC, ETH, USDT, and many altcoins. Our platform continuously updates its supported list, so you can check the 'From' and 'To' currency selectors on the Convert page for the most current options available for your region.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 2 ? null : 2)}
            >
              <span className="text-base font-medium">How is crypto conversion different from trading?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 2 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 2 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>Crypto conversion on Flux offers a simpler, more direct way to exchange one cryptocurrency for another, typically at a fixed rate with zero trading fees and no slippage. It's ideal for users who want to quickly swap assets without engaging in complex order book trading. Trading, on the other hand, involves buying and selling assets on a spot or futures market, where prices fluctuate based on supply and demand, and may involve various order types and fees.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 3 ? null : 3)}
            >
              <span className="text-base font-medium">What are the conditions of crypto converter?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 3 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 3 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>The Flux crypto converter is designed for ease of use. Key conditions include: zero trading fees, no slippage (you get exactly the quoted amount), and lower limits for smaller transactions. While there are minimum and maximum conversion amounts per transaction, these are clearly displayed on the conversion interface. Ensure you have sufficient balance in your spot wallet for the conversion.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 4 ? null : 4)}
            >
              <span className="text-base font-medium">Where can I find my converted crypto?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 4 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 4 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>After a successful conversion on Flux, the converted cryptocurrency will be immediately credited to your Spot Wallet. You can view your updated balances and transaction history in the 'Assets' section of your account. The conversion history also provides a detailed record of all your past conversions.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 5 ? null : 5)}
            >
              <span className="text-base font-medium">How do I check my conversion orders?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 5 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 5 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>You can check your conversion orders by clicking on the 'Conversion history' link located below the 'Convert' button on the main Convert page. This will open a modal displaying a list of your past conversions, including the date, cryptocurrencies involved, amount, and status.</p>
              </div>
            )}
          </div>
          
          <div className="border-b border-gray-800 pb-4">
            <button 
              className="flex justify-between items-center w-full text-left py-2"
              onClick={() => setOpenFAQIndex(openFAQIndex === 6 ? null : 6)}
            >
              <span className="text-base font-medium">How can I deposit/withdraw the crypto converted?</span>
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 transform ${openFAQIndex === 6 ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openFAQIndex === 6 && (
              <div className="pt-2 pb-4 text-gray-300 text-sm">
                <p>Once your crypto is converted and credited to your Spot Wallet, you can easily deposit or withdraw it from the 'Assets' section of your Flux account. Navigate to 'Assets', select the cryptocurrency, and choose between 'Deposit' or 'Withdraw' to proceed with your transaction. Follow the on-screen instructions, ensuring all details are correct for secure transfers.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isFromModalOpen && (
        <FromCurrencyModal 
          onClose={closeFromModal} 
          onSelectCurrency={handleFromCurrencySelect}
        />
      )}

      {isToModalOpen && (
        <CurrencyModal 
          onClose={closeToModal} 
          onSelectCurrency={handleToCurrencySelect}
        />
      )}
      
      {/* Conversion History Modal */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
          <div className="relative bg-[#1A1A1A] rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
              <h3 className="text-xl font-semibold text-white">Conversion History</h3>
              <button 
                onClick={closeHistoryModal}
                className="text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
              {historyLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#F88726]"></div>
                </div>
              ) : historyError ? (
                <div className="text-red-500 text-center py-6">{historyError}</div>
              ) : conversionHistory.length === 0 ? (
                <div className="text-gray-400 text-center py-6">No conversion history found</div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-2 text-sm text-gray-400 border-b border-gray-800 pb-2">
                    <div>Date</div>
                    <div>From</div>
                    <div>To</div>
                    <div>Amount</div>
                    <div>Status</div>
                  </div>
                  
                  {conversionHistory.map((item) => (
                    <div key={item.id} className="grid grid-cols-5 gap-2 py-3 border-b border-gray-800 text-sm">
                      <div className="text-gray-300">
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </div>
                      <div className="text-white font-medium">{item.convert_from}</div>
                      <div className="text-white font-medium">{item.convert_to}</div>
                      <div className="text-white font-medium">
                        {parseFloat(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900 text-green-300">
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Modal Footer */}
            <div className="border-t border-gray-800 p-4 flex justify-end">
              <button
                onClick={closeHistoryModal}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Walkthrough Trigger */}
      <ConversionWalkthroughTrigger />
    </div>
  )
}

export default Conversion;