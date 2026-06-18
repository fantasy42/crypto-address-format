import type {AnyValidationResult, AnyBatchValidationResult} from './types';
import type {ValidationErrorCode} from '../types';

import {ROUTES} from './routes';
import {ValidationErrorCodes} from '../constants';
import {prevalidate} from '../utils/prevalidate';

/**
 * Omnibox router – validates an address against all supported chains.
 *
 * Uses fast heuristic pre‑filtering to narrow down candidate chains,
 * then runs strict checksum verification only on those candidates.
 *
 * @param address - The address string to validate.
 * @returns An `AnyValidationResult` indicating success with all matching
 *          chain names, or failure with the most relevant error.
 */
export function validateAny(address: string): AnyValidationResult {
  const rawAddress = address;
  const preResult = prevalidate(rawAddress);

  if (!preResult.ok) {
    return {
      isValid: false,
      code: preResult.code,
      message: preResult.message,
      original: preResult.original,
    };
  }

  const sanitized = preResult.value;
  const chains: string[] = [];
  let firstFailure: {code: string; message: string} | null = null;
  let anyRouteMatched = false;
  let normalizedAddress = sanitized;

  for (const route of ROUTES) {
    if (!route.predicate(sanitized)) continue;
    anyRouteMatched = true;

    for (const {chain, validate} of route.validators) {
      const result = validate(sanitized);
      if (result.isValid) {
        chains.push(chain);
        if (chains.length === 1) {
          normalizedAddress = result.address;
        }
      } else if (!firstFailure) {
        firstFailure = {code: result.code, message: result.message};
      }
    }
  }

  if (chains.length > 0) {
    return {
      isValid: true,
      chains,
      address: normalizedAddress,
      original: rawAddress,
    };
  }

  if (!anyRouteMatched) {
    return {
      isValid: false,
      code: ValidationErrorCodes.UNSUPPORTED_TYPE,
      message: 'Address format not recognized',
      original: rawAddress,
    };
  }

  return {
    isValid: false,
    code: firstFailure!.code as ValidationErrorCode,
    message: firstFailure!.message,
    original: rawAddress,
  };
}

/**
 * Validates a batch of addresses through `validateAny`.
 *
 * Wraps `validateAny`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `AnyBatchValidationResult`, preserving input order.
 */
export function validateAnyBatch(
  items: readonly (string | {address: string; id?: string | number})[]
): AnyBatchValidationResult[] {
  return items.map((item, index) => {
    const input = typeof item === 'string' ? item : item?.address;
    const id = typeof item === 'string' ? undefined : item?.id;
    const result = validateAny(input);
    return {...result, index, id} as AnyBatchValidationResult;
  });
}

export type * from './types';
