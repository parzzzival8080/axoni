const API_BASE_URL = 'https://apiv2.bhtokens.com/api/v1';
const API_KEY = 'A20RqFwVktRxxRqrKBtmi6ud';
const DEFAULT_UID = 'yE8vKBNw'; // Default UID to use if none is provided

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
 * Execute a spot trade order
 * @param params - Trade parameters including uid, order_type, execution_type, price, amount
 * @returns Promise with trade result
 */
export const executeSpotTradeOrder = async (params) => {
    try {
        const { uid = DEFAULT_UID, symbol = 'BTC', order_type, excecution_type, price, amount } = params;
        
        // Calculate total
        const total_in_usdt = (price * amount).toFixed(6);
        
        // Get coin_id based on symbol (in a real implementation, this would be from an API or mapping)
        const coin_id = symbol === 'BTC' ? 1 : 
                       symbol === 'ETH' ? 2 : 
                       symbol === 'XRP' ? 3 : 1; // Default to BTC if unknown
        
        // Create URL with query parameters
        const url = `${API_BASE_URL}/orders?uid=${uid}&coin_id=${coin_id}&order_type=${order_type}&excecution_type=${excecution_type}&price=${price}&amount=${amount}&total_in_usdt=${total_in_usdt}&apikey=${API_KEY}`;
        
        console.log('Executing spot trade with URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });

        const data = await response.json();
        
        if (!response.ok) {
            console.error('Spot Trade API error:', data);
            throw new Error(data.message || 'Spot trade execution failed');
        }

        console.log('Spot trade successful:', data);
        return {
            success: true,
            data,
            message: `Spot ${order_type === 'buy' ? 'Buy' : 'Sell'} order executed successfully`
        };
    } catch (error) {
        console.error('Spot trade execution error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An error occurred during spot trade execution'
        };
    }
};

/**
 * Get user's spot trading account balance
 * @param uid - User ID
 * @returns Promise with balance information
 */
export const getSpotBalance = async (uid = DEFAULT_UID) => {
    try {
        const url = `${API_BASE_URL}/balance/${uid}?apikey=${API_KEY}`;
        
        console.log('Fetching spot balance from:', url);
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch spot balance');
        }

        const data = await response.json();
        
        // Sample response for development if API doesn't return actual balances
        const mockBalance = {
            usdt: 50000.00,
            btc: 1.23456,
            eth: 15.7891,
            xrp: 10000.00
        };
        
        // Use actual data if available, otherwise use mock data
        const balance = data.balance || mockBalance;
        
        return {
            success: true,
            balance,
            message: 'Spot balance fetched successfully'
        };
    } catch (error) {
        console.error('Error fetching spot balance:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'An error occurred while fetching spot balance'
        };
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