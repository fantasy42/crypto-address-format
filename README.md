# crypto-address-format &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fantasy42/crypto-address-format/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/crypto-address-format.svg?style=flat)](https://www.npmjs.com/package/crypto-address-format) [![tests](https://github.com/fantasy42/crypto-address-format/actions/workflows/test.yml/badge.svg)](https://github.com/fantasy42/crypto-address-format/actions/workflows/test.yml) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/fantasy42/crypto-address-format/blob/master/.github/CONTRIBUTING.md)

Universal, lightweight format validation for cryptocurrency addresses.

- **Checksums, not regex** – full verification of Bech32, EIP‑55, Base58Check, CRC16, and more.
- **Tree‑shakeable** – import a single validator and leave the rest behind. Never ship unused code.
- **Runs everywhere** – browsers, Node.js, Deno, Edge. No polyfills, no DOM.
- **Type‑safe** – every result is a strictly typed discriminated union. No ambiguous `boolean | string`.
- **Blazing fast** – pure synchronous functions, perfect for real‑time form validation. 350+ test vectors ensure correctness.

## Installation

```bash
npm install crypto-address-format
```

## Basic Usage

Each validator returns a strictly typed `ValidationResult` and automatically trims whitespace, rejecting non‑ASCII, empty, or overly long input.

```ts
import { validateBTC, validateETH, validateTRX } from 'crypto-address-format';

// Example: Validating a Bitcoin address
const result = validateBTC('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');

if (result.isValid) {
  console.log(`Valid ${result.type} address: ${result.address}`);
} else {
  console.error(`Validation failed: ${result.error}`);
}
```

## Validators

`validateBTC(address)`

Validates Bitcoin mainnet addresses including **Legacy (P2PKH)**, **Nested SegWit (P2SH)**, **Native SegWit (Bech32)**, and **Taproot (Bech32m)**.

`validateETH(address)` / `validateERC20(address)`

Validates Ethereum mainnet addresses using **EIP-55** checksum integrity.

`validateUSDTERC20(address)`

Alias for `validateETH`. Validates Ethereum-based **USDT** (ERC-20) destination addresses.

`validateBNB(address)` / `validateBEP20(address)`

Validates BNB Smart Chain (**BSC**) addresses using EVM-compatible EIP-55 checksums.

`validateUSDTBEP20(address)`

Alias for `validateBNB`. Specifically validates BSC-based **USDT** (BEP-20) destination addresses.

`validateSOL(address)`

Validates Solana mainnet addresses using **Base58** encoding, ensuring the decoded public key is exactly 32 bytes. Accepts both standard wallet keys and PDAs.

`validateTRX(address)` / `validateTRC20(address)`

Validates TRON mainnet addresses using **Base58Check** encoding.

`validateUSDTTRC20(address)`

Alias for `validateTRX`. Specifically validates TRON-based **USDT** (TRC-20) destination addresses.

`validateXRP(address)`

Validates XRP Ledger addresses, supporting both **Classic (r-prefix)** and **Mainnet X-Addresses** using double-SHA256 checksums.

`validateLTC(address)`

Validates Litecoin mainnet addresses including **Legacy (P2PKH)**, **P2SH (M and 3 prefixes)**, **Native SegWit (Bech32)**, and **Taproot (Bech32m)**.

`validateXLM(address)`

Validates Stellar mainnet addresses, supporting **Standard (G…)** and **Muxed (M…)** accounts using Base32 encoding and CRC16‑XModem checksum verification.

`validatePolygon(address)` / `validateMatic(address)`

Validates Polygon (PoS) mainnet addresses using **EIP-55** checksum integrity.

`validateTON(address)`

Validates TON (The Open Network) addresses, supporting both **Raw** (workchain:hex) and **User‑Friendly** (base64/base64url) formats across mainnet and testnet, with full CRC16 checksum verification.

## Modular Imports

Tree‑shaking works out of the box. Import only what you use:

```ts
import { validateETH } from 'crypto-address-format/eth';
import { validateUSDTBEP20 } from 'crypto-address-format/usdt-bep20';
```

> A single validator adds **less than 3 kB gzipped** to your bundle.

## Result Format

All validators return a discriminated union, ensuring type safety:

```ts
type ValidationResult<T extends string> =
  | {
      isValid: true;
      type: T;
      address: string; // The normalized/checksummed address string
    }
  | {
      isValid: false;
      error: string;   // Descriptive error message
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
