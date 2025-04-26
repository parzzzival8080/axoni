import React, { useState } from 'react';
import CurrencyModal from '../components/conversion/CurrencyModal';
import FAQAccordion from '../components/conversion/FAQAccordion';
import Coin from '../assets/img/BitCoin.png';
import ZeroTradingFees from '../assets/img/Convert_1-removebg-preview.png'
import NoSlippage from '../assets/img/convert-2-removebg-preview.png'
import MorePairs from '../assets/img/convert-3-removebg-preview.png'
import '../components/conversion/ConvertPage.css';

const Conversion = () => {
    const [isFromModalOpen, setIsFromModalOpen] = useState(false);
    const [isToModalOpen, setIsToModalOpen] = useState(false);
    const [fromCurrency, setFromCurrency] = useState('BTC');
    const [toCurrency, setToCurrency] = useState('USDT');
    const [isFromDropdownOpen, setIsFromDropdownOpen] = useState(false);
const [isToDropdownOpen, setIsToDropdownOpen] = useState(false);

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
      setFromCurrency(currency);
      closeFromModal();
    };
  
    const handleToCurrencySelect = (currency) => {
      setToCurrency(currency);
      closeToModal();
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
        <div className="form-group">
          <label>From</label>
          <div className="input-group">
            <input type="text" placeholder="0.00001-0.54" />
            <img className='coin-img' src={Coin} alt="coin" />
              <button className="currency-btn" onClick={openFromModal}>
                {fromCurrency}
            </button>
            <span className={`dropdown-icon ${isFromDropdownOpen ? 'open' : ''}`}>▼</span>
          </div>
        </div>
        
        <div className="balance-info">
            Available: 0 {fromCurrency} <a href="#">Deposit</a>
            <div className="accounts">
              Trading account: 0 {fromCurrency} | Funding account: 0 {fromCurrency}
            </div>
        </div>

        <div className="form-group">
          <label>To</label>
          <div className="input-group">
            <input type="text" placeholder="0.92116-50,000" />
            <img className='coin-img' src={Coin} alt="coin" />
            <button className="currency-btn" onClick={openToModal}>
              {toCurrency}
            </button>
            <div className={`dropdown-icon ${isToDropdownOpen ? 'open' : ''}`}>▼</div>
          </div>
        </div>

        <div className="exchange-rate">
          Exchange rate: 1 {toCurrency} ≈ 0.00001072 {fromCurrency}
        </div>

        <button className="preview-btn">Preview</button>
      </div>

      <div className="conversion-history-link">
        <a href="#">Conversion history</a>
      </div>
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

    {/* Replace the static FAQ section with the dynamic FAQAccordion component */}
    <section className="faq-section">
      <FAQAccordion />
    </section>

    {/* Currency Modal for "From" field */}
    {isFromModalOpen && (
      <CurrencyModal 
        onClose={closeFromModal} 
        onSelectCurrency={handleFromCurrencySelect}
      />
    )}

    {/* Currency Modal for "To" field */}
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