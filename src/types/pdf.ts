export type Selection = {
  kind: 'page' | 'range';
  from: number;
  to: number;
};

export type ParsedSelection = {
  selections: Selection[];
  errors: string[];
  warnings: string[];
};

export type PdfOutput = {
  id: string;
  filename: string;
  pageCount: number;
  byteSize: number;
  blob: Blob;
  selection: Selection;
};

export type WorkerResult = {
  filename: string;
  pageCount: number;
  buffer: ArrayBuffer;
  selection: Selection;
};

export type WorkerRequest = {
  type: 'PROCESS';
  buffer: ArrayBuffer;
  selections: Selection[];
  baseName: string;
};

export type WorkerResponse =
  | { type: 'PROGRESS'; progress: number; completed: number; total: number }
  | { type: 'COMPLETE'; outputs: WorkerResult[] }
  | { type: 'ERROR'; message: string };
