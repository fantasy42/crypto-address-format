# crypto-address-format

Universal, lightweight format validation for cryptocurrency addresses.

`crypto-address-format` provides high-performance validators for Bitcoin, Ethereum, BNB, TRON, and popular token standards. It is fully compatible with browser, Node.js, and Edge runtimes.

- **Cryptographic:** Performs full checksum verification (Bech32, EIP-55, Base58Check).
- **Type-Safe:** Built with TypeScript for predictable results.
- **Modular:** Tree-shakeable exports for minimal bundle sizes.

## Installation

```bash
npm install crypto-address-format
```

## Basic Usage

All validators follow a consistent pattern, returning a strictly typed `ValidationResult` object.

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

> **Note:** Always validate a cleaned string. Trim leading and trailing whitespace before passing user input to any validator, otherwise a valid address may fail validation.

## Validators

### `validateBTC(address)`

Validates Bitcoin mainnet addresses including **Legacy (P2PKH)**, **Nested SegWit (P2SH)**, **Native SegWit (Bech32)**, and **Taproot (Bech32m)**.

### `validateETH(address)`

Validates Ethereum mainnet addresses using **EIP-55** checksum integrity.

### `validateERC20(address)` / `validateUSDTERC20(address)`

Aliases for validateETH. Validates Ethereum-based token addresses.

### `validateTRX(address)`

Validates TRON mainnet addresses using **Base58Check** encoding.

### `validateTRC20(address)` / `validateUSDTTRC20(address)`

Aliases for `validateTRX`. Validates TRON-based token addresses (TRC-20), including USDT.

### `validateBNB(address)`

Validates BNB Smart Chain (**BSC**) addresses using EVM-compatible EIP-55 checksums.

### `validateBEP20(address)` / `validateUSDTBEP20(address)`

Aliases for `validateBNB`. Validates BSC-based token addresses.

## Modular Imports

For optimized bundle sizes, you can import any validator directly from its specific entry point:

```ts
import { validateETH } from 'crypto-address-format/eth';
import { validateUSDTBEP20 } from 'crypto-address-format/usdt-bep20';
```

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

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Fantasy](https://github.com/fantasy42)
