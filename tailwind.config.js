/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,html}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        editor: {
          bg: 'var(--color-bg)',
          fg: 'var(--color-fg)',
          border: 'var(--color-border)',
          accent: 'var(--color-accent)'
        }
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace']
      }
    }
  },
  plugins: []
}
