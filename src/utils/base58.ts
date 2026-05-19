import {createBaseCodec} from './baseCodec';
import {BTC_ALPHABET, XRP_ALPHABET} from './alphabets';

export const base58 = createBaseCodec(BTC_ALPHABET);
export const base58Xrp = createBaseCodec(XRP_ALPHABET);
