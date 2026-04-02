import type {ValidationResult} from '../types';

import {bech32, bech32m} from '../utils/bech32';
import {base58Check} from '../utils/base58Check';
import {createFailure, createSuccess} from '../utils/validationResult';

/**
 * Supported Bitcoin address categories returned by `validateBTC()`.
 */
export type BitcoinAddressType = 'P2PKH' | 'P2SH' | 'Bech32' | 'Bech32m';

/**
 * Result object returned by `validateBTC()`.
 *
 * Contains either a validated Bitcoin address with its detected type,
 * or an error message if validation fails.
 */
export type BTCValidationResult = ValidationResult<BitcoinAddressType>;

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
export function validateBTC(address: string): BTCValidationResult {
  if (!address || typeof address !== 'string') {
    return createFailure('Address must be a non-empty string');
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

  return createFailure('Unsupported address format or prefix');
}

function validateBech32(original: string, lower: string): BTCValidationResult {
  // Bech32 addresses cannot be mixed case (BIP173 Requirement)
  if (original !== lower && original !== original.toUpperCase()) {
    return createFailure('Mixed case is invalid for Bech32');
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

    // BIP173: Witness version 0 MUST use Bech32
    if (witnessVersion === 0 && isBech32m) {
      return createFailure('Version 0 must use Bech32 encoding');
    }

    // BIP350: Witness version 1+ MUST use Bech32m
    if (witnessVersion >= 1 && !isBech32m) {
      return createFailure('Version 1+ must use Bech32m encoding');
    }

    return createSuccess(witnessVersion === 0 ? 'Bech32' : 'Bech32m', lower);
  } catch {
    return createFailure('Invalid Bech32/Bech32m checksum');
  }
}

function validateBase58(address: string): BTCValidationResult {
  const result = base58Check(address);

  if (!result.isValid) {
    return createFailure(result.error);
  }

  const isP2PKH = result.version === 0x00;
  const isP2SH = result.version === 0x05;

  if (!isP2PKH && !isP2SH) {
    return createFailure('Unsupported Bitcoin address version');
  }

  return createSuccess(isP2PKH ? 'P2PKH' : 'P2SH', address);
}
