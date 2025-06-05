'use client'

import React, { useState, useEffect } from 'react'
import {
  ShoppingCart,
  Plus,
  Minus,
  Send,
  Search,
  Loader,
  AlertCircle,
} from 'lucide-react'
import ProductImage from './ProductImage'

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
      <div className="min-h-screen flex items-center justify-center mare-secondary">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 mare-text-primary" size={48} />
          <h2 className="text-xl font-bold mb-2 mare-text-primary">
            Cargando catálogo...
          </h2>
          <p className="text-sm opacity-80 mare-text-primary">
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
      {/* Header - Mejorado para móvil */}
      <div className="shadow-lg mare-primary">
        <div className="text-center py-2 text-sm mare-secondary mare-text-primary">
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
              <h1 className="text-2xl md:text-3xl font-bold tracking-wider font-serif">
                MARÉ
              </h1>
              <p className="text-sm md:text-base opacity-90 mt-1">Tu estilo en cada detalle</p>
              <div className="text-sm opacity-80 flex items-center justify-center space-x-3 mt-2">
                <span>@mare_uy</span>
                <span>•</span>
                <span>🔄 Conectado a GitHub</span>
                <span>•</span>
                <span>{productos.length} productos</span>
              </div>
            </div>
            <button
              onClick={() => setMostrarCarrito(!mostrarCarrito)}
              className="relative p-3 rounded-full hover:bg-white/20 transition-colors bg-white/10"
            >
              <ShoppingCart size={24} />
              {cantidadItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center font-bold">
                  {cantidadItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Búsqueda - Mejorada */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-4 top-4 mare-text-primary" size={20} />
          <input
            type="text"
            placeholder="Buscar productos o códigos..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base border border-gray-300 rounded-xl focus:ring-2 focus:border-transparent bg-white shadow-sm"
            style={{ fontSize: '16px' }}
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
              className={`px-5 py-3 rounded-full whitespace-nowrap transition-colors text-base font-semibold shadow-sm min-h-[44px] ${
                categoriaActiva === categoria.id ? 'mare-primary text-white' : 'bg-white mare-text-primary'
              }`}
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
                  <div className="relative">
                    <ProductImage
                      src={producto.imagenes[imagenesActivas[producto.codigo] || 0]}
                      alt={producto.nombre}
                      height={280}
                      onError={(e) => {
                        const currentSrc = e.target.src
                        if (currentSrc.includes('.jpg')) {
                          e.target.src = currentSrc.replace('.jpg', '.png')
                        } else if (currentSrc.includes('.png')) {
                          e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`
                        } else {
                          e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`
                        }
                      }}
                      className="h-52 sm:h-60 lg:h-72"
                    />
                    
                    {/* Indicadores de imágenes */}
                    {producto.imagenes.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {producto.imagenes.map((_, indice) => (
                          <button
                            key={indice}
                            onClick={() => cambiarImagen(producto.codigo, indice)}
                            className={`w-3 h-3 rounded-full transition-colors ${
                              (imagenesActivas[producto.codigo] || 0) === indice ? 'mare-primary' : 'bg-white/50'
                            }`}
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
                      <h3 className="font-bold text-xl leading-tight mare-text-primary">
                        {producto.nombre}
                      </h3>
                      <span className="text-sm px-3 py-1 rounded-full font-medium mare-secondary mare-text-primary">
                        {producto.codigo}
                      </span>
                    </div>

                    {producto.descripcion && producto.descripcion !== producto.nombre && (
                      <p className="text-base text-gray-600 mb-3">📝 {producto.descripcion}</p>
                    )}
                    
                    {producto.medidas && (
                      <p className="text-base text-gray-600 mb-3">📏 {producto.medidas}</p>
                    )}
                    
                    <p className="text-3xl font-bold mb-4 mare-text-primary">
                      ${producto.precio}
                    </p>
                    
                    <div className="space-y-4">
                      {tieneColores && (
                        <p className="text-base font-semibold mare-text-primary">
                          Colores disponibles:
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-3 mb-4">
                        <label className="text-base font-semibold mare-text-primary">
                          Cantidad:
                        </label>
                        <input
                          type="number"
                          min="1"
                          defaultValue="1"
                          id={'cantidad-' + producto.codigo}
                          className="w-20 text-center border-2 rounded-lg px-3 py-2 text-lg font-semibold mare-border-primary mare-text-primary"
                          style={{ fontSize: '16px' }}
                        />
                      </div>

                      <div className="mb-4">
                        <label className="text-base font-semibold mb-3 block mare-text-primary">
                          💬 Comentario del producto (opcional):
                        </label>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            placeholder="Ej: Color específico, talle, observaciones..."
                            id={'comentario-' + producto.codigo}
                            className="flex-1 text-base border-2 rounded-lg px-4 py-3 bg-gray-50 mare-border-primary"
                            style={{ fontSize: '16px' }}
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
                            className="px-4 py-3 text-base font-semibold rounded-lg border-2 text-white min-w-[60px] mare-primary mare-border-primary"
                          >
                            💬
                          </button>
                        </div>
                      </div>

                      {comentariosProducto[producto.codigo] && (
                        <div className="mt-4 p-4 rounded-xl border-2 mare-secondary mare-border-primary">
                          <div className="flex justify-between items-start mb-3">
                            <p className="text-sm font-semibold mare-text-primary">
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
                            className="w-full text-base border-2 rounded-lg px-4 py-3 bg-white mare-border-primary mare-text-primary"
                            style={{ fontSize: '16px' }}
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
                            className="px-6 py-4 rounded-full text-base font-bold transition-colors hover:shadow-lg border-2 text-white w-full mare-primary mare-border-primary min-h-[52px]"
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
                            className="px-5 py-3 rounded-full text-base font-bold transition-colors hover:shadow-lg border-2 text-white mare-primary mare-border-primary min-h-[48px]"
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
                                className="px-4 py-3 rounded-full text-base font-semibold transition-colors hover:shadow-md border-2 mare-secondary mare-border-primary mare-text-primary min-h-[48px]"
                              >
                                + {color}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                      
                      {Object.entries(carrito).some(([key]) => key.startsWith(producto.codigo)) && (
                        <div className="mt-4 p-4 rounded-xl border-2 mare-secondary mare-border-primary">
                          <p className="text-base font-bold mb-3 mare-text-primary">
                            🛒 En tu carrito:
                          </p>
                          {Object.entries(carrito)
                            .filter(([key]) => key.startsWith(producto.codigo))
                            .map(([key, item]) => (
                              <div key={key} className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg">
                                <div className="flex-1">
                                  <span className="text-base font-semibold mare-text-primary">
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

      {/* Modal del Carrito - Optimizado */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header del carrito */}
          <div className="p-4 border-b shadow-sm mare-primary">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMostrarCarrito(false)}
                className="flex items-center space-x-3 text-white hover:opacity-80 transition-opacity"
              >
                <span className="text-2xl">←</span>
                <span className="text-base font-semibold">Volver al catálogo</span>
              </button>
              <h2 className="text-2xl font-bold text-white">
                🛒 Mi Pedido
              </h2>
              <div className="w-24"></div>
            </div>
          </div>
          
          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4 mare-secondary">
            {Object.keys(carrito).length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6">🛒</div>
                <p className="text-2xl mb-6 font-semibold mare-text-primary">Tu carrito está vacío</p>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="px-8 py-4 text-white rounded-xl font-bold text-lg mare-primary"
                >
                  Agregar productos
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-5">
                {Object.entries(carrito).map(([key, item]) => (
                  <div key={key} className="bg-white rounded-2xl p-5 shadow-lg border-2 mare-border-primary">
                    {/* Header del producto */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mare-text-primary">
                          {item.producto.nombre}
                        </h3>
                        <p className="text-base text-gray-600 mt-1">Código: {item.producto.codigo}</p>
                        <p className="text-base mt-1 mare-text-primary">
                          Color: <span className="font-semibold">{item.color}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(key)}
                        className="text-red-500 hover:text-red-700 p-3 rounded-xl font-bold text-lg"
                        style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Cantidad y precio */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <span className="text-base font-semibold mare-text-primary">Cantidad:</span>
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad - 1)}
                            className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 mare-border-primary"
                          >
                            <Minus size={18} className="mare-text-primary" />
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => establecerCantidad(key, e.target.value)}
                            className="w-20 text-center font-bold border-2 rounded-lg px-3 py-2 text-lg mare-border-primary mare-text-primary"
                            style={{ fontSize: '18px' }}
                          />
                          
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad + 1)}
                            className="w-10 h-10 rounded-full border-2 flex items-center justify-center hover:bg-gray-100 mare-border-primary"
                          >
                            <Plus size={18} className="mare-text-primary" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-base text-gray-600">${item.producto.precio} c/u</p>
                        <p className="text-2xl font-bold mare-text-primary">
                          ${item.producto.precio * item.cantidad}
                        </p>
                      </div>
                    </div>

                    {/* Comentario del producto si existe */}
                    {comentariosProducto[item.producto.codigo] && (
                      <div className="mt-4 p-4 rounded-xl border-2" style={{ backgroundColor: '#F8F6F3' }} className="mare-border-primary">
                        <p className="text-sm font-semibold mb-2 mare-text-primary">
                          💬 Comentario:
                        </p>
                        <p className="text-base text-gray-700">
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
            <div className="bg-white border-t p-5 shadow-lg">
              <div className="max-w-2xl mx-auto">
                {/* Total */}
                <div className="flex justify-between items-center mb-5 py-4 border-t-2 mare-border-primary">
                  <span className="text-3xl font-bold mare-text-primary">Total:</span>
                  <span className="text-4xl font-bold mare-text-primary">${calcularTotal()}</span>
                </div>
                
                {/* Comentarios adicionales */}
                <div className="mb-5">
                  <label className="block text-base font-semibold mb-3 mare-text-primary">
                    📝 Comentarios adicionales del pedido:
                  </label>
                  <textarea
                    placeholder="Ej: Entregar urgente, horario de recepción, dirección específica..."
                    value={comentarioFinal}
                    onChange={(e) => setComentarioFinal(e.target.value)}
                    className="w-full border-2 rounded-xl px-4 py-4 text-base resize-none mare-border-primary"
                    style={{ fontSize: '16px' }}
                    rows="4"
                  />
                </div>

                {/* Botones */}
                <div className="space-y-4">
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="w-full py-4 rounded-xl font-bold text-lg border-2 transition-colors mare-border-primary mare-text-primary bg-white"
                >
                    ← Seguir comprando
                  </button>
                  <button
                    onClick={generarPedido}
                    className="w-full text-white py-5 rounded-xl font-bold text-xl hover:opacity-90 transition-colors flex items-center justify-center space-x-4 shadow-lg mare-accent"
                  >
                    <Send size={28} />
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
