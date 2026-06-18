import type {ValidationErrorCode} from '../types';

/**
 * Discriminated union returned by the omnibox router.
 *
 * - `isValid: true` → the address is valid on at least one chain. The `chains`
 *   array lists every supported chain where the address passed checksum verification.
 * - `isValid: false` → the address is invalid or the format is not recognized.
 *   Contains a machine‑readable `code` and human‑readable `message`.
 */
export type AnyValidationResult =
  | {isValid: true; chains: string[]; address: string; original: string}
  | {
      isValid: false;
      code: ValidationErrorCode;
      message: string;
      original: string;
    };

/**
 * Validation result for a single address within a batch, using the omnibox router.
 *
 * Extends `AnyValidationResult` with the item’s position (`index`) and optional tracking `id`.
 *
 * - `isValid: true` → contains the normalized address, list of matching chains, and original input.
 * - `isValid: false` → contains a machine‑readable `code`, human‑readable `message`, and original input.
 */
export type AnyBatchValidationResult =
  | {
      isValid: true;
      chains: string[];
      address: string;
      original: string;
      index: number;
      id?: string | number;
    }
  | {
      isValid: false;
      code: ValidationErrorCode;
      message: string;
      original: string;
      index: number;
      id?: string | number;
    };
