import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxyTarget = env.VITE_API_PROXY_TARGET;

  if (command === 'serve' && !apiProxyTarget) {
    throw new Error('Set VITE_API_PROXY_TARGET in frontend/.env before starting the dev server.');
  }

  return {
    plugins: [react()],
    server: {
      port: 5173,
      ...(apiProxyTarget && { proxy: {
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
        },
      } }),
    },
  };
});
