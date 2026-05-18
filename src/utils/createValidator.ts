import type {ValidationResult} from '../types';

/**
 * Helper methods for building a `ValidationResult` inside a validator.
 */
export interface ValidationContext {
  success: <T extends string>(type: T, address: string) => ValidationResult<T>;
  failure: (message: string) => ValidationResult<never>;
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
    success: (type, address) => ({isValid: true, type, address}),
    failure: (error) => ({isValid: false, error}),
  };

  return (address: string): R => {
    if (!address || typeof address !== 'string') {
      return {isValid: false, error: 'Address must be a non-empty string'} as R;
    }

    try {
      return validate(address, context);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : 'Unknown validation error';
      return {isValid: false, error: `Internal Error: ${message}`} as R;
    }
  };
}
