import {createBaseCodec} from './baseCodec';

const BTC_ALPHABET =
  '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const XRP_ALPHABET =
  'rpshnaf39wBUDNEGHJKLM4PQRST7VWXYZ2bcdeCg65jkm8oFqi1tuvAxyz';

export const base58 = createBaseCodec(BTC_ALPHABET);
export const base58Xrp = createBaseCodec(XRP_ALPHABET);
