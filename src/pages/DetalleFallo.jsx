import { useEffect } from 'react'
import { Link, useLocation, useParams } from 'react-router'
import { Cargando, Distintivos, EstadoError } from '../components/Resultados.jsx'
import { urlPdf } from '../lib/api.js'
import { fecha, referencia } from '../lib/formato.js'
import { Resaltado } from '../lib/resaltar.jsx'
import { useConsulta } from '../lib/useConsulta.js'

/** Fallo completo con sus sumarios. Reemplaza Fallo.php + PresFallo.php e imprimefallo.php (PDF). */
export function DetalleFallo() {
  const { id } = useParams()
  const { state } = useLocation()
  const valido = /^\d+$/.test(id)
  const { datos, error, cargando } = useConsulta(valido ? `/fallos/${id}` : null)
  const fallo = datos?.fallo
  const terminos = state?.terminos ?? []
  const volver = state?.volver

  useEffect(() => {
    if (fallo) document.title = `${referencia(fallo)} · ${fallo.juzgado.nombre} · Jurisprudencia`
  }, [fallo])

  return (
    <article className="detalle contenedor">
      {volver
        ? <Link className="detalle__volver" to={volver}>← Volver a los resultados</Link>
        : <Link className="detalle__volver" to="/buscar">← Ir al buscador</Link>}

      {!valido && <EstadoError error={{ message: 'La dirección no corresponde a un fallo.' }} />}
      {cargando && !fallo && <Cargando />}
      {error && <EstadoError error={error} />}

      {fallo && (
        <>
          <p className="mt-3 mb-0"><Distintivos fallo={fallo} /></p>
          <h2 className="detalle__titulo">{referencia(fallo)}</h2>
          <p className="detalle__juzgado">
            {fallo.juzgado.nombre}
            {fallo.juzgado.depende_de && ` · ${fallo.juzgado.depende_de.nombre}`}
          </p>

          <dl className="datos">
            <dt>Carátula</dt>
            <dd><Resaltado texto={fallo.caratula || '—'} terminos={terminos} /></dd>
            <dt>Fecha</dt>
            <dd>{fecha(fallo.fecha)}</dd>
            {fallo.expediente && (<><dt>Expediente</dt><dd>{fallo.expediente}</dd></>)}
            {fallo.firmantes && (<><dt>Firmantes</dt><dd>{fallo.firmantes}</dd></>)}
            <dt>Sumarios</dt>
            <dd>{fallo.sumarios.length === 0 ? 'Sin sumarios' : fallo.sumarios.length}</dd>
          </dl>

          {fallo.novedoso && (
            <div className="novedoso">
              <p className="novedoso__titulo">Publicado como fallo novedoso · {fallo.novedoso.materias.join(', ')}</p>
              <ul className="novedoso__lista">
                {fallo.novedoso.titulos.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </div>
          )}

          <div className="acciones mt-0">
            <a className="btn btn-primary" href={urlPdf(fallo.id_fallo)} target="_blank" rel="noopener">Descargar PDF</a>
          </div>

          {fallo.sumarios.length > 0 && (
            <section className="detalle__seccion" aria-labelledby="titulo-sumarios">
              <h3 id="titulo-sumarios" className="detalle__subtitulo">Sumarios</h3>
              <ol className="lista">
                {fallo.sumarios.map((s) => (
                  <li key={s.id_sumario} className="item">
                    <h4 className="item__tema"><Resaltado texto={s.tema} terminos={terminos} /></h4>
                    <p className="item__texto"><Resaltado texto={s.texto} terminos={terminos} /></p>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <section className="detalle__seccion" aria-labelledby="titulo-texto">
            <h3 id="titulo-texto" className="detalle__subtitulo">Texto completo</h3>
            {fallo.tiene_texto
              ? <div className="texto-fallo"><Resaltado texto={fallo.texto} terminos={terminos} /></div>
              : <p className="aviso">El texto completo de esta resolución no está cargado en la base de jurisprudencia. Se publican sus sumarios.</p>}
          </section>

          <p className="traza">Registro {fallo.id_fallo} · juzgado {fallo.juzgado.id_juzgado} · {fallo.tipo_resolucion.nombre.toLowerCase()} {fallo.numero}/{fallo.anio}</p>
        </>
      )}
    </article>
  )
}
