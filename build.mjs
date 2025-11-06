#!/usr/bin/env node
import { build } from 'esbuild';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'));

const sharedConfig = {
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'cjs',
  banner: {
    js: `// ${pkg.name} v${pkg.version}\n// Built: ${new Date().toISOString()}\n`,
  },
  outfile: 'dist/out.js',
  external: [],
  minify: true,
  sourcemap: false,
  treeShaking: true,
  logLevel: 'info',
  // Ensure Node.js globals like fetch are available
  define: {
    'global': 'globalThis',
  },
};

try {
  console.log('🚀 Building with esbuild...');
  await build(sharedConfig);
  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
