import {describe, it, expect} from 'vite-plus/test';

import {prevalidate} from '../prevalidate';
import {ValidationErrorCodes} from '../../constants';

describe('prevalidate', () => {
  it('accepts a valid printable ASCII string', () => {
    const result = prevalidate('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
    }
  });

  it('trims leading/trailing whitespace', () => {
    const result = prevalidate('  0xAbc  ');
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe('0xAbc');
    }
  });

  it('accepts exactly 256 printable characters', () => {
    const addr = 'A'.repeat(256);
    const result = prevalidate(addr);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(addr);
      expect(result.value).toHaveLength(256);
    }
  });

  describe('null or non-string', () => {
    const cases = [
      {label: 'null', value: null},
      {label: 'undefined', value: undefined},
      {label: 'number', value: 123},
      {label: 'object', value: {}},
      {label: 'array', value: []},
      {label: 'boolean', value: true},
    ];

    it.each(cases)('rejects $label', ({value}) => {
      const result = prevalidate(value);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe(ValidationErrorCodes.NULL_OR_UNDEFINED);
        expect(result.message).toContain('non-empty string');
        expect(result.original).toBe('');
      }
    });
  });

  describe('empty or whitespace', () => {
    const cases = [
      {label: 'empty string', value: ''},
      {label: 'spaces', value: '   '},
      {label: 'tab', value: '\t'},
      {label: 'newline', value: '\n'},
      {label: 'mixed whitespace', value: ' \t \n '},
    ];

    it.each(cases)('rejects $label', ({value}) => {
      const result = prevalidate(value);
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe(ValidationErrorCodes.EMPTY);
        expect(result.message).toContain('empty or whitespace');
        expect(result.original).toBe(value.trim());
      }
    });
  });

  it('rejects strings longer than 256 characters', () => {
    const long = 'A'.repeat(257);
    const result = prevalidate(long);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(ValidationErrorCodes.TOO_LONG);
      expect(result.message).toContain('256');
      expect(result.original).toBe(long);
    }
  });

  describe('non-printable or unicode characters', () => {
    it('rejects a control character', () => {
      const result = prevalidate('0x1234\x00abcd');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHARACTERS);
        expect(result.message).toContain('invalid characters');
        expect(result.original).toBe('0x1234\x00abcd'.trim());
      }
    });

    it('rejects non-ASCII printable (emoji)', () => {
      const result = prevalidate('😃hello');
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.code).toBe(ValidationErrorCodes.INVALID_CHARACTERS);
      }
    });
  });
});
