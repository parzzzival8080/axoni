import React, { useState } from 'react';
import './LanguageModal.css';
import './okx-translate-spinner.css';

const languageMap = {
  English: 'en',
  Español: 'es',
  Français: 'fr',
  '简体中文': 'zh-CN', // Simplified Chinese
};

function injectGoogleTranslateScript() {
  console.log('[Translate] injectGoogleTranslateScript called');
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
      console.log('[Translate] googleTranslateElementInit CALLED');
      const targetDiv = document.getElementById('google_translate_element');
      if (!targetDiv) {
          console.error('[Translate] Target div "google_translate_element" NOT FOUND in DOM at init time.');
          return;
      }

      if (!window.googleTranslateElement) {
        console.log('[Translate] Attempting to create TranslateElement...');
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
            window.googleTranslateElement = new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,es,fr,zh-CN',
              autoDisplay: false,
            }, 'google_translate_element');
            console.log('[Translate] TranslateElement CREATED:', window.googleTranslateElement);
        } else {
            console.error('[Translate] window.google.translate.TranslateElement is NOT AVAILABLE at init time.');
        }
      } else {
        console.log('[Translate] googleTranslateElement already exists.');
      }
    };
  }
}

function setGoogleTranslateLang(langCode, callback) {
  console.log(`[Translate] setGoogleTranslateLang called with langCode: ${langCode}`);
  const trySetLang = (attempts = 0) => {
    console.log(`[Translate] trySetLang attempt: ${attempts}, looking for select.goog-te-combo`);
    const select = document.querySelector('select.goog-te-combo');
    if (select) {
      console.log('[Translate] select.goog-te-combo FOUND:', select);
      if (select.value === langCode) {
        // If the language is already selected, no change needed, just run callback
        if (typeof callback === 'function') callback();
        return;
      }
      console.log(`[Translate] Setting select.value to: ${langCode}`);
      select.value = langCode;
      // Ensure the change event is properly caught by Google's script
      if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent("change", false, true);
        select.dispatchEvent(evt);
      } else {
        select.fireEvent("onchange"); // For older IE
      }
      console.log('[Translate] Change event dispatched.');

      // The timeout is a practical way to wait for DOM changes by Google Translate.
      // It's hard to get a direct signal of completion.
      // Increased slightly for more complex pages or slower connections.
      setTimeout(() => {
        if (typeof callback === 'function') callback();
      }, 1800); 
    } else if (attempts < 15) {
      console.log('[Translate] select.goog-te-combo NOT FOUND. Retrying...');
      setTimeout(() => trySetLang(attempts + 1), 250); // Slightly longer interval
    } else {
      console.error('Google Translate select element not found after multiple attempts.');
      if (typeof callback === 'function') callback(); // Still call callback to stop loading spinner
    }
  };
  trySetLang();
}

// Handles language click and shows loading spinner
function handleLanguageClick(lang, setLoading) {
  console.log(`[Translate] handleLanguageClick called with lang: ${lang}`);
  const langCode = languageMap[lang];
  setLoading(true);
  injectGoogleTranslateScript();
  console.log('[Translate] injectGoogleTranslateScript finished in handleLanguageClick.');
  // Wait for the widget to load, then set language
  setTimeout(() => {
    setGoogleTranslateLang(langCode, () => setLoading(false));
  }, 500);
};

const LanguageModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('language');
  const [loading, setLoading] = useState(false);
  
  const onLanguageClick = (lang) => {
    // All languages, including English, will now go through handleLanguageClick
    // This allows Google Translate to revert the page to its original state
    // without a full page reload.
    handleLanguageClick(lang, setLoading);
  };

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

            <div className="language-modal-content">
              {Object.keys(languageMap).map((lang) => (
                <div
                  key={lang}
                  className="language-option"
                  onClick={() => onLanguageClick(lang)}
                >
                  {lang}
                </div>
              ))}
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