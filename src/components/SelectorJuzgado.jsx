import { useEffect, useState } from 'react'
import { pedir } from '../lib/api.js'

let cacheJuzgados = null

/**
 * Selector de juzgado. Los organismos con dependientes (STJ y sus secretarías, Tribunal del Trabajo
 * y sus salas, cámaras criminales, juzgados civiles) se pueden elegir completos: la API incluye
 * a los que dependen de ellos. Reemplaza los grupos 27-30 del sistema anterior.
 */
export function SelectorJuzgado({ id, valor, alCambiar }) {
  const [juzgados, setJuzgados] = useState(cacheJuzgados)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (cacheJuzgados) return undefined
    const control = new AbortController()
    pedir('/juzgados', { signal: control.signal })
      .then(({ juzgados: lista }) => {
        cacheJuzgados = lista
        setJuzgados(lista)
      })
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
    return () => control.abort()
  }, [])

  return (
    <>
      <select
        id={id}
        className="form-select"
        value={valor}
        onChange={(e) => alCambiar(e.target.value)}
        disabled={!juzgados && !error}
        aria-describedby={`${id}-ayuda`}
      >
        <option value="">Todos los juzgados</option>
        {juzgados?.map((j) =>
          j.dependientes.length === 0 ? (
            <option key={j.id_juzgado} value={j.id_juzgado}>{j.nombre}</option>
          ) : (
            <optgroup key={j.id_juzgado} label={j.nombre}>
              <option value={j.id_juzgado}>{j.nombre} (todos)</option>
              {j.dependientes.map((d) => (
                <option key={d.id_juzgado} value={d.id_juzgado}>{d.nombre}</option>
              ))}
            </optgroup>
          ),
        )}
      </select>
      <span id={`${id}-ayuda`} className="campo__ayuda">
        {error ? 'No se pudo cargar la lista de juzgados.' : !juzgados ? 'Cargando juzgados…' : ''}
      </span>
    </>
  )
}
