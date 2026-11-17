import type { ParsedSelection, Selection } from '../types/pdf';

export const MAX_OUTPUTS = 200;

export function parseSelections(value: string, totalPages: number): ParsedSelection {
  const result: ParsedSelection = { selections: [], errors: [], warnings: [] };
  if (!value.trim()) {
    result.errors.push('Escribe por lo menos una página o un rango.');
    return result;
  }
  if (!Number.isSafeInteger(totalPages) || totalPages < 1) {
    result.errors.push('No se ha cargado un documento PDF válido.');
    return result;
  }

  const tokens = value.split(',');
  if (tokens.length > MAX_OUTPUTS) {
    result.errors.push(`Puedes solicitar como máximo ${MAX_OUTPUTS} archivos por operación.`);
    return result;
  }
  const seen = new Set<string>();
  const repeated: string[] = [];

  for (const token of tokens) {
    const t = token.trim();
    if (!t) {
      result.errors.push('Hay una selección vacía entre comas.');
      continue;
    }
    const pageMatch = /^(\d+)$/.exec(t);
    const rangeMatch = /^(\d+)\s*-\s*(\d+)$/.exec(t);
    if (!pageMatch && !rangeMatch) {
      result.errors.push(`«${t}» no tiene un formato válido. Usa 4 o 23-45.`);
      continue;
    }
    const from = Number(pageMatch?.[1] ?? rangeMatch?.[1]);
    const to = Number(pageMatch?.[1] ?? rangeMatch?.[2]);
    if (!Number.isSafeInteger(from) || !Number.isSafeInteger(to) || from < 1 || to < 1) {
      result.errors.push(`«${t}»: las páginas deben ser números enteros positivos.`);
      continue;
    }
    if (from > to) {
      result.errors.push(`«${t}»: el rango está invertido (inicio mayor que fin).`);
      continue;
    }
    if (to > totalPages) {
      result.errors.push(`«${t}»: el PDF tiene ${totalPages} páginas; la selección excede ese límite.`);
      continue;
    }
    const kind: Selection['kind'] = from === to ? 'page' : 'range';
    const key = `${from}-${to}`;
    if (seen.has(key)) {
      repeated.push(t);
      continue;
    }
    seen.add(key);
    result.selections.push({ kind, from, to });
  }
  if (repeated.length) {
    result.warnings.push(`Selecciones exactamente duplicadas omitidas: ${repeated.join(', ')}.`);
  }
  let overlaps = 0;
  for (let i = 0; i < result.selections.length; i++) {
    for (let j = i + 1; j < result.selections.length; j++) {
      const a = result.selections[i]!;
      const b = result.selections[j]!;
      if (a.from <= b.to && b.from <= a.to) overlaps++;
    }
  }
  if (overlaps) {
    result.warnings.push(`Hay ${overlaps} coincidencia(s) entre selecciones distintas. Se conservarán todas: cada una genera su propio archivo.`);
  }
  return result;
}

export function describeSelection(selection: Selection): string {
  return selection.kind === 'page'
    ? `Página ${selection.from}`
    : `Páginas ${selection.from} a ${selection.to}`;
}

export function sanitizeBaseName(input: string): string {
  return input
    .trim()
    .replace(/\.pdf$/i, '')
    .normalize('NFKC')
    .replace(/[\\/<>:"|?*\x00-\x1f]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 75);
}

export function selectionFilename(selection: Selection, baseName = ''): string {
  const prefix = sanitizeBaseName(baseName);
  const name = selection.kind === 'page'
    ? `pagina_${String(selection.from).padStart(4, '0')}`
    : `paginas_${String(selection.from).padStart(4, '0')}-${String(selection.to).padStart(4, '0')}`;
  return `${prefix ? prefix + '_' : ''}${name}.pdf`;
}
