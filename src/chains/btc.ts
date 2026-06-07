import type {ValidationResult} from '../types';
import type {ValidationContext} from '../utils/createValidator';

import {bech32, bech32m, fromWordsUnsafe} from '../utils/bech32';
import {base58} from '../utils/base58';
import {base58Check} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';

/**
 * Supported Bitcoin address categories.
 */
export type BitcoinAddressType = 'P2PKH' | 'P2SH' | 'Bech32' | 'Bech32m';

/**
 * Result returned by `validateBTC()`.
 */
export type BTCValidationResult = ValidationResult<BitcoinAddressType>;

/**
 * Validates a Bitcoin mainnet address.
 *
 * Supports legacy Base58 (P2PKH `1...`, P2SH `3...`) and native SegWit/Taproot
 * (Bech32 `bc1...`, Bech32m `bc1p...`).
 *
 * @param address - The Bitcoin address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateBTC = createValidator<BTCValidationResult>(
  (address, context): BTCValidationResult => {
    const lowerAddr = address.toLowerCase();

    if (lowerAddr.startsWith('bc1')) {
      return validateBech32(address, lowerAddr, context);
    }

    if (address.startsWith('1') || address.startsWith('3')) {
      return validateBase58(address, context);
    }

    return context.failure('Unsupported address format or prefix');
  }
);

/**
 * Validates a batch of Bitcoin mainnet addresses.
 *
 * Wraps `validateBTC`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateBTCBatch = createBatchValidator(validateBTC);

function validateBech32(
  original: string,
  lower: string,
  {success, failure}: ValidationContext
) {
  if (original !== lower && original !== original.toUpperCase()) {
    return failure('Mixed case is invalid for Bech32');
  }

  let decoded;
  let isBech32m = false;

  // Try Bech32 (v0), fall back to Bech32m (v1+)
  try {
    decoded = bech32.decode(lower, 1023);
  } catch {
    try {
      decoded = bech32m.decode(lower, 1023);
      isBech32m = true;
    } catch {
      return failure('Invalid Bech32/Bech32m checksum or encoding');
    }
  }

  if (decoded.prefix !== 'bc') {
    return failure('Invalid human-readable part (HRP) for Bitcoin');
  }

  if (decoded.words.length === 0) {
    return failure('Missing witness version byte');
  }

  const witnessVersion = decoded.words[0];

  if (witnessVersion > 16) {
    return failure('Invalid witness version (must be 0-16)');
  }

  if (witnessVersion === 0 && isBech32m) {
    return failure('Version 0 must use Bech32 encoding');
  }

  if (witnessVersion >= 1 && !isBech32m) {
    return failure('Version 1+ must use Bech32m encoding');
  }

  const programWords = decoded.words.slice(1);
  const programBytes = fromWordsUnsafe(programWords);
  if (!programBytes) {
    return failure('Invalid witness program padding (non-zero padding bits)');
  }

  if (
    witnessVersion === 0 &&
    programBytes.length !== 20 &&
    programBytes.length !== 32
  ) {
    return failure(
      'Invalid witness program length for version 0 (must be 20 or 32 bytes)'
    );
  }

  return success(witnessVersion === 0 ? 'Bech32' : 'Bech32m', lower);
}

function validateBase58(
  address: string,
  {success, failure}: ValidationContext
) {
  const result = base58Check(address, {
    codec: base58,
  });

  if (!result.isValid) {
    return failure(result.error);
  }

  // Mainnet version bytes: P2PKH=0x00 (1...), P2SH=0x05 (3...)
  const isP2PKH = result.version === 0x00;
  const isP2SH = result.version === 0x05;

  if (!isP2PKH && !isP2SH) {
    return failure('Unsupported Bitcoin address version');
  }

  if (result.payload.length !== 20) {
    return failure(
      'Invalid public key hash or script hash length (must be 20 bytes)'
    );
  }

  return success(isP2PKH ? 'P2PKH' : 'P2SH', address);
}
