/**
 * Levanta el proyecto completo en desarrollo: API (backendJurisprudencia, puerto 3000) y frontend (Vite, 5173).
 * Uso: npm run dev:todo   (desde la raíz de jurisprudencia-nuevo). Ctrl+C detiene los dos.
 */
import { spawn } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const procesos = [
  { nombre: 'api', color: 34, cmd: 'npm', args: ['run', 'dev'], cwd: path.join(raiz, 'backendJurisprudencia') },
  { nombre: 'web', color: 32, cmd: 'npm', args: ['run', 'dev'], cwd: raiz },
]

const hijos = procesos.map(({ nombre, color, cmd, args, cwd }) => {
  const hijo = spawn(cmd, args, { cwd, stdio: ['ignore', 'pipe', 'pipe'] })
  const prefijo = `\x1b[${color}m[${nombre}]\x1b[0m `
  const reenviar = (salida) => (datos) => {
    for (const linea of datos.toString().split('\n')) if (linea.trim()) salida.write(prefijo + linea + '\n')
  }
  hijo.stdout.on('data', reenviar(process.stdout))
  hijo.stderr.on('data', reenviar(process.stderr))
  hijo.on('exit', (codigo) => {
    console.log(`${prefijo}terminó (código ${codigo}). Deteniendo el resto…`)
    detener()
  })
  return hijo
})

let deteniendo = false
function detener() {
  if (deteniendo) return
  deteniendo = true
  for (const h of hijos) if (h.exitCode === null) h.kill('SIGTERM')
  setTimeout(() => process.exit(0), 1500).unref()
}
process.on('SIGINT', detener)
process.on('SIGTERM', detener)

console.log('Buscador en http://localhost:5173  ·  API en http://localhost:3000/api/v1')
