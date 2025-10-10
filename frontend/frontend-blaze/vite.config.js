import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // No proxy needed for Pinata - direct HTTPS works fine
  },
  optimizeDeps: {
    include: ['@wagmi/core'],
    exclude: ['@wagmi/core/providers/public']
  },
  resolve: {
    alias: {
      '@wagmi/core/providers/public': '@wagmi/core'
    }
  }
});