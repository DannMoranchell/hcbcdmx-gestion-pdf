/// <reference lib="webworker" />
import { splitPdf } from '../services/pdfProcessor';
import type { WorkerRequest, WorkerResponse } from '../types/pdf';

const scope = self as DedicatedWorkerGlobalScope;
scope.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  if (event.data.type !== 'PROCESS') return;
  try {
    const { buffer, selections, baseName } = event.data;
    const outputs = await splitPdf(buffer, selections, baseName, (progress, completed, total) => {
      scope.postMessage({ type: 'PROGRESS', progress, completed, total } satisfies WorkerResponse);
    });
    scope.postMessage({ type: 'COMPLETE', outputs } satisfies WorkerResponse, outputs.map(o => o.buffer));
  } catch (error) {
    const message = error instanceof Error ? `${error.name}: ${error.message}` : String(error);
    scope.postMessage({ type: 'ERROR', message } satisfies WorkerResponse);
  }
};
