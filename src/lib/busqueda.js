/**
 * El estado de la búsqueda vive en la URL (?q=...&juzgado=...&pagina=2): se puede compartir,
 * guardar y volver atrás con el navegador. Los nombres son los mismos que usa la API (/api/v1/busqueda).
 */
export const FILTROS = ['tipo', 'juzgado', 'partes', 'firmante', 'numero', 'anio', 'desde', 'hasta']
export const CAMPOS = ['q', 'operador', ...FILTROS]
export const ORDEN_POR_DEFECTO = 'reciente'

/** Valores del formulario a partir de la URL. */
export function leerFormulario(searchParams) {
  const valores = {}
  for (const campo of CAMPOS) valores[campo] = searchParams.get(campo) ?? ''
  if (!valores.operador) valores.operador = 'todas'
  return valores
}

/** Parámetros de URL a partir del formulario: solo los que tienen valor y no son el valor por defecto. */
export function armarParametros(valores) {
  const p = new URLSearchParams()
  for (const [clave, valor] of Object.entries(valores)) {
    const v = String(valor ?? '').trim()
    if (!v) continue
    if (clave === 'operador' && v === 'todas') continue
    if (clave === 'orden' && v === ORDEN_POR_DEFECTO) continue
    if (clave === 'pagina' && v === '1') continue
    p.set(clave, v)
  }
  return p
}

/** Hay algo para buscar si hay texto o al menos un filtro. */
export function hayCriterio(searchParams) {
  return ['q', ...FILTROS].some((c) => (searchParams.get(c) ?? '').trim() !== '')
}

export function cantidadDeFiltros(valores) {
  return FILTROS.filter((f) => String(valores[f] ?? '').trim() !== '').length
}
