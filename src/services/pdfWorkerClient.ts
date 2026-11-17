import type { Selection, WorkerResponse, WorkerResult } from '../types/pdf';

export async function processPdfInWorker(
  file: File,
  selections: Selection[],
  baseName: string,
  onProgress: (percent: number) => void,
  signal?: AbortSignal,
): Promise<WorkerResult[]> {
  if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
  const buffer = await file.arrayBuffer();
  if (signal?.aborted) throw new DOMException('Cancelado', 'AbortError');
  return await new Promise<WorkerResult[]>((resolve, reject) => {
    const worker = new Worker(new URL('../workers/pdf.worker.ts', import.meta.url), { type: 'module' });
    let finished = false;
    const cleanup = () => {
      signal?.removeEventListener('abort', abort);
      worker.terminate();
    };
    const abort = () => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new DOMException('Cancelado', 'AbortError'));
    };
    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      if (finished) return;
      if (event.data.type === 'PROGRESS') onProgress(event.data.progress);
      if (event.data.type === 'ERROR') {
        finished = true;
        cleanup();
        reject(new Error(event.data.message));
      }
      if (event.data.type === 'COMPLETE') {
        finished = true;
        cleanup();
        resolve(event.data.outputs);
      }
    };
    worker.onerror = event => {
      if (finished) return;
      finished = true;
      cleanup();
      reject(new Error(event.message || 'Error del proceso de extracción.'));
    };
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) { abort(); return; }
    worker.postMessage({ type: 'PROCESS', buffer, selections, baseName }, [buffer]);
  });
}
