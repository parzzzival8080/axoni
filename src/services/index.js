/**
 * This file re-exports all trading API functionality from the separate files.
 * Use this for backwards compatibility with existing imports.
 * For new code, please import directly from spotTradingApi.js or futureTradingApi.js.
 */

// Import from future trading API
import { 
  fetchCoinDetails as futureCoinDetails,
  executeFutureTradeOrder,
  getFutureBalance
} from './futureTradingApi.js';

// Import from spot trading API
import { 
  fetchCoinDetails as spotCoinDetails,
  executeSpotTradeOrder,
  getSpotBalance 
} from './spotTradingApi.js';

// Re-export all functionality
export {
  // Future trading exports
  futureCoinDetails as fetchFutureCoinDetails,
  executeFutureTradeOrder,
  getFutureBalance,
  
  // Spot trading exports
  spotCoinDetails as fetchSpotCoinDetails,
  executeSpotTradeOrder,
  getSpotBalance
};

// Default exports for backward compatibility
export const fetchCoinDetails = futureCoinDetails;
export const executeTradeOrder = executeSpotTradeOrder;
export const getUserBalance = getSpotBalance; 