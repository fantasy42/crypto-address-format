import {defineConfig} from 'vite-plus';

export default defineConfig({
  staged: {
    '*': 'vp check --fix',
  },
  pack: {
    entry: {
      index: 'src/index.ts',
      btc: 'src/btc.ts',
      eth: 'src/eth.ts',
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
  },
});
