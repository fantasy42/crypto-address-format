export {
  validateBTC,
  type BTCValidationResult,
  type BitcoinAddressType,
} from './chains/btc';
export {
  validateETH,
  validateERC20,
  type ETHValidationResult,
  type EthereumAddressType,
} from './chains/eth';
export {
  validateTRX,
  validateTRC20,
  type TronValidationResult,
  type TronAddressType,
} from './chains/trx';

export {
  validateUSDTERC20,
  type USDTERC20AddressType,
  type USDTERC20ValidationResult,
} from './aliases/usdt-erc20';
export {
  validateUSDTTRC20,
  type USDTTRC20AddressType,
  type USDTTRC20ValidationResult,
} from './aliases/usdt-trc20';

export type {ValidationResult} from './types';
