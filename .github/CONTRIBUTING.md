# Contributing to crypto-address-format

First off, thank you for considering contributing to `crypto-address-format`! It's people like you that make this tool better for everyone.

## Getting Started

1.  **Fork the repository** on GitHub.
2.  **Clone your fork** locally:
    ```bash
    git clone https://github.com/your-username/crypto-address-format.git
    cd crypto-address-format
    ```

## Development Workflow

This project uses **Vite+** (`vp`) as its unified toolchain. Please ensure you use its commands for all development, linting, and testing tasks.

### 1. Install Dependencies

Always use Vite+ to install packages. Do not use `npm`, `pnpm`, or `yarn` directly:

```bash
vp install
```

### 2. Run the Development Server

```bash
vp dev
```

### 3. Check and Format Your Code

Before submitting your changes, please ensure that the code is properly formatted and passes all linting/type checks. Vite+ handles this automatically:

```bash
vp check
```

### 4. Run Tests

Ensure all existing tests pass and write new tests for any added features or bug fixes. Vitest is bundled directly, so use:

```bash
vp test
```

## Pull Request Process

1.  Create a new branch for your feature or bugfix:
    ```bash
    git checkout -b feature/your-feature-name
    ```
2.  Commit your changes with clear and descriptive commit messages.
3.  Push your branch to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
4.  Open a Pull Request against the repository.
5.  Ensure all CI checks (like `vp check` and `vp test`) pass on your PR.
6.  Wait for code review and address any feedback.

## Reporting Issues

If you find a bug or have a feature request, please search the issue tracker first to see if it has already been reported. If not, open a new issue and provide as much detail as possible, including:

- A clear descriptive title.
- Steps to reproduce the issue (for bugs).
- Your environment details.

We appreciate your contributions and look forward to building this project together!
