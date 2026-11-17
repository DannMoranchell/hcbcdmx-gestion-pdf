import { describe, it, expect } from 'vitest';
import { parseSelections, selectionFilename, sanitizeBaseName } from '../src/utils/selection';

describe('analizador de páginas y rangos', () => {
  it('extrae cinco páginas individuales', () => {
    const result = parseSelections('4, 7, 9, 45, 60', 100);
    expect(result.errors).toEqual([]);
    expect(result.selections).toHaveLength(5);
    expect(result.selections.every(x => x.kind === 'page')).toBe(true);
  });
  it('genera dos rangos inclusivos', () => {
    const r = parseSelections('23-45, 70-75', 100);
    expect(r.selections).toEqual([
      { kind: 'range', from: 23, to: 45 },
      { kind: 'range', from: 70, to: 75 },
    ]);
  });
  it('mezcla páginas y rangos en seis archivos', () => {
    const r = parseSelections('4, 7, 9, 23-45, 60, 70-75', 100);
    expect(r.errors).toHaveLength(0);
    expect(r.selections).toHaveLength(6);
    expect(r.selections[3]).toEqual({ kind: 'range', from: 23, to: 45 });
  });
  it('rechaza 0, negativos, texto, página excedida y rangos invertidos', () => {
    for (const input of ['0', '-1', 'a', '10-3', '101', '4,,5', '1.5', '3-0']) {
      expect(parseSelections(input, 100).errors.length, input).toBeGreaterThan(0);
    }
  });
  it('quita duplicados exactos conservando superposiciones distintas', () => {
    const r = parseSelections('4, 4, 1-5, 1-5, 4-4', 12);
    expect(r.errors).toEqual([]);
    expect(r.selections).toHaveLength(2);
    expect(r.warnings).toHaveLength(2);
  });
  it('acepta archivos de una sola página', () => {
    expect(parseSelections('1', 1).selections).toHaveLength(1);
    expect(parseSelections('2', 1).errors).toHaveLength(1);
  });
  it('escribe nombres con padding y permite un nombre base seguro', () => {
    expect(selectionFilename({ kind: 'page', from: 4, to: 4 })).toBe('pagina_0004.pdf');
    expect(selectionFilename({ kind: 'range', from: 23, to: 45 }, 'reporte')).toBe('reporte_paginas_0023-0045.pdf');
    expect(sanitizeBaseName('historial/../../público.pdf')).not.toContain('/');
  });
});
