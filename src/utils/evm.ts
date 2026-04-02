import type {ValidationResult} from '../types';

import {keccak_256} from '@noble/hashes/sha3.js';

import {createFailure, createSuccess} from './validationResult';

// Pre-instantiate to avoid GC pressure during high-frequency validation
const encoder = new TextEncoder();

export function validateEVMAddress<T extends string>(
  address: string,
  label: T
): ValidationResult<T> {
  if (!address || typeof address !== 'string') {
    return createFailure('Address must be a non-empty string');
  }

  const hasCorrectPrefix = address.startsWith('0x') || address.startsWith('0X');
  if (address.length !== 42 || !hasCorrectPrefix) {
    return createFailure(`Invalid ${label} address length or prefix`);
  }

  const hexPart = address.slice(2);
  if (!/^[0-9a-fA-F]{40}$/.test(hexPart)) {
    return createFailure('Invalid hexadecimal characters');
  }

  const isLowercase = hexPart === hexPart.toLowerCase();
  const isUppercase = hexPart === hexPart.toUpperCase();

  // If mixed case, validate EIP-55 checksum
  if (!isLowercase && !isUppercase) {
    const lowercaseAddr = hexPart.toLowerCase();
    const hash = keccak_256(encoder.encode(lowercaseAddr));

    for (let i = 0; i < 40; i++) {
      const char = hexPart[i];

      // Numbers don't have case, skip
      if (char >= '0' && char <= '9') {
        continue;
      }

      const byte = hash[i >> 1];
      const nibble = i % 2 === 0 ? byte >> 4 : byte & 0x0f;
      const isUpper = char === char.toUpperCase();

      // EIP-55 rule: nibble >= 8 means uppercase, < 8 means lowercase
      if ((nibble >= 8 && !isUpper) || (nibble < 8 && isUpper)) {
        return createFailure(`Invalid ${label} checksum (EIP-55)`);
      }
    }
  }

  return createSuccess(label, `0x${hexPart.toLowerCase()}`);
}
