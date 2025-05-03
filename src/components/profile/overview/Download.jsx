import React from 'react';
import './Download.css';

const DownloadApp = ({ onClose }) => {
  return (
    <div className="download-app-modal">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <i className="fas fa-times"></i>
        </button>
        
        <h2 className="modal-title">Download app and trade on the go</h2>
        
        <div className="download-section">
          <div className="qr-code-placeholder">
            {/* Placeholder for QR code */}
            <div className="qr-code-box">
              {/* QR code pattern effect */}
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
              <div className="qr-pattern"></div>
            </div>
          </div>
          
          <div className="download-info">
            <h3 className="app-name">OKX App</h3>
            <p className="download-instruction">Scan to download</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;