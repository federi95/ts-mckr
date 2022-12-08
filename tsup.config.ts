import { readdirSync, rmdirSync, statSync } from 'fs';
import { join } from 'path';

import { defineConfig } from 'tsup';

export const cleanupEmptyFolders = (folder: string) => {
  if (!statSync(folder).isDirectory()) return;
  let files = readdirSync(folder);

  if (files.length > 0) {
    files.forEach((file) => cleanupEmptyFolders(join(folder, file)));
    // Re-evaluate files; after deleting subfolders we may have an empty parent
    // folder now.
    files = readdirSync(folder);
  }

  if (files.length === 0) {
    console.log('removing: ', folder);
    rmdirSync(folder);
  }
};

export default defineConfig({
  entry: ['./src/index.ts'],
  sourcemap: true,
  splitting: true,
  clean: true,
  dts: true,
  format: ['cjs', 'esm'],
  minify: true,
  onSuccess: async () => {
    try {
      cleanupEmptyFolders('./dist');
    } catch (e) {
      console.log(e);
    }
  },
});
