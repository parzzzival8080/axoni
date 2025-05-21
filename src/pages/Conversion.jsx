import React, { useState, useEffect } from 'react';
import CurrencyModal from '../components/conversion/CurrencyModal';
import FromCurrencyModal from '../components/conversion/FromCurrencyModal';
import FAQAccordion from '../components/conversion/FAQAccordion';
import Coin from '../assets/img/BitCoin.png';
import ZeroTradingFees from '../assets/img/Convert_1-removebg-preview.png'
import NoSlippage from '../assets/img/convert-2-removebg-preview.png'
import MorePairs from '../assets/img/convert-3-removebg-preview.png'
import '../components/conversion/ConvertPage.css';
import TetherLogo from '../assets/coin/usdt.png';

const Conversion = () => {
    const [isFromModalOpen, setIsFromModalOpen] = useState(false);
    const [isToModalOpen, setIsToModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [conversionError, setConversionError] = useState(null);
    const [conversionSuccess, setConversionSuccess] = useState(false);
    
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

    const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
    const uid = localStorage.getItem('uid');

    useEffect(() => {
      fetchBtcPrice();
    }, []);

    const fetchBtcPrice = async () => {
      try {
        const response = await fetch(
          `https://apiv2.bhtokens.com/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=BTC`
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        if (data && data.price) {
          const btcPrice = parseFloat(data.price);
          setToCurrency(prev => ({ ...prev, price: btcPrice }));
        }
      } catch (error) {
        console.error('Failed to fetch BTC price:', error);
      }
    };

    useEffect(() => {
      fetchBalance();
    }, []);

    const fetchBalance = async () => {
      setBalance(prev => ({ ...prev, loading: true, error: null }));
      try {
        const url = `https://apiv2.bhtokens.com/api/v1/user-wallet/${uid}/1?apikey=${apiKey}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        setBalance({
          loading: false,
          error: null,
          spotWallet: data.usdtWallet?.spot_wallet || '0'
        });
      } catch (error) {
        console.error('Failed to load balance:', error);
        setBalance(prev => ({ ...prev, loading: false, error: 'Failed to load balance', spotWallet: '0' }));
      }
    };

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

    const handleFromCurrencySelect = (currency) => {
      setFromCurrency(currency);
      setFromAmount(''); 
      setToAmount('');
      setIsFromModalOpen(false);
      fetchBalance(); // Re-fetch balance for the new currency if needed, assuming USDT is the only 'from'
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
        const response = await fetch('https://apiv2.bhtokens.com/api/v1/coin-convert', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            uid: uid,
            apikey: apiKey,
            from_coin: fromCurrency.symbol,
            to_coin: toCurrency.symbol,
            from_amount: parseFloat(fromAmount),
            to_amount: parseFloat(toAmount) 
          }),
        });

        const responseData = await response.json();

        if (!response.ok || responseData.code !== "200") {
          throw new Error(responseData.msg || 'Conversion failed. Please try again.');
        }
        
        setConversionSuccess(true);
        setFromAmount('');
        setToAmount('');
        fetchBalance(); // Refresh balance after successful conversion

        setTimeout(() => {
          setConversionSuccess(false);
        }, 5000); 

      } catch (error) {
        setConversionError(error.message || 'An unexpected error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div className="conversion-container bg-gray-50 min-h-screen">
      <header className="conversion-header">
        <h1>Convert</h1>
        <p className="conversion-subtitle">Easily convert between different cryptocurrencies.</p>
      </header>

      <section className="conversion-form-section">
        <div className="conversion-card">
          {conversionSuccess && (
            <div className="success-message bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your conversion was processed.</span>
            </div>
          )}
          
          {conversionError && (
            <div className="error-message text-red-600 mb-4 text-center">
              {conversionError}
            </div>
          )}
          
          <div className="conversion-form-group">
            <label className='text-gray-700 mb-1 block'>From</label>
            <div className="conversion-input-group">
              <input 
                className='fromConvert w-full' 
                type="text" 
                placeholder="0.00001-0.54" 
                value={fromAmount}
                onChange={handleFromAmountChange}
              />
              <div className='conversion-coin-dropdown p-2' onClick={openFromModal}>
                <img 
                  className='conversion-coin-img mr-2' 
                  src={fromCurrency.icon || TetherLogo}
                  alt={fromCurrency.symbol} 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain' }}
                />
                <button className="conversion-currency-btn">
                  {fromCurrency.symbol}
                </button>
                <span className={`conversion-dropdown-icon ${isFromDropdownOpen ? 'open' : ''} ml-1 text-gray-600`}>▼</span>
              </div>
            </div>
          </div>
          
          <div className="conversion-balance-info">
              {balance.loading ? (
                <span>Loading balance...</span>
              ) : balance.error ? (
                <span className="text-red-500">{balance.error}</span>
              ) : (
                <>
                  Available: {formatNumber(balance.spotWallet)} {fromCurrency.symbol} <a href="#" className="text-blue-600 hover:underline">Deposit</a>
                </>
              )}
          </div>

          <div className="conversion-form-group">
            <label className='text-gray-700 mb-1 block'>To</label>
            <div className="conversion-input-group">
              <input 
                className='toConvert w-full' 
                type="text" 
                placeholder="0.92116-50,000" 
                value={toAmount}
                onChange={handleToAmountChange}
              />
              <div className='conversion-coin-dropdown p-2' onClick={openToModal}>
                <img 
                  className='conversion-coin-img mr-2' 
                  src={toCurrency.icon || Coin} 
                  alt={toCurrency.symbol} 
                  style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'contain' }}
                />
                <button className="conversion-currency-btn">
                  {toCurrency.symbol}
                </button>
                <div className={`conversion-dropdown-icon ${isToDropdownOpen ? 'open' : ''} ml-1 text-gray-600`}>▼</div>
              </div>
            </div>
          </div>

          {/* <div className="conversion-exchange-rate">
            1 {fromCurrency.symbol} ≈ {formatNumber(1/parseFloat(toCurrency.price), 8)} {toCurrency.symbol}
          </div> */}

          <button 
            className="conversion-preview-btn" 
            onClick={handleConvert}
            disabled={isSubmitting || !fromAmount || !toAmount || !!conversionError}
          >
            {isSubmitting ? 'Converting...' : 'Convert'}
          </button>
        </div>

        {/* <div className="conversion-history-link">
          <a href="#">Conversion history</a>
        </div> */}
      </section>

      <section className="conversion-benefits-section">
        <div className="conversion-benefit-item">
          <img src={ZeroTradingFees} alt="Zero trading fees" />
          <p>Zero trading fees</p>
        </div>
        <div className="conversion-benefit-item">
          <img src={NoSlippage} alt="No slippage" />
          <p>No slippage</p>
        </div>
        <div className="conversion-benefit-item">
          <img src={MorePairs} alt="More pairs" />
          <p>More pairs</p>
        </div>
      </section>

      <section className="conversion-faq-section">
        <FAQAccordion />
      </section>

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
    </div>
  )
}

export default Conversion;