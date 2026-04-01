/**
 * Represents the result of an address validation operation.
 *
 * This discriminated union type provides either a successful validation result
 * with the validated address and its detected type, or a failure result with
 * an error message.
 *
 * @template T - The type of address (e.g., 'Bech32', 'Ethereum'). Defaults to `string`.
 */
export type ValidationResult<T extends string = string> =
  | {isValid: true; type: T; address: string}
  | {isValid: false; error: string};
