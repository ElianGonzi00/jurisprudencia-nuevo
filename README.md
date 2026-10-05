# Jurisprudencia · Poder Judicial de Formosa

Buscador público de jurisprudencia (sentencias y autos interlocutorios), primera versión.
Reemplaza a `buscador.php` / `buscafallo.php` del sistema PHP que hoy se publica embebido en
`jusformosa.gob.ar/decisiones-judiciales/jurisprudencia`.

```
Navegador ──► React + Vite (/) ──/api──► Express (backendJurisprudencia) ──► MariaDB/MySQL
                                          usuario de SOLO LECTURA            c1jurisprudencia_nuevo
```

## Levantar en local

Requisitos: Node 20+, la base `c1jurisprudencia_nuevo` cargada (ver `dev-local0/resources/`) y
`backendJurisprudencia/.env` configurado (copiar de `.env.example`).

```bash
npm install && npm --prefix backendJurisprudencia install   # la primera vez
npm run dev:todo                                             # API (3000) + frontend (5173) juntos
```

Abrir **http://localhost:5173** (no `127.0.0.1`: Vite escucha en `localhost`).
Para levantarlos por separado: `npm run dev` en `backendJurisprudencia/` y `npm run dev` en la raíz.

## Cómo funciona la búsqueda

Un solo buscador. Cada resultado es un **fallo** y muestra primero lo que permite decidir si sirve:

- si tiene sumarios: los que coinciden con la búsqueda (hasta 2) y cuántos más tiene;
- si no tiene (18.836 de los 20.245 fallos con texto): un fragmento del fallo donde aparece el término,
  marcado **"Sin sumario"**. Nunca se inventa un resumen.

Después se accede al fallo completo (`/fallo/:id`): datos, todos sus sumarios, texto completo y PDF.
Orden por defecto: con sumario primero; también por fecha o por relevancia.

| Criterio | Regla |
| --- | --- |
| Texto | Busca en tema y texto de los sumarios y en el texto del fallo. "Todas las palabras" o "Alguna". Frase exacta entre comillas |
| Acentos y mayúsculas | No importan (collation `utf8mb4_spanish_ci`) |
| Conectores (de, la, con…) | Se ignoran (misma lista que el sistema anterior) |
| Juzgado | Un organismo incluye a los que dependen de él (salas, secretarías, juzgados agrupados) |
| Fecha | Rango desde/hasta o año |
| Tipo | Sentencias y autos interlocutorios juntos, o uno solo |

La búsqueda vive en la URL (`/buscar?q=...&juzgado=...&pagina=2`): se puede compartir y volver atrás.

## API (`/api/v1`, solo lectura)

| Endpoint | Reemplaza a |
| --- | --- |
| `GET /busqueda?q=&operador=&tipo=&juzgado=&partes=&firmante=&numero=&anio=&desde=&hasta=&orden=&pagina=` | `presentar2.php` + `presentarf2.php` |
| `GET /fallos/:id` | `Fallo.php` + `PresFallo.php` |
| `GET /fallos/:id/pdf` | `imprimefallo.php` |
| `GET /juzgados` (árbol) | el desplegable de tribunales |
| `GET /tipos-resolucion`, `GET /salud` | — |
| `GET /sumarios`, `GET /fallos` | búsquedas separadas de la primera versión (siguen disponibles; el frontend no las usa) |

## Trazabilidad

- Cada solicitud tiene un id (`X-Request-Id`) que aparece en los errores y en el pie de los PDF.
- `backendJurisprudencia/logs/api-AAAA-MM-DD.jsonl`: una línea por solicitud (ruta, parámetros,
  resultados, tiempo). No se registra la IP ni los nombres buscados en "partes" o "firmantes".
- Datos: la migración y la limpieza de texto dejan respaldo y mapa de cada fila en `zz_mig_archivo`
  (`orig_*`, `mapa_fallo`, `mapa_sumario`, `incidencia`, `limpieza_texto`).

## Seguridad

Consultas parametrizadas · usuario de base de solo lectura · límite de solicitudes por minuto ·
cabeceras de seguridad (CSP que permite embeber solo desde `jusformosa.gob.ar`) · el texto se muestra
como texto, nunca como HTML.

## Mantenimiento de datos (`backendJurisprudencia/`)

```bash
npm run limpiar:estado | limpiar:validar | limpiar:aplicar   # entidades HTML en los textos
```
