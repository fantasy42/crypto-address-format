import type {ValidationResult} from '../types';

import {createBatchValidator} from '../utils/createBatchValidator';
import {createValidator} from '../utils/createValidator';
import {getEVMLogic} from '../utils/evm';

/**
 * Supported Ethereum address categories.
 */
export type EthereumAddressType = 'Ethereum';

/**
 * Result returned by `validateETH()`.
 */
export type ETHValidationResult = ValidationResult<EthereumAddressType>;

/**
 * Validates an Ethereum mainnet address.
 *
 * Checks the 42‑character hex format and EIP‑55 checksum (Keccak‑256).
 *
 * @param address - The Ethereum address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateETH = createValidator<ETHValidationResult>(
  getEVMLogic('Ethereum')
);

/**
 * Validates a batch of Ethereum mainnet addresses.
 *
 * Wraps `validateETH`; processes all items and collects results in order.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateETHBatch = createBatchValidator(validateETH);

/**
 * Validates an ERC‑20 token address on the Ethereum network.
 *
 * Alias of `validateETH` – same format and checksum rules.
 *
 * @param address - The ERC‑20 address to validate.
 * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
 */
export const validateERC20 = validateETH;

/**
 * Validates a batch of ERC‑20 token addresses on the Ethereum network.
 *
 * Alias for `validateETHBatch`.
 *
 * @param items - Array of addresses or `BatchItem` objects.
 * @returns Array of `BatchValidationResult`, preserving input order.
 */
export const validateERC20Batch = validateETHBatch;
