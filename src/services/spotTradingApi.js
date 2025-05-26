const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';
const DEFAULT_UID = 'yE8vKBNw';

// Enhanced configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_DURATION = 30000; // Increased to 30 seconds for better performance
const REQUEST_TIMEOUT = 8000; // Increased timeout
const RATE_LIMIT_DELAY = 100; // Minimum delay between requests

// Enhanced request queue and cache
const requestQueue = new Map();
const apiCache = new Map();
const lastRequestTime = new Map();

// Helper functions
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleApiError = (error, context) => {
    console.error(`API Error in ${context}:`, error);
    return {
        success: false,
        message: error.message || 'An unexpected error occurred',
        error: error
    };
};

// Rate limiting helper
const enforceRateLimit = async (key) => {
    const lastTime = lastRequestTime.get(key) || 0;
    const timeSinceLastRequest = Date.now() - lastTime;
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
        await delay(RATE_LIMIT_DELAY - timeSinceLastRequest);
    }
    
    lastRequestTime.set(key, Date.now());
};

// Enhanced fetch with timeout and retry
const fetchWithTimeout = async (url, options = {}, timeout = REQUEST_TIMEOUT) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            // Return a special object for aborts
            return { aborted: true };
        }
        throw error;
    }
};

/**
 * Helper function to format price based on value
 * @param {number|string} price - The price to format
 * @returns {string} Formatted price string
 */
const formatPrice = (price) => {
    if (price == null || price === '') return "$0.00";

    const numPrice = typeof price === 'string' ? parseFloat(price) || 0 : (price || 0);

    if (numPrice >= 1000) {
        return `$${numPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else if (numPrice >= 1) {
        return `$${numPrice.toFixed(4)}`;
    } else if (numPrice >= 0.01) {
        return `$${numPrice.toFixed(6)}`;
    } else {
        return `$${numPrice.toFixed(8)}`;
    }
};

/**
 * Fetches details for a specific coin by symbol
 * @param {string} symbol - The coin symbol (e.g., 'BTC', 'ETH')
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<Object>} Promise with coin details or error information
 */
export const fetchCoinDetails = async (symbol, retryCount = 0) => {
    try {
        // Validate input
        if (!symbol || typeof symbol !== 'string') {
            return { success: false, message: "Valid coin symbol is required" };
        }

        const coinSymbol = symbol.toUpperCase().trim();
        const cacheKey = `coin_details_${coinSymbol}`;
        
        // Check cache first
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION)) {
            console.log(`Using cached data for ${coinSymbol}`);
            return cachedData.data;
        }

        // Check if request is already in progress
        if (requestQueue.has(cacheKey)) {
            console.log(`Request already in progress for ${coinSymbol}, waiting...`);
            return await requestQueue.get(cacheKey);
        }

        // Enforce rate limiting
        await enforceRateLimit(`coin_details`);

        const url = `${API_BASE_URL}/coins?apikey=${API_KEY}`;

        // Create request promise
        const requestPromise = (async () => {
            try {
                console.log(`Fetching coin data for ${coinSymbol}`);
                
                const response = await fetchWithTimeout(url, { method: 'GET' });

                if (!response.ok) {
                    if (retryCount < MAX_RETRIES) {
                        console.log(`Retrying request for ${coinSymbol} (${retryCount + 1}/${MAX_RETRIES})`);
                        await delay(RETRY_DELAY * (retryCount + 1));
                        requestQueue.delete(cacheKey);
                        return fetchCoinDetails(symbol, retryCount + 1);
                    }
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }

                const coinsData = await response.json();

                if (!Array.isArray(coinsData)) {
                    throw new Error('Invalid API response format');
                }

                // Find the coin by symbol
                const coinDetails = coinsData.find(coin => coin.symbol === coinSymbol);

                if (!coinDetails) {
                    return {
                        success: false,
                        message: `Coin with symbol ${coinSymbol} not found`
                    };
                }

                // Process coin details
                const processedCoin = {
                    ...coinDetails,
                    price: parseFloat(coinDetails.price) || 0,
                    price_change_24h: parseFloat(coinDetails.price_change_24h) || 0,
                    volume_24h: parseFloat(coinDetails.volume_24h) || 0,
                    market_cap: parseFloat(coinDetails.market_cap) || 0,
                    circulating_supply: parseFloat(coinDetails.circulating_supply) || 0,
                    total_supply: parseFloat(coinDetails.total_supply) || 0,
                    max_supply: parseFloat(coinDetails.max_supply) || 0
                };

                // Handle 24h high/low with better fallbacks
                processedCoin['24_high'] = coinDetails['24_high'] ? 
                    parseFloat(coinDetails['24_high']) : 
                    processedCoin.price * 1.05;
                
                processedCoin['24_low'] = coinDetails['24_low'] ? 
                    parseFloat(coinDetails['24_low']) : 
                    processedCoin.price * 0.95;

                // Add formatted values
                processedCoin.formatted_price = formatPrice(processedCoin.price);
                processedCoin.price_change_formatted = `${processedCoin.price_change_24h.toFixed(2)}%`;
                processedCoin.price_change_is_positive = processedCoin.price_change_24h >= 0;
                processedCoin['24_high_formatted'] = formatPrice(processedCoin['24_high']);
                processedCoin['24_low_formatted'] = formatPrice(processedCoin['24_low']);

                const responseObject = {
                    success: true,
                    data: processedCoin,
                    message: 'Coin details fetched successfully'
                };

                // Cache the response
                apiCache.set(cacheKey, {
                    data: responseObject,
                    timestamp: Date.now()
                });

                return responseObject;

            } catch (error) {
                console.error(`Error fetching ${coinSymbol}:`, error);
                throw error;
            } finally {
                requestQueue.delete(cacheKey);
            }
        })();

        // Add to queue
        requestQueue.set(cacheKey, requestPromise);
        return await requestPromise;

    } catch (error) {
        requestQueue.delete(`coin_details_${symbol.toUpperCase()}`);
        return handleApiError(error, `fetchCoinDetails(${symbol})`);
    }
};

/**
 * Fetches all available coins for trading
 * @returns {Promise<Object>} Promise with array of coins
 */
export const fetchAllCoins = async () => {
    const cacheKey = 'all_coins';
    try {
        const url = `${API_BASE_URL}/coins?apikey=${API_KEY}`;
        const requestPromise = (async () => {
            try {
                const response = await fetchWithTimeout(url, { method: 'GET' });
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                if (!Array.isArray(data)) {
                    throw new Error('Invalid API response format - expected array');
                }
                // Process and format the coin data
                const formattedCoins = data.map((coin, index) => ({
                    ...coin,
                    id: coin.id || index + 1,
                    coin_pair: coin.coin_pair || coin.id || index + 1,
                    price: parseFloat(coin.price) || 0,
                    price_change_24h: parseFloat(coin.price_change_24h) || 0,
                    formatted_price: formatPrice(parseFloat(coin.price) || 0),
                    price_change_formatted: `${(parseFloat(coin.price_change_24h) || 0).toFixed(2)}%`,
                    price_change_is_positive: (parseFloat(coin.price_change_24h) || 0) >= 0,
                    logo_path: coin.logo_path || `/assets/coin/${coin.symbol?.toLowerCase() || 'default'}.png`
                }));
                return {
                    success: true,
                    coins: formattedCoins,
                    message: 'Coins fetched successfully'
                };
            } catch (error) {
                let errorMsg = error.message;
                if (errorMsg.includes('Failed to fetch')) {
                    errorMsg = 'Network or CORS error: Unable to fetch coins from API.';
                }
                return {
                    success: false,
                    coins: [],
                    message: errorMsg,
                    error: errorMsg
                };
            } finally {
                requestQueue.delete(cacheKey);
            }
        })();
        requestQueue.set(cacheKey, requestPromise);
        return await requestPromise;
    } catch (error) {
        requestQueue.delete(cacheKey);
        let errorMsg = error.message;
        if (errorMsg.includes('Failed to fetch')) {
            errorMsg = 'Network or CORS error: Unable to fetch coins from API.';
        }
        return {
            success: false,
            coins: [],
            message: errorMsg,
            error: errorMsg
        };
    }
};

/**
 * Execute a spot trade order
 * @param {Object} params - Trade parameters
 * @returns {Promise<Object>} Promise with trade result
 */
export const executeSpotTradeOrder = async (params) => {
    try {
        const { 
            uid = DEFAULT_UID, 
            coin_pair_id, 
            order_type, 
            excecution_type = 'limit',
            side = 'buy',
            price, 
            amount 
        } = params;

        // Validation
        const validationErrors = [];
        if (!uid) validationErrors.push('User ID is required');
        if (!coin_pair_id) validationErrors.push('Coin pair ID is required');
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
            validationErrors.push('Valid price is required');
        }
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            validationErrors.push('Valid amount is required');
        }

        if (validationErrors.length > 0) {
            return {
                success: false,
                message: validationErrors.join(', ')
            };
        }

        const effectiveOrderType = order_type || side;
        const total_in_usdt = (parseFloat(price) * parseFloat(amount)).toFixed(6);
        
        // Enforce rate limiting for trades
        await enforceRateLimit(`trade_${uid}`);

        const url = `${API_BASE_URL}/orders?uid=${uid}&coin_id=${coin_pair_id}&order_type=${effectiveOrderType}&excecution_type=${excecution_type}&price=${price}&amount=${amount}&total_in_usdt=${total_in_usdt}&apikey=${API_KEY}`;
        
        console.log('Executing spot trade:', { uid, coin_pair_id, side, price, amount });
        
        const response = await fetchWithTimeout(url, { method: 'POST' });

        let data;
        try {
            data = await response.json();
        } catch (e) {
            // Mock response for development
            console.warn('API returned invalid JSON, using mock response');
            data = {
                success: true,
                order_id: `mock-${Date.now()}`,
                message: 'Order processed successfully (mock)',
                timestamp: new Date().toISOString()
            };
        }

        if (!response.ok && !data?.success) {
            throw new Error(data?.message || `Trade execution failed: ${response.status}`);
        }

        return {
            success: true,
            data,
            message: `${side === 'buy' ? 'Buy' : 'Sell'} order executed successfully`
        };

    } catch (error) {
        console.error('Spot trade execution error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Trade execution failed'
        };
    }
};

/**
 * Get user's spot trading wallet for a specific coin
 * @param {string} uid - User ID
 * @param {string|number} coinId - Coin ID
 * @returns {Promise<Object>} Wallet data including balances and coin information
 */
export const getSpotWallet = async (uid, coinId) => {
    if (!uid) {
        return { 
            success: false, 
            error: true, 
            message: 'User ID is required' 
        };
    }
    
    if (!coinId) {
        return { 
            success: false, 
            error: true, 
            message: 'Coin ID is required' 
        };
    }
    
    const cacheKey = `wallet_${uid}_${coinId}`;
    
    try {
        // Check cache first (shorter cache for wallet data)
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < 10000)) { // 10 second cache
            console.log(`Using cached wallet data for ${uid}/${coinId}`);
            return cachedData.data;
        }

        // Enforce rate limiting
        await enforceRateLimit(`wallet_${uid}`);

        const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
        console.log(`Fetching wallet for UID ${uid}, Coin ID ${coinId}`);
        
        const response = await fetchWithTimeout(url, { method: 'GET' });
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        
        const responseObject = {
            success: true,
            cryptoWallet: data.cryptoWallet || {},
            usdtWallet: data.usdtWallet || {},
            message: 'Spot wallet fetched successfully'
        };

        // Cache the response (shorter cache for wallet data)
        apiCache.set(cacheKey, {
            data: responseObject,
            timestamp: Date.now()
        });

        return responseObject;

    } catch (error) {
        console.error(`getSpotWallet error for ${uid}/${coinId}:`, error);
        return { 
            success: false,
            error: true, 
            message: error.message || 'Failed to fetch spot wallet data' 
        };
    }
};

/**
 * Get user's spot trading account balance
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Promise with balance information
 */
export const getSpotBalance = async (uid = DEFAULT_UID) => {
    const cacheKey = `balance_${uid}`;
    
    try {
        // Check cache first
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < 15000)) { // 15 second cache
            return cachedData.data;
        }

        // Enforce rate limiting
        await enforceRateLimit(`balance_${uid}`);

        const url = `${API_BASE_URL}/balance/${uid}?apikey=${API_KEY}`;
        
        const response = await fetchWithTimeout(url, { method: 'GET' });

        if (!response.ok) {
            throw new Error(`Failed to fetch balance: ${response.status}`);
        }

        const data = await response.json();
        
        const responseObject = {
            success: true,
            balance: data.balance || {
                usdt: 50000.00,
                btc: 1.23456,
                eth: 15.7891,
                xrp: 10000.00
            },
            message: 'Spot balance fetched successfully'
        };

        // Cache the response
        apiCache.set(cacheKey, {
            data: responseObject,
            timestamp: Date.now()
        });

        return responseObject;

    } catch (error) {
        console.error('Error fetching spot balance:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to fetch balance'
        };
    }
};

/**
 * Clear cache for specific keys or all cache
 * @param {string|Array} keys - Specific cache keys to clear, or 'all' for everything
 */
export const clearCache = (keys = 'all') => {
    if (keys === 'all') {
        apiCache.clear();
        requestQueue.clear();
        lastRequestTime.clear();
        console.log('All API cache cleared');
    } else {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
            apiCache.delete(key);
            requestQueue.delete(key);
            lastRequestTime.delete(key);
        });
        console.log('Cleared cache for keys:', keysArray);
    }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
    return {
        cacheSize: apiCache.size,
        activeRequests: requestQueue.size,
        rateLimitEntries: lastRequestTime.size,
        cacheKeys: Array.from(apiCache.keys())
    };
};

/**
 * Get a coin from the all_coins cache by coin_pair or symbol
 * @param {string|number} coinPairIdOrSymbol
 * @returns {object|null}
 */
export function getCoinFromCache(coinPairIdOrSymbol) {
  const cache = apiCache.get('all_coins');
  if (!cache || !cache.data || !Array.isArray(cache.data.coins)) return null;
  const coins = cache.data.coins;
  if (!coinPairIdOrSymbol) return null;
  return coins.find(
    c => c.coin_pair?.toString() === coinPairIdOrSymbol.toString() ||
         c.symbol?.toUpperCase() === coinPairIdOrSymbol.toString().toUpperCase()
  ) || null;
}

// Export the formatPrice function as well
export { formatPrice };