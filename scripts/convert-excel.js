const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

console.log('🔄 Iniciando conversión de Excel a JSON...');

// Leer el archivo Excel
const workbook = XLSX.readFile('datos/catalogo-mare.xlsx');
const sheetName = workbook.SheetNames[0];
const worksheet = workbook.Sheets[sheetName];

// Obtener el rango de datos
const range = XLSX.utils.decode_range(worksheet['!ref']);
console.log(`📊 Procesando datos de ${range.e.r} productos...`);

// Leer headers
const headers = [];
for (let col = range.s.c; col <= range.e.c; col++) {
  const cellAddress = XLSX.utils.encode_cell({r: 0, c: col});
  const cell = worksheet[cellAddress];
  headers.push(cell ? cell.v : '');
}

// Procesar cada fila de productos (desde fila 1, ya que fila 0 son headers)
const productos = [];
for (let row = 1; row <= range.e.r; row++) {
  // Leer datos básicos del producto (columnas A-F)
  const codigo = getCell(worksheet, row, 0); // Columna A
  const nombre = getCell(worksheet, row, 1); // Columna B
  const descripcion = getCell(worksheet, row, 2); // Columna C
  const categoria = getCell(worksheet, row, 3); // Columna D
  const precio = getCell(worksheet, row, 4); // Columna E
  const medidas = getCell(worksheet, row, 5); // Columna F
  
  // Skip empty rows
  if (!codigo || !nombre) continue;
  
  // Procesar imágenes (columnas G-Q: 6-16)
  const imagenes = [];
  for (let col = 6; col <= 16; col++) {
    const nombreImagen = getCell(worksheet, row, col);
    if (nombreImagen && nombreImagen.toString().trim()) {
      imagenes.push(`https://ferabensrl.github.io/mare-catalogo-web/imagenes/${nombreImagen.toString().trim()}.jpg`);
    }
  }
  
  // Procesar colores disponibles (columnas AC en adelante: desde columna 28)
  const colores = [];
  for (let col = 28; col < headers.length; col++) {
    const colorDisponible = getCell(worksheet, row, col);
    if (colorDisponible && (colorDisponible.toString().toUpperCase() === 'SI' || colorDisponible.toString().toUpperCase() === 'SÍ')) {
      const nombreColor = headers[col];
      if (nombreColor && nombreColor.toString().trim()) {
        colores.push(nombreColor.toString().trim());
      }
    }
  }
  
  const producto = {
    codigo: codigo.toString().trim(),
    nombre: nombre.toString().trim(),
    categoria: categoria ? categoria.toString().trim() : '',
    precio: precio ? precio.toString().trim() : '',
    descripcion: descripcion ? descripcion.toString().trim() : '',
    medidas: medidas ? medidas.toString().trim() : '',
    imagenes: imagenes,
    colores: colores,
    disponible: true
  };
  
  console.log(`✅ ${producto.codigo} - ${producto.nombre} (${imagenes.length} imágenes, ${colores.length} colores)`);
  productos.push(producto);
}

// Función auxiliar para obtener valor de celda
function getCell(worksheet, row, col) {
  const cellAddress = XLSX.utils.encode_cell({r: row, c: col});
  const cell = worksheet[cellAddress];
  return cell ? cell.v : '';
}

// Crear las carpetas necesarias
const publicDir = 'public';
const dataDir = 'datos';

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
  console.log('📁 Carpeta public creada');
}

// Guardar en public/productos.json Y también en datos/productos.json (para GitHub)
const outputPath = path.join(publicDir, 'productos.json');
const dataOutputPath = path.join(dataDir, 'productos.json');

fs.writeFileSync(outputPath, JSON.stringify(productos, null, 2));
fs.writeFileSync(dataOutputPath, JSON.stringify(productos, null, 2));

console.log('🎉 Conversión completada exitosamente!');
console.log(`📁 Archivos generados: ${outputPath} y ${dataOutputPath}`);
console.log(`📊 Total productos: ${productos.length}`);

// Mostrar categorías únicas
const categorias = [...new Set(productos.map(p => p.categoria))];
console.log(`📂 Categorías: ${categorias.join(', ')}`);

// Mostrar resumen de colores
const todosLosColores = [...new Set(productos.flatMap(p => p.colores))];
console.log(`🎨 Colores disponibles: ${todosLosColores.join(', ')}`);
