const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Lista completa de colores posibles según el Excel
const coloresPosibles = [
  'Negro', 'Blanco', 'Dorado', 'Plateado', 'Acero', 'Nude', 'Tonos marrones', 
  'Tonos pastel', 'Varios colores', 'Amarillo', 'Verde', 'Lila', 'Celeste', 
  'Rosado', 'Fucsia', 'Animal Print', 'Beige', 'Marron Claro', 'Marron Oscuro', 
  'Gris', 'Verde claro', 'Terracota', 'Bordeaux', 'Rojo', 'Rosa Viejo', 
  'Petroleo', 'Turquesa', 'Verde militar', 'Azul', 'Verde Agua', 'Salmon', 
  'Mostaza', 'Crudo', 'Combinado', 'Acero dorado', 'C1', 'C2', 'C3', 'C4', 
  'C5', 'C6', 'C7', 'C8', 'C9', 'C10'
];

function convertirExcelAJSON() {
  try {
    console.log('🔄 Iniciando conversión de Excel a JSON...');
    
    // Leer el archivo Excel
    const excelPath = path.join(__dirname, '../datos/catalogo-mare.xlsx');
    const workbook = XLSX.readFile(excelPath);
    const hoja = workbook.Sheets['Catalogo_Actual'];
    const datosExcel = XLSX.utils.sheet_to_json(hoja);
    
    console.log(`📊 Procesando ${datosExcel.length} productos...`);
    
    // Procesar productos
    const productosFormateados = datosExcel.map(producto => {
      // Obtener imágenes disponibles
      const imagenes = [];
      for (let i = 1; i <= 10; i++) {
        const urlImg = producto[`Imagen ${i} URL`];
        if (urlImg && urlImg.trim() && urlImg !== '') {
          // Convertir URLs a GitHub Pages
          let urlFinal = urlImg.replace(
            'https://cdn.jsdelivr.net/gh/Ferabensrl/catalogo-mare@main',
            'https://ferabensrl.github.io/mare-catalogo-web'
          );
          imagenes.push(urlFinal);
        }
      }

      // Si no hay URLs, construir basándose en el código
      if (imagenes.length === 0) {
        const codigoProducto = producto['Código'].toString();
        // Buscar patrones de imágenes
        for (let i = 1; i <= 6; i++) {
          const nombreImg = producto[`Imagen ${i}`];
          if (nombreImg) {
            imagenes.push(`https://ferabensrl.github.io/mare-catalogo-web/imagenes/${nombreImg}.png`);
          }
        }
        
        // Si aún no hay imágenes, usar el código base
        if (imagenes.length === 0) {
          imagenes.push(`https://ferabensrl.github.io/mare-catalogo-web/imagenes/${codigoProducto}.png`);
        }
      }

      // Obtener colores disponibles
      const coloresDisponibles = [];
      coloresPosibles.forEach(color => {
        if (producto[color] === 'SI') {
          coloresDisponibles.push(color);
        }
      });

      const productoFormateado = {
        id: producto['Código'].toString(),
        nombre: producto['Nombre'],
        descripcion: producto['Descripción'] || producto['Nombre'],
        categoria: producto['Categoría'],
        precio: producto['Precio'],
        medidas: producto['Medidas'] || null,
        imagenes: imagenes,
        colores: coloresDisponibles,
        tieneColores: coloresDisponibles.length > 0,
        fechaActualizacion: new Date().toISOString()
      };

      console.log(`✅ ${productoFormateado.id} - ${productoFormateado.nombre} (${imagenes.length} imágenes, ${coloresDisponibles.length} colores)`);
      return productoFormateado;
    });

    // Generar categorías
    const categoriasUnicas = [...new Set(productosFormateados.map(p => p.categoria))];
    
    const datosFinales = {
      productos: productosFormateados,
      categorias: categoriasUnicas,
      metadatos: {
        totalProductos: productosFormateados.length,
        fechaGeneracion: new Date().toISOString(),
        version: '1.0'
      }
    };

    // Guardar JSON
    const jsonPath = path.join(__dirname, '../datos/productos.json');
    fs.writeFileSync(jsonPath, JSON.stringify(datosFinales, null, 2));
    
    console.log('🎉 Conversión completada exitosamente!');
    console.log(`📁 Archivo generado: ${jsonPath}`);
    console.log(`📊 Total productos: ${productosFormateados.length}`);
    console.log(`📂 Categorías: ${categoriasUnicas.join(', ')}`);
    
    return datosFinales;
    
  } catch (error) {
    console.error('❌ Error en la conversión:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  convertirExcelAJSON();
}

module.exports = { convertirExcelAJSON };
