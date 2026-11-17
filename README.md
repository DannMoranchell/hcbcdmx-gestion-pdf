# Sistema Institucional de Gestión de Documentos PDF

**Heroico Cuerpo de Bomberos de la Ciudad de México — Primera versión funcional (1.0)**

Proyecto web en español, construido con **React + TypeScript + Vite + Tailwind CSS**, orientado a la **división y extracción local** de documentos PDF desde varias computadoras. Se entrega como base técnica sujeta a la revisión y autorización del área institucional de tecnologías, seguridad y comunicación gráfica.

> **Aviso importante:** este repositorio no constituye un servicio oficial aprobado por la institución ni incluye su escudo. El sitio publicado por Netlify **no es privado por defecto**. No cargar documentos institucionales sensibles en una instancia pública que no haya sido aprobada por TI.

## Funciones realmente implementadas

- Selección de archivos PDF o arrastrar y soltar.
- Verificación de la cabecera PDF, tamaño (máximo 1 GB; advertencia a partir de 200 MB), archivo ilegible o protegido por contraseña.
- Lectura del número de páginas y previsualización **paginada de 8 miniaturas**, con ampliación.
- Selección visual de páginas y transferencia al campo de extracción.
- Extracción de páginas sueltas: `4, 7, 9, 45, 60` -> cinco PDF independientes.
- Extracción de rangos: `23-45, 70-75` -> dos PDF independientes de 23 y 6 páginas.
- Extracción combinada: `4, 7, 9, 23-45, 60, 70-75` -> seis PDF independientes.
- Validaciones de sintaxis, cero/negativos, rangos invertidos, páginas inexistentes, selecciones vacías y duplicados.
- Duplicados *exactos* se omiten con advertencia; las selecciones diferentes que se superponen **se conservan** con otra advertencia.
- Nombre base opcional, nombres automáticos con ceros (`pagina_0004.pdf`, `paginas_0023-0045.pdf`).
- Generación dentro de un **Web Worker** para aislar el cálculo de la interfaz, progreso y cancelación.
- Descarga individual y descarga de todos los resultados en un único **ZIP**.
- Limpieza de archivos, salidas y estado sin persistir PDF en el almacenamiento del navegador.
- Interfaz adaptable a móvil, tablet y escritorio, con indicador de estado y navegación.

Los módulos de **Unir PDF**, **Organizar páginas** y **Herramientas PDF** aparecen expresamente como **próximamente**; no contienen controles simulados.

## Archivos PDF grandes (hasta 1 GB)

- Se aumentó el límite de carga del navegador de **200 MB a 1 GB**. Para PDFs de más de 200 MB se muestra una advertencia de consumo de memoria.
- **Netlify no recibe esos PDF**: el archivo se abre y procesa localmente. El límite depende del código del frontend, no del alojamiento web.
- PDF.js lee el documento para obtener las páginas y `pdf-lib` lo vuelve a abrir en un Web Worker durante la extracción. El consumo de RAM puede superar ampliamente el tamaño del archivo.
- Incluso un archivo inferior a 1 GB puede fallar si la RAM disponible es insuficiente, tiene muchas imágenes, una estructura compleja o se solicitan numerosas extracciones.
- Para documentos especialmente pesados, conviene descargar los resultados uno por uno y evitar generar archivos ZIP enormes. Si el navegador se detiene, usar una herramienta de escritorio aprobada por TI.
- Tras cambiar el límite, ejecutar `npm run test` y `npm run build`, subir los cambios a GitHub y dejar que Netlify vuelva a desplegar.

## Requisitos

- Node.js **20.19+** (recomendado Node 22 LTS) y npm.
- Navegador moderno con soporte para ECMAScript modules, Web Workers y Canvas.
- Conexión a Internet **solo para instalar las dependencias o descargar la página**. Después de abrir la aplicación, el procesamiento de PDF no requiere APIs externas. La aplicación **no es una PWA sin conexión** y por tanto el sitio en sí puede necesitar conexión para abrirse.

## Instalación y uso local

```bash
npm install
npm run dev
```

En el terminal se imprimirá una URL local (normalmente `http://localhost:5173`). Abre la URL en Chrome, Edge, Firefox o Safari actualizado.

1. Pulsa **Seleccionar archivo PDF** o arrástralo al recuadro.
2. Espera a que aparezca el total de páginas. Puedes revisar la vista previa y marcar algunas miniaturas.
3. Escribe `4, 7, 9, 23-45, 60, 70-75` (si el archivo tiene al menos 75 páginas) o agrega las miniaturas marcadas.
4. Opcionalmente escribe el nombre base del expediente.
5. Pulsa **Generar archivos PDF**.
6. Descarga un archivo específico o pulsa **Descargar todos en ZIP**.

**Nota:** `23-45` es un único documento con todas las páginas, en orden, desde la 23 hasta la 45 inclusive. No genera 23 PDF individuales.

## Compilación y pruebas

```bash
npm run test
npm run build
npm run preview
```

- `npm run test` ejecuta pruebas Vitest de sintaxis de selecciones, rangos, duplicados, archivo de una página, documento generado con `pdf-lib`, integridad de resultados y ZIP.
- `npm run build` ejecuta verificación de tipos con TypeScript y construye la versión distribuible `dist/`.
- `npm run preview` permite revisar la versión de producción antes de publicar.

### Prueba de aceptación obligatoria

Con un PDF de 100 páginas, usa:

```text
4, 7, 9, 23-45, 60, 70-75
```

Se deben obtener exactamente:

| Archivo | Páginas del original | Total de páginas del resultado |
| --- | --- | ---: |
| `pagina_0004.pdf` | 4 | 1 |
| `pagina_0007.pdf` | 7 | 1 |
| `pagina_0009.pdf` | 9 | 1 |
| `paginas_0023-0045.pdf` | 23 a 45 | 23 |
| `pagina_0060.pdf` | 60 | 1 |
| `paginas_0070-0075.pdf` | 70 a 75 | 6 |

Verifica adicionalmente que cada PDF abre correctamente, y que el ZIP tiene los seis archivos.

**Limitación del entorno de preparación de este paquete:** no fue posible descargar dependencias npm porque el entorno que generó el proyecto no tenía resolución DNS hacia `registry.npmjs.org`. Por lo tanto, los comandos de compilación y Vitest quedan preparados, pero **no se afirma que hayan pasado** sin ejecutarlos en un equipo con npm disponible. Se verificó la sintaxis de los archivos TypeScript y se ejecutaron pruebas de las funciones puras de selección.

## Etapas de desarrollo y archivos responsables

| Etapa | Estado | Archivos principales |
| --- | --- | --- |
| 1. Arquitectura | Incluida | `src/types/pdf.ts`, `src/services/`, `src/utils/`, `src/workers/`, `tsconfig*.json` |
| 2. Interfaz institucional | Incluida | `src/App.tsx`, `src/layouts/AppShell.tsx`, `src/styles.css` |
| 3. Carga y vista previa | Incluida | `src/components/Dropzone.tsx`, `src/components/PageGallery.tsx`, `src/hooks/usePdfDocument.ts`, `src/services/pdfPreview.ts` |
| 4. Extracción individual, rangos y combinada | Incluida | `src/components/SelectionEditor.tsx`, `src/utils/selection.ts`, `src/services/pdfProcessor.ts`, `src/workers/pdf.worker.ts` |
| 5. Descargas y ZIP | Incluida | `src/components/ResultsList.tsx`, `src/utils/files.ts` |
| 6. Validaciones y pruebas | Incluidas, pendientes de ejecutar tras instalar npm | `tests/`, `src/utils/selection.ts`, `src/utils/files.ts` |
| 7. Publicación en Netlify | Configurada, pendiente de publicar/autorización | `netlify.toml`, `vite.config.ts`, `package.json`, `README.md` |

No se ha publicado una instancia real ni se afirma que se haya autorizado el sistema para uso productivo.

## Publicar en Netlify

1. Crea un repositorio Git **privado** administrado por la institución y coloca ahí el contenido de este proyecto (sin `node_modules` ni documentos PDF reales).
2. Ejecuta `npm install`, `npm run test` y `npm run build` en tu equipo o en el proceso CI.
3. En Netlify, selecciona **Add new project → Import an existing project** y vincula el repositorio.
4. La configuración ya está incluida en `netlify.toml`: `command = "npm run build"` y `publish = "dist"`.
5. Despliega una **instancia de pruebas** sin documentos sensibles y comprueba el ejemplo de aceptación.
6. **Antes de habilitar acceso de personal institucional**, solicita al área de TI los controles de acceso/autenticación, dominio, HTTPS, revisión de dependencias, responsable del servicio y autorización de uso de datos.

El archivo `netlify.toml` incluye redirección de página única (SPA) y encabezados defensivos, incluyendo CSP, `X-Frame-Options`, `Permissions-Policy` y `Referrer-Policy`.

**No** se usan Netlify Functions, base de datos, servicios externos ni endpoints que reciban archivos PDF. La aplicación es un sitio estático sin autenticación incorporada.

## Estructura del proyecto

```text
hcbcdmx-gestion-pdf/
├── index.html
├── netlify.toml
├── vite.config.ts
├── package.json
├── tsconfig*.json
├── public/
│   └── favicon.svg           # símbolo genérico; NO es el escudo oficial
├── src/
│   ├── assets/               # reservado para recursos autorizados
│   ├── components/           # carga, editor, visor y descargas
│   ├── hooks/                # lectura de PDF.js con limpieza
│   ├── layouts/              # navegación y estructura visual
│   ├── pages/                # reservado para ampliaciones futuras
│   ├── services/             # pdf-lib, PDF.js, comunicación con worker
│   ├── types/                # tipos de selecciones, PDF y mensajes
│   ├── utils/                # validaciones, nombres, ZIP y descargas
│   ├── workers/              # procesamiento en segundo hilo del navegador
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── tests/
│   ├── selections.test.ts
│   └── pdfProcessor.test.ts
└── README.md
```

## Protección de datos y controles de seguridad

- El archivo se selecciona localmente con la API File del navegador y se pasa a PDF.js para previsualizar; no se efectúa ningún `fetch` externo.
- Para extraer, el archivo pasa a un Web Worker local que utiliza `pdf-lib`; los resultados se transfieren a la página y son accesibles para descarga.
- Los archivos **no** se escriben en `localStorage`, `sessionStorage` ni IndexedDB; no se utilizan cookies de sesión ni analíticas en esta versión.
- Se limita el número de archivos de salida por ejecución a 200 y el tamaño del PDF de origen a 1 GB (1,024 MiB). Se muestran advertencias por encima de 200 MB. Este límite de carga **no garantiza** que el navegador pueda abrir, procesar o comprimir documentos de ese tamaño; la memoria necesaria puede ser varias veces el tamaño del PDF y depende de su contenido.
- La previsualización renderiza solo ocho páginas por lote; un documento muy extenso puede seguir demandando mucha memoria por su estructura interna.
- La cancelación termina el Web Worker; salir o refrescar la página elimina los resultados en memoria, salvo copias que el usuario haya descargado.
- La eliminación del archivo dentro del sitio no borra el PDF original del dispositivo ni los archivos ya descargados.
- Los PDF con contraseña deben abrirse y guardarse de forma **autorizada** sin protección antes de intentar dividirlos.
- Procesamiento local **no equivale** a control de acceso. TI debe evaluar una solución como un gateway de acceso con SSO corporativo, un alojamiento privado o una intranet aprobada.
- La configuración CSP limita fuentes de scripts, workers y conexiones externas, pero las políticas deben probarse con el entorno real.
- Se recomienda análisis de dependencias, revisión de seguridad, pruebas con formatos de PDF reales y una política de actualización de bibliotecas antes de operar en producción.
- **No agregar el escudo oficial** hasta contar con autorización institucional y un recurso de identidad aprobado.

## Ampliaciones posteriores

La estructura admite nuevos servicios para unir PDF, eliminar/reordenar/rotar páginas, generar varios formatos de salida y agregar controles de acceso institucional. Estas funciones no se anuncian como terminadas en esta entrega.

---

**Destinatarios:** equipos de sistemas y usuarios administrativos autorizados. **Estado:** primera versión funcional del código, pendiente de instalación de dependencias, pruebas en navegador y revisión institucional antes del despliegue de producción.
