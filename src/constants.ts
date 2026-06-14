/**
 * Standardized error codes used across all validators.
 *
 * These codes are machine-readable and stable. Use them for programmatic
 * error handling, custom UI messages, analytics, or recovery flows.
 *
 * The human-readable explanation lives in the `message` field of the error result.
 */
export const ValidationErrorCodes = {
  /** Input was `null`, `undefined`, or not a string. */
  NULL_OR_UNDEFINED: 'NULL_OR_UNDEFINED',

  /** Address was empty or contained only whitespace. */
  EMPTY: 'EMPTY',

  /** Address exceeds the maximum allowed length (256 characters). */
  TOO_LONG: 'TOO_LONG',

  /** Address contains control characters or non-printable ASCII. */
  INVALID_CHARACTERS: 'INVALID_CHARACTERS',

  /** General format violation not covered by more specific codes. */
  INVALID_FORMAT: 'INVALID_FORMAT',

  /** Missing or invalid prefix for the expected chain/format. */
  INVALID_PREFIX: 'INVALID_PREFIX',

  /** Length does not match the expected size for this address type. */
  INVALID_LENGTH: 'INVALID_LENGTH',

  /** Checksum verification failed (Bech32, Base58Check, EIP-55, CRC16, etc.). */
  INVALID_CHECKSUM: 'INVALID_CHECKSUM',

  /** Version byte, witness version, or similar is invalid or unsupported. */
  INVALID_VERSION: 'INVALID_VERSION',

  /** Underlying encoding/decoding failed (e.g. invalid Base58, Bech32, etc.). */
  INVALID_ENCODING: 'INVALID_ENCODING',

  /** Mixed case detected where the format requires single case only. */
  MIXED_CASE: 'MIXED_CASE',

  /** Address uses a format or type not supported by this validator. */
  UNSUPPORTED_TYPE: 'UNSUPPORTED_TYPE',

  /** An unexpected internal error occurred during validation. */
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
