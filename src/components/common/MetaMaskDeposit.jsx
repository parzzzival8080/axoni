import React, { useState, useEffect } from 'react';
import { useMetaMask } from '../../context/MetaMaskContext';
import { FaWallet, FaArrowRight, FaCheck, FaSpinner, FaExclamationTriangle, FaArrowDown } from 'react-icons/fa';

const MetaMaskDeposit = ({ isOpen, onClose, selectedCoin = 'ETH' }) => {
  const {
    isConnected,
    account,
    balance,
    provider,
    connectWallet,
    formatAddress,
    fluxWalletAddress,
    fetchFluxWalletAddress,
  } = useMetaMask();

  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);
  const [depositStatus, setDepositStatus] = useState(''); // 'success', 'error', 'pending'
  const [txHash, setTxHash] = useState('');
  const [error, setError] = useState('');

  // Fetch FLUX wallet address when modal opens
  useEffect(() => {
    if (isOpen && selectedCoin && !fluxWalletAddress) {
      fetchFluxWalletAddress();
    }
  }, [isOpen, selectedCoin, fluxWalletAddress, fetchFluxWalletAddress]);

  const handleDeposit = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (parseFloat(depositAmount) > parseFloat(balance)) {
      setError('Insufficient balance');
      return;
    }

    if (!fluxWalletAddress) {
      setError('FLUX deposit address not found');
      return;
    }

    setIsDepositing(true);
    setError('');
    setDepositStatus('pending');

    try {
      // Convert amount to Wei (for ETH)
      const amountInWei = (parseFloat(depositAmount) * Math.pow(10, 18)).toString(16);

      // Get current gas price
      const gasPrice = await provider.request({
        method: 'eth_gasPrice',
      });

      // Prepare transaction
      const transactionParameters = {
        to: fluxWalletAddress,
        from: account,
        value: '0x' + amountInWei,
        gas: '0x5208', // Standard gas limit for ETH transfer (21000)
        gasPrice: gasPrice,
      };

      // Send transaction
      const txHash = await provider.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters],
      });

      setTxHash(txHash);
      setDepositStatus('success');

      // Notify your backend about the deposit
      await notifyBackendDeposit(txHash, depositAmount, selectedCoin);

    } catch (err) {
      console.error('Deposit error:', err);
      if (err.code === 4001) {
        setError('Transaction was rejected by user');
      } else if (err.code === -32603) {
        setError('Transaction failed - insufficient funds for gas');
      } else {
        setError(err.message || 'Transaction failed');
      }
      setDepositStatus('error');
    } finally {
      setIsDepositing(false);
    }
  };

  const notifyBackendDeposit = async (txHash, amount, coin) => {
    try {
      const uid = localStorage.getItem('uid');
      const apiKey = 'A20RqFwVktRxxRqrKBtmi6ud';

      // Notify your backend about the pending deposit
      const response = await fetch(`https://apiv2.bhtokens.com/api/v1/metamask-deposit-notification?apikey=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: uid,
          txHash: txHash,
          amount: amount,
          coin: coin,
          fromAddress: account,
          toAddress: fluxWalletAddress,
          timestamp: new Date().toISOString(),
          source: 'metamask',
          network: 'ethereum',
        }),
      });

      if (!response.ok) {
        console.warn('Failed to notify backend about deposit:', response.status, response.statusText);
      } else {
        console.log('Successfully notified backend about deposit');
      }
    } catch (err) {
      console.warn('Error notifying backend:', err);
    }
  };

  const handleMaxAmount = () => {
    // Leave some ETH for gas fees (approximately 0.01 ETH)
    const maxAmount = Math.max(0, parseFloat(balance) - 0.01);
    setDepositAmount(maxAmount.toFixed(6));
  };

  const resetDeposit = () => {
    setDepositAmount('');
    setDepositStatus('');
    setTxHash('');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-gray-900 border border-gray-700 rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">
            Deposit {selectedCoin}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <FaWallet className="mx-auto text-3xl text-gray-400 mb-4" />
            <p className="text-gray-300 mb-4">Connect MetaMask to continue</p>
            <button
              onClick={connectWallet}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              Connect MetaMask
            </button>
          </div>
        ) : depositStatus === 'success' ? (
          <div className="text-center py-6">
            <FaCheck className="mx-auto text-3xl text-green-500 mb-3" />
            <h3 className="text-lg font-semibold text-white mb-2">Deposit Initiated!</h3>
            <p className="text-gray-300 mb-4 text-sm">
              Transaction submitted. It will be credited once confirmed.
            </p>
            <div className="bg-gray-800 border border-gray-700 p-3 rounded-lg mb-4">
              <p className="text-xs text-gray-400 mb-1">Transaction Hash:</p>
              <a
                href={`https://etherscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 text-xs font-mono break-all hover:text-orange-300 transition-colors"
              >
                {txHash}
              </a>
            </div>
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3 mb-4">
              <p className="text-xs text-yellow-200">
                <strong>Note:</strong> Confirmation takes 5-15 minutes
              </p>
            </div>
            <button
              onClick={() => {
                resetDeposit();
                onClose();
              }}
              className="bg-gray-700 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div>
            {/* Account Information - Compact */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <FaWallet className="text-orange-500 mr-2 text-sm" />
                  <span className="text-white font-medium text-sm">MetaMask</span>
                </div>
                <span className="text-orange-400 font-bold text-sm">{balance} {selectedCoin}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Address:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-mono">{formatAddress(account)}</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(account)}
                    className="text-orange-400 hover:text-orange-300 transition-colors"
                    title="Copy address"
                  >
                    Copy
                  </button>
                </div>
              </div>
            </div>

            {/* FLUX Deposit Address - Compact */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded mr-2 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">F</span>
                  </div>
                  <span className="text-white font-medium text-sm">FLUX Wallet</span>
                </div>
                <span className="text-green-400 text-xs">Ethereum</span>
              </div>
              
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">Deposit to:</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-300 font-mono">
                    {fluxWalletAddress ? fluxWalletAddress : 'Loading...'}
                  </span>
                  {fluxWalletAddress && (
                    <button
                      onClick={() => navigator.clipboard.writeText(fluxWalletAddress)}
                      className="text-orange-400 hover:text-orange-300 transition-colors"
                      title="Copy address"
                    >
                      Copy
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Transfer Arrow - Compact */}
            <div className="flex justify-center mb-4">
              <div className="bg-orange-500 bg-opacity-20 p-2 rounded-full">
                <FaArrowRight className="text-orange-500 text-sm" />
              </div>
            </div>

            {/* Amount Input - Compact */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-gray-400"
                  step="0.000001"
                  min="0.001"
                  max={balance}
                />
                <div className="absolute right-3 top-3 flex items-center gap-2">
                  <button
                    onClick={handleMaxAmount}
                    className="bg-orange-500 bg-opacity-20 text-orange-400 px-2 py-1 rounded text-xs hover:bg-opacity-30 transition-colors"
                    type="button"
                  >
                    MAX
                  </button>
                  <span className="text-gray-400 text-sm">{selectedCoin}</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Reserves 0.01 ETH for gas fees
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-900 border border-red-700 rounded-lg p-3 mb-4">
                <div className="flex items-center">
                  <FaExclamationTriangle className="text-red-400 mr-2 flex-shrink-0 text-sm" />
                  <span className="text-red-200 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Important Information - Compact */}
            <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <FaExclamationTriangle className="text-yellow-400 mr-2 mt-0.5 flex-shrink-0 text-sm" />
                <div className="text-xs text-yellow-200">
                  <p className="font-medium mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li>Network fees deducted from MetaMask</li>
                    <li>Confirmation: 5-15 minutes</li>
                    <li>Only send {selectedCoin} on Ethereum network</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons - Compact */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-700 border border-gray-600 text-gray-300 py-2.5 rounded-lg hover:bg-gray-600 transition-colors font-medium text-sm"
                disabled={isDepositing}
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={isDepositing || !depositAmount || parseFloat(depositAmount) < 0.001 || parseFloat(depositAmount) > parseFloat(balance) || !fluxWalletAddress}
                className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg hover:bg-orange-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 font-medium text-sm"
              >
                {isDepositing ? (
                  <>
                    <FaSpinner className="animate-spin text-sm" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FaArrowRight className="text-sm" />
                    Deposit {depositAmount || '0'} {selectedCoin}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaMaskDeposit; 