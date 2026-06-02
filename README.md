# cryptovalid &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fantasy42/crypto-address-format/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/cryptovalid.svg?style=flat)](https://www.npmjs.com/package/cryptovalid) [![tests](https://github.com/fantasy42/crypto-address-format/actions/workflows/test.yml/badge.svg)](https://github.com/fantasy42/crypto-address-format/actions/workflows/test.yml) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/fantasy42/crypto-address-format/blob/master/.github/CONTRIBUTING.md)

**Lightweight crypto address validator with checksum verification for Bitcoin, Ethereum, Solana and more.**

- **Checksums, not regex** — Full verification of Bech32, EIP-55, Base58Check, CRC16 and more.
- **Tree-shakeable** — Import only what you need. Tiny bundle size.
- **Runs everywhere** — Browsers, Node.js, Deno, Edge. No DOM, no polyfills.
- **Type-safe** — Clean discriminated union results.
- **Blazing fast** — Synchronous validation, proven by 350+ test vectors.

## Installation

```bash
npm install cryptovalid
```

## Basic Usage

```ts
import { validateBTC, validateETH, validateTRX } from 'cryptovalid';

const result = validateBTC('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');

if (result.isValid) {
  console.log(`Valid ${result.type} address: ${result.address}`);
} else {
  console.error(`Validation failed: ${result.error}`);
}
```

> Each validator auto-trims input and rejects invalid formats early.

## Supported Chains

| Chain           | Functions                              | Key Features                                      |
|-----------------|----------------------------------------|---------------------------------------------------|
| **Bitcoin**     | `validateBTC`                          | Legacy (P2PKH), P2SH, Bech32, Bech32m             |
| **Ethereum**    | `validateETH`, `validateERC20`         | EIP-55 checksum                                   |
| **BNB**         | `validateBNB`, `validateBEP20`         | EIP-55 checksum                                   |
| **Solana**      | `validateSOL`                          | Base58, 32-byte public key (wallets + PDAs)       |
| **TRON**        | `validateTRX`, `validateTRC20`         | Base58Check                                       |
| **Litecoin**    | `validateLTC`                          | Legacy (P2PKH), P2SH, Bech32, Bech32m             |
| **Polygon**     | `validatePolygon`, `validateMatic`     | EIP-55 checksum                                   |
| **XRP**         | `validateXRP`                          | Classic (r-prefix) + X-Address                    |
| **Stellar**     | `validateXLM`                          | Standard (G…) + Muxed (M…) + CRC16                |
| **TON**         | `validateTON`                          | Raw + User-Friendly formats + CRC16               |

Token aliases (`validateUSDTERC20`, `validateUSDTBEP20`, `validateUSDTTRC20`) are available for semantic clarity.

## Modular Imports

```ts
import { validateETH } from 'cryptovalid/eth';
import { validateUSDTTRC20 } from 'cryptovalid/usdt-trc20';
```

> A single validator adds **< 3 kB gzipped**.

## Result Format

```ts
type ValidationResult<T extends string> =
  | {
      isValid: true;
      type: T;           // e.g. 'Bitcoin', 'Ethereum', 'Solana'...
      address: string;   // Normalized / checksummed address
    }
  | {
      isValid: false;
      error: string;     // Human-readable error message
    };
```

## Contributing

Development happens in the open on GitHub and we are grateful for contributions including bug fixes, improvements, and ideas.

### Code of Conduct

This project expects all participants to adhere to the project’s [Code of Conduct](.github/CODE_OF_CONDUCT.md). Please read the full text so that you can understand what actions will and will not be tolerated.

### Contributing Guide

Read the [contributing guide](.github/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

### Security

If you discover a security vulnerability, please follow the [security policy](.github/SECURITY.md) instead of opening a public issue.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Fantasy](https://github.com/fantasy42)
