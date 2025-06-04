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
  const [metadatos, setMetadatos] = useState(null);

  // Cargar datos desde el JSON generado automáticamente
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log('🔄 Cargando datos del catálogo...');
      
      // Intentar cargar desde GitHub Pages
      const response = await fetch('https://ferabensrl.github.io/mare-catalogo-web/datos/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const datos = await response.json();
      
      console.log('✅ Datos cargados:', datos);
      
      setProductos(datos.productos || []);
      setMetadatos(datos.metadatos || null);
      
      // Generar categorías
      const categoriasUnicas = datos.categorias || [];
      const categoriasFormateadas = [
        { id: 'todos', nombre: 'Todos los productos' },
        ...categoriasUnicas.map(cat => ({
          id: cat.toLowerCase().replace(/\s+/g, '_'),
          nombre: cat
        }))
      ];
      setCategorias(categoriasFormateadas);
      
      console.log(`📊 ${datos.productos?.length || 0} productos cargados`);
      
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
                           producto.id.toLowerCase().includes(busqueda.toLowerCase()) ||
                           (producto.descripcion && producto.descripcion.toLowerCase().includes(busqueda.toLowerCase()));
    return coincideCategoria && coincideBusqueda;
  });

  const agregarAlCarrito = (productoId, color, cantidad = 1) => {
    const key = productoId + '-' + color;
    setCarrito(prev => ({
      ...prev,
      [key]: {
        cantidad: (prev[key]?.cantidad || 0) + cantidad,
        producto: productos.find(p => p.id === productoId),
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
    
    // Agrupar productos por ID
    const productosAgrupados = {};
    itemsCarrito.forEach(item => {
      const productoId = item.producto.id;
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
      mensaje += '- ' + grupo.producto.nombre + ' (' + grupo.producto.id + ')\n';
      
      if (grupo.producto.tieneColores) {
        const colores = grupo.items.map(item => item.cantidad + ' ' + item.color).join(', ');
        mensaje += '  Cantidades: ' + colores + '\n';
      } else {
        const totalCantidad = grupo.items.reduce((sum, item) => sum + item.cantidad, 0);
        mensaje += '  Cantidad: ' + totalCantidad + '\n';
      }
      
      mensaje += '  Precio unitario: $' + grupo.producto.precio + '\n';
      mensaje += '  Subtotal: $' + grupo.totalProducto + '\n';
      
      const comentario = comentariosProducto[grupo.producto.id];
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
      <div className="min-h-screen flex items-center justify-center mare-secondary">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4" size={48} style={{ color: '#8F6A50' }} />
          <h2 className="text-xl font-bold mb-2 mare-text-primary">
            Cargando catálogo...
          </h2>
          <p className="text-sm mare-text-primary opacity-80">
            Sincronizando desde GitHub
          </p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center mare-secondary">
        <div className="text-center p-6 bg-white rounded-lg shadow-lg max-w-md">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold mb-2 text-red-600">Error al cargar</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 py-2 text-white rounded-lg hover:opacity-90 mare-primary"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mare-secondary">
      {/* Header */}
      <div className="shadow-lg mare-primary">
        <div className="text-center py-1 text-xs mare-secondary mare-text-primary">
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
                {metadatos && (
                  <>
                    <span>•</span>
                    <span>{metadatos.totalProductos} productos</span>
                  </>
                )}
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
                  ? 'mare-primary text-white' 
                  : 'bg-white mare-text-primary'
              }`}
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
            {productosFiltrados.map(producto => (
              <div key={producto.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
                {/* CARRUSEL DE IMÁGENES */}
                <div className="relative image-carousel">
                  <img
                    src={producto.imagenes[imagenesActivas[producto.id] || 0]}
                    alt={producto.nombre}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      const currentSrc = e.target.src;
                      if (currentSrc.includes('.png')) {
                        e.target.src = currentSrc.replace('.png', '.jpg');
                      } else if (currentSrc.includes('.jpg')) {
                        e.target.src = currentSrc.replace(/\.(jpg|png)$/, '');
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
                          onClick={() => cambiarImagen(producto.id, indice)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            (imagenesActivas[producto.id] || 0) === indice ? 'mare-primary' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Flechas de navegación */}
                  {producto.imagenes.length > 1 && (
                    <>
                      <button
                        onClick={() => cambiarImagen(producto.id, (imagenesActivas[producto.id] || 0) > 0 ? (imagenesActivas[producto.id] || 0) - 1 : producto.imagenes.length - 1)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => cambiarImagen(producto.id, (imagenesActivas[producto.id] || 0) < producto.imagenes.length - 1 ? (imagenesActivas[producto.id] || 0) + 1 : 0)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70 transition-colors"
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Contador de imágenes */}
                  {producto.imagenes.length > 1 && (
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {(imagenesActivas[producto.id] || 0) + 1}/{producto.imagenes.length}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg mare-text-primary">
                      {producto.nombre}
                    </h3>
                    <span className="text-xs px-2 py-1 rounded mare-secondary mare-text-primary">
                      {producto.id}
                    </span>
                  </div>

                  {producto.descripcion && producto.descripcion !== producto.nombre && (
                    <p className="text-sm text-gray-600 mb-2">📝 {producto.descripcion}</p>
                  )}
                  
                  {producto.medidas && (
                    <p className="text-sm text-gray-600 mb-2">📏 {producto.medidas}</p>
                  )}
                  
                  <p className="text-2xl font-bold mb-3 mare-text-primary">
                    ${producto.precio}
                  </p>
                  
                  <div className="space-y-3">
                    {producto.tieneColores && (
                      <p className="text-sm font-medium mare-text-primary">
                        Colores disponibles:
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <label className="text-sm font-medium mare-text-primary">
                        Cantidad:
                      </label>
                      <input
                        type="number"
                        min="1"
                        defaultValue="1"
                        id={'cantidad-' + producto.id}
                        className="w-20 text-center border rounded px-2 py-1 mare-border-primary mare-text-primary"
                      />
                    </div>

                    <div className="mb-3">
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Comentarios del producto..."
                          id={'comentario-' + producto.id}
                          className="flex-1 text-sm border rounded px-3 py-2 mare-border-primary bg-gray-50"
                        />
                        <button
                          onClick={() => {
                            const comentarioInput = document.getElementById('comentario-' + producto.id);
                            const comentario = comentarioInput.value.trim();
                            if (comentario) {
                              actualizarComentarioProducto(producto.id, comentario);
                              comentarioInput.value = '';
                            }
                          }}
                          className="px-3 py-2 text-sm font-medium rounded border mare-primary text-white mare-border-primary"
                        >
                          💬
                        </button>
                      </div>
                    </div>
                    
                    {comentariosProducto[producto.id] && (
                      <div className="mt-3 p-3 rounded border mare-secondary mare-border-primary">
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-xs font-medium mare-text-primary">
                            💬 Comentario del producto:
                          </p>
                          <button
                            onClick={() => actualizarComentarioProducto(producto.id, '')}
                            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                            style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                          >
                            🗑️
                          </button>
                        </div>
                        <input
                          type="text"
                          value={comentariosProducto[producto.id]}
                          onChange={(e) => actualizarComentarioProducto(producto.id, e.target.value)}
                          className="w-full text-sm border rounded px-3 py-2 mare-border-primary bg-white mare-text-primary"
                          placeholder="Edita tu comentario aquí..."
                        />
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-2">
                      {!producto.tieneColores ? (
                        // Para productos sin colores
                        <button
                          onClick={() => {
                            const cantidadInput = document.getElementById('cantidad-' + producto.id);
                            const comentarioInput = document.getElementById('comentario-' + producto.id);
                            const cantidad = parseInt(cantidadInput.value) || 1;
                            const comentario = comentarioInput.value;
                            agregarAlCarrito(producto.id, 'ÚNICO', cantidad);
                            if (comentario) {
                              actualizarComentarioProducto(producto.id, comentario);
                            }
                            cantidadInput.value = 1;
                            comentarioInput.value = '';
                          }}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-mare hover:shadow-md border-2 mare-primary text-white color-button"
                        >
                          + AGREGAR AL CARRITO
                        </button>
                      ) : (
                        // Para productos con colores
                        <>
                          <button
                            onClick={() => {
                              const cantidadInput = document.getElementById('cantidad-' + producto.id);
                              const comentarioInput = document.getElementById('comentario-' + producto.id);
                              const cantidad = parseInt(cantidadInput.value) || 1;
                              const comentario = comentarioInput.value;
                              agregarAlCarrito(producto.id, 'SURTIDO', cantidad);
                              if (comentario) {
                                actualizarComentarioProducto(producto.id, comentario);
                              }
                              cantidadInput.value = 1;
                              comentarioInput.value = '';
                            }}
                            className="px-3 py-2 rounded-full text-sm font-medium transition-mare hover:shadow-md border-2 mare-primary text-white color-button"
                          >
                            + SURTIDO
                          </button>
                          
                          {producto.colores.map(color => (
                            <button
                              key={color}
                              onClick={() => {
                                const cantidadInput = document.getElementById('cantidad-' + producto.id);
                                const comentarioInput = document.getElementById('comentario-' + producto.id);
                                const cantidad = parseInt(cantidadInput.value) || 1;
                                const comentario = comentarioInput.value;
                                agregarAlCarrito(producto.id, color, cantidad);
                                if (comentario) {
                                  actualizarComentarioProducto(producto.id, comentario);
                                }
                                cantidadInput.value = 1;
                                comentarioInput.value = '';
                              }}
                              className="px-3 py-2 rounded-full text-sm font-medium transition-mare hover:shadow-md mare-secondary mare-text-primary border color-button mare-border-primary"
                            >
                              + {color}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                    
                    {Object.entries(carrito).some(([key]) => key.startsWith(producto.id)) && (
                      <div className="mt-3 p-3 rounded border-2 mare-secondary mare-border-primary">
                        <p className="text-sm font-bold mb-2 mare-text-primary">
                          🛒 En tu carrito:
                        </p>
                        {Object.entries(carrito)
                          .filter(([key]) => key.startsWith(producto.id))
                          .map(([key, item]) => (
                            <div key={key} className="flex items-center justify-between mb-2 p-2 bg-white rounded">
                              <div className="flex-1">
                                <span className="text-sm font-medium mare-text-primary">
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
            ))}
          </div>
        )}
      </div>

      {/* Modal del Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-black/50 z-50">
          <div className="h-full w-full flex flex-col bg-white">
            <div className="bg-white border-b p-4 shadow-sm z-10 mare-border-primary">
              <div className="flex items-center justify-between">
                <div></div>
                <h2 className="text-xl font-bold mare-text-primary">
                  🛒 Mi Pedido
                </h2>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl px-4 py-2 rounded-lg hover:bg-gray-100 border"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                {Object.keys(carrito).length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No hay productos en el carrito</p>
                  </div>
                ) : (
                  <div className="space-y-3 mb-6">
                    {/* Agrupar productos por ID para mostrar agrupados EN EL CARRITO */}
                    {(() => {
                      const productosAgrupados = {};
                      Object.entries(carrito).forEach(([key, item]) => {
                        const productoId = item.producto.id;
                        if (!productosAgrupados[productoId]) {
                          productosAgrupados[productoId] = {
                            producto: item.producto,
                            items: []
                          };
                        }
                        productosAgrupados[productoId].items.push({ key, ...item });
                      });

                      return Object.values(productosAgrupados).map(grupo => (
                        <div key={grupo.producto.id} className="p-3 rounded-lg border mare-secondary mare-border-primary">
                          {/* Header del producto */}
                          <div className="mb-3">
                            <h4 className="font-bold text-lg mare-text-primary">
                              {grupo.producto.nombre} ({grupo.producto.id})
                            </h4>
                            <p className="text-sm mare-text-primary">
                              💰 ${grupo.producto.precio} c/u
                            </p>
                            {grupo.producto.descripcion && grupo.producto.descripcion !== grupo.producto.nombre && (
                              <p className="text-xs text-gray-600">
                                📝 {grupo.producto.descripcion}
                              </p>
                            )}
                          </div>

                          {/* Items agrupados */}
                          <div className="space-y-2">
                            {grupo.items.map(item => (
                              <div key={item.key} className="flex items-center justify-between p-2 bg-white rounded">
                                <div className="flex-1">
                                  <span className="font-medium mare-text-primary">
                                    {item.producto.tieneColores ? `🎨 ${item.color}` : '📦'}: {item.cantidad} unidades
                                  </span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => actualizarCantidad(item.key, item.cantidad - 1)}
                                    className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors border mare-border-primary"
                                  >
                                    <Minus size={16} style={{ color: '#8F6A50' }} />
                                  </button>
                                  
                                  <input
                                    type="number"
                                    min="1"
                                    value={item.cantidad}
                                    onChange={(e) => establecerCantidad(item.key, e.target.value)}
                                    className="w-16 text-center font-bold border rounded px-2 py-1 mare-border-primary mare-text-primary"
                                  />
                                  
                                  <button
                                    onClick={() => actualizarCantidad(item.key, item.cantidad + 1)}
                                    className="p-1 bg-white rounded-full hover:bg-gray-100 transition-colors border mare-border-primary"
                                  >
                                    <Plus size={16} style={{ color: '#8F6A50' }} />
                                  </button>
                                  
                                  <button
                                    onClick={() => eliminarDelCarrito(item.key)}
                                    className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded ml-2"
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Total del producto agrupado */}
                          <div className="mt-3 pt-3 border-t border-gray-300 text-right">
                            <p className="font-bold mare-text-primary">
                              💰 Subtotal producto: ${grupo.items.reduce((sum, item) => sum + (item.producto.precio * item.cantidad), 0)}
                            </p>
                          </div>

                          {/* Mostrar comentario del producto si existe - EDITABLE */}
                          {comentariosProducto[grupo.producto.id] && (
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-xs font-medium mare-text-primary">
                                  💬 Comentario del producto:
                                </p>
                                <button
                                  onClick={() => actualizarComentarioProducto(grupo.producto.id, '')}
                                  className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded"
                                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                                >
                                  🗑️
                                </button>
                              </div>
                              <input
                                type="text"
                                value={comentariosProducto[grupo.producto.id]}
                                onChange={(e) => actualizarComentarioProducto(grupo.producto.id, e.target.value)}
                                className="w-full text-sm border rounded px-3 py-2 mare-border-primary bg-white mare-text-primary"
                                placeholder="Edita tu comentario aquí..."
                              />
                            </div>
                          )}
                        </div>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border-t p-4 shadow-lg mare-border-primary">
              <button
                onClick={() => setMostrarCarrito(false)}
                className="w-full flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors px-4 py-3 rounded-lg hover:bg-gray-100 border mb-4"
              >
                <span className="text-xl">←</span>
                <span className="text-sm font-bold">Seguir comprando</span>
              </button>

              <div className="flex justify-between items-center text-xl font-bold mb-4">
                <span className="mare-text-primary">💳 Total:</span>
                <span className="mare-text-primary">${calcularTotal()}</span>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2 mare-text-primary">
                  📝 Comentarios adicionales del pedido:
                </label>
                <textarea
                  placeholder="Ej: Entregar urgente, horario de recepción..."
                  value={comentarioFinal}
                  onChange={(e) => setComentarioFinal(e.target.value)}
                  className="w-full border rounded px-3 py-2 text-sm mare-border-primary bg-gray-50"
                  rows="2"
                />
              </div>

              <button
                onClick={generarPedido}
                disabled={Object.keys(carrito).length === 0}
                className="w-full text-white py-4 rounded-lg font-bold hover:opacity-90 transition-colors flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
                style={{ backgroundColor: Object.keys(carrito).length === 0 ? '#999999' : '#25D366' }}
              >
                <Send size={20} />
                <span>📱 Enviar Pedido por WhatsApp</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogoMare;