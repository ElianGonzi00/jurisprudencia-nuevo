/** Error de la API con el id de solicitud, para que el usuario pueda reportarlo. */
export class ErrorApi extends Error {
  constructor(mensaje, { estado, codigo, idSolicitud } = {}) {
    super(mensaje)
    this.estado = estado
    this.codigo = codigo
    this.idSolicitud = idSolicitud
  }
}

const BASE = '/api/v1'

export async function pedir(ruta, { signal } = {}) {
  let respuesta
  try {
    respuesta = await fetch(`${BASE}${ruta}`, { signal, headers: { Accept: 'application/json' } })
  } catch (err) {
    if (err.name === 'AbortError') throw err
    throw new ErrorApi('No pudimos comunicarnos con el servidor. Revisá tu conexión y volvé a intentar.', { codigo: 'sin_conexion' })
  }
  const idSolicitud = respuesta.headers.get('X-Request-Id')
  const cuerpo = await respuesta.json().catch(() => null)
  // Sin cuerpo de error de la API y sin id de solicitud: la respuesta no vino del backend
  // (típico en desarrollo: Vite no pudo conectarse porque el backend no está levantado).
  if (!respuesta.ok && !cuerpo?.error && !idSolicitud) {
    throw new ErrorApi('El servidor de búsqueda no responde. Verificá que el backend esté levantado (npm run dev en backendJurisprudencia).', {
      estado: respuesta.status,
      codigo: 'backend_no_disponible',
    })
  }
  if (!respuesta.ok) {
    throw new ErrorApi(cuerpo?.error?.mensaje ?? `El servidor respondió con un error (${respuesta.status}).`, {
      estado: respuesta.status,
      codigo: cuerpo?.error?.codigo,
      idSolicitud: cuerpo?.error?.id_solicitud ?? idSolicitud,
    })
  }
  return cuerpo
}

export const urlPdf = (idFallo) => `${BASE}/fallos/${idFallo}/pdf`
