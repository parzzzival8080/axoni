// ERC-20 token registry per chain. Native token is represented by `null` address.
// Decimals are critical — USDT/USDC are 6 on most chains, but USDC on Polygon is also 6, BUSD is 18, etc.
// Verify each address before adding new ones — using wrong contract steals funds.

export const TOKENS_BY_CHAIN = {
  ethereum: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, native: true },
    { symbol: 'USDT', name: 'Tether USD', address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18 },
    { symbol: 'WBTC', name: 'Wrapped BTC', address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', decimals: 8 },
  ],
  bsc: [
    { symbol: 'BNB', name: 'BNB', address: null, decimals: 18, native: true },
    { symbol: 'USDT', name: 'Tether USD', address: '0x55d398326f99059fF775485246999027B3197955', decimals: 18 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', decimals: 18 },
    { symbol: 'BUSD', name: 'Binance USD', address: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56', decimals: 18 },
  ],
  polygon: [
    { symbol: 'POL', name: 'POL', address: null, decimals: 18, native: true },
    { symbol: 'USDT', name: 'Tether USD', address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
    { symbol: 'DAI', name: 'Dai Stablecoin', address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', decimals: 18 },
  ],
  arbitrum: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, native: true },
    { symbol: 'USDT', name: 'Tether USD', address: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', decimals: 6 },
    { symbol: 'USDC', name: 'USD Coin', address: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', decimals: 6 },
  ],
  base: [
    { symbol: 'ETH', name: 'Ethereum', address: null, decimals: 18, native: true },
    { symbol: 'USDC', name: 'USD Coin', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  ],
};

export const getTokensForChain = (chainKey) => TOKENS_BY_CHAIN[chainKey] || [];

export const findToken = (chainKey, symbol) => {
  return getTokensForChain(chainKey).find((t) => t.symbol === symbol) || null;
};
