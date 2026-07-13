import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Apple 차트 피드는 CORS를 허용하지 않아서 브라우저가 직접 못 부른다.
    // 개발 서버가 대신 요청해주는 프록시 설정:
    // /apple-api/... 로 요청하면 → https://rss.marketingtools.apple.com/... 으로 전달
    proxy: {
      '/apple-api': {
        target: 'https://rss.marketingtools.apple.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/apple-api/, ''),
      },
    },
  },
})
