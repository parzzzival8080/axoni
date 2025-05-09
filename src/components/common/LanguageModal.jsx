import React, { useState } from 'react';
import './LanguageModal.css';
import './okx-translate-spinner.css';

const languageMap = {
  'English': 'en',
  '简体中文': 'zh-CN',
  '繁體中文': 'zh-TW',
  'Tiếng Việt': 'vi',
  'Русский': 'ru',
  'Español (Latinoamérica)': 'es',
  'Bahasa Indonesia': 'id',
  'Français': 'fr',
  'Українська': 'uk',
  'العربية': 'ar',
};

function injectGoogleTranslateScript() {
  // Inject CSS to hide Google Translate banner and UI
  if (!window.googleTranslateStyleInjected) {
    const style = document.createElement('style');
    style.innerHTML = `
      body .goog-te-banner-frame.skiptranslate,
      body .goog-te-gadget-icon,
      body .goog-te-menu-value,
      body .goog-te-balloon-frame,
      body #goog-gt-tt,
      body .goog-te-banner-frame,
      body .goog-te-gadget-simple {
        display: none !important;
      }
      body { top: 0px !important; }
      html { margin-top: 0 !important; }
    `;
    document.head.appendChild(style);
    window.googleTranslateStyleInjected = true;
  }
  if (!window.googleTranslateScriptInjected) {
    const script = document.createElement('script');
    script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);
    window.googleTranslateScriptInjected = true;
  }
  if (!window.googleTranslateElementInit) {
    window.googleTranslateElementInit = function() {
      if (!window.googleTranslateElement) {
        window.googleTranslateElement = new window.google.translate.TranslateElement({
          pageLanguage: 'en',
          autoDisplay: false,
        }, 'google_translate_element');
      }
    };
  }
}

function setGoogleTranslateLang(langCode) {
  const select = document.querySelector('select.goog-te-combo');
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event('change'));
  }
}

// Handles language click and shows loading spinner
function handleLanguageClick(lang, setLoading) {
  const langCode = languageMap[lang];
  setLoading(true);
  injectGoogleTranslateScript();
  setTimeout(() => {
    setGoogleTranslateLang(langCode);
    // Wait for translation to finish, then hide loading
    setTimeout(() => setLoading(false), 1800);
  }, 1000);
};

const LanguageModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('language');
  const [loading, setLoading] = useState(false);
  
  const onLanguageClick = (lang) => handleLanguageClick(lang, setLoading);

  if (!isOpen) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose}>
      {loading && (
        <div className="okx-loading-spinner">
          <div className="okx-spinner-circle"></div>
          <div className="okx-spinner-text">Translating...</div>
        </div>
      )}
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
              <div className="language-option" onClick={() => onLanguageClick('English')}>
                English
              </div>
              <div className="language-option" onClick={() => onLanguageClick('简体中文')}>
                简体中文
              </div>
              <div className="language-option" onClick={() => onLanguageClick('繁體中文')}>
                繁體中文
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Tiếng Việt')}>
                Tiếng Việt
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Русский')}>
                Русский
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Español (Latinoamérica)')}>
                Español (Latinoamérica)
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Bahasa Indonesia')}>
                Bahasa Indonesia
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Français')}>
                Français
              </div>
              <div className="language-option" onClick={() => onLanguageClick('Українська')}>
                Українська
              </div>
              <div className="language-option" onClick={() => onLanguageClick('العربية')}>
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
      {/* Google Translate widget container (hidden) */}
      <div id="google_translate_element" style={{ display: 'none' }}></div>
    </div>
  );
};

export default LanguageModal;