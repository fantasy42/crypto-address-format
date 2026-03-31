import type {ValidationResult} from './types';

import {sha256} from '@noble/hashes/sha2.js';

import {bech32, bech32m} from './utils/bech32';
import base58 from './utils/base58';

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
  try {
    const decoded = base58.decode(address);
    if (decoded.length !== 25) {
      return {isValid: false, error: 'Invalid Base58 payload length'};
    }

    const version = decoded[0];
    const payload = decoded.slice(0, -4);
    const checksum = decoded.slice(-4);

    // Double SHA256 hashing is the standard for Base58Check
    const expectedChecksum = sha256(sha256(payload)).slice(0, 4);

    if (!compareBytes(checksum, expectedChecksum)) {
      return {isValid: false, error: 'Base58 checksum mismatch'};
    }

    return {
      isValid: true,
      type: version === 0x00 ? 'P2PKH' : 'P2SH',
      address,
    };
  } catch {
    return {isValid: false, error: 'Invalid Base58 encoding'};
  }
}

function compareBytes(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }

  return result === 0;
}
