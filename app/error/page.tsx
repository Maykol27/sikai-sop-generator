export default function ErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-3xl font-bold text-red-500 mb-4">¡Ups! Algo salió mal.</h2>
      <p className="text-gray-400">Ha ocurrido un error al procesar tu solicitud.</p>
    </div>
  )
}
