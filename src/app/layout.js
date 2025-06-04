import './globals.css'

export const metadata = {
  title: 'MARÉ - Catálogo Digital',
  description: 'Catálogo digital mayorista MARÉ - Tu estilo en cada detalle',
  keywords: 'maré, catalogo, mayorista, moda, accesorios, bandoleras, bolsos',
  authors: [{ name: 'Feraben SRL' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#8F6A50" />
      </head>
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
