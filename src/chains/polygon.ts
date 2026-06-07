import type {ValidationResult} from '../types';

import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {getEVMLogic} from '../utils/evm';

/**
 * Supported Polygon address categories.
 */
export type PolygonAddressType = 'Polygon';

/**
 * Result returned by `validatePolygon()`.
 */
export type PolygonValidationResult = ValidationResult<PolygonAddressType>;

/**
 * Validates a Polygon (MATIC) mainnet address.
 *
 * Checks the 42‑character hex format and EIP‑55 checksum (Keccak‑256).
 *
 * @param address - The Polygon address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validatePolygon = createValidator<PolygonValidationResult>(
  getEVMLogic('Polygon')
);

/**
 * Validates a batch of Polygon (MATIC) addresses.
 *
 * Wraps `validatePolygon`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validatePolygonBatch = createBatchValidator(validatePolygon);

/**
 * Validates a MATIC token address on the Polygon network.
 *
 * Alias of `validatePolygon` – same format and checksum rules.
 *
 * @param address - The MATIC address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateMatic = validatePolygon;

/**
 * Validates a batch of MATIC token addresses on the Polygon network.
 *
 * Alias for `validatePolygonBatch`.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateMaticBatch = validatePolygonBatch;
