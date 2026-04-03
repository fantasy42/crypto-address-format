import {promises as fs} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');

async function getModules(dirName: string) {
  const dirPath = path.resolve(rootDir, 'src', dirName);
  try {
    const files = await fs.readdir(dirPath);
    return files
      .filter((file) => file.endsWith('.ts') && !file.includes('.test.'))
      .map((file) => path.parse(file).name);
  } catch {
    return [];
  }
}

try {
  const pkgPath = path.resolve(rootDir, 'package.json');
  const pkgStr = await fs.readFile(pkgPath, 'utf8');
  const pkg = JSON.parse(pkgStr);

  const chains = await getModules('chains');
  const aliases = await getModules('aliases');

  const exportsConfig: Record<string, unknown> = {
    '.': {
      import: {
        default: './dist/index.mjs',
        types: './dist/index.d.mts',
      },
      require: {
        default: './dist/index.cjs',
        types: './dist/index.d.cts',
      },
    },
  };

  const allModules = [...chains, ...aliases];

  for (const mod of allModules) {
    exportsConfig[`./${mod}`] = {
      import: {
        default: `./dist/${mod}.mjs`,
        types: `./dist/${mod}.d.mts`,
      },
      require: {
        default: `./dist/${mod}.cjs`,
        types: `./dist/${mod}.d.cts`,
      },
    };
  }

  exportsConfig['./package.json'] = './package.json';

  pkg.exports = exportsConfig;

  await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
  console.log('✅ Generated named exports in package.json');
} catch (error) {
  throw new Error('Failed to generate exports in package.json', {
    cause: error,
  });
}
