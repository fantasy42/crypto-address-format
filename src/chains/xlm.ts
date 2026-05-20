import type {ValidationResult} from '../types';

import {decode, encode} from '../utils/base32';
import {crc16xmodem} from '../utils/crc16';
import {createValidator} from '../utils/createValidator';

/**
 * Supported Stellar address types returned by `validateXLM()`.
 */
export type StellarAddressType = 'Standard' | 'Muxed';

/**
 * Result object returned by `validateXLM()`.
 *
 * Contains either a validated Stellar address with its detected type,
 * or an error message if validation fails.
 */
export type XLMValidationResult = ValidationResult<StellarAddressType>;

/**
 * Validates a Stellar mainnet address, accepting standard (G…) and muxed (M…) accounts.
 *
 * Performs full validation: checks the prefix, length, Base32 encoding, version byte,
 * key length, and CRC16‑XModem checksum. Other address types (secret seeds, claimable
 * balances, etc.) are rejected. The function returns a typed result object and does
 * not throw on invalid input.
 *
 * @param address - The Stellar address to validate.
 * @returns A `ValidationResult` indicating validity and the address type.
 */
export const validateXLM = createValidator<XLMValidationResult>(
  (address, context): XLMValidationResult => {
    if (!address.startsWith('G') && !address.startsWith('M')) {
      return context.failure(
        'Unsupported address format: must start with G or M'
      );
    }

    if (address.startsWith('G') && address.length !== 56) {
      return context.failure(
        'Invalid length for standard address (expected 56 characters)'
      );
    }
    if (address.startsWith('M') && address.length !== 69) {
      return context.failure(
        'Invalid length for muxed address (expected 69 characters)'
      );
    }

    let decoded: Uint8Array;
    try {
      decoded = decode(address);
    } catch {
      return context.failure('Invalid Base32 encoding');
    }

    try {
      if (encode(decoded) !== address) {
        return context.failure('Invalid Base32 encoding');
      }
    } catch {
      return context.failure('Invalid Base32 encoding');
    }

    const expectedVersion = address.startsWith('G') ? 0x30 : 0x60; // G: 6<<3, M: 12<<3
    const expectedDataLength = address.startsWith('G') ? 32 : 40;

    if (decoded.length < 3) {
      return context.failure('Decoded payload too short');
    }

    const versionByte = decoded[0];
    const payload = decoded.slice(0, -2); // version + data
    const checksum = decoded.slice(-2);
    const data = decoded.slice(1, -2);

    if (versionByte !== expectedVersion) {
      return context.failure('Invalid version byte');
    }

    if (data.length !== expectedDataLength) {
      return context.failure('Invalid public key length');
    }

    const expectedChecksum = crc16xmodem(payload);
    if (
      expectedChecksum[0] !== checksum[0] ||
      expectedChecksum[1] !== checksum[1]
    ) {
      return context.failure('Checksum mismatch');
    }

    const type: StellarAddressType = address.startsWith('G')
      ? 'Standard'
      : 'Muxed';
    return context.success(type, address);
  }
);
