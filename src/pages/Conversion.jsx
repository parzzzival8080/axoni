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
    
    // Store the full currency objects, not just the names
    const [fromCurrency, setFromCurrency] = useState({
      id: 'usdt',
      symbol: 'USDT',
      name: 'Tether',
      icon: TetherLogo,
      price: 1 // Default price for USDT is 1
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

    // API key and user ID - these should ideally come from your auth context or environment variables
    const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';
    const uid = 
    localStorage.getItem('uid'); // Replace with actual user ID or get it from auth context

    // Fetch BTC price on initial load
    useEffect(() => {
      fetchBtcPrice();
    }, []);

    // Fetch BTC price from the API
    const fetchBtcPrice = async () => {
      try {
        const response = await fetch(
          `https://apiv2.bhtokens.com/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=BTC`
        );
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update toCurrency with the fetched price
        if (data && data.price) {
          const btcPrice = parseFloat(data.price);
          
          setToCurrency(prev => ({
            ...prev,
            price: btcPrice
          }));
        }
      } catch (error) {
        // Error handling could be improved here
      }
    };

    // Fetch balance when currency changes
    useEffect(() => {
      fetchBalance();
    }, [toCurrency]);

    const fetchBalance = async () => {
      if (!toCurrency.symbol) {
        return;
      }
      
      setBalance(prev => ({
        ...prev,
        loading: true,
        error: null
      }));
      
      try {
        const url = `https://apiv2.bhtokens.com/api/v1/coin-balance/${uid}?apikey=${apiKey}&symbol=${toCurrency.symbol}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        setBalance({
          loading: false,
          error: null,
          spotWallet: data.spot_wallet || '0'
        });
      } catch (error) {
        setBalance(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load balance information',
          spotWallet: '0'
        }));
      }
    };

    const handleFromAmountChange = (e) => {
      const amount = e.target.value;
      
      // Only allow numeric input with decimal point
      if (amount === '' || /^[0-9]*\.?[0-9]*$/.test(amount)) {
        setFromAmount(amount);
        
        // Calculate to amount based on toCurrency.price directly
        if (amount && toCurrency.price) {
          const calculatedAmount = parseFloat(amount) / parseFloat(toCurrency.price);
          setToAmount(calculatedAmount.toFixed(8));
        } else {
          setToAmount('');
        }
      }
    };

    const handleToAmountChange = (e) => {
      const amount = e.target.value;
      
      // Only allow numeric input with decimal point
      if (amount === '' || /^[0-9]*\.?[0-9]*$/.test(amount)) {
        setToAmount(amount);
        
        // Calculate from amount based on toCurrency.price directly
        if (amount && toCurrency.price) {
          const calculatedAmount = parseFloat(amount) * parseFloat(toCurrency.price);
          setFromAmount(calculatedAmount.toFixed(8));
        } else {
          setFromAmount('');
        }
      }
    };

    const openFromModal = () => {
      setIsFromModalOpen(true);
    };
  
    const closeFromModal = () => {
      setIsFromModalOpen(false);
    };
  
    const openToModal = () => {
      setIsToModalOpen(true);
    };
  
    const closeToModal = () => {
      setIsToModalOpen(false);
    };
  
    const handleFromCurrencySelect = (currency) => {
      // Store the entire currency object
      setFromCurrency(currency);
      closeFromModal();
      
      // Recalculate the conversion if there's an amount entered
      if (fromAmount && toCurrency.price) {
        const calculatedAmount = parseFloat(fromAmount) / parseFloat(toCurrency.price);
        setToAmount(calculatedAmount.toFixed(8));
      }
    };
  
    const handleToCurrencySelect = (currency) => {
      // Store the entire currency object
      setToCurrency(currency);
      closeToModal();
      
      // Recalculate the conversion if there's an amount entered
      if (fromAmount && currency.price) {
        const calculatedAmount = parseFloat(fromAmount) / parseFloat(currency.price);
        setToAmount(calculatedAmount.toFixed(8));
      }
    };

    // Format number with commas and fixed decimal places
    const formatNumber = (num, decimals = 8) => {
      if (!num) {
        return '0';
      }
      
      // If the number is very small, show all significant digits
      if (Math.abs(parseFloat(num)) < 0.000001 && parseFloat(num) !== 0) {
        return parseFloat(num).toFixed(8);
      }
      
      return parseFloat(num).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals
      });
    };
    
    // Handle conversion submission
    const handleConvert = async () => {
      // Validate inputs
      if (!fromAmount || !toAmount || parseFloat(fromAmount) <= 0) {
        setConversionError("Please enter a valid amount to convert");
        return;
      }
      
      // Reset states
      setIsSubmitting(true);
      setConversionError(null);
      setConversionSuccess(false);
      
      try {
        // Prepare payload
        const payload = {
          uid: uid,
          convert_from: fromCurrency.symbol,
          convert_to: toCurrency.symbol,
          amount: parseFloat(fromAmount),
          converted_amount: parseFloat(toAmount)
        };
        console.log(payload)
        
        // Make API call
        const response = await fetch(`https://apiv2.bhtokens.com/api/v1/conversions?apikey=${apiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });
        
          // Handle response
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `API error: ${response.status}`);
          }
        
        const data = await response.json();
        console.log('Conversion API response:', data);
        
        // Set success state
        setConversionSuccess(true);
        
        // Clear form
        setFromAmount('');
        setToAmount('');
        
        // Refresh balance
        fetchBalance();
        
      } catch (error) {
        setConversionError(error.message || "Failed to complete conversion. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    };
  
  return (
    <div className="convert-container">
    <header className="convert-header">
      <h1 className="convert-title">Convert</h1>
      <p className="convert-subtitle">
        Zero trading fees | Lower limits | Simple transactions
      </p>
    </header>

    <section className="convert-form">
      <div className="convert-card">
        {conversionSuccess && (
          <div className="success-message" style={{ color: 'green', marginBottom: '15px', textAlign: 'center' }}>
            Conversion completed successfully!
          </div>
        )}
        
        {conversionError && (
          <div className="error-message" style={{ color: 'red', marginBottom: '15px', textAlign: 'center' }}>
            {conversionError}
          </div>
        )}
        
        <div className="convert-form-group">
          <label>From</label>
          <div className="input-group">
            <input 
              className='fromConvert' 
              type="text" 
              placeholder="0.00001-0.54" 
              value={fromAmount}
              onChange={handleFromAmountChange}
            />
            <div className='coin-dropdown' onClick={openFromModal}>
              <img 
                className='coin-img' 
                src={fromCurrency.icon || TetherLogo}
                alt={fromCurrency.symbol} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }}
              />
              <button className="currency-btn">
                {fromCurrency.symbol}
              </button>
              <span className={`dropdown-icon ${isFromDropdownOpen ? 'open' : ''}`}>▼</span>
            </div>
        
          </div>
        </div>
        
        <div className="balance-info">
            {balance.loading ? (
              <span>Loading balance...</span>
            ) : balance.error ? (
              <span style={{ color: 'red' }}>{balance.error}</span>
            ) : (
              <>
                Available: {formatNumber(balance.spotWallet)} {fromCurrency.symbol} <a href="#">Deposit</a>
              </>
            )}
        </div>

        <div className="convert-form-group">
          <label>To</label>
          <div className="input-group">
            <input 
              className='toConvert' 
              type="text" 
              placeholder="0.92116-50,000" 
              value={toAmount}
              onChange={handleToAmountChange}
            />
            <div className='coin-dropdown' onClick={openToModal}>
              <img 
                className='coin-img' 
                src={toCurrency.icon || Coin} 
                alt={toCurrency.symbol} 
                style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'contain' }}
              />
              <button className="currency-btn">
                {toCurrency.symbol}
              </button>
              <div className={`dropdown-icon ${isToDropdownOpen ? 'open' : ''}`}>▼</div>
            </div>
          </div>
        </div>

        {/* <div className="exchange-rate">
          1 {fromCurrency.symbol} ≈ {formatNumber(1/parseFloat(toCurrency.price), 8)} {toCurrency.symbol}
        </div> */}

        <button 
          className="preview-btn" 
          onClick={handleConvert}
          disabled={isSubmitting || !fromAmount || !toAmount}
        >
          {isSubmitting ? 'Converting...' : 'Convert'}
        </button>
      </div>

      {/* <div className="conversion-history-link">
        <a href="#">Conversion history</a>
      </div> */}
    </section>

    <section className="convert-benefits">
      <div className="benefit-item">
        <img src={ZeroTradingFees} alt="Zero trading fees" />
        <p>Zero trading fees</p>
      </div>
      <div className="benefit-item">
        <img src={NoSlippage} alt="No slippage" />
        <p>No slippage</p>
      </div>
      <div className="benefit-item">
        <img src={MorePairs} alt="More pairs" />
        <p>More pairs</p>
      </div>
    </section>

    <section className="faq-section">
      <FAQAccordion />
    </section>

    {/* Use FromCurrencyModal for "From" field - only shows USDT */}
    {isFromModalOpen && (
      <FromCurrencyModal 
        onClose={closeFromModal} 
        onSelectCurrency={handleFromCurrencySelect}
      />
    )}

    {/* Currency Modal for "To" field - shows all currencies */}
    {isToModalOpen && (
      <CurrencyModal 
        onClose={closeToModal} 
        onSelectCurrency={handleToCurrencySelect}
      />
    )}
  </div>
  )
}

export default Conversion