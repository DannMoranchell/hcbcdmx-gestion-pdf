import { PDFDocument } from 'pdf-lib';
import type { Selection, WorkerResult } from '../types/pdf';
import { selectionFilename } from '../utils/selection';

/** Se ejecuta dentro de un Web Worker: el PDF nunca sale del navegador. */
export async function splitPdf(
  original: ArrayBuffer,
  selections: Selection[],
  baseName: string,
  onProgress?: (progress: number, completed: number, total: number) => void,
): Promise<WorkerResult[]> {
  const source = await PDFDocument.load(original, { updateMetadata: false });
  const count = source.getPageCount();
  const outputs: WorkerResult[] = [];
  for (let i = 0; i < selections.length; i++) {
    const selection = selections[i]!;
    if (selection.from < 1 || selection.from > selection.to || selection.to > count) {
      throw new Error(`La selección ${selection.from}-${selection.to} no existe en el documento.`);
    }
    const target = await PDFDocument.create();
    const indices = Array.from({ length: selection.to - selection.from + 1 }, (_, j) => selection.from - 1 + j);
    const copied = await target.copyPages(source, indices);
    for (const page of copied) target.addPage(page);
    const bytes = await target.save();
    const buffer = new Uint8Array(bytes).buffer;
    outputs.push({
      filename: selectionFilename(selection, baseName),
      pageCount: copied.length,
      selection,
      buffer,
    });
    onProgress?.(Math.round(((i + 1) / selections.length) * 100), i + 1, selections.length);
  }
  return outputs;
}
