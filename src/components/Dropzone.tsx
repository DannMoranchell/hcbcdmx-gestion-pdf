import { useRef, useState } from 'react';
import { ArrowUpFromLine, FileUp, LockKeyhole, FileCheck2 } from 'lucide-react';
import { formatBytes, MAX_FILE_BYTES, WARNING_FILE_BYTES } from '../utils/files';

interface Props {
  file: File | null;
  totalPages?: number;
  busy: boolean;
  onFile: (file: File) => void;
  onClear: () => void;
}

export default function Dropzone({ file, totalPages, busy, onFile, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  return (
    <section className="panel overflow-hidden" aria-labelledby="load-title">
      <div className="panel-heading">
        <div>
          <div className="step-label">PASO 01</div>
          <h2 id="load-title" className="panel-title">Cargar documento</h2>
          <p className="muted mt-1">Elige el archivo PDF que deseas trabajar.</p>
        </div>
        <span className="step-counter">01 / 03</span>
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <input
          ref={inputRef}
          aria-label="Elegir archivo PDF"
          className="sr-only"
          type="file"
          accept=".pdf,application/pdf"
          disabled={busy}
          onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }}
        />
        {file ? (
          <div className="uploaded-file">
            <div className="uploaded-icon"><FileCheck2 size={27} strokeWidth={1.7} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[14px] font-semibold text-slate-800" title={file.name}>{file.name}</div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-slate-500">
                <span>{formatBytes(file.size)}</span><span aria-hidden="true">•</span>
                <span>{totalPages ? `${totalPages} páginas` : 'Leyendo páginas…'}</span>
              </div>
            </div>
            <button type="button" className="outline-button shrink-0" disabled={busy} onClick={() => inputRef.current?.click()}>Cambiar</button>
          </div>
        ) : (
          <div
            role="button"
            tabIndex={busy ? -1 : 0}
            aria-label="Arrastra un PDF aquí o haz clic para seleccionarlo"
            onClick={() => { if (!busy) inputRef.current?.click(); }}
            onKeyDown={e => { if ((e.key === 'Enter' || e.key === ' ') && !busy) { e.preventDefault(); inputRef.current?.click(); } }}
            onDragEnter={e => { e.preventDefault(); setDrag(true); }}
            onDragOver={e => e.preventDefault()}
            onDragLeave={e => { e.preventDefault(); setDrag(false); }}
            onDrop={e => { e.preventDefault(); setDrag(false); if (!busy && e.dataTransfer.files[0]) onFile(e.dataTransfer.files[0]); }}
            className={`drop-surface ${drag ? 'drop-surface-active' : ''} ${busy ? 'opacity-60' : 'cursor-pointer'}`}
          >
            <div className="drop-icon"><FileUp size={28} strokeWidth={1.5} /></div>
            <p className="mt-4 text-[15px] font-semibold text-slate-800">Arrastra tu PDF aquí</p>
            <p className="mt-1 text-[13px] text-slate-500">o haz clic para buscar en tu equipo</p>
            <span className="browse-button"><ArrowUpFromLine size={15} /> Seleccionar archivo</span>
            <p className="mt-4 text-[11px] text-slate-400">Únicamente archivos PDF · Máximo {formatBytes(MAX_FILE_BYTES)}</p>
          </div>
        )}
        {file && file.size > WARNING_FILE_BYTES && (
          <p className="mt-3 text-[12px] text-amber-700">Archivo grande (más de 200 MB): su apertura y extracción pueden consumir varios GB de memoria. Si el navegador se detiene, utiliza un equipo con más RAM o una herramienta de escritorio autorizada.</p>
        )}
        <div className="privacy-inline mt-4"><LockKeyhole size={14} /><span>Tu documento permanece en este dispositivo.</span></div>
        {file && <button type="button" className="text-action mt-3" onClick={onClear} disabled={busy}>Quitar documento y limpiar resultados</button>}
      </div>
    </section>
  );
}
