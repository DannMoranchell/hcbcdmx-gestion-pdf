import { AlertCircle, AlertTriangle, ArrowRight, CheckCheck, LoaderCircle, Scissors } from 'lucide-react';
import type { ParsedSelection } from '../types/pdf';

export default function SelectionEditor({ value, onChange, baseName, onBaseName, parsed, pageCount, processing, percent, onProcess, onCancel }: {
  value: string;
  onChange: (value: string) => void;
  baseName: string;
  onBaseName: (value: string) => void;
  parsed: ParsedSelection;
  pageCount: number;
  processing: boolean;
  percent: number;
  onProcess: () => void;
  onCancel: () => void;
}) {
  const canRun = pageCount > 0 && !parsed.errors.length && parsed.selections.length > 0 && !processing;
  return (
    <section className="panel" aria-labelledby="selection-title">
      <div className="panel-heading">
        <div><div className="step-label">PASO 02</div><h2 id="selection-title" className="panel-title">Configurar extracción</h2><p className="muted mt-1">Una página o rango = un archivo independiente.</p></div>
        <span className="step-counter">02 / 03</span>
      </div>
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        <label htmlFor="page-selections" className="field-label">Páginas y rangos</label>
        <textarea id="page-selections" rows={3} className="field-input resize-y leading-relaxed" value={value} onChange={e => onChange(e.target.value)} disabled={processing} placeholder="Ej. 4, 7, 9, 23-45, 60, 70-75" spellCheck={false} aria-describedby="selection-help" />
        <p id="selection-help" className="mt-2 text-[12px] leading-relaxed text-slate-500">Separa con comas. Los rangos incluyen ambos extremos: <span className="font-semibold text-slate-700">23-45</span> crea un PDF de 23 páginas.</p>
        {pageCount > 0 && <div className="mt-3 flex items-center gap-2 text-[12px] text-slate-500"><CheckCheck size={14} className="text-emerald-600" /> Documento con {pageCount} páginas disponible.</div>}
        {value.trim() && parsed.errors.map((message, i) => <p key={`err${i}`} role="alert" className="notice-error mt-3"><AlertCircle size={15} className="shrink-0"/>{message}</p>)}
        {value.trim() && parsed.warnings.map((message, i) => <p key={`warn${i}`} className="notice-warning mt-3"><AlertTriangle size={15} className="shrink-0"/>{message}</p>)}
        {value.trim() && !parsed.errors.length && pageCount > 0 && <div className="mt-3 flex items-center gap-2 text-[12px] text-emerald-700"><CheckCheck size={15} /> Se crearán {parsed.selections.length} archivo(s) PDF.</div>}
        <div className="my-5 border-t border-slate-100" />
        <label htmlFor="base-name" className="field-label">Nombre base de los archivos <span className="font-normal text-slate-400">(opcional)</span></label>
        <input id="base-name" className="field-input" type="text" maxLength={75} value={baseName} onChange={e => onBaseName(e.target.value)} disabled={processing} placeholder="Ej. expediente_2026" />
        <p className="mt-2 text-[11px] text-slate-400">Si lo dejas vacío: pagina_0004.pdf, paginas_0023-0045.pdf…</p>
        {processing ? (
          <div className="mt-5" aria-live="polite"><div className="flex items-center justify-between gap-3 text-[12px] font-medium text-slate-700"><span className="flex items-center gap-2"><LoaderCircle size={16} className="animate-spin text-[#8c1627]"/> Generando documentos…</span><span>{percent}%</span></div><div role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} className="progress-track mt-3"><div style={{ width: `${percent}%` }} className="progress-fill" /></div><button type="button" onClick={onCancel} className="outline-button mt-4 w-full justify-center">Cancelar operación</button></div>
        ) : (
          <button type="button" disabled={!canRun} onClick={onProcess} className="primary-button mt-5 w-full justify-center"><Scissors size={18} strokeWidth={1.8} /> Generar archivos PDF <ArrowRight size={17} className="ml-auto" /></button>
        )}
        <p className="mt-3 text-center text-[11px] text-slate-400">Procesamiento privado en tu navegador. Sin subir el archivo.</p>
      </div>
    </section>
  );
}
