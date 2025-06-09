import './globals.css'
import Link from 'next/link'

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
      <body className="min-h-screen bg-gray-50 flex flex-col">
        <nav className="bg-[#8F6A50] text-white p-4 flex justify-center space-x-6">
          <Link href="/" className="hover:underline">Inicio</Link>
          <Link href="/sobre-nosotros" className="hover:underline">Sobre Nosotros</Link>
          <Link href="/productos" className="hover:underline">Productos</Link>
          <Link href="/tips" className="hover:underline">Tips & Estilo</Link>
          <Link href="/contacto" className="hover:underline">Contacto</Link>
        </nav>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
