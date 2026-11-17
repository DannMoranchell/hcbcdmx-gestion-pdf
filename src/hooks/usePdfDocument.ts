import { useEffect, useState } from 'react';
import type { PDFDocumentProxy } from 'pdfjs-dist';
import { openPdfPreview } from '../services/pdfPreview';
import { readablePdfError } from '../utils/files';

export function usePdfDocument(file: File | null) {
  const [document, setDocument] = useState<PDFDocumentProxy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let disposed = false;
    let opened: PDFDocumentProxy | null = null;
    if (!file) {
      setDocument(null);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setDocument(null);
    openPdfPreview(file)
      .then(async pdf => {
        if (disposed) { await pdf.destroy(); return; }
        opened = pdf;
        setDocument(pdf);
      })
      .catch(err => {
        if (!disposed) setError(readablePdfError(err));
      })
      .finally(() => {
        if (!disposed) setLoading(false);
      });
    return () => {
      disposed = true;
      if (opened) void opened.destroy();
    };
  }, [file]);

  return { document, error, loading };
}
