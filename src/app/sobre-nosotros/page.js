import contenido from '../../data/contenido_web.json'

export default function SobreNosotros() {
  const info = contenido.sobreNosotros
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold text-[#8F6A50]">Sobre Nosotros</h1>
      <p>{info.historia}</p>
      <p><strong>Misión:</strong> {info.mision}</p>
      <p><strong>Visión:</strong> {info.vision}</p>
      <p><strong>Valores:</strong> {info.valores.join(', ')}</p>
    </div>
  )
}
