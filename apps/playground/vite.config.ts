import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'maskflow/styles.css': path.resolve(
        __dirname,
        '../../packages/maskflow/src/styles/maskflow.css',
      ),
      maskflow: path.resolve(__dirname, '../../packages/maskflow/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
});
