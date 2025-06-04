const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando conversión de Excel a JSON...');

// Leer el archivo Excel
const workbook = XLSX.readFile('datos/catalogo-mare.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(worksheet);

console.log(`📊 Procesando ${data.length} productos...`);

// Procesar los datos
const productos = data.map(row => {
  // Procesar imágenes (separadas por comas)
  const imagenesTexto = row['Imágenes'] || row['Imagenes'] || '';
  const imagenes = imagenesTexto.split(',')
    .map(img => img.trim())
    .filter(img => img.length > 0)
    .map(img => `https://ferabensrl.github.io/mare-catalogo-web/imagenes/${img}`);

  // Procesar colores (separados por comas)
  const coloresTexto = row['Colores'] || '';
  const colores = coloresTexto.split(',')
    .map(color => color.trim())
    .filter(color => color.length > 0);

  const producto = {
    codigo: row['Código'] || row['Codigo'] || '',
    nombre: row['Nombre'] || row['Producto'] || '',
    categoria: row['Categoría'] || row['Categoria'] || '',
    precio: row['Precio'] || '',
    descripcion: row['Descripción'] || row['Descripcion'] || '',
    imagenes: imagenes,
    colores: colores,
    disponible: row['Disponible'] !== 'No' && row['Disponible'] !== 'FALSE'
  };

  console.log(`✅ ${producto.codigo} - ${producto.nombre} (${imagenes.length} imágenes, ${colores.length} colores)`);
  return producto;
});

// Crear la carpeta public si no existe
const publicDir = 'public';
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('📁 Carpeta public creada');
}

// Guardar en public/productos.json
const outputPath = path.join(publicDir, 'productos.json');
fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2));

console.log('🎉 Conversión completada exitosamente!');
console.log(`📁 Archivo generado: ${outputPath}`);
console.log(`📊 Total productos: ${productos.length}`);

// Mostrar categorías únicas
const categorias = [...new Set(productos.map(p => p.categoria))];
console.log(`📂 Categorías: ${categorias.join(', ')}`);
