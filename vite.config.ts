import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// NOTE: Do not put secret keys (like GEMINI_API_KEY) in `define` here —
// anything defined here is copied into the public website code.
// The Gemini key is only used on the server in api/scan.ts.
export default defineConfig(() => {
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
