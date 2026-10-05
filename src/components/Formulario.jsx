import { useEffect, useId, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { armarParametros, cantidadDeFiltros, leerFormulario } from '../lib/busqueda.js'
import { SelectorJuzgado } from './SelectorJuzgado.jsx'

function Campo({ id, etiqueta, ayuda, children, ancho }) {
  return (
    <div className={`campo${ancho ? ' campo--ancho' : ''}`}>
      <label className="campo__etiqueta" htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda !== undefined && <span id={`${id}-ayuda`} className="campo__ayuda">{ayuda}</span>}
    </div>
  )
}

/**
 * Formulario del buscador único. Un campo de texto que busca en sumarios (tema y texto) y en el texto
 * de los fallos, más los filtros de siempre. Al buscar, los valores pasan a la URL.
 */
export function Formulario({ cargando }) {
  const id = useId()
  const navegar = useNavigate()
  const [searchParams] = useSearchParams()
  const [valores, setValores] = useState(() => leerFormulario(searchParams))
  const [aviso, setAviso] = useState('')

  // Si la URL cambia (atrás/adelante del navegador, sugerencias), el formulario la sigue.
  useEffect(() => {
    setValores(leerFormulario(searchParams))
  }, [searchParams])

  const cambiar = (campo) => (e) => {
    setValores((v) => ({ ...v, [campo]: e?.target ? e.target.value : e }))
    setAviso('')
  }
  const filtrosActivos = cantidadDeFiltros(valores)

  function buscar(e) {
    e.preventDefault()
    const parametros = armarParametros(valores)
    if ([...parametros.keys()].filter((k) => k !== 'operador').length === 0) {
      setAviso('Escribí qué buscar, o elegí al menos un filtro.')
      return
    }
    const orden = searchParams.get('orden')
    if (orden) parametros.set('orden', orden)
    navegar(`/buscar?${parametros}`)
  }

  function limpiar() {
    setValores(leerFormulario(new URLSearchParams()))
    setAviso('')
    navegar('/buscar')
  }

  return (
    <section className="busqueda" aria-label="Criterios de búsqueda">
      <form className="contenedor" onSubmit={buscar} noValidate>
        <Campo id={`${id}-q`} etiqueta="Buscar en sumarios y fallos" ayuda="Ejemplo: prescripción adquisitiva · Para una frase exacta, escribila entre comillas: “daño moral”">
          <input
            id={`${id}-q`}
            className="form-control form-control-lg"
            type="search"
            maxLength={200}
            value={valores.q}
            onChange={cambiar('q')}
            aria-describedby={`${id}-q-ayuda`}
            autoComplete="off"
          />
        </Campo>

        <fieldset className="mt-2">
          <legend className="visually-hidden">Coincidencia</legend>
          <div className="operador">
            <div className="form-check">
              <input className="form-check-input" type="radio" id={`${id}-todas`} name="operador" value="todas"
                checked={valores.operador === 'todas'} onChange={cambiar('operador')} />
              <label className="form-check-label" htmlFor={`${id}-todas`}>Todas las palabras</label>
            </div>
            <div className="form-check">
              <input className="form-check-input" type="radio" id={`${id}-alguna`} name="operador" value="alguna"
                checked={valores.operador === 'alguna'} onChange={cambiar('operador')} />
              <label className="form-check-label" htmlFor={`${id}-alguna`}>Alguna de las palabras</label>
            </div>
          </div>
        </fieldset>

        <details className="filtros" open={filtrosActivos > 0 || undefined}>
          <summary className="filtros__resumen">
            Filtros {filtrosActivos > 0 && <span className="filtros__cantidad">({filtrosActivos} en uso)</span>}
          </summary>
          <div className="filtros__grilla">
            <Campo id={`${id}-juzgado`} etiqueta="Juzgado o tribunal" ancho>
              <SelectorJuzgado id={`${id}-juzgado`} valor={valores.juzgado} alCambiar={cambiar('juzgado')} />
            </Campo>
            <Campo id={`${id}-tipo`} etiqueta="Tipo de resolución" ayuda="">
              <select id={`${id}-tipo`} className="form-select" value={valores.tipo} onChange={cambiar('tipo')}>
                <option value="">Sentencias y autos interlocutorios</option>
                <option value="1">Solo sentencias</option>
                <option value="2">Solo autos interlocutorios</option>
              </select>
            </Campo>
            <Campo id={`${id}-partes`} etiqueta="Partes (carátula)" ayuda="Apellido o razón social">
              <input id={`${id}-partes`} className="form-control" type="text" maxLength={120}
                value={valores.partes} onChange={cambiar('partes')} aria-describedby={`${id}-partes-ayuda`} />
            </Campo>
            <Campo id={`${id}-firmante`} etiqueta="Firmantes" ayuda="Apellido del magistrado">
              <input id={`${id}-firmante`} className="form-control" type="text" maxLength={120}
                value={valores.firmante} onChange={cambiar('firmante')} aria-describedby={`${id}-firmante-ayuda`} />
            </Campo>
            <Campo id={`${id}-numero`} etiqueta="Número de fallo" ayuda="">
              <input id={`${id}-numero`} className="form-control" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={10}
                value={valores.numero} onChange={cambiar('numero')} />
            </Campo>
            <Campo id={`${id}-anio`} etiqueta="Año" ayuda="">
              <input id={`${id}-anio`} className="form-control" type="text" inputMode="numeric" pattern="[0-9]*" maxLength={4}
                placeholder="2024" value={valores.anio} onChange={cambiar('anio')} />
            </Campo>
            <div className="campo">
              <span className="campo__etiqueta" id={`${id}-fechas`}>Fecha del fallo</span>
              <div className="fechas" role="group" aria-labelledby={`${id}-fechas`}>
                <input className="form-control" type="date" aria-label="Desde" value={valores.desde} onChange={cambiar('desde')} />
                <input className="form-control" type="date" aria-label="Hasta" value={valores.hasta} onChange={cambiar('hasta')} />
              </div>
              <span className="campo__ayuda">Desde · hasta (podés completar uno solo)</span>
            </div>
          </div>
        </details>

        {aviso && <p className="alerta-validacion" role="alert">{aviso}</p>}

        <div className="acciones">
          <button type="submit" className="btn btn-primary" aria-busy={cargando || undefined}>
            {cargando ? 'Buscando…' : 'Buscar'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={limpiar}>Limpiar</button>
        </div>
      </form>
    </section>
  )
}
