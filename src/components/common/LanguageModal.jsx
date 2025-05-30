import React, { useState, useEffect } from 'react';
import './LanguageModal.css';
import './okx-translate-spinner.css';

const LanguageModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('language');

  useEffect(() => {
    // Inject CSS fixes for ConveyThis flags
    if (!document.getElementById('conveythis-flag-fixes')) {
      const style = document.createElement('style');
      style.id = 'conveythis-flag-fixes';
      style.innerHTML = `
        /* Fix ConveyThis flag display issues */
        .conveythis-flag {
          background-color: transparent !important;
          display: inline-block !important;
          width: 24px !important;
          height: 18px !important;
          background-size: cover !important;
          background-repeat: no-repeat !important;
          background-position: center !important;
          border: 1px solid #ddd !important;
          border-radius: 2px !important;
        }
        
        /* ConveyThis widget styling inside modal */
        #conveythis_widget {
          background: transparent !important;
        }
        
        #conveythis_widget .conveythis-language-item {
          padding: 8px 12px !important;
          margin: 4px 0 !important;
          border-radius: 6px !important;
          cursor: pointer !important;
          transition: background-color 0.2s ease !important;
          display: flex !important;
          align-items: center !important;
          gap: 8px !important;
        }
        
        #conveythis_widget .conveythis-language-item:hover {
          background-color: #f5f5f5 !important;
        }
        
        #conveythis_widget .conveythis-language-text {
          font-size: 14px !important;
          color: #333 !important;
        }
        
        /* Ensure flag images load properly */
        img[src*="conveythis"] {
          display: inline-block !important;
          max-width: 24px !important;
          max-height: 18px !important;
        }
        
        /* Fix for black flag rectangles */
        .conveythis-flag-bg,
        [class*="flag-"],
        [class*="country-"] {
          background-color: transparent !important;
          background-image: url('data:image/svg+xml;base64,') !important;
        }
        
        /* ConveyThis specific flag fixes */
        .ct-language-flag {
          background-color: transparent !important;
          border: 1px solid #e0e0e0 !important;
          border-radius: 2px !important;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    const widgetElement = document.getElementById('conveythis_widget');
    if (widgetElement) {
      if (isOpen && activeTab === 'language') {
        // Show the widget inside the modal
        widgetElement.style.display = 'block';
        widgetElement.style.position = 'static';
        widgetElement.style.visibility = 'visible';
        widgetElement.style.left = 'auto';
        widgetElement.style.top = 'auto';
        widgetElement.style.width = 'auto';
        widgetElement.style.height = 'auto';
        
        // Move the widget to the modal content area
        const modalContent = document.getElementById('language-modal-content');
        if (modalContent && !modalContent.contains(widgetElement)) {
          modalContent.appendChild(widgetElement);
        }
        
        // Force refresh ConveyThis after moving
        setTimeout(() => {
          if (window.ConveyThis && typeof window.ConveyThis.refresh === 'function') {
            window.ConveyThis.refresh();
          }
        }, 100);
        
      } else {
        // Hide the widget when modal is closed or not on language tab
        widgetElement.style.display = 'none';
        widgetElement.style.position = 'absolute';
        widgetElement.style.visibility = 'hidden';
        widgetElement.style.left = '-9999px';
        widgetElement.style.top = '-9999px';
        widgetElement.style.width = '0px';
        widgetElement.style.height = '0px';
        
        // Move it back to body if it's in the modal
        if (document.body && !document.body.contains(widgetElement)) {
          const modalContent = document.getElementById('language-modal-content');
          if (modalContent && modalContent.contains(widgetElement)) {
            document.body.appendChild(widgetElement);
          }
        }
      }
    }
  }, [isOpen, activeTab]);

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
          <div className="language-modal-content" id="language-modal-content">
            {/* ConveyThis widget will be moved here when modal is open */}
          </div>
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

// Create the ConveyThis widget container outside the component
// This ensures it's always in the DOM for ConveyThis to find
if (typeof window !== 'undefined' && !document.getElementById('conveythis_widget')) {
  const widgetDiv = document.createElement('div');
  widgetDiv.id = 'conveythis_widget';
  widgetDiv.style.display = 'none';
  widgetDiv.style.position = 'absolute';
  widgetDiv.style.left = '-9999px';
  widgetDiv.style.top = '-9999px';
  widgetDiv.style.visibility = 'hidden';
  widgetDiv.style.width = '0px';
  widgetDiv.style.height = '0px';
  document.body.appendChild(widgetDiv);
}

export default LanguageModal;