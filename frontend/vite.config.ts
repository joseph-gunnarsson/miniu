import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'






export default defineConfig(({ command, mode }) => {

  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND,
          changeOrigin: true,
          rewrite: (path:string) => path.replace(/^\/api/, '/'),
        },
      },
    },
  }
})
