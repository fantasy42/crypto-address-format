import type {ValidationResult} from '../types';

import {createValidator} from '../utils/createValidator';
import {getEVMLogic} from '../utils/evm';

/**
 * Supported Polygon address categories returned by `validatePolygon()`.
 */
export type PolygonAddressType = 'Polygon';

/**
 * Result object returned by `validatePolygon()`.
 *
 * Contains either a validated Polygon address with its detected type,
 * or an error message if validation fails.
 */
export type PolygonValidationResult = ValidationResult<PolygonAddressType>;

/**
 * Validates a Polygon (MATIC) address by checking its format and EIP-55 checksum.
 *
 * Since Polygon PoS is EVM-compatible, this function verifies the standard
 * 42-character hex format and the visual integrity of mixed-case checksum
 * addresses using Keccak-256 hashing.
 *
 * @param address - The Polygon address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validatePolygon = createValidator<PolygonValidationResult>(
  getEVMLogic('Polygon')
);

/**
 * Validates a MATIC token address on the Polygon network.
 *
 * Since Polygon tokens use the standard Ethereum address format, this function
 * checks for the `0x` prefix and verifies the EIP-55 checksum if the address
 * is mixed-case. It ensures the address is a visually and cryptographically
 * valid destination for token transfers on Polygon.
 *
 * @param address - The MATIC address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid.
 */
export const validateMatic = validatePolygon;
