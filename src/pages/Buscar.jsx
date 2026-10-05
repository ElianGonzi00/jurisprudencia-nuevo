import { useEffect } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Formulario } from '../components/Formulario.jsx'
import { Cargando, CabeceraResultados, Distintivos, EstadoError, Paginacion, SinResultados } from '../components/Resultados.jsx'
import { hayCriterio } from '../lib/busqueda.js'
import { fecha, recortar } from '../lib/formato.js'
import { Resaltado } from '../lib/resaltar.jsx'
import { useConsulta } from '../lib/useConsulta.js'

function DatosDelFallo({ fallo }) {
  return (
    <div className="item__meta">
      <Distintivos fallo={fallo} />
      <span><strong>N° {fallo.numero}/{fallo.anio}</strong></span>
      <span>{fecha(fallo.fecha)}</span>
      <span>{fallo.juzgado.nombre}</span>
    </div>
  )
}

function AlFallo({ fallo, terminos, volver }) {
  return (
    <div className="item__acciones">
      <Link className="btn btn-primary btn-sm" to={`/fallo/${fallo.id_fallo}`} state={{ terminos, volver }}>
        {fallo.tiene_texto ? 'Ver fallo completo' : 'Ver fallo'}
      </Link>
      {!fallo.tiene_texto && <span className="etiqueta etiqueta--neutra">Texto completo no cargado</span>}
    </div>
  )
}

/**
 * Una publicación es un sumario (el resumen para decidir si el fallo sirve) o un fallo sin sumario.
 * Las dos llevan al fallo completo.
 */
function Publicacion({ publicacion, terminos, volver }) {
  const { fallo } = publicacion
  if (publicacion.clase === 'sumario') {
    const { sumario } = publicacion
    return (
      <li className="item">
        <DatosDelFallo fallo={fallo} />
        <h2 className="item__tema"><Resaltado texto={sumario.tema} terminos={terminos} /></h2>
        <p className="item__texto"><Resaltado texto={recortar(sumario.texto, 900)} terminos={terminos} /></p>
        <p className="item__origen"><Resaltado texto={fallo.caratula || 'Sin carátula'} terminos={terminos} /></p>
        <AlFallo fallo={fallo} terminos={terminos} volver={volver} />
      </li>
    )
  }
  return (
    <li className="item item--fallo">
      <DatosDelFallo fallo={fallo} />
      <h2 className="item__tema"><Resaltado texto={fallo.caratula || 'Sin carátula'} terminos={terminos} /></h2>
      <p className="item__aviso">Fallo sin sumario</p>
      {publicacion.fragmento && terminos.length > 0 && (
        <p className="item__texto">… <Resaltado texto={recortar(publicacion.fragmento, 400)} terminos={terminos} /></p>
      )}
      <AlFallo fallo={fallo} terminos={terminos} volver={volver} />
    </li>
  )
}

export function Buscar() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  // Un orden de la versión anterior (fecha, sumario, relevancia) se ignora: hoy son reciente/antiguo.
  const parametros = new URLSearchParams(searchParams)
  if (!['reciente', 'antiguo'].includes(parametros.get('orden'))) parametros.delete('orden')
  const ruta = hayCriterio(parametros) ? `/busqueda?${parametros}` : null
  const { datos, error, cargando } = useConsulta(ruta)
  const volver = `${location.pathname}${location.search}`

  useEffect(() => {
    const q = searchParams.get('q')
    document.title = `${q ? `${q} · ` : ''}Jurisprudencia · Poder Judicial de Formosa`
  }, [searchParams])

  return (
    <>
      <Formulario cargando={cargando} />
      <section className="resultados contenedor" aria-label="Resultados" aria-busy={cargando}>
        {!ruta && (
          <div className="estado">
            <h2 className="estado__titulo">Buscá en la jurisprudencia del Poder Judicial de Formosa</h2>
            <p>
              Cada sumario aparece como una publicación, para que puedas decidir si el fallo te sirve antes de
              abrirlo. Los fallos que no tienen sumario aparecen con acceso directo al fallo completo.
              Incluye sentencias, autos interlocutorios y fallos novedosos.
            </p>
          </div>
        )}
        {ruta && cargando && !datos && <Cargando />}
        {ruta && error && <EstadoError error={error} />}
        {ruta && datos && !error && (
          datos.paginacion.total === 0
            ? <SinResultados consulta={datos.consulta} />
            : (
              <>
                <CabeceraResultados datos={datos} />
                <ol className="lista" start={(datos.paginacion.pagina - 1) * datos.paginacion.por_pagina + 1}>
                  {datos.resultados.map((pub) => (
                    <Publicacion
                      key={pub.clase === 'sumario' ? `s${pub.sumario.id_sumario}` : `f${pub.fallo.id_fallo}`}
                      publicacion={pub}
                      terminos={datos.consulta.terminos}
                      volver={volver}
                    />
                  ))}
                </ol>
                <Paginacion paginacion={datos.paginacion} />
              </>
            )
        )}
      </section>
    </>
  )
}
