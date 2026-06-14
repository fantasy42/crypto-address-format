import type {ValidationResult} from '../types';
import type {ValidationContext} from '../utils/createValidator';

import {bech32, bech32m, fromWordsUnsafe} from '../utils/bech32';
import {base58} from '../utils/base58';
import {base58Check, mapBase58CheckError} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {ValidationErrorCodes} from '../constants';

/**
 * Supported Litecoin address categories.
 */
export type LitecoinAddressType = 'P2PKH' | 'P2SH' | 'Bech32' | 'Bech32m';

/**
 * Result returned by `validateLTC()`.
 */
export type LTCValidationResult = ValidationResult<LitecoinAddressType>;

/**
 * Validates a Litecoin mainnet address.
 *
 * Supports legacy Base58 (P2PKH `L...`, P2SH `M...` or `3...`) and native SegWit/Taproot
 * (Bech32 `ltc1...`, Bech32m `ltc1p...`).
 *
 * @param address - The Litecoin address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateLTC = createValidator<LTCValidationResult>(
  (address, context): LTCValidationResult => {
    const lowerAddr = address.toLowerCase();

    if (lowerAddr.startsWith('ltc1')) {
      return validateLtcBech32(address, lowerAddr, context);
    }

    if (
      address.startsWith('L') ||
      address.startsWith('M') ||
      address.startsWith('3')
    ) {
      return validateLtcBase58(address, context);
    }

    return context.failure(
      ValidationErrorCodes.UNSUPPORTED_TYPE,
      'Unsupported address format or prefix'
    );
  }
);

/**
 * Validates a batch of Litecoin mainnet addresses.
 *
 * Wraps `validateLTC`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateLTCBatch = createBatchValidator(validateLTC);

function validateLtcBech32(
  original: string,
  lower: string,
  {success, failure}: ValidationContext
): LTCValidationResult {
  if (original !== lower && original !== original.toUpperCase()) {
    return failure(
      ValidationErrorCodes.MIXED_CASE,
      'Mixed case is invalid for Bech32'
    );
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
      return failure(
        ValidationErrorCodes.INVALID_CHECKSUM,
        'Invalid Bech32/Bech32m checksum or encoding'
      );
    }
  }

  if (decoded.prefix !== 'ltc') {
    return failure(
      ValidationErrorCodes.INVALID_PREFIX,
      'Invalid human-readable part (HRP) for Litecoin'
    );
  }

  if (decoded.words.length === 0) {
    return failure(
      ValidationErrorCodes.INVALID_FORMAT,
      'Missing witness version byte'
    );
  }

  const witnessVersion = decoded.words[0];

  if (witnessVersion > 16) {
    return failure(
      ValidationErrorCodes.INVALID_VERSION,
      'Invalid witness version (must be 0-16)'
    );
  }

  if (witnessVersion === 0 && isBech32m) {
    return failure(
      ValidationErrorCodes.INVALID_ENCODING,
      'Version 0 must use Bech32 encoding'
    );
  }

  if (witnessVersion >= 1 && !isBech32m) {
    return failure(
      ValidationErrorCodes.INVALID_ENCODING,
      'Version 1+ must use Bech32m encoding'
    );
  }

  const programWords = decoded.words.slice(1);
  const programBytes = fromWordsUnsafe(programWords);
  if (!programBytes) {
    return failure(
      ValidationErrorCodes.INVALID_FORMAT,
      'Invalid witness program padding (non-zero padding bits)'
    );
  }

  if (
    witnessVersion === 0 &&
    programBytes.length !== 20 &&
    programBytes.length !== 32
  ) {
    return failure(
      ValidationErrorCodes.INVALID_LENGTH,
      'Invalid witness program length for version 0 (must be 20 or 32 bytes)'
    );
  }

  return success(witnessVersion === 0 ? 'Bech32' : 'Bech32m', lower);
}

function validateLtcBase58(
  address: string,
  {success, failure}: ValidationContext
): LTCValidationResult {
  const result = base58Check(address, {codec: base58});

  if (!result.isValid) {
    return failure(mapBase58CheckError(result.code), result.message);
  }

  // Mainnet version bytes: P2PKH=0x30 (L), P2SH=0x32 (M) or 0x05 (3)
  const isP2PKH = result.version === 0x30;
  const isP2SH = result.version === 0x32 || result.version === 0x05;

  if (!isP2PKH && !isP2SH) {
    return failure(
      ValidationErrorCodes.UNSUPPORTED_TYPE,
      'Unsupported Litecoin address version'
    );
  }

  if (result.payload.length !== 20) {
    return failure(
      ValidationErrorCodes.INVALID_LENGTH,
      'Invalid public key hash or script hash length (must be 20 bytes)'
    );
  }

  return success(isP2PKH ? 'P2PKH' : 'P2SH', address);
}
