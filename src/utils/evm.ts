import type {ValidationContext} from './createValidator';
import type {ValidationResult} from '../types';

import {keccak_256} from '@noble/hashes/sha3.js';

const HEX_REGEX = /^[0-9a-fA-F]{40}$/;

const encoder = new TextEncoder();

/**
 * Returns an EIP‑55 checksum validation callback for EVM addresses.
 */
export const getEVMLogic =
  <T extends string>(label: T) =>
  (
    address: string,
    {success, failure}: ValidationContext
  ): ValidationResult<T> => {
    if (address.length !== 42) {
      return failure(`Invalid ${label} address length`);
    }
    if (address[0] !== '0' || (address[1] !== 'x' && address[1] !== 'X')) {
      return failure(`Invalid ${label} address prefix (must start with 0x)`);
    }

    const hexPart = address.slice(2);
    if (!HEX_REGEX.test(hexPart)) {
      return failure('Invalid hexadecimal characters');
    }

    const isLowercase = hexPart === hexPart.toLowerCase();
    const isUppercase = hexPart === hexPart.toUpperCase();

    if (!isLowercase && !isUppercase) {
      const lowerHex = hexPart.toLowerCase();
      const hash = keccak_256(encoder.encode(lowerHex));

      for (let i = 0; i < 40; i++) {
        const char = hexPart[i];

        if (char >= '0' && char <= '9') {
          continue;
        }

        const byte = hash[i >> 1];
        const nibble = (i & 1) === 0 ? byte >> 4 : byte & 0x0f;
        const shouldBeUpper = nibble >= 8; // EIP-55 rule
        const isUpperActual = char === char.toUpperCase();

        if (shouldBeUpper !== isUpperActual) {
          return failure(`Invalid ${label} checksum (EIP-55)`);
        }
      }
    }

    return success(label, `0x${hexPart.toLowerCase()}`);
  };
