import {glob} from 'tinyglobby';
import path from 'node:path';

async function getEntries() {
  const files = await glob([
    'src/chains/*.ts',
    'src/aliases/*.ts',
    '!src/**/*.test.ts',
  ]);

  const entries: Record<string, string> = {};
  const seen = new Set<string>();

  for (const file of files) {
    const name = path.parse(file).name;
    if (seen.has(name)) {
      throw new Error(
        `Duplicate entry name "${name}" from files: ${entries[name]} and ${file}. Rename one of the source files.`
      );
    }

    seen.add(name);
    entries[name] = file;
  }

  return entries;
}

const entries = await getEntries();

export default {
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: {
      index: 'src/index.ts',
      any: 'src/any/index.ts',
      ...entries,
    },
    format: ['esm', 'cjs'],
    dts: {
      tsgo: true,
    },
    unbundle: true,
    clean: true,
    treeshake: true,
    minify: true,
  },
  lint: {
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  fmt: {
    trailingComma: 'es5',
    semi: true,
    printWidth: 80,
    singleQuote: true,
    bracketSpacing: false,
    ignorePatterns: ['*.yml', '*.md'],
  },
};
