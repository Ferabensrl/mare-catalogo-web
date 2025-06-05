'use client'

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Send, Search, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const CatalogoMare = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [comentarioFinal, setComentarioFinal] = useState('');
  const [comentariosProducto, setComentariosProducto] = useState({});
  const [imagenesActivas, setImagenesActivas] = useState({});
  const [imagenModal, setImagenModal] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const touchStart = useRef({});

  // Persistir carrito y comentarios entre páginas
  useEffect(() => {
    const savedCarrito = localStorage.getItem('mare-carrito');
    const savedComentarios = localStorage.getItem('mare-comentarios-producto');
    const savedComentarioFinal = localStorage.getItem('mare-comentario-final');
    if (savedCarrito) setCarrito(JSON.parse(savedCarrito));
    if (savedComentarios) setComentariosProducto(JSON.parse(savedComentarios));
    if (savedComentarioFinal) setComentarioFinal(savedComentarioFinal);
  }, []);

  useEffect(() => {
    localStorage.setItem('mare-carrito', JSON.stringify(carrito));
  }, [carrito]);

  useEffect(() => {
    localStorage.setItem('mare-comentarios-producto', JSON.stringify(comentariosProducto));
  }, [comentariosProducto]);

  useEffect(() => {
    localStorage.setItem('mare-comentario-final', comentarioFinal);
  }, [comentarioFinal]);

  // Cargar datos desde el JSON generado automáticamente
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log('🔄 Cargando datos del catálogo...');
      
      // Cargar desde GitHub Pages
      const response = await fetch('https://ferabensrl.github.io/mare-catalogo-web/datos/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const datos = await response.json();
      
      console.log('✅ Datos cargados:', datos);
      
      // Los datos son un array directo
      setProductos(datos || []);
      
      // Generar categorías desde los productos
      const categoriasUnicas = [...new Set(datos.map(p => p.categoria))];
      const categoriasFormateadas = [
        { id: 'todos', nombre: 'Todos los productos' },
        ...categoriasUnicas.map(cat => ({
          id: cat.toLowerCase().replace(/\s+/g, '_'),
          nombre: cat
        }))
      ];
      setCategorias(categoriasFormateadas);
      
      console.log(`📊 ${datos.length} productos cargados`);
      
    } catch (error) {
      console.error('❌ Error al cargar datos:', error);
      setError(`Error al cargar el catálogo: ${error.message}`);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const productosFiltrados = productos.filter(producto => {
    const coincideCategoria = categoriaActiva === 'todos' || 
      producto.categoria.toLowerCase().replace(/\s+/g, '_') === categoriaActiva;
    const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                           producto.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
                           (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  const agregarAlCarrito = (productoId, color, cantidad = 1) => {
    const key = productoId + '-' + color;
    setCarrito(prev => ({
      ...prev,
      [key]: {
        cantidad: (prev[key]?.cantidad || 0) + cantidad,
        producto: productos.find(p => p.codigo === productoId),
        color: color
      }
    }));
  };

  const establecerCantidad = (key, nuevaCantidad) => {
    const cantidad = parseInt(nuevaCantidad) || 0;
    if (cantidad <= 0) {
      const nuevoCarrito = { ...carrito };
      delete nuevoCarrito[key];
      setCarrito(nuevoCarrito);
    } else {
      setCarrito(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          cantidad: cantidad
        }
      }));
    }
  };

  const actualizarCantidad = (key, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      const nuevoCarrito = { ...carrito };
      delete nuevoCarrito[key];
      setCarrito(nuevoCarrito);
    } else {
      setCarrito(prev => ({
        ...prev,
        [key]: {
          ...prev[key],
          cantidad: nuevaCantidad
        }
      }));
    }
  };

  const actualizarComentarioProducto = (productoId, comentario) => {
    setComentariosProducto(prev => ({
      ...prev,
      [productoId]: comentario
    }));
  };

  const eliminarDelCarrito = (key) => {
    const nuevoCarrito = { ...carrito };
    delete nuevoCarrito[key];
    setCarrito(nuevoCarrito);
  };

  const cambiarImagen = (productoId, indice) => {
    setImagenesActivas(prev => ({
      ...prev,
      [productoId]: indice
    }));
  };

  const abrirImagen = (productoId, indice) => {
    setImagenModal({ productoId, indice });
  };

  const cerrarImagen = () => setImagenModal(null);

  const calcularTotal = () => {
    return Object.values(carrito).reduce((total, item) => {
      return total + (item.producto.precio * item.cantidad);
    }, 0);
  };

  const generarPedido = () => {
    const itemsCarrito = Object.values(carrito);
    if (itemsCarrito.length === 0) return;

    let mensaje = 'PEDIDO MARE\n\n';
    mensaje += 'Cliente: [Nombre del cliente]\n';
    mensaje += 'Fecha: ' + new Date().toLocaleDateString('es-UY') + '\n\n';
    mensaje += 'PRODUCTOS:\n';
    
    // Agrupar productos por código
    const productosAgrupados = {};
    itemsCarrito.forEach(item => {
      const productoId = item.producto.codigo;
      if (!productosAgrupados[productoId]) {
        productosAgrupados[productoId] = {
          producto: item.producto,
          items: [],
          totalProducto: 0
        };
      }
      productosAgrupados[productoId].items.push(item);
      productosAgrupados[productoId].totalProducto += item.producto.precio * item.cantidad;
    });

    // Generar mensaje agrupado por producto
    Object.values(productosAgrupados).forEach(grupo => {
      mensaje += '- ' + grupo.producto.nombre + ' (' + grupo.producto.codigo + ')\n';
      
      const tieneColores = grupo.producto.colores && grupo.producto.colores.length > 0;
      if (tieneColores) {
        const colores = grupo.items.map(item => item.cantidad + ' ' + item.color).join(', ');
        mensaje += '  Cantidades: ' + colores + '\n';
      } else {
        const totalCantidad = grupo.items.reduce((sum, item) => sum + item.cantidad, 0);
        mensaje += '  Cantidad: ' + totalCantidad + '\n';
      }
      
      mensaje += '  Precio unitario: $' + grupo.producto.precio + '\n';
      mensaje += '  Subtotal: $' + grupo.totalProducto + '\n';
      
      const comentario = comentariosProducto[grupo.producto.codigo];
      if (comentario && comentario.trim()) {
        mensaje += '  COMENTARIO: ' + comentario + '\n';
      }
      mensaje += '\n';
    });

    mensaje += 'TOTAL PEDIDO: $' + calcularTotal() + '\n\n';
    
    if (comentarioFinal && comentarioFinal.trim()) {
      mensaje += 'COMENTARIOS ADICIONALES:\n' + comentarioFinal + '\n\n';
    }
    
    mensaje += 'Pedido enviado desde Catalogo MARE\nBy Feraben SRL';

    // Truncar mensaje si es muy largo
    const numeroWhatsapp = '59897998999';
    const mensajeCorto = mensaje.length > 1800 ? 
      mensaje.substring(0, 1600) + '\n...(mensaje truncado)\n\nTotal: $' + calcularTotal() :
      mensaje;
    
    const url = 'https://wa.me/' + numeroWhatsapp + '?text=' + encodeURIComponent(mensajeCorto);
    window.open(url, '_blank');

    setCarrito({});
    setComentarioFinal('');
    setComentariosProducto({});
  };

  const cantidadItems = Object.values(carrito).reduce((total, item) => total + item.cantidad, 0);

  // Componente de carga
  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E3D4C1' }}>
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#8F6A50' }} />
          <h2 className="text-xl font-bold mb-2" style={{ color: '#8F6A50' }}>
            Cargando catálogo...
          </h2>
          <p className="text-sm opacity-80" style={{ color: '#8F6A50' }}>
            Sincronizando desde GitHub
          </p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#E3D4C1' }}>
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold mb-2 text-red-600">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90"
            style={{ backgroundColor: '#8F6A50' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#E3D4C1' }}>
      {/* Header - Mejorado para móvil */}
      <div className="shadow-lg" style={{ backgroundColor: '#8F6A50' }}>
        <div className="text-center py-2 text-sm" style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}>
          <div className="flex items-center justify-center space-x-4 text-sm font-medium">
            <span>📞 097 998 999</span>
            <span>•</span>
            <span>By Feraben SRL</span>
            <span>•</span>
            <span>✉️ ferabensrl@gmail.com</span>
          </div>
        </div>
        
        <div className="p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="font-bold tracking-wider font-serif" style={{ fontSize: '28px' }}>
                MARÉ
              </h1>
              <p className="opacity-90 mt-1" style={{ fontSize: '18px' }}>Tu estilo en cada detalle</p>
              <div className="opacity-80 flex items-center justify-center space-x-3 mt-2" style={{ fontSize: '16px' }}>
                <span>@mare_uy</span>
                <span>•</span>
                <span>🔄 Conectado a GitHub</span>
                <span>•</span>
                <span>{productos.length} productos</span>
              </div>
            </div>
            <Link
              href="/carrito"
              className="relative p-4 rounded-full hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <ShoppingCart size={28} />
              {cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cantidadItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* Búsqueda - Mejorada */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-5" size={24} style={{ color: '#8F6A50' }} />
          <input
            type="text"
            placeholder="Buscar productos o códigos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-14 pr-4 py-5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent bg-white shadow-sm"
            style={{ fontSize: '18px' }}
          />
        </div>
      </div>

      {/* Categorías - Botones más grandes */}
      <div className="px-4 pb-4">
        <div className="flex overflow-x-auto space-x-3 pb-2">
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
              className={`px-5 py-3 rounded-full whitespace-nowrap transition-colors text-base font-semibold shadow-sm ${
                categoriaActiva === categoria.id 
                  ? 'text-white' 
                  : 'bg-white'
              }`}
              style={{
                backgroundColor: categoriaActiva === categoria.id ? '#8F6A50' : 'white',
                color: categoriaActiva === categoria.id ? 'white' : '#8F6A50',
                minHeight: '44px'
              }}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Productos - Layout optimizado */}
      <div className="px-4 pb-10">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.map(producto => {
              const tieneColores = producto.colores && producto.colores.length > 0;
              
              return (
                <div key={producto.codigo} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                  {/* CARRUSEL DE IMÁGENES */}
                  <div
                    className="relative"
                    onTouchStart={(e) => (touchStart.current[producto.codigo] = e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      const start = touchStart.current[producto.codigo];
                      const end = e.changedTouches[0].clientX;
                      if (start - end > 50) {
                        const next = (imagenesActivas[producto.codigo] || 0) + 1;
                        cambiarImagen(producto.codigo, next >= producto.imagenes.length ? 0 : next);
                      } else if (end - start > 50) {
                        const prev = (imagenesActivas[producto.codigo] || 0) - 1;
                        cambiarImagen(producto.codigo, prev < 0 ? producto.imagenes.length - 1 : prev);
                      }
                    }}
                  >
                    <Image
                      src={producto.imagenes[imagenesActivas[producto.codigo] || 0]}
                      alt={producto.nombre}
                      width={400}
                      height={400}
                      className="w-full h-32 sm:h-40 md:h-48 object-cover cursor-pointer"
                      onClick={() => abrirImagen(producto.codigo, imagenesActivas[producto.codigo] || 0)}
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('.jpg')) {
                          e.target.src = currentSrc.replace('.jpg', '.png');
                        } else {
                          e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`;
                        }
                      }}
                    />

                    {producto.imagenes.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            const prev = (imagenesActivas[producto.codigo] || 0) - 1;
                            cambiarImagen(producto.codigo, prev < 0 ? producto.imagenes.length - 1 : prev);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                        >
                          <ChevronLeft size={20} />
                        </button>
                        <button
                          onClick={() => {
                            const next = (imagenesActivas[producto.codigo] || 0) + 1;
                            cambiarImagen(producto.codigo, next >= producto.imagenes.length ? 0 : next);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </>
                    )}
                    
                    {/* Indicadores de imágenes */}
                    {producto.imagenes.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {producto.imagenes.map((_, indice) => (
                          <button
                            key={indice}
                            onClick={() => cambiarImagen(producto.codigo, indice)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              (imagenesActivas[producto.codigo] || 0) === indice ? 'bg-white' : 'bg-white/50'
                            }`}
                            style={{
                              backgroundColor: (imagenesActivas[producto.codigo] || 0) === indice ? '#8F6A50' : 'rgba(255,255,255,0.5)'
                            }}
                          />
                        ))}
                      </div>
                    )}

                    {/* Contador de imágenes */}
                    {producto.imagenes.length > 1 && (
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full font-medium">
                        {(imagenesActivas[producto.codigo] || 0) + 1}/{producto.imagenes.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-xl leading-tight" style={{ color: '#8F6A50' }}>
                        {producto.nombre}
                      </h3>
                      <span className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}>
                        {producto.codigo}
                      </span>
                    </div>

                    {producto.descripcion && producto.descripcion !== producto.nombre && (
                      <p className="text-base text-gray-600 mb-3">📝 {producto.descripcion}</p>
                    )}
                    
                    {producto.medidas && (
                      <p className="text-base text-gray-600 mb-3">📏 {producto.medidas}</p>
                    )}
                    
                    <p className="font-bold mb-4" style={{ color: '#8F6A50', fontSize: '26px' }}>
                      ${producto.precio}
                    </p>
                    
                    <div className="space-y-4">
                      {tieneColores && (
                        <p className="text-base font-semibold" style={{ color: '#8F6A50' }}>
                          Colores disponibles:
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 mb-5">
                        <label className="text-base font-semibold" style={{ color: '#8F6A50' }}>
                          Cantidad:
                        </label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={'cantidad-' + producto.codigo}
                          className="w-28 text-center border-2 rounded-lg px-4 py-3 text-lg font-semibold placeholder-gray-400"
                          style={{ borderColor: '#8F6A50', color: '#8F6A50', fontSize: '18px' }}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="text-base font-semibold mb-3 block" style={{ color: '#8F6A50' }}>
                          💬 Comentario del producto (opcional):
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Ej: Color específico, talle, observaciones..."
                            id={'comentario-' + producto.codigo}
                            className="flex-1 text-base border-2 rounded-lg px-5 py-4 bg-gray-50 placeholder-gray-400"
                            style={{ borderColor: '#8F6A50', fontSize: '18px', color: '#8F6A50' }}
                          />
                          <button
                            onClick={() => {
                              const comentarioInput = document.getElementById('comentario-' + producto.codigo);
                              const comentario = comentarioInput.value.trim();
                              if (comentario) {
                                actualizarComentarioProducto(producto.codigo, comentario);
                                comentarioInput.value = '';
                              }
                            }}
                            className="px-5 py-4 text-base font-semibold rounded-lg border-2 text-white min-w-[60px]"
                            style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50' }}
                          >
                            💬
                          </button>
                        </div>
                      </div>

                      {comentariosProducto[producto.codigo] && (
                        <div className="mt-4 p-4 rounded-xl border-2" style={{ backgroundColor: '#E3D4C1', borderColor: '#8F6A50' }}>
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-semibold" style={{ color: '#8F6A50' }}>
                              💬 Comentario guardado:
                            </p>
                            <button
                              onClick={() => actualizarComentarioProducto(producto.codigo, '')}
                              className="text-red-500 hover:text-red-700 text-sm px-3 py-1 rounded-lg font-medium"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            >
                              🗑️
                            </button>
                          </div>
                          <input
                            type="text"
                            value={comentariosProducto[producto.codigo]}
                            onChange={(e) => actualizarComentarioProducto(producto.codigo, e.target.value)}
                            className="w-full text-base border-2 rounded-lg px-5 py-4 bg-white placeholder-gray-400"
                            style={{ borderColor: '#8F6A50', color: '#8F6A50', fontSize: '18px' }}
                            placeholder="Edita tu comentario aquí..."
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-3">
                        {!tieneColores ? (
                          // Para productos sin colores
                          <button
                            onClick={() => {
                              const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
                              const cantidad = parseInt(cantidadInput.value) || 1;
                              agregarAlCarrito(producto.codigo, 'ÚNICO', cantidad);
                              cantidadInput.value = '1';
                            }}
                            className="px-6 py-4 rounded-full text-base font-bold transition-colors hover:shadow-lg border-2 text-white w-full"
                            style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50', minHeight: '52px' }}
                          >
                            + AGREGAR AL CARRITO
                          </button>
                        ) : (
                          // Para productos con colores
                          <>
                            <button
                              onClick={() => {
                                const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
                                const cantidad = parseInt(cantidadInput.value) || 1;
                                agregarAlCarrito(producto.codigo, 'SURTIDO', cantidad);
                                cantidadInput.value = '1';
                              }}
                              className="px-6 py-4 rounded-full text-base font-bold transition-colors hover:shadow-lg border-2 text-white"
                              style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50', minHeight: '56px' }}
                            >
                              + SURTIDO
                            </button>
                            
                            {producto.colores.map(color => (
                              <button
                                key={color}
                                onClick={() => {
                                  const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
                                  const cantidad = parseInt(cantidadInput.value) || 1;
                                  agregarAlCarrito(producto.codigo, color, cantidad);
                                  cantidadInput.value = '1';
                                }}
                                className="px-5 py-4 rounded-full text-base font-semibold transition-colors hover:shadow-md border-2"
                                style={{
                                  backgroundColor: '#E3D4C1',
                                  color: '#8F6A50',
                                  borderColor: '#8F6A50',
                                  minHeight: '56px'
                                }}
                              >
                                + {color}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                      
                      {Object.entries(carrito).some(([key]) => key.startsWith(producto.codigo)) && (
                        <div className="mt-4 p-4 rounded-xl border-2" style={{ backgroundColor: '#E3D4C1', borderColor: '#8F6A50' }}>
                          <p className="text-base font-bold mb-3" style={{ color: '#8F6A50', fontSize: '18px' }}>
                            🛒 En tu carrito:
                          </p>
                          {Object.entries(carrito)
                            .filter(([key]) => key.startsWith(producto.codigo))
                            .map(([key, item]) => (
                              <div key={key} className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg">
                                <div className="flex-1">
                                  <span className="text-base font-semibold" style={{ color: '#8F6A50', fontSize: '16px' }}>
                                    {item.color}: {item.cantidad} unidades
                                  </span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() => actualizarCantidad(key, item.cantidad - 1)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg text-base"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => actualizarCantidad(key, item.cantidad + 1)}
                                    className="p-2 text-green-500 hover:bg-green-100 rounded-lg text-base"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => eliminarDelCarrito(key)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg text-base ml-2"
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>


      {imagenModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="relative">
            <button
              onClick={cerrarImagen}
              className="absolute -top-3 -right-3 bg-black text-white rounded-full p-2"
            >
              ✕
            </button>
            <Image
              src={productos.find(p => p.codigo === imagenModal.productoId).imagenes[imagenModal.indice]}
              alt="Imagen ampliada"
              width={600}
              height={600}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}

      <Link
        href="/carrito"
        className="fixed bottom-4 right-4 bg-[#8F6A50] text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg z-40"
      >
        <ShoppingCart size={28} />
        {cantidadItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {cantidadItems}
          </span>
        )}
      </Link>
    </div>
  );
};

export default CatalogoMare;
