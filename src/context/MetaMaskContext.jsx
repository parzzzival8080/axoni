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

  // Initialize MetaMask SDK
  useEffect(() => {
    const initializeSDK = () => {
      try {
        const MMSDK = new MetaMaskSDK({
          dappMetadata: {
            name: "COINCHI Trading Platform",
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
          
          // Fetch COINCHI wallet address when connected
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
        
        // Fetch COINCHI wallet address when connected
        await fetchCOINCHIWalletAddress();
        
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
    setCOINCHIWalletAddress('');
    
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

  // Fetch COINCHI wallet address
  const fetchCOINCHIWalletAddress = async () => {
    console.log('🔍 fetchCOINCHIWalletAddress called');
    try {
      let uid = localStorage.getItem('uid');
      const user_id = localStorage.getItem('user_id');
      const authToken = localStorage.getItem('authToken');
      const apiKey = '5lPMMw7mIuyzQQDjlKJbe0dY';
      
      console.log('🔍 Fetching COINCHI wallet address with UID:', uid);
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
          const userInfoUrl = `https://django.fluxcoin.tech/api/user_account/getUserInformation/?user_id=${user_id}`;
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
      
      const url = `https://api.fluxcoin.tech/api/v1/metamask-address/${uid}?apikey=${apiKey}`;
      console.log('🔍 Fetching COINCHI address from URL:', url);
      
      const response = await fetch(url);
      
      console.log('🔍 COINCHI API Response status:', response.status);
      console.log('🔍 COINCHI API Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const responseText = await response.text();
        console.log('🔍 COINCHI wallet address response (raw):', responseText);
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
          console.log('🔍 Setting COINCHI wallet address to:', address);
          setCOINCHIWalletAddress(address);
          return address;
        } else {
          console.warn('🔍 No address received');
          setCOINCHIWalletAddress('');
          return '';
        }
      } else {
        const errorText = await response.text();
        console.error('🔍 ❌ Failed to fetch COINCHI wallet address:', response.status, response.statusText, errorText);
        setCOINCHIWalletAddress(''); // Set empty to stop loading
        return '';
      }
    } catch (err) {
      console.error('🔍 ❌ Error fetching COINCHI wallet address:', err);
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
    COINCHIWalletAddress,
    fetchCOINCHIWalletAddress,
  };

  return (
    <MetaMaskContext.Provider value={value}>
      {children}
    </MetaMaskContext.Provider>
  );
}; 