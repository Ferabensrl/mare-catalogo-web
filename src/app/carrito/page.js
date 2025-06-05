'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Minus, Send } from 'lucide-react'

export default function CarritoPage() {
  const [carrito, setCarrito] = useState({})
  const [comentariosProducto, setComentariosProducto] = useState({})
  const [comentarioFinal, setComentarioFinal] = useState('')

  useEffect(() => {
    const savedCarrito = localStorage.getItem('mare-carrito')
    const savedComentarios = localStorage.getItem('mare-comentarios-producto')
    const savedComentarioFinal = localStorage.getItem('mare-comentario-final')
    if (savedCarrito) setCarrito(JSON.parse(savedCarrito))
    if (savedComentarios) setComentariosProducto(JSON.parse(savedComentarios))
    if (savedComentarioFinal) setComentarioFinal(savedComentarioFinal)
  }, [])

  useEffect(() => {
    localStorage.setItem('mare-carrito', JSON.stringify(carrito))
  }, [carrito])

  useEffect(() => {
    localStorage.setItem('mare-comentarios-producto', JSON.stringify(comentariosProducto))
  }, [comentariosProducto])

  useEffect(() => {
    localStorage.setItem('mare-comentario-final', comentarioFinal)
  }, [comentarioFinal])

  const establecerCantidad = (key, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 0
    if (cantidad <= 0) {
      const nuevoCarrito = { ...carrito }
      delete nuevoCarrito[key]
      setCarrito(nuevoCarrito)
    } else {
      setCarrito(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          cantidad: cantidad
        }
      }))
    }
  }

  const actualizarCantidad = (key, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      const nuevoCarrito = { ...carrito }
      delete nuevoCarrito[key]
      setCarrito(nuevoCarrito)
    } else {
      setCarrito(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          cantidad: nuevaCantidad
        }
      }))
    }
  }

  const eliminarDelCarrito = (key) => {
    const nuevoCarrito = { ...carrito }
    delete nuevoCarrito[key]
    setCarrito(nuevoCarrito)
  }

  const calcularTotal = () => {
    return Object.values(carrito).reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad)
    }, 0)
  }

  const generarPedido = () => {
    const itemsCarrito = Object.values(carrito)
    if (itemsCarrito.length === 0) return

    let mensaje = 'PEDIDO MARE\n\n'
    mensaje += 'Cliente: [Nombre del cliente]\n'
    mensaje += 'Fecha: ' + new Date().toLocaleDateString('es-UY') + '\n\n'
    mensaje += 'PRODUCTOS:\n'

    const productosAgrupados = {}
    itemsCarrito.forEach(item => {
      const productoId = item.producto.codigo
      if (!productosAgrupados[productoId]) {
        productosAgrupados[productoId] = {
          producto: item.producto,
          items: [],
          totalProducto: 0
        }
      }
      productosAgrupados[productoId].items.push(item)
      productosAgrupados[productoId].totalProducto += item.producto.precio * item.cantidad
    })

    Object.values(productosAgrupados).forEach(grupo => {
      mensaje += '- ' + grupo.producto.nombre + ' (' + grupo.producto.codigo + ')\n'

      const tieneColores = grupo.producto.colores && grupo.producto.colores.length > 0
      if (tieneColores) {
        const colores = grupo.items.map(item => item.cantidad + ' ' + item.color).join(', ')
        mensaje += '  Cantidades: ' + colores + '\n'
      } else {
        const totalCantidad = grupo.items.reduce((sum, item) => sum + item.cantidad, 0)
        mensaje += '  Cantidad: ' + totalCantidad + '\n'
      }

      mensaje += '  Precio unitario: $' + grupo.producto.precio + '\n'
      mensaje += '  Subtotal: $' + grupo.totalProducto + '\n'

      const comentario = comentariosProducto[grupo.producto.codigo]
      if (comentario && comentario.trim()) {
        mensaje += '  COMENTARIO: ' + comentario + '\n'
      }
      mensaje += '\n'
    })

    mensaje += 'TOTAL PEDIDO: $' + calcularTotal() + '\n\n'

    if (comentarioFinal && comentarioFinal.trim()) {
      mensaje += 'COMENTARIOS ADICIONALES:\n' + comentarioFinal + '\n\n'
    }

    mensaje += 'Pedido enviado desde Catalogo MARE\nBy Feraben SRL'

    const numeroWhatsapp = '59897998999'
    const mensajeCorto = mensaje.length > 1800 ?
      mensaje.substring(0, 1600) + '\n...(mensaje truncado)\n\nTotal: $' + calcularTotal() :
      mensaje

    const url = 'https://wa.me/' + numeroWhatsapp + '?text=' + encodeURIComponent(mensajeCorto)
    window.open(url, '_blank')

    setCarrito({})
    setComentarioFinal('')
    setComentariosProducto({})
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#E3D4C1' }}>
      <div className="p-4 border-b shadow-sm flex items-center justify-between" style={{ backgroundColor: '#8F6A50' }}>
        <Link href="/" className="text-white text-lg">← Volver al catálogo</Link>
        <h2 className="text-2xl font-bold text-white">🛒 Mi Pedido</h2>
        <div className="w-24"></div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {Object.keys(carrito).length === 0 ? (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">🛒</div>
            <p className="text-2xl mb-6 font-semibold" style={{ color: '#8F6A50' }}>Tu carrito está vacío</p>
            <Link href="/" className="px-8 py-4 text-white rounded-xl font-bold text-lg" style={{ backgroundColor: '#8F6A50' }}>
              Agregar productos
            </Link>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto space-y-5">
            {Object.entries(carrito).map(([key, item]) => (
              <div key={key} className="bg-white rounded-2xl p-5 shadow-lg border-2" style={{ borderColor: '#8F6A50' }}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold" style={{ color: '#8F6A50' }}>{item.producto.nombre}</h3>
                    <p className="text-base text-gray-600 mt-1">Código: {item.producto.codigo}</p>
                    <p className="text-base mt-1" style={{ color: '#8F6A50' }}>
                      Color: <span className="font-semibold">{item.color}</span>
                    </p>
                  </div>
                  <button onClick={() => eliminarDelCarrito(key)} className="text-red-500 hover:text-red-700 p-3 rounded-xl font-bold text-lg" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
                    🗑️
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <span className="text-base font-semibold" style={{ color: '#8F6A50' }}>Cantidad:</span>
                    <div className="flex items-center space-x-3">
                      <button onClick={() => actualizarCantidad(key, item.cantidad - 1)} className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100" style={{ borderColor: '#8F6A50' }}>
                        <Minus size={18} style={{ color: '#8F6A50' }} />
                      </button>
                      <input type="number" min="1" value={item.cantidad} onChange={(e) => establecerCantidad(key, e.target.value)} className="w-20 text-center font-bold border-2 rounded-lg px-3 py-2 text-lg" style={{ borderColor: '#8F6A50', color: '#8F6A50', fontSize: '18px' }} />
                      <button onClick={() => actualizarCantidad(key, item.cantidad + 1)} className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100" style={{ borderColor: '#8F6A50' }}>
                        <Plus size={18} style={{ color: '#8F6A50' }} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base text-gray-600">${item.producto.precio} c/u</p>
                    <p className="text-2xl font-bold" style={{ color: '#8F6A50' }}>${item.producto.precio * item.cantidad}</p>
                  </div>
                </div>
                {comentariosProducto[item.producto.codigo] && (
                  <div className="mt-4 p-4 rounded-xl border-2" style={{ backgroundColor: '#F8F6F3', borderColor: '#8F6A50' }}>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#8F6A50' }}>💬 Comentario:</p>
                    <p className="text-base text-gray-700">{comentariosProducto[item.producto.codigo]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {Object.keys(carrito).length > 0 && (
        <div className="bg-white border-t p-5 shadow-lg">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-5 py-4 border-t-2" style={{ borderColor: '#8F6A50' }}>
              <span className="text-3xl font-bold" style={{ color: '#8F6A50' }}>Total:</span>
              <span className="text-4xl font-bold" style={{ color: '#8F6A50' }}>${calcularTotal()}</span>
            </div>
            <div className="mb-5">
              <label className="block text-base font-semibold mb-3" style={{ color: '#8F6A50' }}>
                📝 Comentarios adicionales del pedido:
              </label>
              <textarea placeholder="Ej: Entregar urgente, horario de recepción, dirección específica..." value={comentarioFinal} onChange={(e) => setComentarioFinal(e.target.value)} className="w-full border-2 rounded-xl px-4 py-4 text-base resize-none" style={{ borderColor: '#8F6A50', fontSize: '18px' }} rows="4" />
            </div>
            <div className="space-y-4">
              <Link href="/" className="w-full py-4 rounded-xl font-bold text-lg border-2 transition-colors flex justify-center" style={{ borderColor: '#8F6A50', color: '#8F6A50', backgroundColor: 'white' }}>
                ← Seguir comprando
              </Link>
              <button onClick={generarPedido} className="w-full text-white py-5 rounded-xl font-bold text-xl hover:opacity-90 transition-colors flex items-center justify-center space-x-4 shadow-lg" style={{ backgroundColor: '#25D366' }}>
                <Send size={28} />
                <span>📱 Enviar Pedido por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
