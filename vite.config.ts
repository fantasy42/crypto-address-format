import {defineConfig} from 'vite-plus';
import {readdirSync} from 'node:fs';
import path from 'node:path';

const getEntries = (dir: string) => {
  const absolutePath = path.join(process.cwd(), dir);
  const files = readdirSync(absolutePath);

  const entries: Record<string, string> = {};

  for (const file of files) {
    const {name, ext} = path.parse(file);

    if (ext === '.ts' && !file.includes('.test')) {
      entries[name] = `${dir}/${file}`;
    }
  }

  return entries;
};

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: {
      index: 'src/index.ts',
      ...getEntries('src/chains'),
      ...getEntries('src/aliases'),
    },
    format: ['esm', 'cjs'],
    dts: true,
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
});
