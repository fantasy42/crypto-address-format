# crypto-address-format

Universal, lightweight format validation for cryptocurrency addresses.

`crypto-address-format` provides high-performance validators for Bitcoin, Ethereum, TRON, and popular token standards. It is fully compatible with browser, Node.js, and Edge runtimes.

- **Modular:** Import only the validators you need (e.g., `/btc`, `/eth`).
- **Cryptographic:** Performs full checksum verification (Bech32, EIP-55, Base58Check).
- **Type-Safe:** Built with TypeScript for predictable results.

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

The library follows a consistent pattern for all validators. Pass a string, and receive an object containing the status and metadata.

```ts
import {validateBTC, validateETH, validateTRX} from 'crypto-address-format';

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

Validates Bitcoin mainnet addresses across all current standards, including Legacy, SegWit, and Taproot.

Technical Specifications

- Formats: Legacy (P2PKH), Nested SegWit (P2SH), Native SegWit (Bech32), and Taproot (Bech32m).
- Prefixes: `1`, `3`, or `bc1`.
- Checksums: Double-SHA256 (Base58Check) and Polymod (BIP-173/BIP-350).

Validation Logic

- Verifies cryptographic integrity using the specific checksum algorithm required for the detected encoding.
- Enforces BIP-350 rules: Witness version 0 must use Bech32; Witness version 1+ (Taproot) must use Bech32m.
- Rejects mixed-case Bech32/Bech32m strings to prevent visual ambiguity.

Metadata & Returns

- Type: Returns `P2PKH`, `P2SH`, `Bech32`, or `Bech32m` upon success.
- Normalization: Returns the address in lowercase for SegWit/Taproot addresses to ensure database consistency.

Usage

This function is available via the main entrypoint or as a standalone modular export for optimized bundle sizes.

```ts
// Main entrypoint import
import {validateBTC} from 'crypto-address-format';

// Modular import for better tree-shaking
import {validateBTC} from 'crypto-address-format/btc';

const result = validateBTC('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
```

### `validateETH(address)`

Validates Ethereum mainnet addresses by checking their format and EIP-55 checksum integrity.

Technical Specifications

- Formats: 42-character hexadecimal string.
- Prefixes: `0x` or `0X`.
- Checksums: EIP-55 mixed-case checksum (implicit via Keccak-256 hashing).

Validation Logic

- Verifies exact length of 42 characters and ensures the payload consists of valid hexadecimal characters.
- Detects mixed-case addresses and enforces EIP-55 checksum validation.
- Treats strictly all-lowercase or all-uppercase hexadecimal strings as valid un-checksummed addresses.

Metadata & Returns

- Type: Returns `Ethereum` upon success.
- Normalization: Returns the address in lowercase (with `0x` prefix) to ensure database consistency.

Usage

This function is available via the main entrypoint or as a standalone modular export for optimized bundle sizes.

```ts
// Main entrypoint import
import {validateETH} from 'crypto-address-format';

// Modular import for better tree-shaking
import {validateETH} from 'crypto-address-format/eth';

const result = validateETH('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
```

### `validateERC20(address)`

Validates ERC-20 token addresses (such as USDT or USDC) on the Ethereum network.

Technical Specifications

- Formats: Standard Ethereum hexadecimal address format.
- Prefixes: `0x` or `0X`.
- Checksums: EIP-55 mixed-case checksum.

Validation Logic

- Inherits full validation logic from the Ethereum validator.
- Ensures the destination address is structurally and cryptographically valid for ERC-20 token transfers.

Metadata & Returns

- Type: Returns `Ethereum` upon success.
- Normalization: Returns the address in lowercase to ensure database consistency.

Usage

This function is available via the main entrypoint or as a standalone modular export for optimized bundle sizes.

```ts
// Main entrypoint import
import {validateERC20} from 'crypto-address-format';

// Modular import for better tree-shaking
import {validateERC20} from 'crypto-address-format/usdt-erc20';

const result = validateERC20('0xd1235Cc6634C0532925a3b844Bc454e4438f44e');
```

### `validateTRX(address)`

Validates TRON mainnet addresses by checking their Base58Check encoding and network prefix.

Technical Specifications

- Formats: Base58Check encoded string.
- Prefixes: `T` (Version byte `0x41`).
- Checksums: Double-SHA256 (last 4 bytes of the decoded payload).

Validation Logic

- Verifies the mandatory `T` prefix and ensures the decoded version byte matches the TRON mainnet identifier.
- Decodes the Base58 string to validate the cryptographic integrity of the checksum.
- Ensures the address length is exactly 34 characters.

Metadata & Returns

- Type: Returns `TRON` upon success.
- Normalization: Returns the original Base58 string as TRON addresses are case-sensitive.

Usage

This function is available via the main entrypoint or as a standalone modular export for optimized bundle sizes.

```ts
// Main entrypoint import
import {validateTRX} from 'crypto-address-format';

// Modular import for better tree-shaking
import {validateTRX} from 'crypto-address-format/trx';

const result = validateTRX('T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb');
```

### `validateTRC20(address)`

Validates TRC-20 token addresses (such as USDT or USDC) on the TRON network.

Technical Specifications

- Formats: Standard TRON Base58Check address format.
- Prefixes: `T` (Version byte `0x41`).
- Checksums: Double-SHA256.

Validation Logic

- Inherits full validation logic from the TRON validator.
- Confirms the address is structurally and cryptographically valid for receiving TRC-20 token transfers.

Metadata & Returns

- Type: Returns `TRON` upon success.
- Normalization: Returns the original Base58 string.

Usage

This function is available via the main entrypoint or as a standalone modular export for optimized bundle sizes.

```ts
// Main entrypoint import
import {validateTRC20} from 'crypto-address-format';

// Modular import for better tree-shaking
import {validateTRC20} from 'crypto-address-format/usdt-trc20';

const result = validateTRC20('TR7NHqjeKQxGChJ8V7X13dgCH965IlcMh');
```

## Result Format

All validators return a consistent `ValidationResult` object. This is a discriminated union, allowing for safe access to data only when validation succeeds.

```ts
type ValidationResult =
  | {
      isValid: true;
      type: string; // The detected address format (e.g., 'Bech32', 'P2PKH', 'Ethereum')
      address: string; // The normalized version of the address
    }
  | {
      isValid: false;
      error: string; // A descriptive message explaining why validation failed
    };
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [Fantasy](https://github.com/fantasy42)
