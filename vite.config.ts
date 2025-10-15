import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vite';
import clientErrorLogger from '../../plugins/client-error-logger';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), clientErrorLogger()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    allowedHosts: true, // 允许所有主机访问（E2B 动态域名）
  },
});
