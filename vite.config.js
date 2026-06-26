import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: false
      },
      includeAssets: ['icons/icon-192.png', 'icons/icon-512.png', 'favicon.svg'],
      manifest: {
        name: 'MD Viewer',
        short_name: 'MD Viewer',
        description: 'Markdown 编辑预览工具 - 离线可用',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ffffff',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      devOptions: { enabled: false }
    })
  ],
  server: { port: 5173, open: true },
  build: { target: 'es2020', outDir: 'dist', sourcemap: false }
})
