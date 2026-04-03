import {createBaseCodec} from './baseCodec';
import {BTC_ALPHABET, XRP_ALPHABET} from './alphabets';

export const base58Btc = createBaseCodec(BTC_ALPHABET);
export const base58Xrp = createBaseCodec(XRP_ALPHABET);
