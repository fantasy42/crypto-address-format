export {validateBTC, validateBTCBatch} from './chains/btc';
export {validateXRP, validateXRPBatch} from './chains/xrp';
export {validateTON, validateTONBatch} from './chains/ton';
export {validateLTC, validateLTCBatch} from './chains/ltc';
export {validateSOL, validateSOLBatch} from './chains/sol';
export {validateXLM, validateXLMBatch} from './chains/xlm';
export {
  validatePolygon,
  validateMatic,
  validatePolygonBatch,
  validateMaticBatch,
} from './chains/polygon';
export {
  validateETH,
  validateERC20,
  validateETHBatch,
  validateERC20Batch,
} from './chains/eth';
export {
  validateTRX,
  validateTRC20,
  validateTRXBatch,
  validateTRC20Batch,
} from './chains/trx';
export {
  validateBNB,
  validateBEP20,
  validateBNBBatch,
  validateBEP20Batch,
} from './chains/bnb';

export {validateUSDTERC20, validateUSDTERC20Batch} from './aliases/usdt-erc20';
export {validateUSDTTRC20, validateUSDTTRC20Batch} from './aliases/usdt-trc20';
export {validateUSDTBEP20, validateUSDTBEP20Batch} from './aliases/usdt-bep20';

export {ValidationErrorCodes} from './constants';

export type * from './types';

export type * from './chains/btc';
export type * from './chains/xrp';
export type * from './chains/ton';
export type * from './chains/ltc';
export type * from './chains/sol';
export type * from './chains/xlm';
export type * from './chains/polygon';
export type * from './chains/eth';
export type * from './chains/trx';
export type * from './chains/bnb';

export type * from './aliases/usdt-erc20';
export type * from './aliases/usdt-trc20';
export type * from './aliases/usdt-bep20';
