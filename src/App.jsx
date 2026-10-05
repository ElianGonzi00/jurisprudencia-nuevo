import { Link, Navigate, Route, Routes, useLocation } from 'react-router'
import { Encabezado, Pie } from './components/Marco.jsx'
import { Buscar } from './pages/Buscar.jsx'
import { DetalleFallo } from './pages/DetalleFallo.jsx'

function NoEncontrada() {
  return (
    <div className="estado contenedor">
      <h2 className="estado__titulo">Esta página no existe</h2>
      <p>La dirección puede estar mal escrita o el enlace puede ser viejo.</p>
      <p><Link to="/buscar">Ir al buscador</Link></p>
    </div>
  )
}

/** Las direcciones de la primera versión (/sumarios, /fallos) llevan al buscador único, con su búsqueda. */
function AlBuscador() {
  const p = new URLSearchParams(useLocation().search)
  // tema / texto de la primera versión pasan al campo único q
  const q = [p.get('q'), p.get('tema'), p.get('texto')].filter(Boolean).join(' ')
  p.delete('tema')
  p.delete('texto')
  if (q) p.set('q', q)
  return <Navigate to={`/buscar${p.size ? `?${p}` : ''}`} replace />
}

export default function App() {
  return (
    <div className="app">
      <Encabezado />
      <main id="contenido">
        <Routes>
          <Route path="/" element={<Navigate to="/buscar" replace />} />
          <Route path="/buscar" element={<Buscar />} />
          <Route path="/sumarios" element={<AlBuscador />} />
          <Route path="/fallos" element={<AlBuscador />} />
          <Route path="/fallo/:id" element={<DetalleFallo />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
      <Pie />
    </div>
  )
}
