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
  validateBNB,
  validateBEP20,
  type BNBAddressType,
  type BNBValidationResult,
} from './chains/bnb';
export {
  validateXRP,
  type XRPAddressType,
  type XRPValidationResult,
} from './chains/xrp';

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
export {
  validateUSDTBEP20,
  type USDTBEP20AddressType,
  type USDTBEP20ValidationResult,
} from './aliases/usdt-bep20';

export type {ValidationResult} from './types';
