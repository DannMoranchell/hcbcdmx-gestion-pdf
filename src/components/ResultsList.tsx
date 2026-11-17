import { Archive, CheckCircle2, Download, FileText, LoaderCircle, RotateCcw } from 'lucide-react';
import type { PdfOutput } from '../types/pdf';
import { describeSelection } from '../utils/selection';
import { formatBytes } from '../utils/files';

export default function ResultsList({ outputs, onDownload, onZip, zipping, zipProgress, onReset }: {
  outputs: PdfOutput[];
  onDownload: (output: PdfOutput) => void;
  onZip: () => void;
  zipping: boolean;
  zipProgress: number;
  onReset: () => void;
}) {
  return (
    <section aria-labelledby="results-title" className="panel">
      <div className="panel-heading items-center">
        <div><div className="step-label">PASO 03</div><h2 id="results-title" className="panel-title">Archivos generados</h2><p className="muted mt-1">Descarga cada resultado o todos en un archivo ZIP.</p></div>
        <span className="step-counter">03 / 03</span>
      </div>
      {outputs.length === 0 ? (
        <div className="results-empty mx-5 mb-5 flex flex-col items-center justify-center text-center md:mx-6 md:mb-6"><div className="empty-icon"><Archive size={25} strokeWidth={1.5} /></div><p className="mt-3 text-[14px] font-semibold text-slate-700">Tus documentos aparecerán aquí</p><p className="mt-1 text-[12px] text-slate-400">Genera las extracciones para habilitar las descargas.</p></div>
      ) : (
        <div className="px-5 pb-5 md:px-6 md:pb-6">
          <div className="results-success"><CheckCircle2 size={20} /><div><strong>¡Extracción completada!</strong><p className="mt-0.5 text-[12px] font-normal">Se generaron {outputs.length} archivo(s) PDF correctamente.</p></div></div>
          <div className="mt-4 divide-y divide-slate-100 rounded-xl border border-slate-200">
            {outputs.map(output => (
              <div key={output.id} className="flex flex-wrap items-center gap-3 px-3 py-3.5 sm:flex-nowrap sm:px-4">
                <div className="pdf-file-icon"><FileText size={21} strokeWidth={1.7}/></div>
                <div className="min-w-0 flex-1"><p className="truncate text-[13px] font-semibold text-slate-800" title={output.filename}>{output.filename}</p><p className="mt-0.5 text-[11px] text-slate-500">{describeSelection(output.selection)} · {formatBytes(output.byteSize)}</p></div>
                <button type="button" className="outline-button ml-auto sm:ml-0" onClick={() => onDownload(output)} aria-label={`Descargar ${output.filename}`}><Download size={15}/> <span className="hidden sm:inline">Descargar</span></button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="button" className="text-action" onClick={onReset} disabled={zipping}><RotateCcw size={14} /> Limpiar resultados</button>
            <button type="button" className="primary-button" onClick={onZip} disabled={zipping}>
              {zipping ? <LoaderCircle size={17} className="animate-spin"/> : <Archive size={17}/>} {zipping ? `Preparando ZIP (${zipProgress}%)` : 'Descargar todos en ZIP'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
