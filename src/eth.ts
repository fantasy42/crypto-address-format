import type {ValidationResult} from './types';

import {keccak_256} from '@noble/hashes/sha3.js';

/**
 * Validates an Ethereum mainnet address by checking its format and EIP-55 checksum.
 *
 * Supports standard hex addresses and mixed-case checksum addresses.
 * The function follows EIP-55 logic to verify visual integrity via
 * Keccak-256 hashing.
 *
 * @param address - The Ethereum address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export function validateETH(address: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return {isValid: false, error: 'Address must be a non-empty string'};
  }

  if (address.length !== 42 || !address.toLowerCase().startsWith('0x')) {
    return {isValid: false, error: 'Invalid Ethereum address length or prefix'};
  }

  const hexPart = address.slice(2);
  if (!/^[0-9a-fA-F]{40}$/.test(hexPart)) {
    return {isValid: false, error: 'Invalid hexadecimal characters'};
  }

  // If the address is mixed-case, it must validate against EIP-55.
  // If it's all one case, we treat it as a valid un-checksummed address.
  if (hexPart !== hexPart.toLowerCase() && hexPart !== hexPart.toUpperCase()) {
    return validateEIP55(address);
  }

  return {
    isValid: true,
    type: 'Ethereum',
    address: address.toLowerCase(),
  };
}

function validateEIP55(address: string): ValidationResult {
  const stripAddr = address.slice(2).toLowerCase();
  const originalHex = address.slice(2);

  // EIP-55 hashes the UTF-8 bytes of the lowercase hexadecimal string.
  const hash = keccak_256(new TextEncoder().encode(stripAddr));

  for (let i = 0; i < 40; i++) {
    const char = originalHex[i];

    // We only need to check alphabetical characters (a-f, A-F).
    if (/[a-fA-F]/.test(char)) {
      // Each byte in the hash covers 2 hex characters.
      // High nibble for even indices, low nibble for odd indices.
      const hashByte = hash[i >> 1];
      const hashNibble = i % 2 === 0 ? hashByte >> 4 : hashByte & 0x0f;

      // EIP-55 Rule: If the nibble is >= 8, the letter must be uppercase.
      if (hashNibble >= 8 && char !== char.toUpperCase()) {
        return {isValid: false, error: 'Invalid EIP-55 checksum'};
      }
      // If the nibble is < 8, the letter must be lowercase.
      if (hashNibble < 8 && char !== char.toLowerCase()) {
        return {isValid: false, error: 'Invalid EIP-55 checksum'};
      }
    }
  }

  return {
    isValid: true,
    type: 'Ethereum',
    address: address.toLowerCase(),
  };
}
