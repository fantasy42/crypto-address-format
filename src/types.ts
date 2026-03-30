/**
 * Supported Bitcoin address categories returned by `validateBTC`.
 */
export type BitcoinAddressType = 'P2PKH' | 'P2SH' | 'Bech32' | 'Bech32m';

/**
 * Result of a Bitcoin address validation attempt.
 *
 * When `isValid` is `true`, the detected address `type` and normalized
 * `address` are included. When `isValid` is `false`, an `error` message
 * explains why validation failed.
 */
export type ValidationResult =
  | {isValid: true; type: BitcoinAddressType; address: string}
  | {isValid: false; error: string};
