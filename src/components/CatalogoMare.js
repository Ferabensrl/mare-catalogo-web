'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Send, Search, Loader, AlertCircle } from 'lucide-react';

const CatalogoMare = () => {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState({});
  const [categoriaActiva, setCategoriaActiva] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [mostrarCarrito, setMostrarCarrito] = useState(false);
  const [comentarioFinal, setComentarioFinal] = useState('');
  const [comentariosProducto, setComentariosProducto] = useState({});
  const [imagenesActivas, setImagenesActivas] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

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
    setMostrarCarrito(false);
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
      {/* Header */}
      <div className="shadow-lg" style={{ backgroundColor: '#8F6A50' }}>
        <div className="text-center py-1 text-xs" style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}>
          <div className="flex items-center justify-center space-x-3 text-xs">
            <span>📞 097 998 999</span>
            <span>•</span>
            <span>By Feraben SRL</span>
            <span>•</span>
            <span>✉️ ferabensrl@gmail.com</span>
          </div>
        </div>
        
        <div className="p-3 text-white">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-xl font-bold tracking-wider font-serif">
                MARÉ
              </h1>
              <p className="text-xs opacity-90">Tu estilo en cada detalle</p>
              <div className="text-xs opacity-80 flex items-center justify-center space-x-2">
                <span>@mare_uy</span>
                <span>•</span>
                <span>🔄 Conectado a GitHub</span>
                <span>•</span>
                <span>{productos.length} productos</span>
              </div>
            </div>
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              className="relative p-2 rounded-full hover:bg-white/20 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            >
              <ShoppingCart size={20} />
              {cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cantidadItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-3" size={20} style={{ color: '#8F6A50' }} />
          <input
            type="text"
            placeholder="Buscar productos o códigos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Categorías */}
      <div className="px-4 pb-4">
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              onClick={() => setCategoriaActiva(categoria.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors text-sm font-medium ${
                categoriaActiva === categoria.id 
                  ? 'text-white' 
                  : 'bg-white'
              }`}
              style={{
                backgroundColor: categoriaActiva === categoria.id ? '#8F6A50' : 'white',
                color: categoriaActiva === categoria.id ? 'white' : '#8F6A50'
              }}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Productos */}
      <div className="px-4 pb-10">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map(producto => {
              const tieneColores = producto.colores && producto.colores.length > 0;
              
              return (
                <div key={producto.codigo} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                  {/* CARRUSEL DE IMÁGENES */}
                  <div className="relative">
                    <img
                      src={producto.imagenes[imagenesActivas[producto.codigo] || 0]}
                      alt={producto.nombre}
                      className="w-full object-cover"
                      style={{ height: '80px' }}
                      onError={(e) => {
                        const currentSrc = e.target.src;
                        if (currentSrc.includes('.jpg')) {
                          e.target.src = currentSrc.replace('.jpg', '.png');
                        } else if (currentSrc.includes('.png')) {
                          e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`;
                        } else {
                          e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`;
                        }
                      }}
                    />
                    
                    {/* Indicadores de imágenes */}
                    {producto.imagenes.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                        {producto.imagenes.map((_, indice) => (
                          <button
                            key={indice}
                            onClick={() => cambiarImagen(producto.codigo, indice)}
                            className={`w-2 h-2 rounded-full transition-colors ${
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
                      <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                        {(imagenesActivas[producto.codigo] || 0) + 1}/{producto.imagenes.length}
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg" style={{ color: '#8F6A50' }}>
                        {producto.nombre}
                      </h3>
                      <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: '#E3D4C1', color: '#8F6A50' }}>
                        {producto.codigo}
                      </span>
                    </div>

                    {producto.descripcion && producto.descripcion !== producto.nombre && (
                      <p className="text-sm text-gray-600 mb-2">📝 {producto.descripcion}</p>
                    )}
                    
                    {producto.medidas && (
                      <p className="text-sm text-gray-600 mb-2">📏 {producto.medidas}</p>
                    )}
                    
                    <p className="text-2xl font-bold mb-3" style={{ color: '#8F6A50' }}>
                      ${producto.precio}
                    </p>
                    
                    <div className="space-y-3">
                      {tieneColores && (
                        <p className="text-sm font-medium" style={{ color: '#8F6A50' }}>
                          Colores disponibles:
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <label className="text-sm font-medium" style={{ color: '#8F6A50' }}>
                          Cantidad:
                        </label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={'cantidad-' + producto.codigo}
                          className="w-20 text-center border rounded px-2 py-1"
                          style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="text-sm font-medium mb-2 block" style={{ color: '#8F6A50' }}>
                          💬 Comentario del producto (opcional):
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Ej: Color específico, talle, observaciones..."
                            id={'comentario-' + producto.codigo}
                            className="flex-1 text-sm border rounded px-3 py-2 bg-gray-50"
                            style={{ borderColor: '#8F6A50' }}
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
                            className="px-3 py-2 text-sm font-medium rounded border text-white"
                            style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50' }}
                          >
                            💬
                          </button>
                        </div>
                      </div>

                      {comentariosProducto[producto.codigo] && (
                        <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#E3D4C1', borderColor: '#8F6A50' }}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-xs font-medium" style={{ color: '#8F6A50' }}>
                              💬 Comentario guardado:
                            </p>
                            <button
                              onClick={() => actualizarComentarioProducto(producto.codigo, '')}
                              className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                            >
                              🗑️
                            </button>
                          </div>
                          <input
                            type="text"
                            value={comentariosProducto[producto.codigo]}
                            onChange={(e) => actualizarComentarioProducto(producto.codigo, e.target.value)}
                            className="w-full text-sm border rounded px-3 py-2 bg-white"
                            style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                            placeholder="Edita tu comentario aquí..."
                          />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        {!tieneColores ? (
                          // Para productos sin colores
                          <button
                            onClick={() => {
                              const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
                              const cantidad = parseInt(cantidadInput.value) || 1;
                              agregarAlCarrito(producto.codigo, 'ÚNICO', cantidad);
                              cantidadInput.value = '1';
                            }}
                            className="px-4 py-2 rounded-full text-sm font-medium transition-colors hover:shadow-md border-2 text-white"
                            style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50' }}
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
                              className="px-3 py-2 rounded-full text-sm font-medium transition-colors hover:shadow-md border-2 text-white"
                              style={{ backgroundColor: '#8F6A50', borderColor: '#8F6A50' }}
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
                                className="px-3 py-2 rounded-full text-sm font-medium transition-colors hover:shadow-md border"
                                style={{ 
                                  backgroundColor: '#E3D4C1', 
                                  color: '#8F6A50',
                                  borderColor: '#8F6A50'
                                }}
                              >
                                + {color}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                      
                      {Object.entries(carrito).some(([key]) => key.startsWith(producto.codigo)) && (
                        <div className="mt-3 p-3 rounded border-2" style={{ backgroundColor: '#E3D4C1', borderColor: '#8F6A50' }}>
                          <p className="text-sm font-bold mb-2" style={{ color: '#8F6A50' }}>
                            🛒 En tu carrito:
                          </p>
                          {Object.entries(carrito)
                            .filter(([key]) => key.startsWith(producto.codigo))
                            .map(([key, item]) => (
                              <div key={key} className="flex items-center justify-between mb-2 p-2 bg-white rounded">
                                <div className="flex-1">
                                  <span className="text-sm font-medium" style={{ color: '#8F6A50' }}>
                                    {item.color}: {item.cantidad} unidades
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => actualizarCantidad(key, item.cantidad - 1)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded text-xs"
                                  >
                                    -
                                  </button>
                                  <button
                                    onClick={() => actualizarCantidad(key, item.cantidad + 1)}
                                    className="p-1 text-green-500 hover:bg-green-100 rounded text-xs"
                                  >
                                    +
                                  </button>
                                  <button
                                    onClick={() => eliminarDelCarrito(key)}
                                    className="p-1 text-red-500 hover:bg-red-100 rounded text-xs ml-2"
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

      {/* Modal del Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header del carrito */}
          <div className="p-4 border-b shadow-sm" style={{ backgroundColor: '#8F6A50' }}>
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMostrarCarrito(false)}
                className="flex items-center space-x-2 text-white hover:opacity-80 transition-opacity"
              >
                <span className="text-xl">←</span>
                <span className="text-sm font-medium">Volver al catálogo</span>
              </button>
              <h2 className="text-xl font-bold text-white">
                🛒 Mi Pedido
              </h2>
              <div className="w-24"></div>
            </div>
          </div>
          
          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4" style={{ backgroundColor: '#E3D4C1' }}>
            {Object.keys(carrito).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🛒</div>
                <p className="text-xl mb-4" style={{ color: '#8F6A50' }}>Tu carrito está vacío</p>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="px-6 py-3 text-white rounded-lg font-medium"
                  style={{ backgroundColor: '#8F6A50' }}
                >
                  Agregar productos
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                {Object.entries(carrito).map(([key, item]) => (
                  <div key={key} className="bg-white rounded-lg p-4 shadow-sm border" style={{ borderColor: '#8F6A50' }}>
                    {/* Header del producto */}
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold" style={{ color: '#8F6A50' }}>
                          {item.producto.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">Código: {item.producto.codigo}</p>
                        <p className="text-sm" style={{ color: '#8F6A50' }}>
                          Color: <span className="font-medium">{item.color}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(key)}
                        className="text-red-500 hover:text-red-700 p-2 rounded"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Cantidad y precio */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium" style={{ color: '#8F6A50' }}>Cantidad:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad - 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            style={{ borderColor: '#8F6A50' }}
                          >
                            <Minus size={14} style={{ color: '#8F6A50' }} />
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => establecerCantidad(key, e.target.value)}
                            className="w-16 text-center font-bold border rounded px-2 py-1"
                            style={{ borderColor: '#8F6A50', color: '#8F6A50' }}
                          />
                          
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad + 1)}
                            className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-100"
                            style={{ borderColor: '#8F6A50' }}
                          >
                            <Plus size={14} style={{ color: '#8F6A50' }} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm text-gray-600">${item.producto.precio} c/u</p>
                        <p className="text-xl font-bold" style={{ color: '#8F6A50' }}>
                          ${item.producto.precio * item.cantidad}
                        </p>
                      </div>
                    </div>

                    {/* Comentario del producto si existe */}
                    {comentariosProducto[item.producto.codigo] && (
                      <div className="mt-3 p-3 rounded border" style={{ backgroundColor: '#F8F6F3', borderColor: '#8F6A50' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: '#8F6A50' }}>
                          💬 Comentario:
                        </p>
                        <p className="text-sm text-gray-700">
                          {comentariosProducto[item.producto.codigo]}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer con total y botones */}
          {Object.keys(carrito).length > 0 && (
            <div className="bg-white border-t p-4 shadow-lg">
              <div className="max-w-2xl mx-auto">
                {/* Total */}
                <div className="flex justify-between items-center mb-4 py-3 border-t-2" style={{ borderColor: '#8F6A50' }}>
                  <span className="text-2xl font-bold" style={{ color: '#8F6A50' }}>Total:</span>
                  <span className="text-3xl font-bold" style={{ color: '#8F6A50' }}>${calcularTotal()}</span>
                </div>
                
                {/* Comentarios adicionales */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: '#8F6A50' }}>
                    📝 Comentarios adicionales del pedido:
                  </label>
                  <textarea
                    placeholder="Ej: Entregar urgente, horario de recepción, dirección específica..."
                    value={comentarioFinal}
                    onChange={(e) => setComentarioFinal(e.target.value)}
                    className="w-full border rounded-lg px-3 py-3 text-sm resize-none"
                    style={{ borderColor: '#8F6A50' }}
                    rows="3"
                  />
                </div>

                {/* Botones */}
                <div className="space-y-3">
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="w-full py-3 rounded-lg font-medium border-2 transition-colors"
                    style={{ borderColor: '#8F6A50', color: '#8F6A50', backgroundColor: 'white' }}
                  >
                    ← Seguir comprando
                  </button>
                  <button
                    onClick={generarPedido}
                    className="w-full text-white py-4 rounded-lg font-bold text-lg hover:opacity-90 transition-colors flex items-center justify-center space-x-3 shadow-lg"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <Send size={24} />
                    <span>📱 Enviar Pedido por WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CatalogoMare;
