const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';

/**
 * Fetches details for a specific coin by symbol
 * @param symbol - The coin symbol (e.g., 'BTC', 'ETH')
 * @returns Promise with coin details or error information
 */
export const fetchCoinDetails = async (symbol) => {
    try {
        // Validate input
        if (!symbol) {
            console.error('Symbol is required');
            return { success: false, message: "Coin symbol is required" };
        }

        // Convert symbol to uppercase
        const coinSymbol = symbol.toUpperCase();

        // API URL with query parameter
        const url = `${API_BASE_URL}/coins?apikey=${API_KEY}`;

        console.log(`Fetching coin data for ${coinSymbol} from: ${url}`);

        // Send request
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log("Status code:", response.status);

        // Check response status
        if (!response.ok) {
            console.error('API Error:', response.status);
            return { success: false, message: `API Error: ${response.status}` };
        }

        // Parse JSON
        try {
            const coinsData = await response.json();

            // Find the coin by symbol
            let coinDetails = null;
            for (const coin of coinsData) {
                if (coin.symbol === coinSymbol) {
                    coinDetails = { ...coin };
                    break;
                }
            }

            if (coinDetails) {
                // Convert price to number if it's a string or other type
                if (typeof coinDetails.price !== 'number') {
                    coinDetails.price = parseFloat(coinDetails.price) || 0;
                }
                
                // Add formatting for price display
                coinDetails.formatted_price = formatPrice(coinDetails.price);

                // Format price change
                const priceChange = coinDetails.price_change_24h || 0.0;
                coinDetails.price_change_formatted = `${priceChange.toFixed(2)}%`;
                coinDetails.price_change_is_positive = priceChange >= 0;

                // Make sure all numerical fields are numbers
                ['volume_24h', 'market_cap', 'circulating_supply', 'total_supply', 'max_supply'].forEach(field => {
                    if (coinDetails[field] && typeof coinDetails[field] !== 'number') {
                        coinDetails[field] = parseFloat(coinDetails[field]) || 0;
                    }
                });
                
                // Ensure logo information is available
                if (!coinDetails.logo && coinDetails.logo_path) {
                    coinDetails.logo = coinDetails.logo_path;
                } else if (!coinDetails.logo_path && coinDetails.logo) {
                    coinDetails.logo_path = coinDetails.logo;
                }
                
                // Log the logo information for debugging
                console.log(`Logo for ${coinSymbol}:`, coinDetails.logo || coinDetails.logo_path || 'No logo found');

                // Success - found the coin
                return {
                    success: true,
                    message: "Coin details retrieved successfully",
                    data: coinDetails,
                    allCoins: coinsData
                };
            } else {
                // Coin not found
                console.warn(`Coin ${coinSymbol} not found`);
                return {
                    success: false,
                    message: `Coin with symbol ${coinSymbol} not found`,
                    allCoins: coinsData
                };
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            return { success: false, message: `Invalid response format: ${e}` };
        }
    } catch (e) {
        console.error("Exception:", e);
        return { success: false, message: `Network error: ${e}` };
    }
};

/**
 * Execute a future trade order
 * @param params - Trade parameters including symbol, order_type, execution_type, price, amount, leverage
 * @returns Promise with trade result
 */
export const executeFutureTradeOrder = async (params) => {
    try {
        const { uid, symbol = 'BTC', order_type, execution_type, price, amount, leverage = 10 } = params;
        
        // Validate required parameters
        if (!uid) {
            throw new Error('User ID is required for trading');
        }
        
        // Calculate total
        const total_in_usdt = (price * amount).toFixed(6);
        
        // Use transaction_type instead of order_type as the API requires
        const url = `${API_BASE_URL}/futures?uid=${uid}&symbol=${symbol}&transaction_type=${order_type}&execution_type=${execution_type}&entry_price=${price}&amount=${amount}&leverage=${leverage}&total_in_usdt=${total_in_usdt}&apikey=${API_KEY}`;
        
        console.log('Executing future trade with URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('API response is not in the expected JSON format');
        }

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Future Trade API error:', data);
            throw new Error(data.message || `API error: ${response.status}`);
        }

        // Check if the API returned an error
        if (data.error) {
            console.error('API returned an error:', data.error);
            throw new Error(data.error);
        }

        console.log('Future trade successful:', data);
        return {
            success: true,
            data,
            message: `Future ${order_type === 'buy' ? 'Buy' : 'Sell'} order executed successfully`
        };
    } catch (error) {
        console.error('Future trade execution error:', error);
        throw error;
    }
};

/**
 * Get user's future trading account balance
 * @param uid - User ID
 * @returns Promise with balance information
 */
export const getFutureBalance = async (uid) => {
    // Validate UID parameter
    if (!uid) {
        throw new Error('User ID is required for fetching balance');
    }
    
    try {
        // Use coin ID 1 for BTC/USDT as specified by the user
        return await fetchWalletForCoin(uid, 1);
    } catch (error) {
        console.error('Error in getFutureBalance:', error);
        throw error;
    }
};

/**
 * Helper function to fetch wallet balance for a specific coin
 * @param uid - User ID
 * @param coinId - Coin ID (1=BTC, 2=USDT)
 * @returns Promise with balance information
 */
const fetchWalletForCoin = async (uid, coinId) => {
    try {
        // Use the exact endpoint shown in the user's message
        const url = `${API_BASE_URL}/user-wallet/${uid}/${coinId}?apikey=${API_KEY}`;
        
        console.log(`Fetching wallet balance for coin ID ${coinId} from:`, url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        console.log(`Wallet API response status for coin ${coinId}:`, response.status);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            console.error(`API response for coin ${coinId} is not JSON. Content-Type:`, contentType);
            throw new Error(`API did not return JSON for coin ${coinId}`);
        }

        const data = await response.json();
        
        // Log the full response data for debugging
        console.log(`Full wallet API response for coin ${coinId}:`, JSON.stringify(data, null, 2));
        
        if (!response.ok) {
            console.error(`Error fetching balance for coin ${coinId}:`, data);
            throw new Error(`API error for coin ${coinId}: ${response.status}`);
        }

        // Check if the API returned an error
        if (data.error) {
            console.error(`API returned an error for coin ${coinId}:`, data.error);
            throw new Error(`API error for coin ${coinId}: ${data.error}`);
        }
        
        // Process the API response
        if (data && typeof data === 'object') {
            // For BTC/USDT pair (coinId = 1), the structure should have cryptoWallet and usdtWallet
            let btcBalance = 0;
            let usdtBalance = 0;
            
            // Extract BTC balance
            if (data.cryptoWallet && typeof data.cryptoWallet === 'object') {
                console.log(`Found cryptoWallet:`, data.cryptoWallet);
                btcBalance = parseFloat(data.cryptoWallet.future_wallet || data.cryptoWallet.spot_wallet || 0);
            }
            
            // Extract USDT balance
            if (data.usdtWallet && typeof data.usdtWallet === 'object') {
                console.log(`Found usdtWallet:`, data.usdtWallet);
                usdtBalance = parseFloat(data.usdtWallet.future_wallet || data.usdtWallet.spot_wallet || 0);
            }
            
            console.log(`Extracted balances - BTC: ${btcBalance}, USDT: ${usdtBalance}`);
            
            // Build a balance object
            const balance = {
                usdt: usdtBalance,
                btc: btcBalance,
                margin_balance: usdtBalance, // Use USDT as margin balance
                available_balance: usdtBalance
            };
            
            return {
                success: true,
                balance,
                message: `Future balance fetched successfully for BTC/USDT pair`,
                coin_id: coinId
            };
        } else {
            console.warn(`Unexpected API response format for coin ${coinId}.`);
            throw new Error(`Unexpected response format for coin ${coinId}`);
        }
    } catch (error) {
        console.error(`Error fetching future balance for coin ${coinId}:`, error);
        throw error;
    }
};

/**
 * Helper function to format price based on value
 * @param price - The price to format
 * @returns Formatted price string
 */
const formatPrice = (price) => {
    if (price == null) return "$0.00";

    let numPrice;
    if (typeof price === 'string') {
        numPrice = parseFloat(price) || 0.0;
    } else {
        numPrice = typeof price === 'number' ? price : 0.0;
    }

    // Format based on price range
    if (numPrice >= 1000) {
        return `$${numPrice.toFixed(2)}`;
    } else if (numPrice >= 1) {
        return `$${numPrice.toFixed(4)}`;
    } else if (numPrice >= 0.01) {
        return `$${numPrice.toFixed(6)}`;
    } else {
        return `$${numPrice.toFixed(8)}`;
    }
}; 