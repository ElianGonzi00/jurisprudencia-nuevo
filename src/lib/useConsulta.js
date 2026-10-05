import { useEffect, useState } from 'react'
import { pedir } from './api.js'

/**
 * Pide `ruta` a la API cada vez que cambia. Cancela el pedido anterior si el usuario busca de nuevo.
 * El indicador de carga aparece recién a los 150 ms, para no parpadear en respuestas rápidas.
 */
export function useConsulta(ruta) {
  const [estado, setEstado] = useState({ datos: null, error: null, cargando: false, rutaDatos: null })

  useEffect(() => {
    if (!ruta) {
      setEstado({ datos: null, error: null, cargando: false, rutaDatos: null })
      return undefined
    }
    const control = new AbortController()
    const demora = setTimeout(() => setEstado((e) => ({ ...e, cargando: true })), 150)
    pedir(ruta, { signal: control.signal })
      .then((datos) => setEstado({ datos, error: null, cargando: false, rutaDatos: ruta }))
      .catch((error) => {
        if (error.name !== 'AbortError') setEstado({ datos: null, error, cargando: false, rutaDatos: ruta })
      })
      .finally(() => clearTimeout(demora))
    return () => {
      clearTimeout(demora)
      control.abort()
    }
  }, [ruta])

  return estado
}
