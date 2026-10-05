/**
 * Resalta los términos buscados sin importar acentos ni mayúsculas, solo en palabras completas
 * ("judicial" no marca "perjudicial"). Mismo criterio que highlight_accent_insensitive() del
 * sistema anterior, pero sobre texto plano: React escapa el contenido, no se inyecta HTML.
 */
const VARIANTES = {
  a: 'aáàäâã', e: 'eéèëê', i: 'iíìïî', o: 'oóòöôõ', u: 'uúùüû', n: 'nñ', c: 'cç',
}

function patronDe(termino) {
  return [...termino.normalize('NFC').toLocaleLowerCase('es')]
    .map((letra) => {
      const base = letra.normalize('NFD').replace(/\p{M}/gu, '')
      if (VARIANTES[base]) return `[${VARIANTES[base]}]`
      if (/\s/.test(letra)) return '\\s+'
      return letra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    })
    .join('')
}

export function crearExpresion(terminos) {
  const validos = (terminos ?? []).filter((t) => t && t.trim().length > 0)
  if (validos.length === 0) return null
  const alternativas = validos
    .sort((a, b) => b.length - a.length)
    .map(patronDe)
    .join('|')
  return new RegExp(`(?<![\\p{L}\\p{N}])(${alternativas})(?![\\p{L}\\p{N}])`, 'giu')
}

export function Resaltado({ texto, terminos }) {
  const expresion = crearExpresion(terminos)
  if (!texto || !expresion) return texto ?? null
  const partes = texto.split(expresion)
  // split con un grupo de captura intercala: [texto, coincidencia, texto, coincidencia, ...]
  return partes.map((parte, i) => (i % 2 === 1 ? <mark key={i}>{parte}</mark> : parte))
}
