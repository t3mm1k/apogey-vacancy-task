import localFont from 'next/font/local'

export const MaterialSymbols = localFont({
  src: './material-symbols-outlined-full.woff2',
  weight: '100 700',
  style: 'normal',
  display: 'block',
  variable: '--font-material-symbols',
  adjustFontFallback: false,
})