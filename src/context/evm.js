// Lightweight EVM helpers — manual ABI encoding to avoid pulling ethers.js as a dependency.
// Only handles the two ERC-20 calls we need: balanceOf(address) and transfer(address,uint256).

const padHex = (hex, length = 64) => hex.replace(/^0x/, '').padStart(length, '0');

// `0x70a08231` selector + 32-byte padded address
export const encodeBalanceOf = (address) => {
  const addr = address.toLowerCase().replace(/^0x/, '');
  return '0x70a08231' + padHex(addr);
};

// `0xa9059cbb` selector + 32-byte padded recipient + 32-byte padded amount (uint256)
export const encodeTransfer = (recipient, amountInBaseUnits) => {
  const addr = recipient.toLowerCase().replace(/^0x/, '');
  const amount = BigInt(amountInBaseUnits).toString(16);
  return '0xa9059cbb' + padHex(addr) + padHex(amount);
};

// Convert "1.234" + decimals=6 -> "1234000" (string, base units)
export const toBaseUnits = (humanAmount, decimals) => {
  if (!humanAmount) return '0';
  const [whole, frac = ''] = String(humanAmount).split('.');
  const fracPadded = (frac + '0'.repeat(decimals)).slice(0, decimals);
  const combined = (whole + fracPadded).replace(/^0+/, '') || '0';
  return combined;
};

// Convert base units (string/bigint) -> human decimal string
export const fromBaseUnits = (baseUnits, decimals) => {
  const s = BigInt(baseUnits).toString();
  if (decimals === 0) return s;
  const padded = s.padStart(decimals + 1, '0');
  const cut = padded.length - decimals;
  const whole = padded.slice(0, cut) || '0';
  const frac = padded.slice(cut).replace(/0+$/, '');
  return frac ? `${whole}.${frac}` : whole;
};

// Read native gas balance (ETH/BNB/POL) using eth_getBalance
export const readNativeBalance = async (provider, address) => {
  const hex = await provider.request({
    method: 'eth_getBalance',
    params: [address, 'latest'],
  });
  return BigInt(hex).toString();
};

// Read ERC-20 token balance using eth_call
export const readErc20Balance = async (provider, tokenAddress, holderAddress) => {
  const hex = await provider.request({
    method: 'eth_call',
    params: [
      {
        to: tokenAddress,
        data: encodeBalanceOf(holderAddress),
      },
      'latest',
    ],
  });
  if (!hex || hex === '0x') return '0';
  return BigInt(hex).toString();
};
