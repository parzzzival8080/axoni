import React, { createContext, useContext, useState, useEffect } from 'react';
import { MetaMaskSDK } from '@metamask/sdk';

const MetaMaskContext = createContext();

export const useMetaMask = () => {
  const context = useContext(MetaMaskContext);
  if (!context) {
    throw new Error('useMetaMask must be used within a MetaMaskProvider');
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

  // Initialize MetaMask SDK
  useEffect(() => {
    const initializeSDK = () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "FLUX Trading Platform",
            url: window.location.href,
          },
          infuraAPIKey: import.meta.env.VITE_INFURA_API_KEY, // Optional - use Vite env variable
          headless: false,
        });

        setSdk(MMSDK);
        setProvider(MMSDK.getProvider());

        // Check if already connected
        checkConnection(MMSDK);
      } catch (err) {
        console.error('Failed to initialize MetaMask SDK:', err);
        setError('Failed to initialize MetaMask SDK');
      }
    };

    initializeSDK();
  }, []);

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
          await fetchBalance(currentAccount, provider);
          
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

  // Connect to MetaMask
  const connectWallet = async () => {
    if (!sdk) {
      setError('MetaMask SDK not initialized');
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      // Connect and get accounts
      const accounts = await sdk.connect();
      
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await fetchBalance(accounts[0]);
        
        // Store connection state
        localStorage.setItem('metamask_connected', 'true');
        localStorage.setItem('metamask_account', accounts[0]);
        
        return true;
      } else {
        setError('No accounts found');
        return false;
      }
    } catch (err) {
      console.error('Error connecting to MetaMask:', err);
      setError(err.message || 'Failed to connect to MetaMask');
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
    
    // Clear stored connection state
    localStorage.removeItem('metamask_connected');
    localStorage.removeItem('metamask_account');
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

      const handleChainChanged = (chainId) => {
        console.log('Chain changed to:', chainId);
        // Optionally refresh balance or update UI
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
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}; 