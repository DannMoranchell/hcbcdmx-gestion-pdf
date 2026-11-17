import { useCallback, useMemo, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, FileLock2, FileText, Layers3, ShieldCheck, Sparkles } from 'lucide-react';
import type { PdfOutput } from './types/pdf';
import AppShell, { About, StartHero, Upcoming } from './layouts/AppShell';
import type { PageId } from './layouts/AppShell';
import Dropzone from './components/Dropzone';
import PageGallery from './components/PageGallery';
import SelectionEditor from './components/SelectionEditor';
import ResultsList from './components/ResultsList';
import { usePdfDocument } from './hooks/usePdfDocument';
import { processPdfInWorker } from './services/pdfWorkerClient';
import { createZip, downloadBlob, readablePdfError, validatePdfFile } from './utils/files';
import { parseSelections } from './utils/selection';

const moduleTitles: Partial<Record<PageId, string>> = {
  unir: 'Unir archivos PDF', organizar: 'Organizar páginas', herramientas: 'Herramientas PDF',
};

export default function App() {
  const [current, setCurrent] = useState<PageId>('inicio');
  const [file, setFile] = useState<File | null>(null);
  const { document: pdfDocument, error: previewError, loading: previewLoading } = usePdfDocument(file);
  const [input, setInput] = useState('');
  const [baseName, setBaseName] = useState('');
  const [visualPages, setVisualPages] = useState<number[]>([]);
  const [outputs, setOutputs] = useState<PdfOutput[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [zipping, setZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);
  const controller = useRef<AbortController | null>(null);
  const parsed = useMemo(() => parseSelections(input, pdfDocument?.numPages ?? 0), [input, pdfDocument]);

  const clear = useCallback(() => {
    controller.current?.abort();
    controller.current = null;
    setFile(null);
    setInput('');
    setBaseName('');
    setVisualPages([]);
    setOutputs([]);
    setError(null);
    setProcessing(false);
    setProgress(0);
    setZipping(false);
    setZipProgress(0);
  }, []);

  const chooseFile = useCallback(async (chosen: File) => {
    try {
      await validatePdfFile(chosen);
      controller.current?.abort();
      setOutputs([]);
      setError(null);
      setInput('');
      setVisualPages([]);
      setProgress(0);
      setProcessing(false);
      setFile(chosen);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo leer el archivo.');
    }
  }, []);

  const toggleVisual = useCallback((page: number) => {
    setVisualPages(previous => previous.includes(page) ? previous.filter(x => x !== page) : [...previous, page].sort((a, b) => a - b));
  }, []);
  const addVisual = useCallback(() => {
    if (!visualPages.length) return;
    setInput(previous => `${previous.trim().replace(/,+\s*$/, '')}${previous.trim() ? ', ' : ''}${visualPages.join(', ')}`);
    setOutputs([]);
    setVisualPages([]);
  }, [visualPages]);

  const process = useCallback(async () => {
    if (!file || !pdfDocument || parsed.errors.length || !parsed.selections.length || processing) return;
    const abortController = new AbortController();
    controller.current = abortController;
    setProcessing(true);
    setProgress(0);
    setError(null);
    setOutputs([]);
    try {
      const generated = await processPdfInWorker(file, parsed.selections, baseName, setProgress, abortController.signal);
      if (abortController.signal.aborted) return;
      setOutputs(generated.map((item, index) => ({
        id: `${index}-${item.filename}`,
        filename: item.filename,
        pageCount: item.pageCount,
        byteSize: item.buffer.byteLength,
        blob: new Blob([item.buffer], { type: 'application/pdf' }),
        selection: item.selection,
      })));
      setProgress(100);
    } catch (e) {
      if (!abortController.signal.aborted) setError(readablePdfError(e));
    } finally {
      if (!abortController.signal.aborted) setProcessing(false);
      if (controller.current === abortController) controller.current = null;
    }
  }, [file, pdfDocument, parsed, baseName, processing]);

  const cancel = () => { controller.current?.abort(); controller.current = null; setProcessing(false); setProgress(0); setError('Se canceló la generación de documentos.'); };

  const downloadZip = useCallback(async () => {
    if (!outputs.length || zipping) return;
    setZipping(true);
    setZipProgress(0);
    setError(null);
    try {
      const result = await createZip(outputs, baseName, setZipProgress);
      downloadBlob(result.blob, result.filename);
    } catch (e) {
      setError(e instanceof Error ? `No fue posible preparar el ZIP: ${e.message}` : 'No se pudo crear el ZIP.');
    } finally {
      setZipping(false);
    }
  }, [outputs, zipping, baseName]);

  const isWorkspace = current === 'inicio' || current === 'dividir' || current === 'extraer';
  return <AppShell current={current} onChange={setCurrent}>
    {current === 'acerca' ? <About /> : isWorkspace ? (
      <>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div><p className="section-kicker">HERRAMIENTAS DIGITALES · VERSIÓN 1.0</p><h1 className="page-title mt-1">{current === 'extraer' ? 'Extraer páginas PDF' : current === 'dividir' ? 'Dividir archivos PDF' : 'Panel de inicio'}</h1><p className="page-description">Sistema Institucional de Gestión de Documentos PDF</p></div>
          <div className="secure-tag"><ShieldCheck size={16}/> Privado y local</div>
        </div>
        {current === 'inicio' && <StartHero navigate={setCurrent}/>}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="feature-stat"><span className="stat-icon"><FileText size={19}/></span><div><p className="text-[13px] font-bold text-slate-800">Dividir PDF</p><p className="mt-0.5 text-[11px] text-slate-500">Páginas individuales</p></div><ArrowRight size={15} className="ml-auto text-slate-300"/></div>
          <div className="feature-stat"><span className="stat-icon"><Layers3 size={19}/></span><div><p className="text-[13px] font-bold text-slate-800">Extraer rangos</p><p className="mt-0.5 text-[11px] text-slate-500">Uno o varios intervalos</p></div><ArrowRight size={15} className="ml-auto text-slate-300"/></div>
          <div className="feature-stat"><span className="stat-icon"><FileLock2 size={19}/></span><div><p className="text-[13px] font-bold text-slate-800">Sin servidores</p><p className="mt-0.5 text-[11px] text-slate-500">Procesamiento en el equipo</p></div><ShieldCheck size={16} className="ml-auto text-emerald-600"/></div>
        </div>
        <div className="mb-5 mt-8 flex items-center justify-between"><div><p className="section-kicker">ÁREA DE TRABAJO</p><h2 className="mt-1 text-[20px] font-bold tracking-tight text-slate-800">Prepara tu documento</h2></div><span className="hidden items-center gap-1.5 text-[12px] text-slate-400 sm:flex"><Sparkles size={14}/> Sin instalaciones adicionales</span></div>
        {(error || previewError) && <div role="alert" className="notice-error mb-5 rounded-xl px-4 py-3"><AlertCircle size={19} className="shrink-0"/><span>{error || previewError}</span></div>}
        <div className="grid items-start gap-5 xl:grid-cols-2"><Dropzone file={file} totalPages={pdfDocument?.numPages} busy={processing || zipping} onFile={chooseFile} onClear={clear}/><SelectionEditor value={input} onChange={value => { setInput(value); setOutputs([]); }} baseName={baseName} onBaseName={value => { setBaseName(value); setOutputs([]); }} parsed={parsed} pageCount={pdfDocument?.numPages ?? 0} processing={processing} percent={progress} onProcess={process} onCancel={cancel}/></div>
        <div className="mt-5"><PageGallery document={pdfDocument} selectedPages={visualPages} onToggle={toggleVisual} onAddSelection={addVisual}/></div>
        {previewLoading && <p role="status" className="mt-3 text-[12px] text-slate-500">Cargando miniaturas y verificando el documento…</p>}
        <div className="mt-5"><ResultsList outputs={outputs} onDownload={o => downloadBlob(o.blob, o.filename)} onZip={downloadZip} zipping={zipping} zipProgress={zipProgress} onReset={() => { setOutputs([]); setProgress(0); }}/></div>
        <p className="mt-5 flex items-start gap-2 text-[12px] leading-relaxed text-slate-500"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-700" /> No necesitas subir archivos a un servidor. Antes del despliegue institucional, el área de TI debe autorizar el acceso y las políticas de seguridad del sitio.</p>
      </>
    ) : <Upcoming section={moduleTitles[current] ?? 'Próximamente'} onGoBack={() => setCurrent('dividir')}/>}
  </AppShell>;
}
