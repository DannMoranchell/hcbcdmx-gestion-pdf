import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Expand, Image as ImageIcon, X } from 'lucide-react';
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist';

const PER_PAGE = 8;

function Thumbnail({ document, number, selected, onToggle, onZoom }: {
  document: PDFDocumentProxy;
  number: number;
  selected: boolean;
  onToggle: () => void;
  onZoom: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    let active = true;
    let render: ReturnType<PDFPageProxy['render']> | null = null;
    let page: PDFPageProxy | null = null;
    setFailed(false);
    const run = async () => {
      try {
        page = await document.getPage(number);
        if (!active) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const viewport = page.getViewport({ scale: 1 });
        const scale = 152 / viewport.width;
        const scaled = page.getViewport({ scale: scale * 1.5 });
        canvas.width = Math.floor(scaled.width);
        canvas.height = Math.floor(scaled.height);
        canvas.style.width = `${scaled.width / 1.5}px`;
        canvas.style.height = `${scaled.height / 1.5}px`;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        render = page.render({ canvasContext: ctx, viewport: scaled, canvas });
        await render.promise;
      } catch (err) {
        if (active && !(err instanceof Error && err.name === 'RenderingCancelledException')) setFailed(true);
      } finally {
        if (active) page?.cleanup();
      }
    };
    void run();
    return () => { active = false; render?.cancel(); page?.cleanup(); };
  }, [document, number]);

  return (
    <div className={`thumb-tile ${selected ? 'thumb-selected' : ''}`}>
      <button type="button" aria-pressed={selected} aria-label={`Seleccionar página ${number}`} onClick={onToggle} className="thumb-select">
        <div className="thumb-paper">
          {failed ? <ImageIcon className="text-slate-300" size={25} /> : <canvas ref={canvasRef} aria-hidden="true" />}
          <span className="thumb-check" aria-hidden="true">{selected ? '✓' : ''}</span>
        </div>
        <span className="thumb-label">Página {number}</span>
      </button>
      <button type="button" aria-label={`Ampliar página ${number}`} title="Ampliar" className="thumb-zoom" onClick={onZoom}><Expand size={14} /></button>
    </div>
  );
}

function ZoomDialog({ document, number, onClose }: { document: PDFDocumentProxy; number: number; onClose: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    closeRef.current?.focus();
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    documentRef.addEventListener('keydown', handleEscape);
    let active = true;
    let page: PDFPageProxy | null = null;
    let render: ReturnType<PDFPageProxy['render']> | null = null;
    const run = async () => {
      try {
        page = await document.getPage(number);
        const canvas = canvasRef.current;
        if (!active || !canvas) return;
        const original = page.getViewport({ scale: 1 });
        const cssWidth = Math.min(window.innerWidth - 56, 680);
        const scaled = page.getViewport({ scale: (cssWidth / original.width) * Math.min(window.devicePixelRatio || 1, 2) });
        canvas.width = scaled.width;
        canvas.height = scaled.height;
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${scaled.height / Math.min(window.devicePixelRatio || 1, 2)}px`;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;
        render = page.render({ canvas, canvasContext: ctx, viewport: scaled });
        await render.promise;
      } catch { /* A failed preview does not affect extraction. */ }
      finally { if (active) page?.cleanup(); }
    };
    void run();
    return () => { active = false; render?.cancel(); page?.cleanup(); documentRef.removeEventListener('keydown', handleEscape); };
  }, [document, number, onClose]);
  return (
    <div role="presentation" className="modal-backdrop" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={`Vista previa ampliada de página ${number}`} className="preview-dialog" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><span className="font-semibold text-slate-800">Vista previa · Página {number}</span><button ref={closeRef} type="button" onClick={onClose} className="icon-button" aria-label="Cerrar"><X size={19} /></button></div>
        <div className="preview-scroll"><canvas ref={canvasRef} className="mx-auto bg-white shadow-xl" /></div>
      </div>
    </div>
  );
}
const documentRef = globalThis.document;

export default function PageGallery({ document, selectedPages, onToggle, onAddSelection }: {
  document: PDFDocumentProxy | null;
  selectedPages: number[];
  onToggle: (page: number) => void;
  onAddSelection: () => void;
}) {
  const [page, setPage] = useState(0);
  const [zoomed, setZoomed] = useState<number | null>(null);
  useEffect(() => { setPage(0); setZoomed(null); }, [document]);
  const total = document?.numPages ?? 0;
  const pages = Math.ceil(total / PER_PAGE);
  const shown = Array.from({ length: Math.min(PER_PAGE, Math.max(0, total - page * PER_PAGE)) }, (_, i) => page * PER_PAGE + i + 1);
  return (
    <section className="panel flex h-full flex-col" aria-labelledby="preview-title">
      <div className="panel-heading">
        <div><div className="step-label">VISTA DEL DOCUMENTO</div><h2 id="preview-title" className="panel-title">Previsualización</h2><p className="muted mt-1">Selecciona páginas o amplía para revisar.</p></div>
        <span className="small-pill">{total} pág.</span>
      </div>
      <div className="flex flex-1 flex-col px-5 pb-5 md:px-6 md:pb-6">
        {!document ? (
          <div className="preview-empty flex flex-1 flex-col items-center justify-center text-center"><div className="empty-icon"><ImageIcon size={26} strokeWidth={1.5} /></div><p className="mt-4 text-[14px] font-semibold text-slate-700">Aún no hay páginas para mostrar</p><p className="mt-1 max-w-64 text-[12px] text-slate-400">Carga un PDF para ver sus miniaturas y seleccionar páginas visualmente.</p></div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{shown.map(n => <Thumbnail key={`${document.fingerprints[0]}-${n}`} document={document} number={n} selected={selectedPages.includes(n)} onToggle={() => onToggle(n)} onZoom={() => setZoomed(n)} />)}</div>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-5">
              <span className="text-[12px] text-slate-500">{selectedPages.length} seleccionada(s)</span>
              <div className="flex items-center gap-2"><button type="button" onClick={() => setPage(v => v - 1)} disabled={page === 0} className="icon-button" aria-label="Páginas anteriores"><ChevronLeft size={17}/></button><span className="min-w-14 text-center text-[12px] text-slate-600">{page + 1} / {pages}</span><button type="button" onClick={() => setPage(v => v + 1)} disabled={page + 1 >= pages} className="icon-button" aria-label="Páginas siguientes"><ChevronRight size={17} /></button></div>
            </div>
            <button type="button" onClick={onAddSelection} disabled={!selectedPages.length} className="outline-button mt-4 w-full justify-center">Agregar páginas seleccionadas a la extracción</button>
          </>
        )}
      </div>
      {document && zoomed != null && <ZoomDialog document={document} number={zoomed} onClose={() => setZoomed(null)} />}
    </section>
  );
}
