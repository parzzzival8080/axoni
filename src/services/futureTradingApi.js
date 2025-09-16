const API_BASE_URL = 'https://api.coinchi.co/api/v1';
const API_KEY = '5lPMMw7mIuyzQQDjlKJbe0dY';

// Cache configuration for tradable coins
const TRADABLE_COINS_CACHE_KEY = 'future_tradable_coins';
const TRADABLE_COINS_CACHE_EXPIRY = 15 * 60 * 1000; // 15 minutes

/**
 * Fetch all available tradable coins
 * @returns {Promise<Array>} List of available coins with trading information
 */
export const fetchTradableCoins = async (forceRefresh = false) => {
  if (!forceRefresh) {
    // Check cache first
    try {
      const cachedData = localStorage.getItem(TRADABLE_COINS_CACHE_KEY);
      if (cachedData) {
        const { timestamp, data } = JSON.parse(cachedData);
        if (Date.now() - timestamp < TRADABLE_COINS_CACHE_EXPIRY) {
          console.log('Returning cached tradable coins (futures)');
          return data;
        }
      }
    } catch (error) {
      console.error('Error reading tradable coins from cache (futures):', error);
      // Proceed to fetch from API if cache read fails
    }
  }

  try {
    // Use POW-specific API endpoint (same as Market.jsx POW tab)
    const url = `${API_BASE_URL}/fetch-market?apikey=${API_KEY}&pair_type=All&market_type=is_future`;
    console.log('Fetching POW tradable coins from (futures):', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const apiResponse = await response.json();
    
    // Handle API response structure (similar to Market.jsx)
    let data = [];
    if (Array.isArray(apiResponse)) {
      data = apiResponse;
    } else if (apiResponse && Array.isArray(apiResponse.data)) {
      data = apiResponse.data;
    } else {
      console.warn('Unexpected POW API response structure:', apiResponse);
      throw new Error('Invalid API response structure');
    }
    
    // Filter valid coins and sort (BTC first, then by coin_pair)
    const tradableCoins = data
      .filter(coin => 
        coin &&
        coin.symbol &&
        coin.price !== undefined &&
        coin.coin_pair !== undefined
      )
      .sort((a, b) => {
        if (a.symbol === 'BTC') return -1;
        if (b.symbol === 'BTC') return 1;
        // Ensure coin_pair exists and is a number before sorting
        const coinPairA = Number(a.coin_pair);
        const coinPairB = Number(b.coin_pair);
        if (!isNaN(coinPairA) && !isNaN(coinPairB)) {
            return coinPairA - coinPairB;
        }
        return 0; // Default sort if coin_pair is not valid
      });
    
    console.log(`Fetched ${tradableCoins.length} tradable coins (futures)`);

    // Save to cache
    try {
      localStorage.setItem(TRADABLE_COINS_CACHE_KEY, JSON.stringify({
        timestamp: Date.now(),
        data: tradableCoins
      }));
    } catch (error) {
      console.error('Error saving tradable coins to cache (futures):', error);
    }

    return tradableCoins;
  } catch (error) {
    console.error('Error fetching tradable coins (futures):', error);
    return []; // Return empty array on error, or re-throw as per existing logic
  }
};

/**
 * Fetch wallet data for a specific coin
 * @param {string} uid - User ID
 * @param {number} coinId - Coin ID (1=BTC, 2=USDT, etc.)
 * @returns {Promise<Object>} Wallet data including balances and coin information
 */
export const fetchWalletData = async (uid, coinId) => {
  if (!uid) {
    console.error('fetchWalletData: Missing UID parameter');
    return { error: true, message: 'User ID is required' };
  }
  
  if (!coinId || isNaN(coinId)) {
    console.error(`fetchWalletData: Invalid coin ID: ${coinId}`);
    return { error: true, message: 'Invalid coin ID' };
  }
  
  try {
    const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
    console.log(`Fetching wallet data for UID ${uid}, Coin ID ${coinId} from:`, url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Normalize and validate the response data
    if (!data || !data.cryptoWallet) {
      throw new Error('Invalid wallet data structure');
    }
    
    // Extract and format the necessary data - preserve full precision (12 decimals)
    const futureWalletBalance = data.cryptoWallet?.future_wallet || '0';
    console.log('Future trading API - Preserving balance precision:', {
      futureWalletBalance,
      balanceType: typeof futureWalletBalance,
      symbol: data.cryptoWallet?.crypto_symbol
    });
    
    return {
      success: true,
      cryptoWallet: data.cryptoWallet || null,
      usdtWallet: data.usdtWallet || null,
      price: data.cryptoWallet?.price || '0',
      available: futureWalletBalance, // Preserve full precision from API
      symbol: data.cryptoWallet?.crypto_symbol || 'BTC',
      name: data.cryptoWallet?.crypto_name || 'Bitcoin',
      coinId: data.cryptoWallet?.coin_id || coinId
    };
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    return { 
      error: true, 
      message: error.message || 'Failed to fetch wallet data' 
    };
  }
};

/**
 * Execute a future trade order
 * @param {Object} params - Trade parameters
 * @returns {Promise<Object>} Trade result
 */
export const executeFutureTrade = async (params) => {
  const { uid, symbol, entry_price, amount, leverage, transaction_type } = params;
  
  if (!uid) {
    return { error: true, message: 'User ID is required for trading' };
  }
  
  try {
    // Create the URL exactly as shown in the screenshot
    const url = `${API_BASE_URL}/futures?transaction_type=${transaction_type}&apikey=${API_KEY}&uid=${uid}&symbol=${symbol}&entry_price=${entry_price}&amount=${amount}&leverage=${leverage}`;
    
    console.log('Executing future trade with URL:', url);
    
    // Use XMLHttpRequest for maximum compatibility
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
            console.log('Future trade response:', data);
            
            // Handle new API response format with status and message fields
            if (data.status === 'success') {
              resolve({
                success: true,
                data,
                message: data.message || `Future ${transaction_type === 'BUY MORE' ? 'Buy' : 'Sell'} order executed successfully`,
                important: true
              });
            } else if (data.status === 'error') {
              resolve({
                error: true,
                message: data.message || 'Trade execution failed'
              });
            } else {
              // Fallback for unexpected response format
              console.warn('Unexpected API response format:', data);
              resolve({
                error: true,
                message: 'Unexpected response from server'
              });
            }
          } catch (error) {
            console.error('Error parsing JSON response:', error);
            console.error('Raw response:', xhr.responseText);
            resolve({ error: true, message: 'Invalid response from server' });
          }
        } else {
          console.error('Future Trade API error:', xhr.responseText);
          resolve({ 
            error: true, 
            message: `API error: ${xhr.status}` 
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('Future trade execution error (network failure)');
        resolve({ 
          error: true, 
          message: 'Network error occurred during trade execution' 
        });
      };
      
      // Send the request with empty body
      xhr.send();
    });
  } catch (error) {
    console.error('Future trade execution error:', error);
    return {
      error: true,
      message: error.message || 'An error occurred during trade execution'
    };
  }
};

/**
 * Format price for display
 * @param {number|string} price - Price to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted price
 */
export const formatPrice = (price, decimals = 2) => {
  if (price == null) return "0.00";
  
  const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : price;
  
  return numPrice.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

/**
 * Close a future position
 * @param {number} futureId - Future position ID
 * @returns {Promise<Object>} Close position result
 */
export const closePosition = async (futureId) => {
  if (!futureId) {
    return { error: true, message: 'Future ID is required for closing position' };
  }
  
  try {
    const url = `${API_BASE_URL}/close-position?apikey=${API_KEY}&future_id=${futureId}`;
    
    console.log('Closing position with URL:', url);
    
    // Use XMLHttpRequest for maximum compatibility
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
            console.log('Close position response:', data);
            
            // Handle new API response format with status and message fields
            if (data.status === 'success') {
              resolve({
                success: true,
                data,
                message: data.message || 'Position closed successfully'
              });
            } else if (data.status === 'error') {
              resolve({
                error: true,
                message: data.message || 'Failed to close position'
              });
            } else {
              // Fallback for unexpected response format
              console.warn('Unexpected close position response format:', data);
              resolve({
                error: true,
                message: 'Unexpected response from server'
              });
            }
          } catch (error) {
            console.error('Error parsing close position JSON response:', error);
            console.error('Raw response:', xhr.responseText);
            resolve({ error: true, message: 'Invalid response from server' });
          }
        } else {
          console.error('Close position API error:', xhr.responseText);
          resolve({ 
            error: true, 
            message: `API error: ${xhr.status}` 
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('Close position execution error (network failure)');
        resolve({ 
          error: true, 
          message: 'Network error occurred during position close' 
        });
      };
      
      // Send the request with empty body
      xhr.send();
    });
  } catch (error) {
    console.error('Close position execution error:', error);
    return {
      error: true,
      message: error.message || 'An error occurred during position close'
    };
  }
};

/**
 * Calculate maximum tradeable amount based on available balance and leverage
 * @param {number|string} balance - Available balance
 * @param {number|string} price - Current price
 * @param {number|string} leverage - Selected leverage
 * @returns {number} Maximum tradeable amount
 */
export const calculateMaxAmount = (balance, price, leverage) => {
  const availableBalance = parseFloat(balance) || 0;
  const currentPrice = parseFloat(price) || 0;
  const leverageValue = parseFloat(leverage) || 1;
  
  if (currentPrice <= 0) return 0;
  
  // Apply a safety margin (0.95) to account for fees and price fluctuations
  return (availableBalance * leverageValue * 0.95) / currentPrice;
};

/**
 * Add margin to an existing position
 * @param {number} futureId - Future position ID
 * @param {number|string} amount - Amount of margin to add in USDT
 * @returns {Promise<Object>} Add margin result
 */
export const addMargin = async (futureId, amount) => {
  if (!futureId) {
    return { success: false, message: 'Future ID is required for adding margin' };
  }
  
  if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
    return { success: false, message: 'Valid amount is required for adding margin' };
  }
  
  try {
    const url = `${API_BASE_URL}/submit-margin?apikey=${API_KEY}`;
    
    console.log('Adding margin with URL:', url);
    
    // Use XMLHttpRequest for maximum compatibility
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          let data;
          try {
            data = JSON.parse(xhr.responseText);
            console.log('Add margin response:', data);
            
            // Handle API response format with status and message fields
            if (data.status === 'success') {
              resolve({
                success: true,
                data,
                message: data.message || 'Margin added successfully'
              });
            } else if (data.status === 'error') {
              // Handle specific error messages like "Insufficient Balance"
              console.warn('Add margin API error:', data.message);
              resolve({
                success: false,
                message: data.message || 'Failed to add margin'
              });
            } else {
              // Fallback for unexpected response format
              console.warn('Unexpected add margin response format:', data);
              resolve({
                success: false,
                message: 'Unexpected response from server'
              });
            }
          } catch (error) {
            console.error('Error parsing add margin JSON response:', error);
            console.error('Raw response:', xhr.responseText);
            resolve({ success: false, message: 'Invalid response from server' });
          }
        } else {
          console.error('Add margin API error:', xhr.responseText);
          resolve({ 
            success: false, 
            message: `API error: ${xhr.status}` 
          });
        }
      };
      
      xhr.onerror = function() {
        console.error('Add margin execution error (network failure)');
        resolve({ 
          success: false, 
          message: 'Network error occurred during adding margin' 
        });
      };
      
      // Send the request with the margin data
      const requestData = {
        future_id: futureId,
        amount: parseFloat(amount)
      };
      
      xhr.send(JSON.stringify(requestData));
    });
  } catch (error) {
    console.error('Add margin execution error:', error);
    return {
      success: false,
      message: error.message || 'An error occurred during adding margin'
    };
  }
};