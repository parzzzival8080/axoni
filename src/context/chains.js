// Supported EVM chains for MetaMask integration.
// chainId values are the canonical hex strings MetaMask expects.
export const SUPPORTED_CHAINS = {
  ethereum: {
    chainId: '0x1',
    chainIdDecimal: 1,
    name: 'Ethereum',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://cloudflare-eth.com'],
    blockExplorerUrls: ['https://etherscan.io'],
    icon: 'Ξ',
  },
  bsc: {
    chainId: '0x38',
    chainIdDecimal: 56,
    name: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com'],
    icon: 'BNB',
  },
  polygon: {
    chainId: '0x89',
    chainIdDecimal: 137,
    name: 'Polygon',
    nativeCurrency: { name: 'POL', symbol: 'POL', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com'],
    blockExplorerUrls: ['https://polygonscan.com'],
    icon: 'POL',
  },
  arbitrum: {
    chainId: '0xa4b1',
    chainIdDecimal: 42161,
    name: 'Arbitrum One',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
    blockExplorerUrls: ['https://arbiscan.io'],
    icon: 'ARB',
  },
  base: {
    chainId: '0x2105',
    chainIdDecimal: 8453,
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://mainnet.base.org'],
    blockExplorerUrls: ['https://basescan.org'],
    icon: 'BASE',
  },
};

export const getChainByHexId = (hexChainId) => {
  if (!hexChainId) return null;
  const normalized = hexChainId.toLowerCase();
  return Object.values(SUPPORTED_CHAINS).find(
    (c) => c.chainId.toLowerCase() === normalized
  ) || null;
};

export const getChainKeyByHexId = (hexChainId) => {
  if (!hexChainId) return null;
  const normalized = hexChainId.toLowerCase();
  return Object.keys(SUPPORTED_CHAINS).find(
    (k) => SUPPORTED_CHAINS[k].chainId.toLowerCase() === normalized
  ) || null;
};
