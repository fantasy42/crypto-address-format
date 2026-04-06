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

describe('EVM Implementations (Smoke Tests)', () => {
  evmChains.forEach(({validate, label}) => {
    describe(`Binding test for ${label}`, () => {
      runBaseValidatorTests(validate);

      it('correctly maps to label and passes basic check', () => {
        // Standard EIP-55 valid address
        const validAddr = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
        const result = validate(validAddr);

        expect(result.isValid).toBe(true);
        if (result.isValid) {
          expect(result.type).toBe(label);
          expect(result.address).toBe(validAddr.toLowerCase());
        }
      });

      it('fails on completely invalid input', () => {
        expect(validate('not-an-evm-address').isValid).toBe(false);
      });
    });
  });
});
