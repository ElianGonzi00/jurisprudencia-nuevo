import { Link, useSearchParams } from 'react-router'
import { ORDEN_POR_DEFECTO } from '../lib/busqueda.js'
import { numero } from '../lib/formato.js'

export function Cargando() {
  return (
    <div className="esqueleto" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <div key={i} className="esqueleto__bloque">
          <div className="esqueleto__linea esqueleto__linea--corta" />
          <div className="esqueleto__linea esqueleto__linea--media" />
          <div className="esqueleto__linea" />
          <div className="esqueleto__linea" />
        </div>
      ))}
    </div>
  )
}

export function EstadoError({ error }) {
  return (
    <div className="estado estado--error" role="alert">
      <h2 className="estado__titulo">No se pudo completar la búsqueda</h2>
      <p>{error.message}</p>
      {error.idSolicitud && (
        <p className="estado__codigo">Código de solicitud: {error.idSolicitud}</p>
      )}
    </div>
  )
}

/** Sin resultados: qué pasó y qué probar. */
export function SinResultados({ consulta }) {
  const [searchParams] = useSearchParams()
  const sugerencias = []
  if ((consulta?.terminos?.length ?? 0) > 1 && searchParams.get('operador') !== 'alguna') {
    const p = new URLSearchParams(searchParams)
    p.set('operador', 'alguna')
    p.delete('pagina')
    sugerencias.push(<li key="op"><Link to={`?${p}`}>Buscar con alguna de las palabras</Link> en lugar de todas.</li>)
  }
  sugerencias.push(<li key="fil">Quitar algún filtro o ampliar el rango de fechas.</li>)
  return (
    <div className="estado" role="status">
      <h2 className="estado__titulo">No hay resultados para esta búsqueda</h2>
      <p>Probá con:</p>
      <ul>{sugerencias}</ul>
    </div>
  )
}

/** Total de publicaciones (sumarios + fallos sin sumario), términos buscados y orden por fecha. */
export function CabeceraResultados({ datos }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { paginacion, consulta, totales } = datos

  function ordenar(e) {
    const p = new URLSearchParams(searchParams)
    if (e.target.value === ORDEN_POR_DEFECTO) p.delete('orden')
    else p.set('orden', e.target.value)
    p.delete('pagina')
    setSearchParams(p)
  }

  return (
    <div className="resultados__cabecera">
      <div aria-live="polite">
        <p className="resultados__total">
          <strong>{numero(paginacion.total)}</strong> {paginacion.total === 1 ? 'publicación' : 'publicaciones'}
        </p>
        <p className="resultados__terminos">
          {numero(totales.sumarios)} {totales.sumarios === 1 ? 'sumario' : 'sumarios'} · {numero(totales.fallos_sin_sumario)} {totales.fallos_sin_sumario === 1 ? 'fallo sin sumario' : 'fallos sin sumario'}
          {consulta.terminos.length > 0 && <> · Términos: {consulta.terminos.map((t) => `“${t}”`).join(', ')}</>}
        </p>
      </div>
      {paginacion.total > 1 && (
        <div className="orden">
          <label htmlFor="orden" className="campo__etiqueta">Ordenar</label>
          <select id="orden" className="form-select" value={consulta.orden} onChange={ordenar}>
            <option value="reciente">Más recientes primero</option>
            <option value="antiguo">Más antiguos primero</option>
          </select>
        </div>
      )}
    </div>
  )
}

/** Tipo de resolución y, si corresponde, fallo novedoso. */
export function Distintivos({ fallo }) {
  const esAuto = fallo.tipo_resolucion.id_tipo_resolucion === 2
  return (
    <span className="distintivos">
      <span className={`distintivo ${esAuto ? 'distintivo--auto' : 'distintivo--sentencia'}`}>
        {esAuto ? 'Auto interlocutorio' : 'Sentencia'}
      </span>
      {fallo.novedoso && (
        <span className="distintivo distintivo--novedoso" title={`Fallo novedoso · ${fallo.novedoso.materias.join(', ')}`}>
          Fallo novedoso
        </span>
      )}
    </span>
  )
}

/** Paginación con enlaces reales: cada página tiene su URL. */
export function Paginacion({ paginacion }) {
  const [searchParams] = useSearchParams()
  const { pagina, paginas } = paginacion
  if (paginas <= 1) return null

  const enlace = (n) => {
    const p = new URLSearchParams(searchParams)
    if (n === 1) p.delete('pagina')
    else p.set('pagina', String(n))
    return `?${p}`
  }
  const visibles = [...new Set([1, pagina - 1, pagina, pagina + 1, paginas])]
    .filter((n) => n >= 1 && n <= paginas)
    .sort((a, b) => a - b)

  const items = []
  visibles.forEach((n, i) => {
    if (i > 0 && n - visibles[i - 1] > 1) {
      items.push(<li key={`s${n}`} className="page-item disabled"><span className="page-link">…</span></li>)
    }
    items.push(
      <li key={n} className={`page-item${n === pagina ? ' active' : ''}`}>
        {n === pagina
          ? <span className="page-link" aria-current="page">{n}</span>
          : <Link className="page-link" to={enlace(n)} aria-label={`Página ${n}`}>{n}</Link>}
      </li>,
    )
  })

  return (
    <nav className="paginacion" aria-label="Páginas de resultados">
      <ul className="pagination">
        <li className={`page-item${pagina === 1 ? ' disabled' : ''}`}>
          {pagina === 1
            ? <span className="page-link">Anterior</span>
            : <Link className="page-link" to={enlace(pagina - 1)}>Anterior</Link>}
        </li>
        {items}
        <li className={`page-item${pagina === paginas ? ' disabled' : ''}`}>
          {pagina === paginas
            ? <span className="page-link">Siguiente</span>
            : <Link className="page-link" to={enlace(pagina + 1)}>Siguiente</Link>}
        </li>
      </ul>
    </nav>
  )
}
