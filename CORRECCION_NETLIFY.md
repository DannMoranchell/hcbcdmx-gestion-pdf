# Parche de compilación de Netlify — HCBCDMX

Resuelve los errores observados:
- TS6133: iconos importados sin utilizar en la versión de AppShell.tsx que está en GitHub.
- TS2353: opción isEvalSupported no reconocida por los tipos instalados de PDF.js.

## Aplicación

1. Extrae este ZIP.
2. Copia los archivos `src/layouts/AppShell.tsx` y `src/services/pdfPreview.ts` dentro de la carpeta de tu proyecto local, respetando las rutas y reemplazando los existentes.
3. Si habías personalizado AppShell.tsx, en vez de reemplazarlo, conserva tus cambios y elimina sólo los iconos no usados de su `import` original.
4. Abre una terminal en la raíz del proyecto y ejecuta `npm install`, `npm run test` y `npm run build`.
5. Si los comandos terminan correctamente, ejecuta `git add src/layouts/AppShell.tsx src/services/pdfPreview.ts && git commit -m "Corregir errores TypeScript en Netlify" && git push`.
6. Revisa el nuevo deploy en Netlify.

Nota: esta corrección fue revisada contra los cuatro errores compartidos, pero no se verificó la compilación completa de npm por imposibilidad de descargar dependencias en el entorno de preparación.
