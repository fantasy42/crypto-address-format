import type {ValidationResult} from '../types';

import {decode, encode} from '../utils/base32';
import {crc16xmodem} from '../utils/crc16';
import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {ValidationErrorCodes} from '../constants';

/**
 * Supported Stellar address categories.
 */
export type StellarAddressType = 'Standard' | 'Muxed';

/**
 * Result returned by `validateXLM()`.
 */
export type XLMValidationResult = ValidationResult<StellarAddressType>;

/**
 * Validates a Stellar mainnet address.
 *
 * Accepts standard (G…) and muxed (M…) accounts. Performs full validation:
 * prefix, length, Base32 encoding, version byte, key length, and CRC16‑XModem checksum.
 * Rejects secret seeds, claimable balances, and other non‑account strings.
 *
 * @param address - The Stellar address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateXLM = createValidator<XLMValidationResult>(
  (address, context): XLMValidationResult => {
    if (!address.startsWith('G') && !address.startsWith('M')) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_PREFIX,
        message: 'Unsupported address format: must start with G or M',
        original: address,
      });
    }

    if (address.startsWith('G') && address.length !== 56) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_LENGTH,
        message: 'Invalid length for standard address (expected 56 characters)',
        original: address,
      });
    }
    if (address.startsWith('M') && address.length !== 69) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_LENGTH,
        message: 'Invalid length for muxed address (expected 69 characters)',
        original: address,
      });
    }

    let decoded: Uint8Array;
    try {
      decoded = decode(address);
    } catch {
      return context.failure({
        code: ValidationErrorCodes.INVALID_ENCODING,
        message: 'Invalid Base32 encoding',
        original: address,
      });
    }

    try {
      if (encode(decoded) !== address) {
        return context.failure({
          code: ValidationErrorCodes.INVALID_ENCODING,
          message: 'Invalid Base32 encoding',
          original: address,
        });
      }
    } catch {
      return context.failure({
        code: ValidationErrorCodes.INVALID_ENCODING,
        message: 'Invalid Base32 encoding',
        original: address,
      });
    }

    const expectedVersion = address.startsWith('G') ? 0x30 : 0x60; // G: 6<<3, M: 12<<3
    const expectedDataLength = address.startsWith('G') ? 32 : 40;

    if (decoded.length < 3) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_LENGTH,
        message: 'Decoded payload too short',
        original: address,
      });
    }

    const versionByte = decoded[0];
    const payload = decoded.slice(0, -2); // version + data
    const checksum = decoded.slice(-2);
    const data = decoded.slice(1, -2);

    if (versionByte !== expectedVersion) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_VERSION,
        message: 'Invalid version byte',
        original: address,
      });
    }

    if (data.length !== expectedDataLength) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_LENGTH,
        message: 'Invalid public key length',
        original: address,
      });
    }

    const expectedChecksum = crc16xmodem(payload);
    if (
      expectedChecksum[0] !== checksum[0] ||
      expectedChecksum[1] !== checksum[1]
    ) {
      return context.failure({
        code: ValidationErrorCodes.INVALID_CHECKSUM,
        message: 'Checksum mismatch',
        original: address,
      });
    }

    const type: StellarAddressType = address.startsWith('G')
      ? 'Standard'
      : 'Muxed';
    return context.success({
      type,
      address,
      original: address,
    });
  }
);

/**
 * Validates a batch of Stellar mainnet addresses.
 *
 * Wraps `validateXLM`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateXLMBatch = createBatchValidator(validateXLM);
