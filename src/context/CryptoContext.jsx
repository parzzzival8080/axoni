import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const CryptoContext = createContext();

export const useCrypto = () => {
  const context = useContext(CryptoContext);
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider');
  }
  return context;
};

export const CryptoProvider = ({ children }) => {
  const [coins, setCoins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await axios.get('https://api.axoni.co/api/v1/coins', {
          params: {
            apikey: '5lPMMw7mIuyzQQDjlKJbe0dY'
          }
        });
        
        if (response.data && Array.isArray(response.data)) {
          setCoins(response.data);
        }
      } catch (err) {
        console.error('Error fetching coins:', err);
        setError('Failed to load coins. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCoins();
  }, []);

  return (
    <CryptoContext.Provider value={{ coins, isLoading, error }}>
      {children}
    </CryptoContext.Provider>
  );
}; 