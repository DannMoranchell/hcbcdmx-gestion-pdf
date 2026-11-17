import JSZip from 'jszip';
import type { PdfOutput } from '../types/pdf';
import { sanitizeBaseName } from './selection';

// Límite de admisión del archivo, no garantía de que cualquier equipo pueda procesarlo.
// 1 GiB; los PDF muy complejos pueden agotar la memoria incluso por debajo de este umbral.
export const MAX_FILE_BYTES = 1024 * 1024 * 1024;
export const WARNING_FILE_BYTES = 200 * 1024 * 1024;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function validatePdfFile(file: File): Promise<void> {
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(`El archivo supera el límite de ${formatBytes(MAX_FILE_BYTES)} establecido en esta versión. Para documentos mayores se requiere otro método de procesamiento.`);
  }
  if (file.size < 8) throw new Error('El archivo está vacío o no es un PDF válido.');
  if (!/\.pdf$/i.test(file.name) && file.type !== 'application/pdf') {
    throw new Error('Selecciona un archivo con formato PDF.');
  }
  const header = new TextDecoder('latin1').decode(await file.slice(0, 1024).arrayBuffer());
  if (!header.includes('%PDF-')) {
    throw new Error('El archivo no tiene una cabecera PDF válida.');
  }
}

export function readablePdfError(error: unknown): string {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  if (/password|encrypted|encryption|contraseñ/i.test(text)) {
    return 'El documento está protegido con contraseña o cifrado. Utiliza una copia PDF autorizada sin protección.';
  }
  if (/abort/i.test(text)) return 'Operación cancelada.';
  if (/memory|allocation|arraybuffer|out of memory/i.test(text)) {
    return 'No hay suficiente memoria disponible para procesar este PDF. Cierra otras pestañas, prueba otro equipo o divide el archivo con una herramienta de escritorio autorizada.';
  }
  if (/invalid|corrupt|parse|missing|format|header|xref|unexpected|syntax/i.test(text)) {
    return 'No fue posible abrir el PDF. El archivo podría estar dañado o tener un formato no compatible.';
  }
  return 'No fue posible procesar el archivo. Comprueba que sea un PDF válido e inténtalo nuevamente.';
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 20_000);
}

export async function createZip(outputs: PdfOutput[], baseName: string, onProgress?: (progress: number) => void): Promise<{ blob: Blob; filename: string }> {
  if (!outputs.length) throw new Error('No hay documentos para comprimir.');
  const zip = new JSZip();
  for (const output of outputs) zip.file(output.filename, output.blob);
  const bytes = await zip.generateAsync(
    { type: 'uint8array', compression: 'DEFLATE', compressionOptions: { level: 3 } },
    metadata => onProgress?.(Math.round(metadata.percent)),
  );
  const safeBytes = new Uint8Array(bytes);
  return {
    blob: new Blob([safeBytes], { type: 'application/zip' }),
    filename: `${sanitizeBaseName(baseName) || 'documentos_extraidos'}_pdf.zip`,
  };
}
