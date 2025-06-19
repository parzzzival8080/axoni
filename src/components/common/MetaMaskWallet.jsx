import React, { useState } from 'react';
import { useMetaMask } from '../../context/MetaMaskContext';
import { FaWallet, FaEthereum, FaSync, FaTimes, FaExternalLinkAlt, FaArrowDown } from 'react-icons/fa';
import MetaMaskDeposit from './MetaMaskDeposit';

const MetaMaskWallet = () => {
  const {
    isConnected,
    account,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    formatAddress,
  } = useMetaMask();

  const [showDetails, setShowDetails] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);

  const handleConnect = async () => {
    const success = await connectWallet();
    if (success) {
      console.log('MetaMask connected successfully');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDetails(false);
  };

  // Format balance for display
  const formatBalance = (bal) => {
    const num = parseFloat(bal);
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    if (num < 1) return num.toFixed(4);
    if (num < 10) return num.toFixed(3);
    return num.toFixed(2);
  };

  if (!isConnected) {
    return (
      <div className="metamask-wallet-container">
        <button
          onClick={handleConnect}
          disabled={isLoading}
          className={`connect-button ${isLoading ? 'disabled' : ''}`}
        >
          <FaWallet />
          {isLoading ? (
            <>
              <FaSync className="spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <span>Connect MetaMask</span>
          )}
        </button>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="metamask-wallet-container">
      {/* Connected wallet display */}
      <div 
        className="wallet-display"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="wallet-icon">
          <FaEthereum />
        </div>
        <div className="wallet-info">
          <span className="balance-label">ETH Balance</span>
          <span className="balance-value">{formatBalance(balance)} ETH</span>
        </div>
        <div className="status-indicator">
          <div className="network-dot"></div>
        </div>
      </div>

      {/* Wallet details dropdown */}
      {showDetails && (
        <div className="wallet-details" style={{ 
          background: '#1f2937', 
          border: '1px solid #374151', 
          borderRadius: '8px',
          padding: '16px',
          color: '#ffffff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
          minWidth: '320px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
              <FaEthereum style={{ color: '#f97316' }} />
              MetaMask Wallet
            </h3>
            <button
              onClick={() => setShowDetails(false)}
              style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '18px' }}
            >
              <FaTimes />
            </button>
          </div>

          {/* Account info */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Account</span>
              <button
                onClick={() => navigator.clipboard.writeText(account)}
                style={{ fontSize: '12px', color: '#f97316', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                Copy
              </button>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              padding: '8px 12px', 
              backgroundColor: '#374151', 
              borderRadius: '6px',
              border: '1px solid #4b5563'
            }}>
              <span style={{ fontSize: '13px', fontFamily: 'monospace', color: '#ffffff', flex: 1 }}>{formatAddress(account)}</span>
              <a
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '12px' }}
              >
                <FaExternalLinkAlt />
              </a>
            </div>
          </div>

          {/* Balance info */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>Balance</span>
              <button
                onClick={refreshBalance}
                style={{ 
                  fontSize: '12px', 
                  color: '#f97316', 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '4px' 
                }}
              >
                <FaSync />
                Refresh
              </button>
            </div>
            <div className="balance-display">
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                marginBottom: '4px',
                padding: '12px',
                backgroundColor: '#374151',
                borderRadius: '6px',
                border: '1px solid #4b5563'
              }}>
                <FaEthereum style={{ fontSize: '18px', color: '#f97316' }} />
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff' }}>{formatBalance(balance)}</span>
                <span style={{ fontSize: '14px', color: '#9ca3af' }}>ETH</span>
              </div>
              <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
                ≈ $0.00 USD
              </div>
            </div>
          </div>

          {/* Network info */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '8px 12px',
            backgroundColor: '#065f46',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #047857'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              backgroundColor: '#10b981', 
              borderRadius: '50%' 
            }}></div>
            <span style={{ fontSize: '12px', color: '#d1fae5' }}>Connected to Ethereum Mainnet</span>
          </div>

          {/* Actions */}
          <div className="action-buttons">
            <button
              onClick={() => {
                setShowDepositModal(true);
                setShowDetails(false);
              }}
              style={{
                background: '#f97316',
                color: 'white',
                border: 'none',
                padding: '10px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '8px',
                width: '100%',
                justifyContent: 'center',
                transition: 'background-color 0.2s',
                fontWeight: '500'
              }}
              onMouseEnter={(e) => e.target.style.background = '#ea580c'}
              onMouseLeave={(e) => e.target.style.background = '#f97316'}
            >
              <FaArrowDown />
              Deposit to FLUX
            </button>
            <div className="secondary-actions" style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleDisconnect}
                style={{
                  flex: 1,
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'background-color 0.2s',
                  fontWeight: '500'
                }}
                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = '#dc2626'}
              >
                Disconnect
              </button>
              <button
                onClick={() => window.open('https://metamask.io', '_blank')}
                style={{
                  background: '#4b5563',
                  color: 'white',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  transition: 'background-color 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.background = '#374151'}
                onMouseLeave={(e) => e.target.style.background = '#4b5563'}
              >
                <FaExternalLinkAlt />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MetaMask Deposit Modal */}
      <MetaMaskDeposit
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
        selectedCoin="ETH"
      />

      {/* Error display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default MetaMaskWallet; 