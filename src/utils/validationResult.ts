import type {ValidationResult} from '../types';

export function createSuccess<T extends string>(
  type: T,
  address: string
): ValidationResult<T> {
  return {isValid: true, type, address};
}

export function createFailure(error: string): ValidationResult<never> {
  return {isValid: false, error};
}
