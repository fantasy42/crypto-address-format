import type {ValidationResult} from './types';

import {bech32, bech32m} from './utils/bech32';
import {base58Check} from './utils/base58Check';

/**
 * Validates a Bitcoin mainnet address by checking its encoding and checksum.
 *
 * Supports legacy Base58 (`P2PKH`, `P2SH`) as well as SegWit and Taproot
 * addresses encoded with Bech32 or Bech32m. The function returns a typed
 * result object and does not throw on invalid input.
 *
 * @param address - The Bitcoin address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and,
 * if valid, its detected address type.
 */
export function validateBTC(address: string): ValidationResult {
  if (!address || typeof address !== 'string') {
    return {isValid: false, error: 'Address must be a non-empty string'};
  }

  const lowerAddr = address.toLowerCase();

  // 1. Bech32 / Bech32m (SegWit & Taproot)
  if (lowerAddr.startsWith('bc1')) {
    return validateBech32(address, lowerAddr);
  }

  // 2. Base58 (Legacy & P2SH)
  if (address.startsWith('1') || address.startsWith('3')) {
    return validateBase58(address);
  }

  return {isValid: false, error: 'Unsupported address format or prefix'};
}

function validateBech32(original: string, lower: string): ValidationResult {
  // Bech32 addresses cannot be mixed case (BIP173 Requirement)
  if (original !== lower && original !== original.toUpperCase()) {
    return {isValid: false, error: 'Mixed case is invalid for Bech32'};
  }

  try {
    let decoded;
    let isBech32m = false;

    // We attempt Bech32 first. If it fails, we try Bech32m.
    // This handles the distinct checksum constants required by BIP350.
    try {
      decoded = bech32.decode(lower, 1023);
    } catch {
      decoded = bech32m.decode(lower, 1023);
      isBech32m = true;
    }

    const witnessVersion = decoded.words[0];

    // Enforce BIP Standards for encoding vs version
    // BIP173: Witness version 0 MUST use Bech32
    if (witnessVersion === 0 && isBech32m) {
      return {isValid: false, error: 'Version 0 must use Bech32 encoding'};
    }
    // BIP350: Witness version 1+ MUST use Bech32m
    if (witnessVersion >= 1 && !isBech32m) {
      return {isValid: false, error: 'Version 1+ must use Bech32m encoding'};
    }

    return {
      isValid: true,
      type: witnessVersion === 0 ? 'Bech32' : 'Bech32m',
      address: lower,
    };
  } catch {
    return {isValid: false, error: 'Invalid Bech32/Bech32m checksum'};
  }
}

function validateBase58(address: string): ValidationResult {
  const result = base58Check(address);

  if (!result.isValid) {
    return {
      isValid: false,
      error: result.error ?? 'Invalid Base58Check address',
    };
  }

  const isP2PKH = result.version === 0x00;
  const isP2SH = result.version === 0x05;

  if (!isP2PKH && !isP2SH) {
    return {isValid: false, error: 'Unsupported Bitcoin address version'};
  }

  return {
    isValid: true,
    type: isP2PKH ? 'P2PKH' : 'P2SH',
    address,
  };
}
