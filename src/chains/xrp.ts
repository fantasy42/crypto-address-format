import type {ValidationResult} from '../types';

import {base58Xrp} from '../utils/base58';
import {base58Check} from '../utils/base58Check';
import {createFailure, createSuccess} from '../utils/validationResult';

/**
 * Supported XRP Ledger address categories returned by `validateXRP()`.
 */
export type XRPAddressType = 'Classic' | 'X-Address-Mainnet';

/**
 * Result object returned by `validateXRP()`.
 *
 * Contains either a validated XRP address with its detected type,
 * or an error message if validation fails.
 */
export type XRPValidationResult = ValidationResult<XRPAddressType>;

/**
 * Validates an XRP Ledger address by checking its encoding, prefix, and checksum.
 *
 * Supports standard Base58 Classic addresses (starting with 'r') and
 * X-Addresses (starting with 'X') for Mainnet. The function verifies the
 * double-SHA256 checksum and network-specific version bytes, returning a
 * typed result object without throwing on invalid input.
 *
 * @param address - The XRP address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and,
 * if valid, its detected address type (Classic or X-Address-Mainnet).
 */
export function validateXRP(address: string): XRPValidationResult {
  if (!address || typeof address !== 'string') {
    return createFailure('Address must be a non-empty string');
  }

  // Classic r-address
  if (address.startsWith('r')) {
    if (address.length < 25 || address.length > 35) {
      return createFailure('Invalid Classic address length');
    }

    const res = base58Check(address, {codec: base58Xrp, expectedVersion: 0x00});

    if (!res.isValid) {
      return createFailure(res.error);
    }

    // Classic payload is exactly 20 bytes (AccountID)
    if (res.payload.length !== 20) {
      return createFailure('Invalid Classic address payload');
    }

    return createSuccess('Classic', address);
  }

  // Mainnet X-Address (Tagged Address)
  if (address.startsWith('X')) {
    if (address.length < 29 || address.length > 59) {
      return createFailure('Invalid X-Address string length');
    }

    const res = base58Check(address, {
      codec: base58Xrp,
      expectedVersion: [0x05, 0x44],
    });

    if (!res.isValid) {
      return createFailure(res.error);
    }

    /**
     * X-Address payload structure:
     * [20b AccountID] + [1b Flag] + [8b Tag/Reserved] = 29 bytes
     */
    if (res.payload.length !== 29) {
      return createFailure('Invalid X-Address payload structure');
    }

    return createSuccess('X-Address-Mainnet', address);
  }

  return createFailure('Unsupported XRP address prefix');
}
