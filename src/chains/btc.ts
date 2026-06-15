import type {ValidationResult} from '../types';
import type {ValidationContext} from '../utils/createValidator';

import {bech32, bech32m, fromWordsUnsafe} from '../utils/bech32';
import {base58} from '../utils/base58';
import {base58Check, mapBase58CheckError} from '../utils/base58Check';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {ValidationErrorCodes} from '../constants';

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

    return context.failure({
      code: ValidationErrorCodes.UNSUPPORTED_TYPE,
      message: 'Unsupported address format or prefix',
      original: address,
    });
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
): BTCValidationResult {
  if (original !== lower && original !== original.toUpperCase()) {
    return failure({
      code: ValidationErrorCodes.MIXED_CASE,
      message: 'Mixed case is invalid for Bech32',
      original,
    });
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
      return failure({
        code: ValidationErrorCodes.INVALID_CHECKSUM,
        message: 'Invalid Bech32/Bech32m checksum or encoding',
        original,
      });
    }
  }

  if (decoded.prefix !== 'bc') {
    return failure({
      code: ValidationErrorCodes.INVALID_PREFIX,
      message: 'Invalid human-readable part (HRP) for Bitcoin',
      original,
    });
  }

  if (decoded.words.length === 0) {
    return failure({
      code: ValidationErrorCodes.INVALID_FORMAT,
      message: 'Missing witness version byte',
      original,
    });
  }

  const witnessVersion = decoded.words[0];

  if (witnessVersion > 16) {
    return failure({
      code: ValidationErrorCodes.INVALID_VERSION,
      message: 'Invalid witness version (must be 0-16)',
      original,
    });
  }

  if (witnessVersion === 0 && isBech32m) {
    return failure({
      code: ValidationErrorCodes.INVALID_ENCODING,
      message: 'Version 0 must use Bech32 encoding',
      original,
    });
  }

  if (witnessVersion >= 1 && !isBech32m) {
    return failure({
      code: ValidationErrorCodes.INVALID_ENCODING,
      message: 'Version 1+ must use Bech32m encoding',
      original,
    });
  }

  const programWords = decoded.words.slice(1);
  const programBytes = fromWordsUnsafe(programWords);
  if (!programBytes) {
    return failure({
      code: ValidationErrorCodes.INVALID_FORMAT,
      message: 'Invalid witness program padding (non-zero padding bits)',
      original,
    });
  }

  if (
    witnessVersion === 0 &&
    programBytes.length !== 20 &&
    programBytes.length !== 32
  ) {
    return failure({
      code: ValidationErrorCodes.INVALID_LENGTH,
      message:
        'Invalid witness program length for version 0 (must be 20 or 32 bytes)',
      original,
    });
  }

  return success({
    type: witnessVersion === 0 ? 'Bech32' : 'Bech32m',
    address: lower,
    original: lower,
  });
}

function validateBase58(
  address: string,
  {success, failure}: ValidationContext
): BTCValidationResult {
  const result = base58Check(address, {codec: base58});

  if (!result.isValid) {
    return failure({
      code: mapBase58CheckError(result.code),
      message: result.message,
      original: address,
    });
  }

  // Mainnet version bytes: P2PKH=0x00 (1...), P2SH=0x05 (3...)
  const isP2PKH = result.version === 0x00;
  const isP2SH = result.version === 0x05;

  if (!isP2PKH && !isP2SH) {
    return failure({
      code: ValidationErrorCodes.UNSUPPORTED_TYPE,
      message: 'Unsupported Bitcoin address version',
      original: address,
    });
  }

  if (result.payload.length !== 20) {
    return failure({
      code: ValidationErrorCodes.INVALID_LENGTH,
      message:
        'Invalid public key hash or script hash length (must be 20 bytes)',
      original: address,
    });
  }

  return success({
    type: isP2PKH ? 'P2PKH' : 'P2SH',
    address,
    original: address,
  });
}
