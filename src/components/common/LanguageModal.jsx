import React, { useState } from 'react';
import './LanguageModal.css';

const LanguageModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('language');
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      {/* Stop propagation to prevent closing when clicking inside the modal */}
      <div className="language-modal" onClick={(e) => e.stopPropagation()}>
        <div className="language-modal-header">
          <div className="language-modal-tabs">
            <div 
              className={`language-modal-tab ${activeTab === 'language' ? 'active' : ''}`}
              onClick={() => setActiveTab('language')}
            >
              Language
            </div>
            <div 
              className={`language-modal-tab ${activeTab === 'currency' ? 'active' : ''}`}
              onClick={() => setActiveTab('currency')}
            >
              Currency
            </div>
          </div>
          <button className="language-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {activeTab === 'language' && (
          <>
            <div className="language-modal-info">
              <i className="fas fa-info-circle"></i>
              <p>Your language selection applies to OKX emails, SMS, in-app notifications and all devices you're logged in to</p>
            </div>
            
            <div className="language-modal-content">
              <div className="language-option selected">
                English
              </div>
              <div className="language-option">
                简体中文
              </div>
              <div className="language-option">
                繁體中文
              </div>
              <div className="language-option">
                Tiếng Việt
              </div>
              <div className="language-option">
                Русский
              </div>
              <div className="language-option">
                Español (Latinoamérica)
              </div>
              <div className="language-option">
                Bahasa Indonesia
              </div>
              <div className="language-option">
                Français
              </div>
              <div className="language-option">
                Українська
              </div>
              <div className="language-option">
                العربية
              </div>
            </div>
          </>
        )}
        
        {activeTab === 'currency' && (
          <div className="language-modal-content">
            <div className="language-option selected">
              USD
            </div>
            <div className="language-option">
              EUR
            </div>
            <div className="language-option">
              GBP
            </div>
            <div className="language-option">
              JPY
            </div>
            <div className="language-option">
              KRW
            </div>
            <div className="language-option">
              CNY
            </div>
            <div className="language-option">
              HKD
            </div>
            <div className="language-option">
              AUD
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LanguageModal;