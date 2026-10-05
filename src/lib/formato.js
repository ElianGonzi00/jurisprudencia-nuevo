/** 'AAAA-MM-DD' -> 'DD/MM/AAAA' (el formato que usa el Poder Judicial). */
export function fecha(iso) {
  if (!iso) return '—'
  const [a, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

const numeros = new Intl.NumberFormat('es-AR')
export const numero = (n) => numeros.format(n)

/** Referencia legible de un fallo: "Sentencia N° 687/2024". */
export function referencia(fallo) {
  return `${fallo.tipo_resolucion.nombre} N° ${fallo.numero}/${fallo.anio}`
}

/** Corta un texto largo en el último espacio antes del límite. */
export function recortar(texto, limite) {
  if (!texto || texto.length <= limite) return texto
  const corte = texto.lastIndexOf(' ', limite)
  return `${texto.slice(0, corte > limite * 0.6 ? corte : limite)}…`
}
