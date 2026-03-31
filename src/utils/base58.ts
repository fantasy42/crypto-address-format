import {createBaseCodec} from './baseCodec';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const base58 = createBaseCodec(ALPHABET);

export default base58;
