import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['./src/index.ts'],
  sourcemap: true,
  splitting: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: true,
  bundle: false,
});
