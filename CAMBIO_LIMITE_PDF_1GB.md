# Actualización: aceptar archivos PDF de hasta 1 GB

Esta actualización elimina el antiguo límite de 200 MB en la aplicación y acepta PDF de hasta 1 GB (1,024 MiB). **No convierte al navegador en un procesador ilimitado**: abrir, extraer y comprimir PDF grandes puede requerir varios gigabytes de RAM.

## Archivos modificados

- `src/utils/files.ts`: nuevo tamaño máximo 1 GB, advertencia desde 200 MB, formato GB y error de memoria más claro.
- `src/components/Dropzone.tsx`: límite y advertencia actualizados.
- `README.md`: documentación de operación con PDFs grandes.
- `tests/files.test.ts`: pruebas de la admisión de archivos mayores a 200 MB sin asignar esa cantidad de RAM en las pruebas.

## Instalación en proyecto que ya está en GitHub

1. Copiar los archivos modificados a sus mismas ubicaciones dentro de la carpeta existente del proyecto. No reemplazar una personalización si difiere: integrar los cambios.
2. En terminal, desde la carpeta raíz del repositorio:

```bash
npm install
npm run test
npm run build
git add .
git commit -m "Permitir PDF de hasta 1 GB"
git push
```

3. Abrir Netlify → Deploys y esperar a que el nuevo despliegue de GitHub termine correctamente.
4. Actualizar la página con recarga completa y hacer una prueba con un PDF de prueba de 250–300 MB.

## Límites reales

- No se sube el PDF al servidor de Netlify. Se maneja localmente.
- El límite de 1 GB es una validación de entrada; no garantiza poder procesar esa cantidad de datos.
- PDF.js y pdf-lib pueden conservar varias representaciones del PDF en memoria, y los resultados/ZIP requieren memoria adicional. Puede fallar antes de alcanzar 1 GB.
- Si se requiere manejar PDFs de varios GB con fiabilidad, es mejor una solución de escritorio o procesamiento por lotes, aprobada por el área de TI.
