import React, { createContext, useContext, useState, useEffect } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';
import { SUPPORTED_CHAINS, getChainByHexId, getChainKeyByHexId } from './chains';
import { TOKENS_BY_CHAIN, getTokensForChain, findToken } from './tokens';
import {
  encodeTransfer,
  toBaseUnits,
  fromBaseUnits,
  readNativeBalance,
  readErc20Balance,
} from './evm';

const MetaMaskContext = createContext();

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    return { account: null, isConnected: false, connect: () => {}, disconnect: () => {} };
  }
  return context;
};

export const MetaMaskProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [sdk, setSdk] = useState(null);
  const [provider, setProvider] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [chainKey, setChainKey] = useState(null);
  // assets: { [chainKey]: [{ symbol, name, address, decimals, native, balance, balanceBaseUnits }] }
  const [assets, setAssets] = useState({});
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [COINCHIWalletAddress, setCOINCHIWalletAddress] = useState('');

  // Debug state changes
  useEffect(() => {
    console.log('🔍 COINCHIWalletAddress state changed to:', COINCHIWalletAddress);
  }, [COINCHIWalletAddress]);

  // Check for stored connection state on mount
  useEffect(() => {
    const storedConnection = localStorage.getItem('metamask_connected');
    const storedAccount = localStorage.getItem('metamask_account');
    
    if (storedConnection === 'true' && storedAccount) {
      // Set initial state from localStorage
      setAccount(storedAccount);
      setIsConnected(true);
      // Balance will be fetched when SDK initializes
    }
  }, []);

  // Find the MetaMask-specific provider when multiple wallets are injected (EIP-6963 / providers array)
  const pickInjectedMetaMaskProvider = () => {
    const eth = window.ethereum;
    if (!eth) return null;
    // EIP-5749 / multi-wallet array
    if (Array.isArray(eth.providers) && eth.providers.length > 0) {
      const mm = eth.providers.find((p) => p.isMetaMask && !p.isBraveWallet);
      if (mm) return mm;
      return eth.providers.find((p) => p.isMetaMask) || eth.providers[0];
    }
    return eth;
  };

  // Initialize provider:
  //  - prefer the directly injected MetaMask extension (window.ethereum) when present
  //  - fall back to MetaMaskSDK for mobile / non-extension flows (deeplink + QR)
  useEffect(() => {
    const initialize = async () => {
      try {
        const injected = pickInjectedMetaMaskProvider();
        if (injected) {
          // Use the extension directly. SDK isn't needed and often misdetects.
          setSdk({
            // Tiny shim so connectWallet() can call sdk.connect()
            connect: () => injected.request({ method: 'eth_requestAccounts' }),
            getProvider: () => injected,
          });
          setProvider(injected);
          checkConnectionWithProvider(injected);
          return;
        }

        // No extension — use SDK so mobile users can scan a QR or deeplink.
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: 'GLD Trading Platform',
            url: window.location.href,
          },
          infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY,
        });
        setSdk(MMSDK);
        setProvider(MMSDK.getProvider());
        checkConnection(MMSDK);
      } catch (err) {
        console.error('Failed to initialize MetaMask:', err);
        setError('Failed to initialize MetaMask');
      }
    };

    initialize();
  }, []);

  // checkConnection variant that takes a raw provider (for the injected path)
  const checkConnectionWithProvider = async (rawProvider) => {
    if (!rawProvider) return;
    try {
      const accounts = await rawProvider.request({ method: 'eth_accounts', params: [] });
      const storedConnection = localStorage.getItem('metamask_connected');
      if (accounts && accounts.length > 0) {
        const currentAccount = accounts[0];
        setAccount(currentAccount);
        setIsConnected(true);

        const currentChainId = await rawProvider.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
        setChainKey(getChainKeyByHexId(currentChainId));

        await fetchBalance(currentAccount, rawProvider);
        await fetchCOINCHIWalletAddress();

        localStorage.setItem('metamask_connected', 'true');
        localStorage.setItem('metamask_account', currentAccount);
      } else if (storedConnection === 'true') {
        localStorage.removeItem('metamask_connected');
        localStorage.removeItem('metamask_account');
        setIsConnected(false);
        setAccount('');
        setBalance('0');
      }
    } catch (err) {
      console.error('Error checking connection (injected):', err);
    }
  };

  // Check existing connection and restore from localStorage
  const checkConnection = async (sdkInstance = sdk) => {
    if (!sdkInstance) return;

    try {
      const provider = sdkInstance.getProvider();
      if (provider) {
        // First check if we have a stored connection
        const storedConnection = localStorage.getItem('metamask_connected');
        const storedAccount = localStorage.getItem('metamask_account');
        
        // Check current accounts from MetaMask
        const accounts = await provider.request({ 
          method: 'eth_accounts',
          params: [] 
        });

        if (accounts && accounts.length > 0) {
          // MetaMask has active accounts
          const currentAccount = accounts[0];
          setAccount(currentAccount);
          setIsConnected(true);

          // Capture current chain
          const currentChainId = await provider.request({ method: 'eth_chainId' });
          setChainId(currentChainId);
          setChainKey(getChainKeyByHexId(currentChainId));

          await fetchBalance(currentAccount, provider);

          // Fetch GLD wallet address when connected
          await fetchCOINCHIWalletAddress();

          // Update localStorage with current account
          localStorage.setItem('metamask_connected', 'true');
          localStorage.setItem('metamask_account', currentAccount);
        } else if (storedConnection === 'true' && storedAccount) {
          // We had a connection before, but MetaMask doesn't show active accounts
          // This might happen if user manually disconnected from MetaMask
          // Clear the stored state
          localStorage.removeItem('metamask_connected');
          localStorage.removeItem('metamask_account');
          setIsConnected(false);
          setAccount('');
          setBalance('0');
        }
      }
    } catch (err) {
      console.error('Error checking connection:', err);
      // If there's an error, clear stored state to prevent inconsistency
      localStorage.removeItem('metamask_connected');
      localStorage.removeItem('metamask_account');
    }
  };

  // Wake MetaMask's MV3 background service worker.
  // Chrome kills it after ~30s of idle and the first heavy call can throw
  // "Background connection unresponsive" before it boots back up.
  // A cheap eth_chainId call usually nudges it awake; retry up to 3 times.
  const wakeMetaMaskBackground = async (rawProvider) => {
    for (let i = 0; i < 3; i++) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await rawProvider.request({ method: 'eth_chainId' });
        return true;
      } catch (err) {
        if (i === 2) throw err;
        // brief delay before the next nudge
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    return false;
  };

  // Connect to MetaMask. Prefers the injected extension; falls back to SDK on mobile.
  const connectWallet = async () => {
    setIsLoading(true);
    setError('');

    try {
      const injected = pickInjectedMetaMaskProvider();
      let accounts;
      let activeProvider;

      if (injected) {
        // Direct extension flow — most reliable. Wake the background worker first.
        await wakeMetaMaskBackground(injected);
        accounts = await injected.request({ method: 'eth_requestAccounts' });
        activeProvider = injected;
        if (provider !== injected) setProvider(injected);
      } else if (sdk && sdk.connect) {
        // SDK flow (mobile QR / deeplink). Note: bare `connect` returns accounts.
        accounts = await sdk.connect();
        activeProvider = sdk.getProvider ? sdk.getProvider() : provider;
      } else {
        setError('MetaMask not detected. Please install MetaMask.');
        return false;
      }

      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);

        const currentChainId = await activeProvider.request({ method: 'eth_chainId' });
        setChainId(currentChainId);
        setChainKey(getChainKeyByHexId(currentChainId));

        await fetchBalance(accounts[0], activeProvider);
        await fetchCOINCHIWalletAddress();

        localStorage.setItem('metamask_connected', 'true');
        localStorage.setItem('metamask_account', accounts[0]);

        return true;
      }
      setError('No accounts found');
      return false;
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      if (err.code === 4001) {
        setError('Connection rejected by user');
      } else if (err.code === -32002) {
        setError('A connection request is already pending. Please open MetaMask.');
      } else if (err.code === -32603) {
        // Internal JSON-RPC error — typically MetaMask is locked, has no accounts,
        // or a hardware wallet integration is in a bad state.
        setError(
          'MetaMask error: please make sure MetaMask is unlocked and has at least one account selected, then try again. (If you use a hardware wallet, open its Ethereum app first.)',
        );
      } else if (
        err.message &&
        (err.message.includes('Background connection unresponsive') ||
          err.message.includes('disconnected'))
      ) {
        setError(
          'MetaMask is asleep. Please click the MetaMask icon in your browser toolbar to wake it up, then try Continue again.',
        );
      } else {
        setError(err.message || 'Failed to connect to MetaMask');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setIsConnected(false);
    setAccount('');
    setBalance('0');
    setError('');
    setChainId(null);
    setChainKey(null);
    setCOINCHIWalletAddress('');

    // Clear stored connection state
    localStorage.removeItem('metamask_connected');
    localStorage.removeItem('metamask_account');
  };

  // Switch (or add then switch) to a supported EVM chain.
  // chainKeyArg must be a key of SUPPORTED_CHAINS: 'ethereum' | 'bsc' | 'polygon' | 'arbitrum' | 'base'.
  const switchChain = async (chainKeyArg) => {
    if (!provider) {
      setError('MetaMask provider not ready');
      return false;
    }
    const chain = SUPPORTED_CHAINS[chainKeyArg];
    if (!chain) {
      setError(`Unsupported chain: ${chainKeyArg}`);
      return false;
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chain.chainId }],
      });
      // chainChanged listener will update chainId/chainKey/balance
      return true;
    } catch (switchErr) {
      // Code 4902 = chain not added to MetaMask. Add it then retry.
      if (switchErr.code === 4902 || switchErr.code === -32603) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: chain.chainId,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls,
              blockExplorerUrls: chain.blockExplorerUrls,
            }],
          });
          return true;
        } catch (addErr) {
          console.error('Error adding chain:', addErr);
          setError(addErr.message || `Failed to add ${chain.name}`);
          return false;
        }
      }
      console.error('Error switching chain:', switchErr);
      setError(switchErr.message || `Failed to switch to ${chain.name}`);
      return false;
    }
  };

  // Fetch wallet balance
  const fetchBalance = async (accountAddress = account, providerInstance = provider) => {
    if (!accountAddress || !providerInstance) return;

    try {
      const balance = await providerInstance.request({
        method: 'eth_getBalance',
        params: [accountAddress, 'latest']
      });

      // Convert from Wei to ETH
      const balanceInETH = parseInt(balance, 16) / Math.pow(10, 18);
      setBalance(balanceInETH.toFixed(6));
    } catch (err) {
      console.error('Error fetching balance:', err);
      setError('Failed to fetch balance');
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (isConnected && account) {
      await fetchBalance();
    }
  };

  // Get current network
  const getCurrentNetwork = async () => {
    if (!provider) return null;

    try {
      const chainId = await provider.request({
        method: 'eth_chainId'
      });
      return chainId;
    } catch (err) {
      console.error('Error getting network:', err);
      return null;
    }
  };

  // Format address for display
  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Fetch GLD wallet address
  const fetchCOINCHIWalletAddress = async () => {
    console.log('🔍 fetchCOINCHIWalletAddress called');
    try {
      let uid = localStorage.getItem('uid');
      const user_id = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('authToken');
      const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
      
      console.log('🔍 Fetching GLD wallet address with UID:', uid);
      console.log('🔍 All localStorage items:', {
        uid: localStorage.getItem('uid'),
        user_id: localStorage.getItem('user_id'),
        authToken: localStorage.getItem('authToken'),
        fullName: localStorage.getItem('fullName')
      });
      
      // Debug all localStorage keys
      console.log('🔍 All localStorage keys:', Object.keys(localStorage));
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        console.log(`🔍 localStorage[${key}] = ${localStorage.getItem(key)}`);
      }
      
      // If no UID but we have user_id and authToken, try to fetch UID
      if (!uid && user_id && authToken) {
        console.log('🔍 No UID found, attempting to fetch from user info API');
        try {
          const userInfoUrl = `https://django.axoni.co/api/user_account/getUserInformation/?user_id=${user_id}`;
          console.log('🔍 Fetching user info from:', userInfoUrl);
          console.log('🔍 Auth token (first 20 chars):', authToken?.substring(0, 20) + '...');
          
          const userInfoResponse = await fetch(userInfoUrl, {
            headers: {
              'Authorization': `Bearer ${authToken}`,
            },
          });
          
          console.log('🔍 User info response status:', userInfoResponse.status);
          
          if (userInfoResponse.ok) {
            const userInfo = await userInfoResponse.json();
            console.log('🔍 User info response:', userInfo);
            
            if (userInfo.user && userInfo.user.uid) {
              uid = userInfo.user.uid;
              localStorage.setItem('uid', uid);
              console.log('🔍 Successfully fetched and stored UID:', uid);
            } else {
              console.log('🔍 No UID found in user info response');
            }
          } else {
            const errorText = await userInfoResponse.text();
            console.log('🔍 User info response error:', errorText);
          }
        } catch (userInfoError) {
          console.error('🔍 Error fetching user info:', userInfoError);
        }
      }
      
      if (!uid) {
        console.error('🔍 UID not found in localStorage and could not be fetched');
        setCOINCHIWalletAddress(''); // Set empty to stop loading
        return '';
      }
      
      const url = `https://api.axoni.co/api/v1/metamask-address/${uid}?apikey=${apiKey}`;
      console.log('🔍 Fetching GLD address from URL:', url);
      
      const response = await fetch(url);
      
      console.log('🔍 GLD API Response status:', response.status);
      console.log('🔍 GLD API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('🔍 GLD wallet address response (raw):', responseText);
        console.log('🔍 Response text length:', responseText.length);
        
        // The API returns the address directly as a string
        let address = '';
        try {
          // First try to parse as JSON (in case it's wrapped in an object)
          const jsonData = JSON.parse(responseText);
          if (typeof jsonData === 'string') {
            address = jsonData;
          } else if (jsonData && jsonData.address) {
            address = jsonData.address;
          } else if (jsonData && jsonData.metamask_address) {
            address = jsonData.metamask_address;
          } else if (jsonData && jsonData.wallet_address) {
            address = jsonData.wallet_address;
          }
        } catch (jsonError) {
          // If JSON parsing fails, treat the response as a plain string address
          address = responseText.trim();
        }
        
        // Just display whatever address we get
        console.log('🔍 Parsed address:', address);
        console.log('🔍 Address type:', typeof address);
        console.log('🔍 Address length:', address?.length);
        
        if (address) {
          console.log('🔍 Setting GLD wallet address to:', address);
          setCOINCHIWalletAddress(address);
          return address;
        } else {
          console.warn('🔍 No address received');
          setCOINCHIWalletAddress('');
          return '';
        }
      } else {
        const errorText = await response.text();
        console.error('🔍 ❌ Failed to fetch GLD wallet address:', response.status, response.statusText, errorText);
        setCOINCHIWalletAddress(''); // Set empty to stop loading
        return '';
      }
    } catch (err) {
      console.error('🔍 ❌ Error fetching GLD wallet address:', err);
      setCOINCHIWalletAddress(''); // Set empty to stop loading
      return '';
    }
  };

  // Manually restore connection from localStorage and MetaMask
  const restoreConnection = async () => {
    if (sdk) {
      await checkConnection(sdk);
    }
  };

  // Listen for account changes
  useEffect(() => {
    if (provider) {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else if (accounts[0] !== account) {
          const newAccount = accounts[0];
          setAccount(newAccount);
          fetchBalance(newAccount);
          
          // Update localStorage with new account
          localStorage.setItem('metamask_account', newAccount);
          localStorage.setItem('metamask_connected', 'true');
        }
      };

      const handleChainChanged = (newChainId) => {
        console.log('Chain changed to:', newChainId);
        setChainId(newChainId);
        setChainKey(getChainKeyByHexId(newChainId));
        if (account) {
          fetchBalance();
        }
      };

      const handleDisconnect = () => {
        disconnectWallet();
      };

      // Add event listeners
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('chainChanged', handleChainChanged);
      provider.on('disconnect', handleDisconnect);

      // Cleanup
      return () => {
        if (provider.removeListener) {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('chainChanged', handleChainChanged);
          provider.removeListener('disconnect', handleDisconnect);
        }
      };
    }
  }, [provider, account]);

  // Scan the connected address for native + ERC-20 balances on a given chain.
  // Reads happen via the active MetaMask provider — the wallet must be on that chain
  // to read its balances. We auto-switch when needed unless `noSwitch` is true.
  // Falls back to the live injected provider + localStorage account so callers that
  // captured stale React state immediately after connectWallet() still work.
  const detectAssetsForChain = async (targetChainKey, opts = {}) => {
    const activeProvider = provider || pickInjectedMetaMaskProvider();
    const activeAccount = account || localStorage.getItem('metamask_account') || '';
    if (!activeProvider || !activeAccount) {
      console.warn('detectAssetsForChain: no provider/account', {
        hasProvider: !!activeProvider,
        account: activeAccount,
      });
      return [];
    }
    const chain = SUPPORTED_CHAINS[targetChainKey];
    if (!chain) return [];

    // Switch chain first if not already on it (unless caller opts out)
    const currentHex = await activeProvider.request({ method: 'eth_chainId' });
    if (currentHex.toLowerCase() !== chain.chainId.toLowerCase() && !opts.noSwitch) {
      try {
        await activeProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.chainId }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          try {
            await activeProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: chain.chainId,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: chain.rpcUrls,
                blockExplorerUrls: chain.blockExplorerUrls,
              }],
            });
          } catch (addErr) {
            console.warn(`Could not add ${chain.name}:`, addErr.message);
            return [];
          }
        } else {
          console.warn(`Could not switch to ${chain.name}:`, switchErr.message);
          return [];
        }
      }
      // small wait so provider reports the new chain
      await new Promise((r) => setTimeout(r, 300));
    }

    const tokens = getTokensForChain(targetChainKey);
    const results = [];
    for (const t of tokens) {
      try {
        const baseUnits = t.native
          ? await readNativeBalance(activeProvider, activeAccount)
          : await readErc20Balance(activeProvider, t.address, activeAccount);
        results.push({
          ...t,
          balanceBaseUnits: baseUnits,
          balance: fromBaseUnits(baseUnits, t.decimals),
        });
      } catch (err) {
        console.warn(`Failed to read ${t.symbol} on ${targetChainKey}:`, err.message);
        results.push({ ...t, balanceBaseUnits: '0', balance: '0' });
      }
    }
    return results;
  };

  // Detect assets on every supported chain. Does sequential chain switches.
  const detectAllAssets = async () => {
    if (!provider || !account) return;
    setAssetsLoading(true);
    try {
      const next = {};
      for (const key of Object.keys(SUPPORTED_CHAINS)) {
        // eslint-disable-next-line no-await-in-loop
        next[key] = await detectAssetsForChain(key);
      }
      setAssets(next);
    } finally {
      setAssetsLoading(false);
    }
  };

  // Send a deposit transaction. token = { symbol, address, decimals, native }.
  // Auto-switches chain to targetChainKey if needed.
  // Returns { txHash, error }.
  const sendDeposit = async ({ chainKey: targetChainKey, token, amount, to }) => {
    const activeProvider = provider || pickInjectedMetaMaskProvider();
    const activeAccount = account || localStorage.getItem('metamask_account') || '';
    if (!activeProvider || !activeAccount) return { error: 'Wallet not connected' };
    if (!to) return { error: 'Missing destination address' };
    if (!token) return { error: 'Missing token' };
    if (!amount || parseFloat(amount) <= 0) return { error: 'Invalid amount' };

    // Make sure we're on the right chain
    const targetChain = SUPPORTED_CHAINS[targetChainKey];
    if (!targetChain) return { error: `Unsupported chain: ${targetChainKey}` };
    const currentHex = await activeProvider.request({ method: 'eth_chainId' });
    if (currentHex.toLowerCase() !== targetChain.chainId.toLowerCase()) {
      try {
        await activeProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: targetChain.chainId }],
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          try {
            await activeProvider.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: targetChain.chainId,
                chainName: targetChain.name,
                nativeCurrency: targetChain.nativeCurrency,
                rpcUrls: targetChain.rpcUrls,
                blockExplorerUrls: targetChain.blockExplorerUrls,
              }],
            });
          } catch (addErr) {
            return { error: `Failed to add ${targetChain.name}` };
          }
        } else {
          return { error: `Failed to switch to ${targetChain.name}` };
        }
      }
    }

    try {
      const amountBaseUnits = toBaseUnits(amount, token.decimals);
      let txParams;
      if (token.native) {
        txParams = {
          from: activeAccount,
          to,
          value: '0x' + BigInt(amountBaseUnits).toString(16),
        };
      } else {
        // ERC-20 transfer: call token contract with `transfer(to, amount)`
        txParams = {
          from: activeAccount,
          to: token.address,
          data: encodeTransfer(to, amountBaseUnits),
          value: '0x0',
        };
      }
      const txHash = await activeProvider.request({
        method: 'eth_sendTransaction',
        params: [txParams],
      });
      return { txHash };
    } catch (err) {
      console.error('sendDeposit failed:', err);
      if (err.code === 4001) return { error: 'Transaction rejected by user' };
      return { error: err.message || 'Transaction failed' };
    }
  };

  const currentChain = chainKey ? SUPPORTED_CHAINS[chainKey] : (chainId ? getChainByHexId(chainId) : null);

  const value = {
    isConnected,
    account,
    balance,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    refreshBalance,
    getCurrentNetwork,
    formatAddress,
    restoreConnection,
    provider,
    COINCHIWalletAddress,
    fetchCOINCHIWalletAddress,
    // Multi-chain
    chainId,
    chainKey,
    currentChain,
    supportedChains: SUPPORTED_CHAINS,
    switchChain,
    // Asset detection
    assets,
    assetsLoading,
    detectAssetsForChain,
    detectAllAssets,
    tokensByChain: TOKENS_BY_CHAIN,
    findToken,
    // Deposit
    sendDeposit,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}; 