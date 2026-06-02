# Contributing to cryptovalid

First off, thank you for considering contributing to `cryptovalid`! It's people like you that make this tool better for everyone.

For detailed coding standards, validator templates, test coverage expectations, and security guidelines, please read the **[AGENTS.md](./AGENTS.md)** file – it’s the single source of truth for development conventions.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/crypto-address-format.git
    cd crypto-address-format
    ```

## Development Workflow: Using Vite+

This project is using **Vite+**, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`.

Vite+ is distinct from Vite itself, and invokes Vite underneath when running commands like `vp dev` or `vp build`. For a list of commands, run `vp help`, or use `vp <command> --help` for details on a specific command. Documentation is available locally at `node_modules/vite-plus/docs` or online at [viteplus.dev](https://viteplus.dev/guide/).

Always use `vp` commands for all development, linting, and testing tasks. Do not use `npm`, `pnpm`, `yarn` or `bun` directly.

### 1. Install Dependencies

Run this after pulling remote changes and before getting started:

```bash
vp install
```

### 2. Check and Format Your Code

Before submitting your changes, please ensure that the code is properly formatted and passes all linting/type checks. Vite+ handles this automatically:

```bash
vp check
```

### 3. Run Tests

Ensure all existing tests pass and write new tests for any added features or bug fixes. Vitest is bundled directly, so use:

```bash
vp test
```

## Pull Request Process

To ensure a smooth review process, please follow this checklist before submitting your work:

- **Sync and Install**: Run `vp install` after pulling remote changes and before getting started.
- **Validate Code**: Run `vp check` and `vp test` to format, lint, type check, and test all changes.
- **Run Additional Scripts**: Check if there are specific `vite.config.ts` tasks or `package.json` scripts necessary for validation, and run them via `vp run <script>`.

Once you are ready:

1. Create a new branch for your feature or bugfix:

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. Commit your changes with clear and descriptive commit messages.
3. Push your branch to your fork:

    ```bash
    git push origin feature/your-feature-name
    ```

4. Open a Pull Request against the main repository.
5. Wait for code review and address any feedback.

## Reporting Issues

If you find a bug or have a feature request, please search the issue tracker first to see if it has already been reported. If not, open a new issue and provide as much detail as possible, including:

- A clear descriptive title.
- Steps to reproduce the issue (for bugs).
- Your environment details.

We appreciate your contributions and look forward to building this project together!
