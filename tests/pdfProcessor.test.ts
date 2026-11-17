import { describe, it, expect } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';
import { readFile } from 'node:fs/promises';
import { splitPdf } from '../src/services/pdfProcessor';
import { parseSelections } from '../src/utils/selection';

async function sample(pageCount: number): Promise<ArrayBuffer> {
  const document = await PDFDocument.create();
  for (let i = 0; i < pageCount; i++) {
    const page = document.addPage([400 + i, 600]);
    page.drawText(`PAGINA_${i + 1}`, { x: 32, y: 300 });
  }
  const bytes = await document.save();
  return new Uint8Array(bytes).buffer;
}

describe('extracción de PDF reales en memoria', () => {
  it('genera seis PDF válidos con exactamente las páginas solicitadas', async () => {
    const choices = parseSelections('4, 7, 9, 23-45, 60, 70-75', 100).selections;
    const outputs = await splitPdf(await sample(100), choices, '');
    expect(outputs).toHaveLength(6);
    expect(outputs.map(x => x.filename)).toEqual([
      'pagina_0004.pdf', 'pagina_0007.pdf', 'pagina_0009.pdf',
      'paginas_0023-0045.pdf', 'pagina_0060.pdf', 'paginas_0070-0075.pdf',
    ]);
    const expected = [1, 1, 1, 23, 1, 6];
    for (let i = 0; i < outputs.length; i++) {
      const pdf = await PDFDocument.load(outputs[i]!.buffer);
      expect(pdf.getPageCount()).toBe(expected[i]);
      const sourcePage = choices[i]!.from;
      for (let pageNumber = 0; pageNumber < pdf.getPageCount(); pageNumber++) {
        // Cada página original tiene un ancho único: valida páginas exactas y su orden.
        expect(pdf.getPage(pageNumber).getWidth()).toBe(400 + sourcePage - 1 + pageNumber);
      }
    }
  });
  it('mantiene los rangos inclusivos y no crea archivos vacíos', async () => {
    const outputs = await splitPdf(await sample(8), parseSelections('3-5,8', 8).selections, 'prueba');
    expect(outputs.map(o => o.pageCount)).toEqual([3, 1]);
    expect(outputs.every(o => o.buffer.byteLength > 0)).toBe(true);
  });
  it('genera PDF válido si el original tiene una página', async () => {
    const outputs = await splitPdf(await sample(1), parseSelections('1', 1).selections, '');
    expect((await PDFDocument.load(outputs[0]!.buffer)).getPageCount()).toBe(1);
  });
  it('rechaza extracciones fuera de rango y archivos corruptos', async () => {
    await expect(splitPdf(await sample(2), [{ kind: 'page', from: 10, to: 10 }], '')).rejects.toThrow();
    await expect(splitPdf(new ArrayBuffer(8), [{ kind: 'page', from: 1, to: 1 }], '')).rejects.toThrow();
  });
  it('rechaza un PDF real cifrado con contraseña', async () => {
    const encrypted = await readFile(new URL('./fixtures/encrypted.pdf', import.meta.url));
    const bytes = new Uint8Array(encrypted).buffer;
    await expect(splitPdf(bytes, [{ kind: 'page', from: 1, to: 1 }], '')).rejects.toThrow(/encrypted|password|encryption/i);
  });
  it('genera un ZIP legible con los PDF resultantes', async () => {
    const outputs = await splitPdf(await sample(5), parseSelections('1,3-5', 5).selections, '');
    const zip = new JSZip();
    for (const output of outputs) zip.file(output.filename, output.buffer);
    const binary = await zip.generateAsync({ type: 'uint8array' });
    const unzipped = await JSZip.loadAsync(binary);
    const names = Object.keys(unzipped.files);
    expect(names).toEqual(['pagina_0001.pdf', 'paginas_0003-0005.pdf']);
    const bytes = await unzipped.file('paginas_0003-0005.pdf')!.async('uint8array');
    expect((await PDFDocument.load(bytes)).getPageCount()).toBe(3);
  });
});
