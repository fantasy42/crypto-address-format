# crypto-address-format

Universal format validation for crypto wallet addresses.

`crypto-address-format` provides lightweight validators for common cryptocurrency address formats. It is suitable for frontend, backend, and edge environments.

## Installation

```bash
npm install crypto-address-format
# or
pnpm add crypto-address-format
# or
yarn add crypto-address-format
# or
bun add crypto-address-format
```

## Basic Usage

```ts
import {validateBTC} from 'crypto-address-format';

const address = 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';
const result = validateBTC(address);

console.log(result);
```

> **Note:** Always validate a cleaned string. Trim leading and trailing whitespace before passing user input to any validator, otherwise a valid address may fail validation.

## Validators

### `validateBTC(address)`

Validates Bitcoin mainnet addresses.

What it checks:

- legacy Base58 addresses starting with `1` or `3`
- native SegWit `bc1...` Bech32 addresses
- Taproot `bc1p...` Bech32m addresses
- checksum and encoding rules for Base58Check, BIP-173, and BIP-350

More info:

- returns `P2PKH`, `P2SH`, `Bech32`, or `Bech32m` when valid
- rejects mixed-case Bech32 addresses
- intended for Bitcoin mainnet addresses

```ts
import {validateBTC} from 'crypto-address-format';

const address = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
const result = validateBTC(address);
```

### `validateETH(address)`

Validates Ethereum addresses.

What it checks:

- `0x` prefix and exact 20-byte hex length
- valid hexadecimal characters
- EIP-55 checksum for mixed-case addresses

More info:

- accepts lowercase and uppercase hex addresses
- verifies checksum when a mixed-case EIP-55 address is used
- returns the normalized lowercase address when valid
- suitable for Ethereum and EVM-style hex address format validation

```ts
import {validateETH} from 'crypto-address-format';

const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
const result = validateETH(address);
```

## Result Format

Validators return a `ValidationResult`:

```ts
type ValidationResult =
  | {isValid: true; type: string; address: string}
  | {isValid: false; error: string};
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Fantasy](https://github.com/fantasy42)
