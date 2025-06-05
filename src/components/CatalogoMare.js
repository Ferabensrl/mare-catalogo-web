'use client'

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Send, Search, Loader, AlertCircle } from 'lucide-react';
import Image from 'next/image';

// Hook personalizado para responsive
const useResponsive = () => {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width < 640;
  const isTablet = windowSize.width >= 640 && windowSize.width < 1024;
  const isDesktop = windowSize.width >= 1024;

  return { windowSize, isMobile, isTablet, isDesktop };
};

// Componente Header
const Header = ({ productos, cantidadItems, onToggleCarrito }) => {
  return (
    <div className="shadow-lg bg-mare-brown">
      <div className="text-center py-2 sm:py-3 text-sm sm:text-base bg-mare-beige text-mare-brown">
        <div className="flex items-center justify-center space-x-2 sm:space-x-4 font-medium">
          <span className="text-xs sm:text-sm">📞 097 998 999</span>
          <span>•</span>
          <span className="text-xs sm:text-sm">By Feraben SRL</span>
          <span>•</span>
          <span className="text-xs sm:text-sm">✉️ ferabensrl@gmail.com</span>
        </div>
      </div>
      
      <div className="p-4 sm:p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-wider font-serif">
              MARÉ
            </h1>
            <p className="text-sm sm:text-base lg:text-lg opacity-90 mt-1">Tu estilo en cada detalle</p>
            <div className="text-xs sm:text-sm opacity-80 flex items-center justify-center space-x-2 sm:space-x-3 mt-2 flex-wrap">
              <span>@mare_uy</span>
              <span>•</span>
              <span>🔄 Conectado a GitHub</span>
              <span>•</span>
              <span>{productos.length} productos</span>
            </div>
          </div>
          <button
            onClick={onToggleCarrito}
            className="relative p-3 sm:p-4 rounded-full hover:bg-white/20 transition-colors bg-white/10 touch-manipulation min-h-touch"
          >
            <ShoppingCart size={24} className="sm:w-6 sm:h-6" />
            {cantidadItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs sm:text-sm rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-bold">
                {cantidadItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente Buscador
const SearchBar = ({ busqueda, onBusquedaChange }) => {
  return (
    <div className="p-4 sm:p-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-mare-brown" size={20} />
        <input
          type="text"
          placeholder="Buscar productos o códigos..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          className="w-full pl-12 pr-4 py-4 sm:py-5 text-base sm:text-lg border-2 border-gray-300 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-mare-brown focus:border-transparent bg-white shadow-sm touch-manipulation"
          style={{ fontSize: '16px' }} // Evita zoom en iOS
        />
      </div>
    </div>
  );
};

// Componente Categorías
const CategoryTabs = ({ categorias, categoriaActiva, onCategoriaChange }) => {
  return (
    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
      <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-2">
        {categorias.map(categoria => (
          <button
            key={categoria.id}
            onClick={() => onCategoriaChange(categoria.id)}
            className={`px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl whitespace-nowrap transition-all duration-200 text-sm sm:text-base lg:text-lg font-semibold shadow-sm min-h-touch touch-manipulation ${
              categoriaActiva === categoria.id 
                ? 'bg-mare-brown text-white shadow-lg transform scale-105' 
                : 'bg-white text-mare-brown hover:bg-gray-50'
            }`}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>
    </div>
  );
};

// Componente Carrusel de Imágenes
const ImageCarousel = ({ producto, imagenesActivas, onCambiarImagen }) => {
  const { isMobile, isTablet } = useResponsive();
  
  const alturaImagen = isMobile ? 'h-48' : isTablet ? 'h-56' : 'h-64';
  
  return (
    <div className="relative">
      <div className={`${alturaImagen} w-full overflow-hidden rounded-t-xl sm:rounded-t-2xl`}>
        <Image
          src={producto.imagenes[imagenesActivas[producto.codigo] || 0]}
          alt={producto.nombre}
          fill
          className="object-cover hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onError={(e) => {
            const currentSrc = e.target.src;
            if (currentSrc.includes('.jpg')) {
              e.target.src = currentSrc.replace('.jpg', '.png');
            } else if (currentSrc.includes('.png')) {
              e.target.src = `https://via.placeholder.com/400x400/8F6A50/E3D4C1?text=${encodeURIComponent(producto.nombre)}`;
            }
          }}
        />
      </div>
      
      {/* Indicadores de imágenes */}
      {producto.imagenes.length > 1 && (
        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {producto.imagenes.map((_, indice) => (
            <button
              key={indice}
              onClick={() => onCambiarImagen(producto.codigo, indice)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-200 touch-manipulation ${
                (imagenesActivas[producto.codigo] || 0) === indice 
                  ? 'bg-mare-brown scale-125' 
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}

      {/* Contador de imágenes */}
      {producto.imagenes.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/60 text-white text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full font-medium">
          {(imagenesActivas[producto.codigo] || 0) + 1}/{producto.imagenes.length}
        </div>
      )}
    </div>
  );
};

// Componente Botones de Color
const ColorButtons = ({ producto, onAgregarCarrito }) => {
  const tieneColores = producto.colores && producto.colores.length > 0;
  
  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {!tieneColores ? (
        <button
          onClick={() => {
            const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
            const cantidad = parseInt(cantidadInput.value) || 1;
            onAgregarCarrito(producto.codigo, 'ÚNICO', cantidad);
            cantidadInput.value = '1';
          }}
          className="w-full bg-mare-brown hover:bg-mare-brown/90 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base lg:text-lg font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-button touch-manipulation"
        >
          + AGREGAR AL CARRITO
        </button>
      ) : (
        <>
          <button
            onClick={() => {
              const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
              const cantidad = parseInt(cantidadInput.value) || 1;
              onAgregarCarrito(producto.codigo, 'SURTIDO', cantidad);
              cantidadInput.value = '1';
            }}
            className="bg-mare-brown hover:bg-mare-brown/90 text-white px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 min-h-button touch-manipulation"
          >
            + SURTIDO
          </button>
          
          {producto.colores.map(color => (
            <button
              key={color}
              onClick={() => {
                const cantidadInput = document.getElementById('cantidad-' + producto.codigo);
                const cantidad = parseInt(cantidadInput.value) || 1;
                onAgregarCarrito(producto.codigo, color, cantidad);
                cantidadInput.value = '1';
              }}
              className="bg-mare-beige hover:bg-mare-beige/80 text-mare-brown border-2 border-mare-brown px-3 sm:px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl text-sm sm:text-base font-semibold transition-all duration-200 hover:shadow-md transform hover:scale-105 min-h-button touch-manipulation"
            >
              + {color}
            </button>
          ))}
        </>
      )}
    </div>
  );
};

// Componente Producto Individual
const ProductCard = ({ 
  producto, 
  imagenesActivas, 
  carrito, 
  comentariosProducto,
  onCambiarImagen,
  onAgregarCarrito,
  onActualizarCantidad,
  onEliminarDelCarrito,
  onActualizarComentario
}) => {
  const tieneColores = producto.colores && producto.colores.length > 0;
  
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 transform hover:scale-105">
      <ImageCarousel 
        producto={producto}
        imagenesActivas={imagenesActivas}
        onCambiarImagen={onCambiarImagen}
      />
      
      <div className="p-4 sm:p-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <h3 className="font-bold text-lg sm:text-xl lg:text-2xl leading-tight text-mare-brown">
            {producto.nombre}
          </h3>
          <span className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-full font-medium bg-mare-beige text-mare-brown whitespace-nowrap ml-2">
            {producto.codigo}
          </span>
        </div>

        {producto.descripcion && producto.descripcion !== producto.nombre && (
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">📝 {producto.descripcion}</p>
        )}
        
        {producto.medidas && (
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">📏 {producto.medidas}</p>
        )}
        
        <p className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 sm:mb-6 text-mare-brown">
          ${producto.precio}
        </p>
        
        <div className="space-y-4 sm:space-y-6">
          {tieneColores && (
            <p className="text-sm sm:text-base lg:text-lg font-semibold text-mare-brown">
              Colores disponibles:
            </p>
          )}
          
          <div className="flex items-center space-x-3 sm:space-x-4">
            <label className="text-sm sm:text-base lg:text-lg font-semibold text-mare-brown">
              Cantidad:
            </label>
            <input
              type="number"
              min="1"
              defaultValue="1"
              id={'cantidad-' + producto.codigo}
              className="w-16 sm:w-20 text-center border-2 border-mare-brown rounded-lg sm:rounded-xl px-2 sm:px-3 py-2 sm:py-3 text-base sm:text-lg font-semibold text-mare-brown touch-manipulation"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div>
            <label className="text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 block text-mare-brown">
              💬 Comentario del producto (opcional):
            </label>
            <div className="flex space-x-2 sm:space-x-3">
              <input
                type="text"
                placeholder="Ej: Color específico, talle, observaciones..."
                id={'comentario-' + producto.codigo}
                className="flex-1 text-sm sm:text-base border-2 border-mare-brown rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 touch-manipulation"
                style={{ fontSize: '16px' }}
              />
              <button
                onClick={() => {
                  const comentarioInput = document.getElementById('comentario-' + producto.codigo);
                  const comentario = comentarioInput.value.trim();
                  if (comentario) {
                    onActualizarComentario(producto.codigo, comentario);
                    comentarioInput.value = '';
                  }
                }}
                className="bg-mare-brown text-white px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-semibold rounded-lg sm:rounded-xl border-2 border-mare-brown min-w-[60px] hover:bg-mare-brown/90 transition-colors touch-manipulation"
              >
                💬
              </button>
            </div>
          </div>

          {comentariosProducto[producto.codigo] && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-mare-brown bg-mare-beige">
              <div className="flex justify-between items-start mb-2 sm:mb-3">
                <p className="text-xs sm:text-sm font-semibold text-mare-brown">
                  💬 Comentario guardado:
                </p>
                <button
                  onClick={() => onActualizarComentario(producto.codigo, '')}
                  className="text-red-500 hover:text-red-700 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 rounded-lg font-medium bg-red-100 hover:bg-red-200 transition-colors touch-manipulation"
                >
                  🗑️
                </button>
              </div>
              <input
                type="text"
                value={comentariosProducto[producto.codigo]}
                onChange={(e) => onActualizarComentario(producto.codigo, e.target.value)}
                className="w-full text-sm sm:text-base border-2 border-mare-brown rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 bg-white text-mare-brown touch-manipulation"
                placeholder="Edita tu comentario aquí..."
                style={{ fontSize: '16px' }}
              />
            </div>
          )}
          
          <ColorButtons 
            producto={producto}
            onAgregarCarrito={onAgregarCarrito}
          />
          
          {/* Items en carrito */}
          {Object.entries(carrito).some(([key]) => key.startsWith(producto.codigo)) && (
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-mare-brown bg-mare-beige">
              <p className="text-sm sm:text-base font-bold mb-2 sm:mb-3 text-mare-brown">
                🛒 En tu carrito:
              </p>
              {Object.entries(carrito)
                .filter(([key]) => key.startsWith(producto.codigo))
                .map(([key, item]) => (
                  <div key={key} className="flex items-center justify-between mb-2 sm:mb-3 p-2 sm:p-3 bg-white rounded-lg sm:rounded-xl">
                    <div className="flex-1">
                      <span className="text-sm sm:text-base font-semibold text-mare-brown">
                        {item.color}: {item.cantidad} unidades
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 sm:space-x-2">
                      <button
                        onClick={() => onActualizarCantidad(key, item.cantidad - 1)}
                        className="p-1 sm:p-2 text-red-500 hover:bg-red-100 rounded-lg text-sm sm:text-base min-h-touch touch-manipulation"
                      >
                        -
                      </button>
                      <button
                        onClick={() => onActualizarCantidad(key, item.cantidad + 1)}
                        className="p-1 sm:p-2 text-green-500 hover:bg-green-100 rounded-lg text-sm sm:text-base min-h-touch touch-manipulation"
                      >
                        +
                      </button>
                      <button
                        onClick={() => onEliminarDelCarrito(key)}
                        className="p-1 sm:p-2 text-red-500 hover:bg-red-100 rounded-lg text-sm sm:text-base ml-1 sm:ml-2 min-h-touch touch-manipulation"
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
};

// Componente Principal
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

  const { isMobile } = useResponsive();

  // Cargar datos desde el JSON generado automáticamente
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log('🔄 Cargando datos del catálogo...');
      
      const response = await fetch('https://ferabensrl.github.io/mare-catalogo-web/datos/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const datos = await response.json();
      
      console.log('✅ Datos cargados:', datos);
      
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
      
      mensaje += '  Precio unitario:  + grupo.producto.precio + '\n';
      mensaje += '  Subtotal:  + grupo.totalProducto + '\n';
      
      const comentario = comentariosProducto[grupo.producto.codigo];
      if (comentario && comentario.trim()) {
        mensaje += '  COMENTARIO: ' + comentario + '\n';
      }
      mensaje += '\n';
    });

    mensaje += 'TOTAL PEDIDO:  + calcularTotal() + '\n\n';
    
    if (comentarioFinal && comentarioFinal.trim()) {
      mensaje += 'COMENTARIOS ADICIONALES:\n' + comentarioFinal + '\n\n';
    }
    
    mensaje += 'Pedido enviado desde Catalogo MARE\nBy Feraben SRL';

    const numeroWhatsapp = '59897998999';
    const mensajeCorto = mensaje.length > 1800 ? 
      mensaje.substring(0, 1600) + '\n...(mensaje truncado)\n\nTotal:  + calcularTotal() :
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
      <div className="min-h-screen flex items-center justify-center bg-mare-beige">
        <div className="text-center">
          <Loader className="animate-spin mx-auto mb-4 text-mare-brown" size={isMobile ? 40 : 48} />
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-mare-brown">
            Cargando catálogo...
          </h2>
          <p className="text-sm sm:text-base opacity-80 text-mare-brown">
            Sincronizando desde GitHub
          </p>
        </div>
      </div>
    );
  }

  // Componente de error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mare-beige">
        <div className="text-center p-6 sm:p-8 bg-white rounded-lg sm:rounded-2xl shadow-lg max-w-md mx-4">
          <AlertCircle className="mx-auto mb-4 text-red-500" size={isMobile ? 40 : 48} />
          <h2 className="text-xl sm:text-2xl font-bold mb-2 text-red-600">Error al cargar</h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg sm:rounded-xl hover:opacity-90 bg-mare-brown text-sm sm:text-base font-semibold touch-manipulation"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mare-beige">
      <Header 
        productos={productos}
        cantidadItems={cantidadItems}
        onToggleCarrito={() => setMostrarCarrito(!mostrarCarrito)}
      />

      <SearchBar 
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
      />

      <CategoryTabs 
        categorias={categorias}
        categoriaActiva={categoriaActiva}
        onCategoriaChange={setCategoriaActiva}
      />

      {/* Grid de Productos */}
      <div className="px-4 sm:px-6 pb-10 sm:pb-16">
        {productosFiltrados.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-xl sm:text-2xl text-gray-600">No se encontraron productos</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
            {productosFiltrados.map(producto => (
              <ProductCard
                key={producto.codigo}
                producto={producto}
                imagenesActivas={imagenesActivas}
                carrito={carrito}
                comentariosProducto={comentariosProducto}
                onCambiarImagen={cambiarImagen}
                onAgregarCarrito={agregarAlCarrito}
                onActualizarCantidad={actualizarCantidad}
                onEliminarDelCarrito={eliminarDelCarrito}
                onActualizarComentario={actualizarComentarioProducto}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal del Carrito */}
      {mostrarCarrito && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">
          {/* Header del carrito */}
          <div className="p-4 sm:p-6 border-b shadow-sm bg-mare-brown">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setMostrarCarrito(false)}
                className="flex items-center space-x-2 sm:space-x-3 text-white hover:opacity-80 transition-opacity touch-manipulation min-h-touch"
              >
                <span className="text-xl sm:text-2xl">←</span>
                <span className="text-sm sm:text-base lg:text-lg font-semibold">Volver al catálogo</span>
              </button>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                🛒 Mi Pedido
              </h2>
              <div className="w-16 sm:w-24"></div>
            </div>
          </div>
          
          {/* Contenido del carrito */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-mare-beige">
            {Object.keys(carrito).length === 0 ? (
              <div className="text-center py-12 sm:py-16">
                <div className="text-6xl sm:text-8xl mb-6">🛒</div>
                <p className="text-xl sm:text-2xl lg:text-3xl mb-6 font-semibold text-mare-brown">Tu carrito está vacío</p>
                <button
                  onClick={() => setMostrarCarrito(false)}
                  className="px-6 sm:px-8 py-3 sm:py-4 text-white rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg bg-mare-brown hover:bg-mare-brown/90 transition-colors touch-manipulation"
                >
                  Agregar productos
                </button>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
                {Object.entries(carrito).map(([key, item]) => (
                  <div key={key} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border-2 border-mare-brown">
                    {/* Header del producto */}
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-mare-brown">
                          {item.producto.nombre}
                        </h3>
                        <p className="text-sm sm:text-base text-gray-600 mt-1">Código: {item.producto.codigo}</p>
                        <p className="text-sm sm:text-base mt-1 text-mare-brown">
                          Color: <span className="font-semibold">{item.color}</span>
                        </p>
                      </div>
                      <button
                        onClick={() => eliminarDelCarrito(key)}
                        className="text-red-500 hover:text-red-700 p-2 sm:p-3 rounded-xl font-bold text-base sm:text-lg bg-red-100 hover:bg-red-200 transition-colors touch-manipulation min-h-touch"
                      >
                        🗑️
                      </button>
                    </div>
                    
                    {/* Cantidad y precio */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <span className="text-sm sm:text-base lg:text-lg font-semibold text-mare-brown">Cantidad:</span>
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad - 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-mare-brown flex items-center justify-center hover:bg-gray-100 touch-manipulation"
                          >
                            <Minus size={isMobile ? 14 : 18} className="text-mare-brown" />
                          </button>
                          
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) => establecerCantidad(key, e.target.value)}
                            className="w-16 sm:w-20 text-center font-bold border-2 border-mare-brown rounded-lg sm:rounded-xl px-2 sm:px-3 py-1 sm:py-2 text-base sm:text-lg text-mare-brown touch-manipulation"
                            style={{ fontSize: '16px' }}
                          />
                          
                          <button
                            onClick={() => actualizarCantidad(key, item.cantidad + 1)}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-mare-brown flex items-center justify-center hover:bg-gray-100 touch-manipulation"
                          >
                            <Plus size={isMobile ? 14 : 18} className="text-mare-brown" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm sm:text-base text-gray-600">${item.producto.precio} c/u</p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-mare-brown">
                          ${item.producto.precio * item.cantidad}
                        </p>
                      </div>
                    </div>

                    {/* Comentario del producto si existe */}
                    {comentariosProducto[item.producto.codigo] && (
                      <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-mare-brown bg-mare-light">
                        <p className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-mare-brown">
                          💬 Comentario:
                        </p>
                        <p className="text-sm sm:text-base text-gray-700">
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
            <div className="bg-white border-t p-4 sm:p-6 shadow-lg">
              <div className="max-w-2xl mx-auto">
                {/* Total */}
                <div className="flex justify-between items-center mb-4 sm:mb-6 py-3 sm:py-4 border-t-2 border-mare-brown">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-mare-brown">Total:</span>
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-bold text-mare-brown">${calcularTotal()}</span>
                </div>
                
                {/* Comentarios adicionales */}
                <div className="mb-4 sm:mb-6">
                  <label className="block text-sm sm:text-base lg:text-lg font-semibold mb-2 sm:mb-3 text-mare-brown">
                    📝 Comentarios adicionales del pedido:
                  </label>
                  <textarea
                    placeholder="Ej: Entregar urgente, horario de recepción, dirección específica..."
                    value={comentarioFinal}
                    onChange={(e) => setComentarioFinal(e.target.value)}
                    className="w-full border-2 border-mare-brown rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-sm sm:text-base resize-none touch-manipulation"
                    style={{ fontSize: '16px' }}
                    rows={isMobile ? "3" : "4"}
                  />
                </div>

                {/* Botones */}
                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => setMostrarCarrito(false)}
                    className="w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg border-2 border-mare-brown text-mare-brown bg-white hover:bg-gray-50 transition-colors touch-manipulation"
                  >
                    ← Seguir comprando
                  </button>
                  <button
                    onClick={generarPedido}
                    className="w-full text-white py-4 sm:py-5 rounded-xl sm:rounded-2xl font-bold text-lg sm:text-xl hover:opacity-90 transition-colors flex items-center justify-center space-x-3 sm:space-x-4 shadow-lg touch-manipulation"
                    style={{ backgroundColor: '#25D366' }}
                  >
                    <Send size={isMobile ? 24 : 28} />
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
