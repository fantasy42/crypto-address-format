import type {ValidationErrorCodes} from './constants';

/**
 * Discriminated union for validation outcomes.
 *
 * - `isValid: true` → successful validation with normalized address, detected type, and original input.
 * - `isValid: false` → validation failed with a machine‑readable `code`, a human‑readable `message`, and the original input.
 *
 * @template T - The detected address type (e.g. `'Bech32'`, `'P2PKH'`, `'Ethereum'`).
 */
export type ValidationResult<T extends string = string> =
  | {isValid: true; type: T; address: string; original: string}
  | {
      isValid: false;
      code: ValidationErrorCode;
      message: string;
      original: string;
    };

/**
 * A batch validation input.
 *
 * Accepts a plain address string or an object with an address and an optional
 * id for mapping results back to UI fields.
 */
export type BatchItem = string | {address: string; id?: string | number};

/**
 * Validation result for a single address within a batch.
 *
 * Extends {@link ValidationResult} with the original input, its position
 * in the input array, and an optional tracking `id`.
 *
 * - When `isValid` is `true`, contains the normalized address, detected type, and original input.
 * - When `isValid` is `false`, contains a machine‑readable `code`, a human‑readable `message`, and the original input.
 *
 * @template T - The detected address type (e.g., `'Bech32'`, `'Ethereum'`).
 */
export type BatchValidationResult<T extends string = string> =
  | (Omit<
      Extract<ValidationResult<T>, {isValid: true}>,
      'address' | 'original'
    > & {
      address: string;
      original: string;
      index: number;
      id?: string | number;
    })
  | (Extract<ValidationResult<T>, {isValid: false}> & {
      original: string;
      index: number;
      id?: string | number;
    });

/**
 * Union of all possible validation error codes.
 *
 * @see {@link ValidationErrorCodes} for the full list and descriptions.
 */
export type ValidationErrorCode =
  (typeof ValidationErrorCodes)[keyof typeof ValidationErrorCodes];
