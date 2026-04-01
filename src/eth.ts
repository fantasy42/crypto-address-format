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

  const hasCorrectPrefix = address.startsWith('0x') || address.startsWith('0X');

  if (address.length !== 42 || !hasCorrectPrefix) {
    return {isValid: false, error: 'Invalid Ethereum address length or prefix'};
  }

  const hexPart = address.slice(2);
  if (!/^[0-9a-fA-F]{40}$/.test(hexPart)) {
    return {isValid: false, error: 'Invalid hexadecimal characters'};
  }

  // If it's mixed case, validate EIP-55 checksum
  const isLowercase = hexPart === hexPart.toLowerCase();
  const isUppercase = hexPart === hexPart.toUpperCase();

  if (!isLowercase && !isUppercase) {
    return validateEIP55(address);
  }

  return {
    isValid: true,
    type: 'Ethereum',
    address: address.toLowerCase(),
  };
}

function validateEIP55(address: string): ValidationResult {
  const hexPart = address.slice(2);
  const lowercaseAddr = hexPart.toLowerCase();

  const hash = keccak_256(new TextEncoder().encode(lowercaseAddr));

  for (let i = 0; i < 40; i++) {
    const char = hexPart[i];

    // Numbers (0-9) don't have case, so we skip them
    if (char >= '0' && char <= '9') {
      continue;
    }

    const byte = hash[i >> 1];
    const nibble = i % 2 === 0 ? byte >> 4 : byte & 0x0f;
    const isUpper = char === char.toUpperCase();

    // EIP-55 rule: nibble >= 8 means uppercase, < 8 means lowercase
    if ((nibble >= 8 && !isUpper) || (nibble < 8 && isUpper)) {
      return {isValid: false, error: 'Invalid EIP-55 checksum'};
    }
  }

  return {
    isValid: true,
    type: 'Ethereum',
    address: `0x${lowercaseAddr}`,
  };
}
