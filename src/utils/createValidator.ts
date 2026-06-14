import type {ValidationErrorCode, ValidationResult} from '../types';

import {ValidationErrorCodes} from '../constants';

/**
 * Helper methods for building a `ValidationResult` inside a validator.
 */
export interface ValidationContext {
  success: <T extends string>(type: T, address: string) => ValidationResult<T>;
  failure: (
    code: ValidationErrorCode,
    message: string
  ) => ValidationResult<never>;
}

const MAX_ADDRESS_LENGTH = 256;

/**
 * Wraps a validation function with common input checks and error handling.
 *
 * @param validate - A validation callback that receives the cleaned address
 *                   and a {@link ValidationContext}.
 * @returns A type‑safe address validator that never throws.
 */
export function createValidator<R extends ValidationResult>(
  validate: (address: string, context: ValidationContext) => R
): (address: string) => R {
  const context: ValidationContext = {
    success: (type, address) => ({isValid: true, type, address}),
    failure: (code, message) => ({isValid: false, code, message}),
  };

  return (address: string): R => {
    if (address == null || typeof address !== 'string') {
      return context.failure(
        ValidationErrorCodes.NULL_OR_UNDEFINED,
        'Address must be a non‑empty string'
      ) as R;
    }

    const trimmed = address.trim();
    if (trimmed.length === 0) {
      return context.failure(
        ValidationErrorCodes.EMPTY,
        'Address must not be empty or whitespace'
      ) as R;
    }

    if (trimmed.length > MAX_ADDRESS_LENGTH) {
      return context.failure(
        ValidationErrorCodes.TOO_LONG,
        `Address exceeds maximum length of ${MAX_ADDRESS_LENGTH} characters`
      ) as R;
    }

    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      if (code < 32 || code > 126) {
        return context.failure(
          ValidationErrorCodes.INVALID_CHARACTERS,
          'Address contains invalid characters'
        ) as R;
      }
    }

    try {
      return validate(trimmed, context);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown validation error';
      return context.failure(
        ValidationErrorCodes.INTERNAL_ERROR,
        `Internal Error: ${message}`
      ) as R;
    }
  };
}
