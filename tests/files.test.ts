import { describe, expect, it } from 'vitest';
import { formatBytes, MAX_FILE_BYTES, validatePdfFile, WARNING_FILE_BYTES } from '../src/utils/files';

/** Simula la propiedad size sin reservar cientos de megabytes para el test. */
function mockFile(size: number, header = '%PDF-1.7\n', name = 'documento.pdf'): File {
  return {
    name,
    type: 'application/pdf',
    size,
    slice: () => new Blob([header]),
  } as unknown as File;
}

describe('validación de tamaño de PDFs grandes', () => {
  it('acepta archivos superiores a 200 MB (ej. 250 MB)', async () => {
    expect(WARNING_FILE_BYTES).toBe(200 * 1024 * 1024);
    await expect(validatePdfFile(mockFile(250 * 1024 * 1024))).resolves.toBeUndefined();
  });

  it('acepta exactamente 1 GB y rechaza cualquier tamaño mayor', async () => {
    expect(MAX_FILE_BYTES).toBe(1024 * 1024 * 1024);
    await expect(validatePdfFile(mockFile(MAX_FILE_BYTES))).resolves.toBeUndefined();
    await expect(validatePdfFile(mockFile(MAX_FILE_BYTES + 1))).rejects.toThrow(/1\.00 GB/);
  });

  it('no acepta un archivo sin cabecera PDF aunque esté dentro del tamaño permitido', async () => {
    await expect(validatePdfFile(mockFile(250 * 1024 * 1024, 'NO-PDF'))).rejects.toThrow(/cabecera PDF/);
  });

  it('muestra correctamente MB y GB', () => {
    expect(formatBytes(250 * 1024 * 1024)).toBe('250.0 MB');
    expect(formatBytes(MAX_FILE_BYTES)).toBe('1.00 GB');
  });
});
