/**
 * Address validation utilities for different blockchain networks
 * Supports Ethereum, BNB Smart Chain, BNB Beacon Chain, TRON, and Bitcoin
 */

// Base58 alphabet for Bitcoin address validation
const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

/**
 * Check if string contains only valid hexadecimal characters
 */
function isValidHex(str) {
  return /^[0-9a-fA-F]+$/.test(str);
}

/**
 * Check if string contains only valid base58 characters
 */
function isValidBase58(str) {
  return str.split('').every(char => BASE58_ALPHABET.includes(char));
}

/**
 * Simple checksum validation for Ethereum addresses
 * This is a basic implementation - in production you might want a full EIP-55 validator
 */
function isValidEthereumChecksum(address) {
  // Remove 0x prefix
  const addr = address.slice(2);
  
  // If all lowercase or all uppercase, checksum is not applied
  if (addr === addr.toLowerCase() || addr === addr.toUpperCase()) {
    return true;
  }
  
  // For mixed case, we'd need a full EIP-55 implementation
  // For now, we'll accept it if it's valid hex
  return isValidHex(addr);
}

/**
 * Validate Ethereum/EVM addresses (Ethereum, BSC)
 */
export function validateEthereumAddress(address) {
  // Must start with 0x
  if (!address.startsWith('0x')) {
    return {
      isValid: false,
      error: 'Please enter a valid address starting with "0x"'
    };
  }
  
  // Must be exactly 42 characters (0x + 40 hex chars)
  if (address.length !== 42) {
    return {
      isValid: false,
      error: 'Address must be 42 characters long (including "0x")'
    };
  }
  
  // Must contain only valid hex characters after 0x
  const hexPart = address.slice(2);
  if (!isValidHex(hexPart)) {
    return {
      isValid: false,
      error: 'Address contains invalid characters. Only 0-9 and A-F allowed after "0x"'
    };
  }
  
  // Basic checksum validation
  if (!isValidEthereumChecksum(address)) {
    return {
      isValid: false,
      error: 'Please double-check your address format'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate BNB Beacon Chain (BEP-2) addresses
 */
export function validateBnbBeaconAddress(address) {
  // Must start with 'bnb1'
  if (!address.startsWith('bnb1')) {
    return {
      isValid: false,
      error: 'BNB Beacon Chain address must start with "bnb1"'
    };
  }
  
  // Must be exactly 42 characters (bnb1 + 38 chars), not 43
  if (address.length !== 42) {
    return {
      isValid: false,
      error: 'BNB Beacon Chain address must be 42 characters long'
    };
  }
  
  // Must contain only valid bech32 characters (lowercase letters and numbers, no 0, 1, b, i, o)
  const bech32Part = address.slice(4); // Remove 'bnb1' prefix
  if (!/^[02-9ac-hj-np-z]+$/.test(bech32Part)) {
    return {
      isValid: false,
      error: 'Address contains invalid characters. Please check and try again'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate TRON addresses
 */
export function validateTronAddress(address) {
  // Must start with 'T'
  if (!address.startsWith('T')) {
    return {
      isValid: false,
      error: 'TRON address must start with "T"'
    };
  }
  
  // Must be exactly 34 characters
  if (address.length !== 34) {
    return {
      isValid: false,
      error: 'TRON address must be exactly 34 characters long'
    };
  }
  
  // Must contain only valid base58 characters
  if (!isValidBase58(address)) {
    return {
      isValid: false,
      error: 'Address contains invalid characters. Please double-check your address'
    };
  }
  
  return { isValid: true };
}

/**
 * Validate Bitcoin addresses (P2PKH, P2SH, and Bech32)
 */
export function validateBitcoinAddress(address) {
  // Bech32 (segwit) addresses
  if (address.startsWith('bc1')) {
    // Must be lowercase for bech32
    if (address !== address.toLowerCase()) {
      return {
        isValid: false,
        error: 'Bitcoin address starting with "bc1" must be lowercase only'
      };
    }
    
    // Basic length check (typically 42 or 62 characters)
    if (address.length < 42 || address.length > 62) {
      return {
        isValid: false,
        error: 'Bitcoin address length is invalid. Please check your address'
      };
    }
    
    // Must contain only valid bech32 characters
    const bech32Part = address.slice(3); // Remove 'bc1' prefix
    if (!/^[02-9ac-hj-np-z]+$/.test(bech32Part)) {
      return {
        isValid: false,
        error: 'Address contains invalid characters. Please double-check your address'
      };
    }
    
    return { isValid: true };
  }
  
  // P2PKH addresses (start with '1')
  if (address.startsWith('1')) {
    // Must be 26-35 characters
    if (address.length < 26 || address.length > 35) {
      return {
        isValid: false,
        error: 'Bitcoin address length is invalid. Should be 26-35 characters'
      };
    }
    
    // Must contain only valid base58 characters
    if (!isValidBase58(address)) {
      return {
        isValid: false,
        error: 'Address contains invalid characters. Please double-check your address'
      };
    }
    
    return { isValid: true };
  }
  
  // P2SH addresses (start with '3')
  if (address.startsWith('3')) {
    // Must be 26-35 characters
    if (address.length < 26 || address.length > 35) {
      return {
        isValid: false,
        error: 'Bitcoin address length is invalid. Should be 26-35 characters'
      };
    }
    
    // Must contain only valid base58 characters
    if (!isValidBase58(address)) {
      return {
        isValid: false,
        error: 'Address contains invalid characters. Please double-check your address'
      };
    }
    
    return { isValid: true };
  }
  
  return {
    isValid: false,
    error: 'Bitcoin address must start with "1", "3", or "bc1"'
  };
}

/**
 * Main validation function that routes to appropriate validator based on network
 */
export function validateAddress(address, networkSymbol) {
  if (!address || !networkSymbol) {
    return {
      isValid: false,
      error: 'Address and network are required'
    };
  }
  
  // Trim whitespace
  address = address.trim();
  
  if (!address) {
    return {
      isValid: false,
      error: 'Address cannot be empty'
    };
  }
  
  // Convert network symbol to lowercase for comparison
  const network = networkSymbol.toLowerCase();
  
  // Route to appropriate validator based on network
  switch (network) {
    case 'eth':
    case 'ethereum':
    case 'erc20':
      return validateEthereumAddress(address);
      
    case 'bsc':
    case 'bnb':
    case 'bep20':
      return validateEthereumAddress(address); // BSC uses same format as Ethereum
      
    case 'bep2':
    case 'bnb_beacon':
      return validateBnbBeaconAddress(address);
      
    case 'trc20':
    case 'tron':
    case 'trx':
      return validateTronAddress(address);
      
    case 'btc':
    case 'bitcoin':
      return validateBitcoinAddress(address);
      
    default:
      // For unknown networks, just check it's not empty
      return {
        isValid: true,
        warning: `Validation not implemented for network: ${networkSymbol}`
      };
  }
}

/**
 * Get network type description for display
 */
export function getNetworkDescription(networkSymbol) {
  const network = networkSymbol?.toLowerCase();
  
  switch (network) {
    case 'eth':
    case 'ethereum':
    case 'erc20':
      return 'Make sure to use an Ethereum address starting with "0x"';
      
    case 'bsc':
    case 'bnb':
    case 'bep20':
      return 'Make sure to use a BNB Smart Chain address starting with "0x"';
      
    case 'bep2':
    case 'bnb_beacon':
      return 'Make sure to use a BNB Beacon Chain address starting with "bnb1"';
      
    case 'trc20':
    case 'tron':
    case 'trx':
      return 'Make sure to use a TRON address starting with "T"';
      
    case 'btc':
    case 'bitcoin':
      return 'Make sure to use a Bitcoin address starting with "1", "3", or "bc1"';
      
    default:
      return `Please enter a valid ${networkSymbol} address`;
  }
}
