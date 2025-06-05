// Cargar datos desde el JSON generado automáticamente
  const cargarDatos = async () => {
    try {
      setCargando(true);
      setError(null);

      console.log('🔄 Cargando datos del catálogo...');
      
      // Cargar desde GitHub Pages - ubicación en datos/
      const response = await fetch('https://ferabensrl.github.io/mare-catalogo-web/datos/productos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const datos = await response.json();
      
      console.log('✅ Datos cargados:', datos);
      
      // Los datos ya están en el formato correcto desde el convertidor
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
