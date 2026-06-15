import type {ValidationResult} from '../types';
import type {ValidationErrorCode} from '../types';

import {ValidationErrorCodes} from '../constants';

export interface SuccessParams<T extends string> {
  type: T;
  address: string;
  original: string;
}

export interface FailureParams {
  code: ValidationErrorCode;
  message: string;
  original: string;
}

/**
 * Helper methods for building a `ValidationResult` inside a validator.
 */
export interface ValidationContext {
  success: <T extends string>(params: SuccessParams<T>) => ValidationResult<T>;
  failure: (params: FailureParams) => ValidationResult<never>;
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
    success: (params) => ({isValid: true, ...params}),
    failure: (params) => ({isValid: false, ...params}),
  };

  return (address: string): R => {
    if (address == null || typeof address !== 'string') {
      return context.failure({
        code: ValidationErrorCodes.NULL_OR_UNDEFINED,
        message: 'Address must be a non-empty string',
        original: '',
      }) as R;
    }

    const trimmed = address.trim();
    if (trimmed.length === 0) {
      return context.failure({
        code: ValidationErrorCodes.EMPTY,
        message: 'Address must not be empty or whitespace',
        original: trimmed,
      }) as R;
    }

    if (trimmed.length > MAX_ADDRESS_LENGTH) {
      return context.failure({
        code: ValidationErrorCodes.TOO_LONG,
        message: `Address exceeds maximum length of ${MAX_ADDRESS_LENGTH} characters`,
        original: trimmed,
      }) as R;
    }

    for (let i = 0; i < trimmed.length; i++) {
      const code = trimmed.charCodeAt(i);
      if (code < 32 || code > 126) {
        return context.failure({
          code: ValidationErrorCodes.INVALID_CHARACTERS,
          message: 'Address contains invalid characters',
          original: trimmed,
        }) as R;
      }
    }

    try {
      return validate(trimmed, context);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown validation error';
      return context.failure({
        code: ValidationErrorCodes.INTERNAL_ERROR,
        message: `Internal Error: ${message}`,
        original: trimmed,
      }) as R;
    }
  };
}
