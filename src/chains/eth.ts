import type {ValidationResult} from '../types';

import {keccak_256} from '@noble/hashes/sha3.js';

import {createFailure, createSuccess} from '../utils/validationResult';

/**
 * Supported Ethereum address categories returned by `validateETH()`.
 */
export type EthereumAddressType = 'Ethereum';

/**
 * Result object returned by `validateETH()`.
 *
 * Contains either a validated Ethereum address with its detected type,
 * or an error message if validation fails.
 */
export type ETHValidationResult = ValidationResult<EthereumAddressType>;

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
export function validateETH(address: string): ETHValidationResult {
  if (!address || typeof address !== 'string') {
    return createFailure('Address must be a non-empty string');
  }

  const hasCorrectPrefix = address.startsWith('0x') || address.startsWith('0X');

  if (address.length !== 42 || !hasCorrectPrefix) {
    return createFailure('Invalid Ethereum address length or prefix');
  }

  const hexPart = address.slice(2);
  if (!/^[0-9a-fA-F]{40}$/.test(hexPart)) {
    return createFailure('Invalid hexadecimal characters');
  }

  // If it's mixed case, validate EIP-55 checksum
  const isLowercase = hexPart === hexPart.toLowerCase();
  const isUppercase = hexPart === hexPart.toUpperCase();

  if (!isLowercase && !isUppercase) {
    return validateEIP55(address);
  }

  return createSuccess('Ethereum', address.toLowerCase());
}

function validateEIP55(address: string): ETHValidationResult {
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
      return createFailure('Invalid EIP-55 checksum');
    }
  }

  return createSuccess('Ethereum', `0x${lowercaseAddr}`);
}

/**
 * Validates an ERC-20 token address (such as USDT or USDC) on the Ethereum network.
 *
 * Since ERC-20 tokens use the standard Ethereum address format, this function
 * checks for the `0x` prefix and verifies the EIP-55 checksum if the address
 * is mixed-case. It ensures the address is a visually and cryptographically
 * valid destination for token transfers.
 *
 * @param address - The ERC-20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validateERC20 = validateETH;
