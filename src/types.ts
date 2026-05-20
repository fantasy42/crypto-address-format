/**
 * Discriminated union for validation outcomes.
 * - `isValid: true` → successful validation with normalized address and detected type.
 * - `isValid: false` → validation failed with an error message.
 *
 * @template T - The detected address type (e.g., `'Bech32'`, `'Ethereum'`).
 */
export type ValidationResult<T extends string = string> =
  | {isValid: true; type: T; address: string}
  | {isValid: false; error: string};
