# Project overview

`cryptovalid` is a TypeScript‑first, lightweight library for validating cryptocurrency addresses with checksums. It provides high‑performance validators for Bitcoin, Ethereum, BNB, TRON, Solana, and various token standards (ERC‑20, BEP‑20, TRC‑20).

The library is designed for both frontend and backend developers, fully compatible with browsers, Node.js, and Edge runtimes. Its main purpose is to ensure that cryptocurrency addresses are properly formatted and valid before any transactions are made, improving security and user experience by preventing funds from being sent to invalid destinations.

## Entry points and exports

The library exports a `ValidationResult` type and a set of validator functions. Every validator automatically trims leading and trailing whitespace and performs basic sanity checks (non‑empty, ≤256 characters, ASCII printable only) – all handled by the shared `createValidator` factory.

### Validators

- **`validateBTC(address)`** – Bitcoin mainnet addresses (Legacy P2PKH, Nested SegWit P2SH, Native SegWit Bech32, Taproot Bech32m).
- **`validateETH(address)` / `validateERC20(address)`** – Ethereum mainnet addresses with EIP‑55 checksum.
- **`validateUSDTERC20(address)`** – Alias for `validateETH`. Returns the same result type (`'Ethereum'`). Use for semantic clarity when validating USDT on ERC‑20.
- **`validateBNB(address)` / `validateBEP20(address)`** – BNB Smart Chain addresses (EIP‑55).
- **`validateUSDTBEP20(address)`** – Alias for `validateBNB`. Returns `'BNB'` type.
- **`validateSOL(address)`** – Solana mainnet addresses (Base58, 32‑byte decoded length).
- **`validateTRX(address)` / `validateTRC20(address)`** – TRON mainnet addresses (Base58Check).
- **`validateUSDTTRC20(address)`** – Alias for `validateTRX`. Returns `'TRON'` type.
- **`validateXRP(address)`** – XRP Ledger addresses (Classic r‑prefix and X‑Addresses).
- **`validateLTC(address)`** – Litecoin mainnet addresses (Legacy, P2SH, Bech32, Bech32m).
- **`validateXLM(address)`** – Stellar mainnet addresses (Standard G…, Muxed M…).
- **`validatePolygon(address)` / `validateMatic(address)`** – Polygon PoS addresses (EIP‑55).
- **`validateTON(address)`** – TON addresses (Raw and User‑Friendly formats, CRC16).

### Batch Validators

Every validator above has a corresponding batch function that accepts an array of `BatchItem` objects and returns an array of `BatchValidationResult` objects.
Batch functions are built with `createBatchValidator` and re‑use the exact same validation logic as their single‑address counterparts.

**Available batch functions:**

- `validateBTCBatch(items)`
- `validateETHBatch(items)` / `validateERC20Batch(items)`
- `validateUSDTERC20Batch(items)`
- `validateBNBBatch(items)` / `validateBEP20Batch(items)`
- `validateUSDTBEP20Batch(items)`
- `validateSOLBatch(items)`
- `validateTRXBatch(items)` / `validateTRC20Batch(items)`
- `validateUSDTTRC20Batch(items)`
- `validateXRPBatch(items)`
- `validateLTCBatch(items)`
- `validateXLMBatch(items)`
- `validatePolygonBatch(items)` / `validateMaticBatch(items)`
- `validateTONBatch(items)`

Usage snippet:

```ts
// items can be plain strings or { address, id } objects
const results = validateETHBatch([
  '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
  '0xinvalid',
  { address: '0x…', id: 'field2' },
]);

results.forEach((r) => {
  // r.isValid, r.type, r.address, r.code, r.message, r.original, r.index, r.id
});
```

Each result preserves the original trimmed input, its position, and an optional `id` you supplied.

### Modular Imports

All functions are available from the main entry point (`cryptovalid`). For minimal bundle sizes, use tree‑shakeable sub‑paths:

- `cryptovalid/eth` – `validateETH`, `validateETHBatch`, etc.
- `cryptovalid/btc` – `validateBTC`, `validateBTCBatch`
- `cryptovalid/usdt-bep20` – `validateUSDTBEP20`, `validateUSDTBEP20Batch`
- (other chains follow the same pattern)

### Error System

Every failure result contains a **machine‑readable `code`** and a **human‑readable `message`**. The codes are chain‑agnostic and reused across all validators. Both success and failure results carry an `original` field with the trimmed input string.

#### Public API

- `ValidationErrorCodes` — a constant object with all error codes.
- `ValidationErrorCode` — the union type of all possible code string literals.
- Both are exported from the main entry point.

#### Internal mapping

The `base58Check` utility returns its own internal error codes. The helper function `mapBase58CheckError` maps those internal codes to the public `ValidationErrorCodes`, so that chain validators only deal with the public set.

When writing a new validator, use the factory's `failure({code, message, original})` method. The `code` must be one of the public constants, and `original` should be the trimmed address being validated. The `success({type, address, original})` method follows the same object‑parameter pattern.

#### Available codes

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

See the project README for a usage example with `switch` statements.

## Project Structure

```text
.
├── src/
│   ├── aliases/          # Token variant and alias configurations (e.g., USDT types)
│   │   └── usdt-*.ts
│   │
│   ├── chains/           # Blockchain network implementations and constants
│   │   └── [chain_files].ts
│   │
│   ├── utils/            # Utility and helper functions
│   │   ├── __tests__/    # Unit tests specifically for internal utility functions
│   │   ├── base*.ts      # Encoding/decoding utils (Base32, Base58, etc.)
│   │   └── [other_utils].ts
│   │
│   ├── constants.ts      # Public error codes and shared constants
│   ├── index.ts          # Main entry point of the application/library
│   └── types.ts          # Global TypeScript type definitions and interfaces
│
└── tests/                # Integration and validation tests for blockchain networks
    └── [chain].test.ts   # Validator logic tests (e.g., btc, evm, sol, etc.)
```

## Toolchain: Vite+

This project uses **Vite+**, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. It wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Do **not** use `npm`, `pnpm`, `yarn`, or `bun` directly.

Vite+ is distinct from Vite itself; it invokes Vite internally for commands like `vp dev` and `vp build`.

| npm command               | Vite+ command            | Description                          |
|---------------------------|--------------------------|--------------------------------------|
| `npm install`             | `vp install`             | Install dependencies                 |
| `npm run build`           | `vp pack`                | Build the library (output in `dist`) |
| `npm test`                | `vp test`                | Run all tests                        |
| `npm run lint & format`   | `vp check`               | Run Oxlint, Oxfmt, and type check    |
| `npm run dev`             | `vp dev`                 | Start dev server (if applicable)     |

1. Run `vp help` to print a list of commands.
2. Run `vp <command> --help` for information about a specific command.
3. Docs are available locally at `node_modules/vite-plus/docs` or online at [viteplus.dev](https://viteplus.dev/guide/).

### Build and Test Commands

1. Install dependencies: `vp install`
2. Build the library: `vp run build` (or `vp pack`)
3. Run format, lint, and type checks: `vp check`
4. Run tests: `vp test` (or `vp test --dir tests` as used in CI). To run only a specific test file: `vp test tests/btc.test.ts`

## Code style and conventions

1. **TypeScript Style** – `camelCase` for validator functions (e.g., `validateBTC`, `validateBTCBatch`), `PascalCase` for types and interfaces.
2. **Validator Factory** – Every single‑address validator must be created with `src/utils/createValidator.ts`.
   Batch validators are created with `src/utils/createBatchValidator.ts` (a thin wrapper that applies a single‑address validator to an array of `BatchItem` objects). The factory already:
   - Trims the input.
   - Ensures the string is non‑empty, ≤256 chars, and contains only ASCII printable characters (codes 32–126).
   - Catches synchronous exceptions and converts them to a failure with `code` and `message`.
   The `failure` helper accepts an object with `code`, `message`, and `original` fields. The `success` helper accepts `type`, `address`, and `original`.
3. **Formatting Rules** – Enforced by `vp check`:
   - Semicolons required (`semi: true`)
   - Single quotes (`singleQuote: true`)
   - Line width: 80 characters
   - No spaces inside brackets (`bracketSpacing: false`)
   - Trailing commas: `es5`
4. **Linting/Typing Rules** – TypeScript `strict: true`, `noUnusedLocals: true`. Oxlint is type‑aware (`typeAware: true`). Use `vp check` to validate and autofix format issues.
5. **Documentation Templates** – Use the following templates for all validators.

   Single-address validator:

   ```ts
   /** Supported [chain] address categories. */
   export type ChainAddressType = ...;

   /** Result returned by `validateChain()`. */
   export type ChainValidationResult = ValidationResult<ChainAddressType>;

   /**
    * Validates a [chain] address ([encoding details]).
    *
    * [Brief description of format and checks].
    *
    * @param address - The [chain] address to validate.
    * @returns A `ValidationResult` indicating whether the address is valid and, if valid, its detected type.
    */
   export const validateChain = ...
   ```

   Alias (single):

   For aliases (e.g., `validateUSDTERC20`), the docstring must explicitly state that it is an alias for the base validator and mention the returned type value.

   Batch validator (chain):

   ```ts
   /**
    * Validates a batch of [chain] addresses.
    *
    * Wraps `validate[Chain]`; processes all items and collects results in order.
    *
    * @param items - Array of addresses or `BatchItem` objects.
    * @returns Array of `BatchValidationResult`, preserving input order.
    */
   export const validate[Chain]Batch = createBatchValidator(validate[Chain]);
   ```

   Batch validator (alias):

   ```ts
   /**
    * Validates a batch of USDT addresses on the [network] ([standard]).
    *
    * Alias for `validate[Chain]Batch`.
    *
    * @param items - Array of addresses or `BatchItem` objects.
    * @returns Array of `BatchValidationResult`, preserving input order.
    */
   export const validateUSDTXXXBatch = validate[Chain]Batch;
   ```

## Testing and quality

1. **Test location** – `tests/*.test.ts` (e.g., `btc.test.ts`, `eth.test.ts`). Internal utility tests live in `src/utils/__tests__/`.
   Batch validators are covered by a generic batch test (`batch.test.ts`); individual chain batch functions do not require separate tests, as they use the same validation logic.
2. **Test coverage** – Aim for ≥95% line coverage on all validator logic and all utility functions (base58, bech32, checksums). New validators must include:
   - Positive cases (valid addresses of each type)
   - Negative cases (invalid length, wrong charset, checksum mismatch, wrong network)
   - Edge cases (empty string, whitespace‑only, maximum length, leading zero bytes, etc.)
   - Tests must assert `result.code` and `result.message` on failure, not a plain `error` string. The `original` field should be asserted only where it documents a specific behavior (e.g., trimming, null input).
3. **CI Requirements**: The GitHub Actions CI pipeline runs `vp install`, `vp check`, and `vp test`. All PRs must pass these checks without errors.

## Security and reliability

1. **Checksum implementations** (Base58Check, Bech32, EIP‑55, CRC16) are security‑critical. Any change to these files requires:
   - Additional review by a maintainer.
   - Expanded test vectors (including known edge cases from reference implementations).
   - A clear explanation of why the change does not weaken validation.
2. **Backward compatibility** – Validation logic must remain backward‑compatible. Adding a new address type is allowed; changing the validation of an existing type (e.g., suddenly rejecting previously valid addresses) requires a major version bump.
3. **Error codes and messages** – Every failure returns a `code` from `ValidationErrorCodes` and a `message`. The `code` is stable and can be relied upon programmatically (for `switch` statements, logging, analytics). The `message` is intended for display to end users; it is in English and may evolve over time as wording improves. Do not remove or change the meaning of existing error codes without a major version bump.
4. **Batch validation** – Batch functions reuse the same single‑address validation logic and therefore inherit all security and reliability guarantees. No additional risks are introduced.

## Contribution and pull requests

1. **Workflow**:
   - Fork the repository.
   - Clone it locally.
   - Create a branch using the `feature/your-feature-name` or `bugfix/...` format.
2. **Package Management**: Always use `vp install` for package management.
3. **Commits**: Write clear and descriptive commit messages.

### PR Review Checklist

Before opening or requesting review on a PR, ensure you have completed the following:

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check, and test all changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, and run them via `vp run <script>`.
- [ ] Ensure any new or modified validators have corresponding tests covering valid/invalid addresses and edge cases.
- [ ] If the public API is changed, update the documentation in `README.md`.
