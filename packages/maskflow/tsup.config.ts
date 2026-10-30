import { defineConfig } from 'tsup';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'react/index': 'src/react/index.ts',
    'vue/index': 'src/vue/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  outExtension({ format }) {
    return {
      js: format === 'esm' ? '.js' : '.cjs',
    };
  },
  external: ['react', 'react-dom', 'vue', 'hls.js'],
  async onSuccess() {
    const srcCss = path.resolve(__dirname, 'src/styles/maskflow.css');
    const distCss = path.resolve(__dirname, 'dist/styles.css');
    if (fs.existsSync(srcCss)) {
      fs.copyFileSync(srcCss, distCss);
    }
  },
});
