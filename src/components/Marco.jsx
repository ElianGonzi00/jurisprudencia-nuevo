import { Link } from 'react-router'

/** Encabezado mínimo: el buscador se publica dentro del sitio oficial, que ya tiene su navegación. */
export function Encabezado() {
  return (
    <header className="encabezado">
      <div className="contenedor">
        <div className="encabezado__marca">
          <span className="encabezado__institucion">Poder Judicial de Formosa</span>
          <h1 className="encabezado__titulo">
            <Link to="/buscar" className="encabezado__enlace">Jurisprudencia</Link>
          </h1>
        </div>
      </div>
    </header>
  )
}

/** Datos de contacto tal como los publica hoy el buscador oficial. */
export function Pie() {
  return (
    <footer className="pie">
      <div className="contenedor">
        <p className="pie__linea">
          <strong>Departamento de Informática Jurisprudencial</strong>
          <span>Dra. Claudia Beatriz Torales</span>
          <span>Dean Funes N° 55 · C.P. 3600 · Formosa</span>
          <span>Tel.: (0370) 4455272</span>
        </p>
      </div>
    </footer>
  )
}
