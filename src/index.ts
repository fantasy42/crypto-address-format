export {validateBTC} from './chains/btc';
export {validateXRP} from './chains/xrp';
export {validateETH, validateERC20} from './chains/eth';
export {validateTRX, validateTRC20} from './chains/trx';
export {validateBNB, validateBEP20} from './chains/bnb';

export {validateUSDTERC20} from './aliases/usdt-erc20';
export {validateUSDTTRC20} from './aliases/usdt-trc20';
export {validateUSDTBEP20} from './aliases/usdt-bep20';

export type {ValidationResult} from './types';

export type {BTCValidationResult, BitcoinAddressType} from './chains/btc';
export type {ETHValidationResult, EthereumAddressType} from './chains/eth';
export type {TronValidationResult, TronAddressType} from './chains/trx';
export type {BNBAddressType, BNBValidationResult} from './chains/bnb';
export type {XRPAddressType, XRPValidationResult} from './chains/xrp';

export type {
  USDTERC20AddressType,
  USDTERC20ValidationResult,
} from './aliases/usdt-erc20';
export type {
  USDTTRC20AddressType,
  USDTTRC20ValidationResult,
} from './aliases/usdt-trc20';
export type {
  USDTBEP20AddressType,
  USDTBEP20ValidationResult,
} from './aliases/usdt-bep20';
