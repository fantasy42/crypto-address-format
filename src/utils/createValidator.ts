import type {ValidationResult, ValidationErrorCode} from '../types';

import {prevalidate} from './prevalidate';
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
    const preResult = prevalidate(address);
    if (!preResult.ok) {
      return context.failure({
        code: preResult.code,
        message: preResult.message,
        original: preResult.original,
      }) as R;
    }

    try {
      return validate(preResult.value, context);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown validation error';
      return context.failure({
        code: ValidationErrorCodes.INTERNAL_ERROR,
        message: `Internal Error: ${message}`,
        original: preResult.value,
      }) as R;
    }
  };
}
