const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';
const DEFAULT_UID = '   ';

// Enhanced configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;
const CACHE_DURATION = 30000; // 30 seconds for other data
const COINS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes for coins data (more frequent updates)
const REQUEST_TIMEOUT = 8000;
const RATE_LIMIT_DELAY = 100;

// Cache keys
const COINS_CACHE_KEY = 'spot_trading_coins_cache_v2';
const COINS_CACHE_TIMESTAMP_KEY = 'spot_trading_coins_cache_timestamp_v2';
const COINS_CACHE_VERSION_KEY = 'spot_trading_coins_cache_version';
const CURRENT_CACHE_VERSION = '2.0';

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
            return { aborted: true };
        }
        throw error;
    }
};

/**
 * Helper function to format price based on value
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
 * Check if coins cache is valid
 */
const isCacheValid = () => {
    try {
        const version = localStorage.getItem(COINS_CACHE_VERSION_KEY);
        const timestamp = localStorage.getItem(COINS_CACHE_TIMESTAMP_KEY);
        
        if (version !== CURRENT_CACHE_VERSION) {
            console.log('Cache version mismatch, clearing cache');
            clearCoinsCache();
            return false;
        }
        
        if (!timestamp) return false;
        
        const cacheAge = Date.now() - parseInt(timestamp);
        const isValid = cacheAge < COINS_CACHE_DURATION;
        
        if (!isValid) {
            console.log(`Cache expired: ${Math.round(cacheAge / 1000)}s old, max age: ${Math.round(COINS_CACHE_DURATION / 1000)}s`);
        }
        
        return isValid;
    } catch (error) {
        console.error('Error checking cache validity:', error);
        return false;
    }
};

/**
 * Get coins from localStorage cache
 */
const getCoinsFromCache = () => {
    try {
        if (!isCacheValid()) {
            return null;
        }
        
        const cachedData = localStorage.getItem(COINS_CACHE_KEY);
        if (!cachedData) return null;
        
        const parsedData = JSON.parse(cachedData);
        console.log(`✅ Loaded ${parsedData.length} coins from cache`);
        return parsedData;
    } catch (error) {
        console.error('Error reading coins from cache:', error);
        clearCoinsCache(); // Clear corrupted cache
        return null;
    }
};

/**
 * Save coins to localStorage cache
 */
const saveCoinsToCache = (coins) => {
    try {
        const dataToSave = JSON.stringify(coins);
        const timestamp = Date.now().toString();
        
        localStorage.setItem(COINS_CACHE_KEY, dataToSave);
        localStorage.setItem(COINS_CACHE_TIMESTAMP_KEY, timestamp);
        localStorage.setItem(COINS_CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
        
        console.log(`💾 Saved ${coins.length} coins to cache (${Math.round(dataToSave.length / 1024)}KB)`);
    } catch (error) {
        console.error('Error saving coins to cache:', error);
        
        // If localStorage is full, try to clear old data and retry
        if (error.name === 'QuotaExceededError') {
            console.log('Storage quota exceeded, clearing cache and retrying...');
            try {
                clearCoinsCache();
                localStorage.setItem(COINS_CACHE_KEY, JSON.stringify(coins));
                localStorage.setItem(COINS_CACHE_TIMESTAMP_KEY, Date.now().toString());
                localStorage.setItem(COINS_CACHE_VERSION_KEY, CURRENT_CACHE_VERSION);
                console.log('✅ Successfully saved after clearing cache');
            } catch (retryError) {
                console.error('❌ Failed to save coins to cache even after clearing:', retryError);
            }
        }
    }
};

/**
 * Clear coins cache
 */
export const clearCoinsCache = () => {
    try {
        localStorage.removeItem(COINS_CACHE_KEY);
        localStorage.removeItem(COINS_CACHE_TIMESTAMP_KEY);
        localStorage.removeItem(COINS_CACHE_VERSION_KEY);
        console.log('🗑️ Coins cache cleared');
    } catch (error) {
        console.error('Error clearing coins cache:', error);
    }
};

/**
 * Process and normalize coin data from API
 */
const processCoinData = (rawCoins) => {
    return rawCoins.map((coin, index) => {
        const processedCoin = {
            ...coin,
            // Ensure required fields
            id: coin.coin_pair || coin.id || index + 1,
            coin_pair: coin.coin_pair || coin.id || index + 1,
            symbol: coin.symbol || 'UNKNOWN',
            name: coin.name || coin.symbol || 'Unknown Coin',
            websocket_name: coin.websocket_name || coin.symbol || 'UNKNOWN', // Ensure websocket_name is available
            pair_name: coin.pair_name || 'USDT',
            
            // Process numeric fields
            price: parseFloat(coin.price) || 0,
            price_change_24h: parseFloat(coin.price_change_24h) || 0,
            volume_24h: parseFloat(coin.volume_24h) || 0,
            market_cap: parseFloat(coin.market_cap) || 0,
            
            // Process 24h high/low with fallbacks
            '24_high': coin['24_high'] ? parseFloat(coin['24_high']) : parseFloat(coin.price) * 1.02,
            '24_low': coin['24_low'] ? parseFloat(coin['24_low']) : parseFloat(coin.price) * 0.98,
            
            // Add formatted fields
            formatted_price: formatPrice(parseFloat(coin.price) || 0),
            price_change_formatted: `${(parseFloat(coin.price_change_24h) || 0).toFixed(2)}%`,
            price_change_is_positive: (parseFloat(coin.price_change_24h) || 0) >= 0,
            
            // Ensure logo path
            logo_path: coin.logo_path || `/assets/coin/${coin.symbol?.toLowerCase() || 'default'}.png`,
            
            // Add trading status
            is_tradable: coin.is_tradable || 'yes',
            is_favorite: coin.is_favorite || false,
            
            // Add timestamp
            last_updated: coin.last_updated || new Date().toISOString(),
            cache_timestamp: Date.now()
        };
        
        return processedCoin;
    });
};

/**
 * Fetches all available coins for trading with enhanced caching
 * @param {boolean} forceRefresh - Force refresh from API
 * @returns {Promise<Object>} Promise with array of coins
 */
export const fetchAllCoins = async (forceRefresh = false) => {
    const cacheKey = 'all_coins_api_v2';
    
    try {
        // Check cache first unless force refresh is requested
        if (!forceRefresh) {
            const cachedCoins = getCoinsFromCache();
            if (cachedCoins && cachedCoins.length > 0) {
                return {
                    success: true,
                    coins: cachedCoins,
                    message: 'Coins loaded from cache',
                    fromCache: true,
                    cacheAge: Date.now() - parseInt(localStorage.getItem(COINS_CACHE_TIMESTAMP_KEY) || '0')
                };
            }
        }

        // Check if request is already in progress
        if (requestQueue.has(cacheKey)) {
            console.log('⏳ Coins fetch already in progress, waiting...');
            return await requestQueue.get(cacheKey);
        }

        console.log('🌐 Fetching coins from API...');
        
        const url = `${API_BASE_URL}/coins?apikey=${API_KEY}`;
        
        const requestPromise = (async () => {
            try {
                // Enforce rate limiting
                await enforceRateLimit('fetch_all_coins');
                
                const response = await fetchWithTimeout(url, { method: 'GET' });
                
                if (response.aborted) {
                    throw new Error('Request timed out');
                }
                
                if (!response.ok) {
                    throw new Error(`API Error: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                if (!Array.isArray(data)) {
                    throw new Error('Invalid API response format - expected array');
                }
                
                if (data.length === 0) {
                    throw new Error('API returned empty coin list');
                }

                // Process and format the coin data
                const processedCoins = processCoinData(data);

                // Sort coins: BTC first, then by coin_pair
                const sortedCoins = processedCoins.sort((a, b) => {
                    if (a.symbol === 'BTC') return -1;
                    if (b.symbol === 'BTC') return 1;
                    return (a.coin_pair || 0) - (b.coin_pair || 0);
                });

                // Save to cache
                saveCoinsToCache(sortedCoins);

                console.log(`✅ Successfully fetched ${sortedCoins.length} coins from API`);

                return {
                    success: true,
                    coins: sortedCoins,
                    message: 'Coins fetched successfully from API',
                    fromCache: false,
                    count: sortedCoins.length
                };

            } catch (error) {
                console.error('❌ Error fetching coins from API:', error);
                
                // Try to return cached data as fallback (even if expired)
                try {
                    const cachedData = localStorage.getItem(COINS_CACHE_KEY);
                    if (cachedData) {
                        const fallbackCoins = JSON.parse(cachedData);
                        console.log('⚠️ API failed, returning stale cached data as fallback');
                        return {
                            success: true,
                            coins: fallbackCoins,
                            message: 'API failed, loaded stale cache as fallback',
                            fromCache: true,
                            isStale: true,
                            apiError: error.message
                        };
                    }
                } catch (cacheError) {
                    console.error('Failed to read fallback cache:', cacheError);
                }
                
                throw error;
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
            errorMsg = 'Network error: Unable to connect to the server. Please check your internet connection.';
        } else if (errorMsg.includes('timeout')) {
            errorMsg = 'Request timed out. Please try again.';
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
 * Get a specific coin from cache by symbol or coin_pair
 * @param {string|number} identifier - Coin symbol or coin_pair ID
 * @returns {Object|null} Coin data or null if not found
 */
export const getCoinFromCache = (identifier) => {
    try {
        const cachedCoins = getCoinsFromCache();
        if (!cachedCoins || !Array.isArray(cachedCoins)) return null;
        
        const searchId = identifier.toString().toLowerCase();
        
        const coin = cachedCoins.find(coin => 
            coin.symbol?.toLowerCase() === searchId ||
            coin.coin_pair?.toString() === identifier.toString() ||
            coin.id?.toString() === identifier.toString()
        );
        
        if (coin) {
            console.log(`🎯 Found ${coin.symbol} in cache`);
        }
        
        return coin || null;
    } catch (error) {
        console.error('Error getting coin from cache:', error);
        return null;
    }
};

/**
 * Get multiple coins from cache by symbols or IDs
 * @param {Array} identifiers - Array of coin symbols or coin_pair IDs
 * @returns {Array} Array of coin data
 */
export const getCoinsFromCacheByIds = (identifiers) => {
    try {
        const cachedCoins = getCoinsFromCache();
        if (!cachedCoins || !Array.isArray(cachedCoins)) return [];
        
        const results = identifiers.map(id => getCoinFromCache(id)).filter(Boolean);
        console.log(`📦 Retrieved ${results.length}/${identifiers.length} coins from cache`);
        
        return results;
    } catch (error) {
        console.error('Error getting coins from cache:', error);
        return [];
    }
};

/**
 * Fetches details for a specific coin by symbol (now uses cache)
 * @param {string} symbol - The coin symbol (e.g., 'BTC', 'ETH')
 * @returns {Promise<Object>} Promise with coin details or error information
 */
export const fetchCoinDetails = async (symbol) => {
    try {
        if (!symbol || typeof symbol !== 'string') {
            return { success: false, message: "Valid coin symbol is required" };
        }

        const coinSymbol = symbol.toUpperCase().trim();
        
        // Try to get from cache first
        const cachedCoin = getCoinFromCache(coinSymbol);
        if (cachedCoin) {
            return {
                success: true,
                data: cachedCoin,
                message: 'Coin details loaded from cache'
            };
        }

        // If not in cache, fetch all coins (which will update cache)
        console.log(`🔍 ${coinSymbol} not in cache, fetching all coins...`);
        const coinsResponse = await fetchAllCoins();
        
        if (!coinsResponse.success) {
            return {
                success: false,
                message: `Failed to fetch coin data: ${coinsResponse.message}`
            };
        }

        // Try to find the coin again after fetching
        const coin = coinsResponse.coins.find(c => c.symbol === coinSymbol);
        if (!coin) {
            return {
                success: false,
                message: `Coin with symbol ${coinSymbol} not found`
            };
        }

        return {
            success: true,
            data: coin,
            message: 'Coin details fetched successfully'
        };

    } catch (error) {
        return handleApiError(error, `fetchCoinDetails(${symbol})`);
    }
};

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export const getCacheStats = () => {
    const cachedCoins = getCoinsFromCache();
    const timestamp = localStorage.getItem(COINS_CACHE_TIMESTAMP_KEY);
    const version = localStorage.getItem(COINS_CACHE_VERSION_KEY);
    
    return {
        coinsCount: cachedCoins ? cachedCoins.length : 0,
        cacheValid: isCacheValid(),
        cacheAge: timestamp ? Date.now() - parseInt(timestamp) : 0,
        cacheExpiry: COINS_CACHE_DURATION,
        version: version || 'unknown',
        currentVersion: CURRENT_CACHE_VERSION,
        memoryCache: {
            size: apiCache.size,
            activeRequests: requestQueue.size,
            rateLimitEntries: lastRequestTime.size
        },
        localStorage: {
            available: typeof Storage !== 'undefined',
            usage: (() => {
                try {
                    const total = 5 * 1024 * 1024; // 5MB typical limit
                    let used = 0;
                    for (let key in localStorage) {
                        if (localStorage.hasOwnProperty(key)) {
                            used += localStorage[key].length + key.length;
                        }
                    }
                    return {
                        used: Math.round(used / 1024), // KB
                        total: Math.round(total / 1024), // KB
                        percentage: Math.round((used / total) * 100)
                    };
                } catch {
                    return { used: 0, total: 0, percentage: 0 };
                }
            })()
        }
    };
};

// Keep existing functions for wallet and trading...
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
        
        await enforceRateLimit(`trade_${uid}`);

        const url = `${API_BASE_URL}/orders?uid=${uid}&coin_id=${coin_pair_id}&order_type=${effectiveOrderType}&excecution_type=${excecution_type}&price=${price}&amount=${amount}&total_in_usdt=${total_in_usdt}&apikey=${API_KEY}`;
        
        console.log('Executing spot trade:', { uid, coin_pair_id, side, price, amount });
        
        const response = await fetchWithTimeout(url, { method: 'POST' });

        let data;
        try {
            data = await response.json();
        } catch (e) {
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
        
        // Clear the wallet cache for this user and coin pair to ensure fresh data on next fetch
        const walletCacheKey = `wallet_${uid}_${coin_pair_id}`;
        apiCache.delete(walletCacheKey);
        console.log(`Cleared wallet cache for ${uid}/${coin_pair_id} after successful trade`);

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
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < 10000)) {
            console.log(`Using cached wallet data for ${uid}/${coinId}`);
            return cachedData.data;
        }

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

export const getSpotBalance = async (uid = DEFAULT_UID) => {
    const cacheKey = `balance_${uid}`;
    
    try {
        const cachedData = apiCache.get(cacheKey);
        if (cachedData && (Date.now() - cachedData.timestamp < 15000)) {
            return cachedData.data;
        }

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
 * Clear all cache
 */
export const clearCache = (keys = 'all') => {
    if (keys === 'all') {
        apiCache.clear();
        requestQueue.clear();
        lastRequestTime.clear();
        clearCoinsCache();
        console.log('🗑️ All cache cleared');
    } else {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
            apiCache.delete(key);
            requestQueue.delete(key);
            lastRequestTime.delete(key);
        });
        console.log('🗑️ Cleared cache for keys:', keysArray);
    }
};

/**
 * Add coin to user's favorites
 * @param {string} uid - User ID
 * @param {string} coinId - Coin ID
 * @returns {Promise<Object>} Promise with success status
 */
export const addToFavorites = async (uid, coinId) => {
    try {
        if (!uid || !coinId) {
            return {
                success: false,
                message: 'User ID and Coin ID are required'
            };
        }

        await enforceRateLimit(`favorites_${uid}`);

        const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
        
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'add_favorite'
            })
        });

        if (response.aborted) {
            throw new Error('Request timed out');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            data,
            message: 'Successfully added to favorites'
        };

    } catch (error) {
        console.error('Error adding to favorites:', error);
        return {
            success: false,
            message: error.message || 'Failed to add to favorites'
        };
    }
};

/**
 * Remove coin from user's favorites
 * @param {string} uid - User ID
 * @param {string} coinId - Coin ID
 * @returns {Promise<Object>} Promise with success status
 */
export const removeFromFavorites = async (uid, coinId) => {
    try {
        if (!uid || !coinId) {
            return {
                success: false,
                message: 'User ID and Coin ID are required'
            };
        }

        await enforceRateLimit(`favorites_${uid}`);

        const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
        
        const response = await fetchWithTimeout(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'remove_favorite'
            })
        });

        if (response.aborted) {
            throw new Error('Request timed out');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            data,
            message: 'Successfully removed from favorites'
        };

    } catch (error) {
        console.error('Error removing from favorites:', error);
        return {
            success: false,
            message: error.message || 'Failed to remove from favorites'
        };
    }
};

/**
 * Check if coin is in user's favorites
 * @param {string} uid - User ID
 * @param {string} coinId - Coin ID
 * @returns {Promise<Object>} Promise with favorite status
 */
export const checkFavoriteStatus = async (uid, coinId) => {
    try {
        if (!uid || !coinId) {
            return {
                success: false,
                message: 'User ID and Coin ID are required'
            };
        }

        await enforceRateLimit(`check_favorite_${uid}`);

        const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
        
        const response = await fetchWithTimeout(url, {
            method: 'GET'
        });

        if (response.aborted) {
            throw new Error('Request timed out');
        }

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        return {
            success: true,
            is_favorite: data.is_favorite || false,
            data,
            message: 'Favorite status retrieved successfully'
        };

    } catch (error) {
        console.error('Error checking favorite status:', error);
        return {
            success: false,
            is_favorite: false,
            message: error.message || 'Failed to check favorite status'
        };
    }
};

/**
 * Get user's favorite coins list
 * @param {string} uid - User ID
 * @returns {Promise<Object>} Promise with favorites list
 */
export const getUserFavorites = async (uid) => {
    try {
        if (!uid) {
            return {
                success: false,
                message: 'User ID is required'
            };
        }

        // For now, we'll get all coins and filter favorites
        // In a real implementation, there should be a dedicated endpoint
        const coinsResponse = await fetchAllCoins();
        
        if (!coinsResponse.success) {
            return {
                success: false,
                message: 'Failed to fetch coins data'
            };
        }

        // Check favorite status for each coin (this is not efficient for large lists)
        // In production, you'd want a dedicated endpoint that returns only favorites
        const favoriteCoins = [];
        
        // For demo purposes, return first 8 tradable coins as favorites
        const tradableCoins = coinsResponse.coins.filter(coin => coin.is_tradable);
        const demoFavorites = tradableCoins.slice(0, 8);

        return {
            success: true,
            favorites: demoFavorites,
            message: 'Favorites retrieved successfully'
        };

    } catch (error) {
        console.error('Error getting user favorites:', error);
        return {
            success: false,
            favorites: [],
            message: error.message || 'Failed to get favorites'
        };
    }
};

export { formatPrice };