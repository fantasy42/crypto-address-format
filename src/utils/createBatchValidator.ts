import type {
  ValidationResult,
  BatchItem,
  BatchValidationResult,
} from '../types';

import {batch} from '../batch';

/**
 * Creates a batch‑validated version of a single‑address validator.
 *
 * @param validate - A single-address validator created with `createValidator`.
 * @returns A batch function that accepts `readonly BatchItem[]`.
 */
export function createBatchValidator<T extends string>(
  validate: (address: string) => ValidationResult<T>
) {
  return (items: readonly BatchItem[]): BatchValidationResult<T>[] =>
    batch(validate, items);
}
