import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  build: {
    outDir: 'public',
    rollupOptions: {
      input: {
        'test-register': resolve(__dirname, 'resources/js/test-register.tsx'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources/js'),
    },
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || 'http://localhost:8000'),
    'import.meta.env.VITE_API_REGISTER_PATH': JSON.stringify(process.env.VITE_API_REGISTER_PATH || '/register'),
    'import.meta.env.VITE_SESSION_MODE': JSON.stringify(process.env.VITE_SESSION_MODE || 'true'),
  },
});
