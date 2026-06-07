import type {ValidationResult} from '../types';

import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {getEVMLogic} from '../utils/evm';

/**
 * Supported BNB address categories.
 */
export type BNBAddressType = 'BNB';

/**
 * Result returned by `validateBNB()`.
 */
export type BNBValidationResult = ValidationResult<BNBAddressType>;

/**
 * Validates a BNB Smart Chain (BSC/BEP‑20) address.
 *
 * Checks the standard 42‑character hex format and EIP‑55 checksum (Keccak‑256).
 *
 * @param address - The BNB address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateBNB = createValidator<BNBValidationResult>(
  getEVMLogic('BNB')
);

/**
 * Validates a batch of BNB Smart Chain addresses.
 *
 * Wraps `validateBNB`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateBNBBatch = createBatchValidator(validateBNB);

/**
 * Validates a BEP‑20 token address on the BNB Smart Chain.
 *
 * Alias of `validateBNB` – same format and checksum rules.
 *
 * @param address - The BEP‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateBEP20 = validateBNB;

/**
 * Validates a batch of BEP‑20 token addresses on the BNB Smart Chain.
 *
 * Alias for `validateBNBBatch`.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateBEP20Batch = validateBNBBatch;
