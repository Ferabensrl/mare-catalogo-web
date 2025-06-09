import contenido from '../../data/contenido_web.json'

export default function TipsPage() {
  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold text-[#8F6A50]">Tips & Estilo</h1>
      {contenido.tips.map((tip, idx) => (
        <div key={idx} className="space-y-2">
          <img src={tip.imagen} alt={tip.titulo} className="w-full h-64 object-cover rounded" />
          <h2 className="text-xl font-semibold">{tip.titulo}</h2>
          <p>{tip.contenido}</p>
        </div>
      ))}
    </div>
  )
}
