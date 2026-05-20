import {describe, it, expect} from 'vite-plus/test';

import {validateBNB} from '../src/chains/bnb';
import {validateETH} from '../src/chains/eth';
import {validatePolygon} from '../src/chains/polygon';
import {runBaseValidatorTests} from './base.shared';

const evmChains = [
  {validate: validateETH, label: 'Ethereum'},
  {validate: validateBNB, label: 'BNB'},
  {validate: validatePolygon, label: 'Polygon'},
];

describe.each(evmChains)(
  '$label validator (smoke tests)',
  ({validate, label}) => {
    runBaseValidatorTests(validate);

    it('returns correct label and normalized address for a valid EIP-55 address', () => {
      const validAddr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
      const result = validate(validAddr);
      expect(result.isValid).toBe(true);
      if (result.isValid) {
        expect(result.type).toBe(label);
        expect(result.address).toBe(validAddr.toLowerCase());
      }
    });

    it('fails with label in error message when checksum is broken', () => {
      const brokenChecksum = '0xd8dA6bF26964aF9D7eEd9e03E53415D37aA96045';
      const result = validate(brokenChecksum);
      expect(result.isValid).toBe(false);
      if (!result.isValid) {
        expect(result.error).toContain(label);
        expect(result.error).toContain('checksum');
      }
    });
  }
);
