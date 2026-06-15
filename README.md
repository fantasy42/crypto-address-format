# cryptovalid &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/fantasy42/cryptovalid/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/cryptovalid.svg?style=flat)](https://www.npmjs.com/package/cryptovalid) [![tests](https://github.com/fantasy42/cryptovalid/actions/workflows/test.yml/badge.svg)](https://github.com/fantasy42/cryptovalid/actions/workflows/test.yml)

**Lightweight crypto address validator with checksum verification for Bitcoin, Ethereum, Solana and more.**

- **Checksums, not regex** — Full verification of Bech32, EIP-55, Base58Check, CRC16 and more
- **Batch validation** — Validate hundreds of addresses efficiently with full context
- **Type-safe & fast** – Clean discriminated union results, synchronous validation, 350+ test vectors
- **Tree-shakeable & tiny** — Import only what you need. Tiny bundle size

## Installation

```bash
npm install cryptovalid
```

## Basic Usage

```ts
import { validateBTC } from 'cryptovalid';

const result = validateBTC('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');

// On success: { isValid: true, type: 'Bech32', address: 'bc1qw508....' }
// On failure: { isValid: false, code: 'INVALID_CHECKSUM', message: 'Invalid Bech32 checksum' }

if (result.isValid) {
  console.log(`Valid ${result.type} address: ${result.address}`);
} else {
  console.error(`Validation failed: ${result.code} – ${result.message}`);
}
```

> Each validator auto-trims input and rejects invalid formats early. All functions are synchronous and never throw.

## Batch Validation

```ts
import { validateETHBatch } from 'cryptovalid';

const results = validateETHBatch([
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  '0xinvalid',
  { address: '0x…', id: 'field2' },
]);

results.forEach((r) => {
  if (r.isValid) {
    console.log(`✅ [${r.index}] ${r.original} → ${r.type}`);
  } else {
    console.error(`❌ [${r.index}] ${r.original} → ${r.code}: ${r.message}`);
  }
});
```

Each result exposes the original (trimmed) address, its position, and an optional `id` for mapping back to UI fields.

## Supported Chains

All validators below are also available as batch versions (e.g. `validateBTC` → `validateBTCBatch`). Token aliases like `validateUSDTERC20` are included for semantic clarity.

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

## Error Codes

Starting in **v0.4.0**, all failure results contain a **machine-readable `code`** alongside a human-friendly `message`.
This allows you to build smart error handling, custom UI messages, analytics, and recovery flows without string parsing.

### Available Error Codes

Import the codes and type:

```ts
import { ValidationErrorCodes, type ValidationErrorCode } from 'cryptovalid';
```

| Code                   | Meaning                                                                      |
|------------------------|------------------------------------------------------------------------------|
| `NULL_OR_UNDEFINED`    | Input was `null`, `undefined`, or not a string.                              |
| `EMPTY`                | Address was empty or only whitespace.                                        |
| `TOO_LONG`             | Address exceeds maximum length (256 chars).                                  |
| `INVALID_CHARACTERS`   | Contains control or non‑printable characters.                                |
| `INVALID_FORMAT`       | General format violation.                                                    |
| `INVALID_PREFIX`       | Missing or invalid prefix.                                                   |
| `INVALID_LENGTH`       | Wrong length for the address type.                                           |
| `INVALID_CHECKSUM`     | Checksum verification failed (Bech32, Base58Check, EIP‑55, CRC16, etc.).     |
| `INVALID_VERSION`      | Invalid version byte or witness version.                                     |
| `INVALID_ENCODING`     | Invalid underlying encoding.                                                 |
| `MIXED_CASE`           | Mixed case where single case is required.                                    |
| `UNSUPPORTED_TYPE`     | Format not supported by this validator.                                      |
| `INTERNAL_ERROR`       | Unexpected internal error.                                                   |

### Usage example

```ts
import { validateETH, ValidationErrorCodes } from 'cryptovalid';

const result = validateETH(address);

if (!result.isValid) {
  switch (result.code) {
    case ValidationErrorCodes.INVALID_CHECKSUM:
      showChecksumError(result.message);
      break;

    case ValidationErrorCodes.INVALID_PREFIX:
      showPrefixError(result.message);
      break;

    default:
      showGenericError(result.message);
  }
}
```

You can also map codes to translations, icons, or severity levels.

### Upgrading from v0.3.x

- The old `{ isValid: false, error: string }` shape has been replaced by `{ isValid: false, code: ValidationErrorCode, message: string }`.
- Old code accessing `result.error` should be updated to use `result.code` and `result.message`.

## Modular Imports

```ts
import { validateBTC } from 'cryptovalid/btc';
import { validateUSDTTRC20 } from 'cryptovalid/usdt-trc20';
import { validateSOL } from 'cryptovalid/sol';
```

> A single validator adds **< 3 kB gzipped**.

## Performance

All validation runs synchronously with a consistent per‑address cost. Batch processing scales linearly with the input size. In practice, the library validates **thousands of addresses per millisecond** on modern hardware, with no inherent input size limit.

## Security

**This library performs offline format and checksum verification only.** It protects against accidental typing errors and malformed addresses, but it does **not**:

- guarantee that an address belongs to the intended recipient
- verify on‑chain activity, contract existence, or balance
- handle private keys, seed phrases, or any secret material

Always verify addresses through multiple independent channels before sending funds. For critical applications, consider additional on‑chain lookups.

If you discover a security vulnerability, please follow the [Security Policy](.github/SECURITY.md) instead of opening a public issue.

## Contributing

Development happens in the open on GitHub and we are grateful for contributions including bug fixes, improvements, and ideas.

Read the [contributing guide](.github/CONTRIBUTING.md) to learn about our development process, how to propose bug fixes and improvements, and how to build and test your changes.

### Code of Conduct

This project expects all participants to adhere to the project's [Code of Conduct](.github/CODE_OF_CONDUCT.md). Please read the full text so that you can understand what actions will and will not be tolerated.

### License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Fantasy](https://github.com/fantasy42)
