import type {
  ValidationResult,
  BatchItem,
  BatchValidationResult,
} from '../types';

/**
 * Validates every address in `items` with the supplied validator.
 *
 * Processes all items (no short‑circuiting). Malformed or missing
 * addresses are treated as empty strings — the validator will reject
 * them, so no runtime errors are thrown.
 *
 * @param validate - A single‑address validator (e.g., `validateBTC`).
 * @param items    - Addresses or {@link BatchItem} objects.
 * @returns Results in the same order as the input array.
 */
export function batch<T extends string>(
  validate: (address: string) => ValidationResult<T>,
  items: readonly BatchItem[]
): BatchValidationResult<T>[] {
  return items.map((item, index) => {
    const input = toInputAddress(item);
    const id = toId(item);
    const result = validate(input);
    const original = input.trim();

    const base = {
      original,
      index,
      ...(id !== undefined && {id}),
    } as const;

    if (result.isValid) {
      return {
        ...base,
        isValid: true,
        type: result.type,
        address: result.address,
      };
    }

    return {...base, isValid: false, error: result.error};
  });
}

function toInputAddress(item: BatchItem): string {
  if (typeof item === 'string') {
    return item;
  }

  if (item != null && typeof item === 'object' && 'address' in item) {
    const address = (item as {address: unknown}).address;
    return typeof address === 'string' ? address : '';
  }

  return '';
}

function toId(item: BatchItem): string | number | undefined {
  if (typeof item === 'object' && item !== null && 'id' in item) {
    const id = (item as {id?: unknown}).id;

    if (typeof id === 'string' || typeof id === 'number') {
      return id;
    }
  }

  return undefined;
}
