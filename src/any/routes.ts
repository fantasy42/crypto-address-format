import type {ValidationResult} from '../types';

import {validatePolygon} from '../chains/polygon';
import {validateBTC} from '../chains/btc';
import {validateETH} from '../chains/eth';
import {validateBNB} from '../chains/bnb';
import {validateSOL} from '../chains/sol';
import {validateTRX} from '../chains/trx';
import {validateXRP} from '../chains/xrp';
import {validateLTC} from '../chains/ltc';
import {validateXLM} from '../chains/xlm';
import {validateTON} from '../chains/ton';

interface ValidatorEntry {
  chain: string;
  validate: (addr: string) => ValidationResult<string>;
}

interface Route {
  predicate: (addr: string) => boolean;
  validators: ValidatorEntry[];
}

const EVM_REGEX = /^0x[0-9a-fA-F]{40}$/;
const BTC_LTC_REGEX = /^(1|3|bc1|L|M|ltc1)/;
const SOL_REGEX = /^[1-9A-HJ-NP-Za-km-z]{43,45}$/;
const TRX_REGEX = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;
const XRP_REGEX =
  /^(r[1-9A-HJ-NP-Za-km-z]{24,34}|X[1-9A-HJ-NP-Za-km-z]{46,58})$/;
const XLM_REGEX = /^G[A-Z2-7]{55}$|^M[A-Z2-7]{68}$/;
const TON_REGEX = /^(0|-1):[0-9a-fA-F]{64}$|^[EU][Qf][0-9a-zA-Z\-_]{46}$/;

export const ROUTES: Route[] = [
  // EVM family – most common, checked first
  {
    predicate: (addr) => EVM_REGEX.test(addr),
    validators: [
      {chain: 'Ethereum', validate: validateETH},
      {chain: 'BNB', validate: validateBNB},
      {chain: 'Polygon', validate: validatePolygon},
    ],
  },
  // Bitcoin & Litecoin – unified route to avoid overlapping P2SH (3…) ambiguity.
  // Both validators are run; success on either marks the address valid for that chain.
  {
    predicate: (addr) => BTC_LTC_REGEX.test(addr),
    validators: [
      {chain: 'Bitcoin', validate: validateBTC},
      {chain: 'Litecoin', validate: validateLTC},
    ],
  },
  // Solana
  {
    predicate: (addr) => SOL_REGEX.test(addr),
    validators: [{chain: 'Solana', validate: validateSOL}],
  },
  // TRON
  {
    predicate: (addr) => TRX_REGEX.test(addr),
    validators: [{chain: 'TRON', validate: validateTRX}],
  },
  // XRP
  {
    predicate: (addr) => XRP_REGEX.test(addr),
    validators: [{chain: 'XRP', validate: validateXRP}],
  },
  // Stellar
  {
    predicate: (addr) => XLM_REGEX.test(addr),
    validators: [{chain: 'Stellar', validate: validateXLM}],
  },
  // TON
  {
    predicate: (addr) => TON_REGEX.test(addr),
    validators: [{chain: 'TON', validate: validateTON}],
  },
];
