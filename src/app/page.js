export default function HomePage() {
  return (
    <div className="relative h-screen flex items-center justify-center text-center">
      <video
        className="absolute w-full h-full object-cover"
        src="https://www.w3schools.com/html/mov_bbb.mp4"
        autoPlay
        muted
        loop
      />
      <div className="relative z-10 text-white">
        <h1 className="text-5xl font-serif mb-4">MARÉ</h1>
        <p className="text-xl">Tu estilo en cada detalle</p>
      </div>
    </div>
  )
}
