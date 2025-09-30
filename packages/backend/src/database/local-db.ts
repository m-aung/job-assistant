import fs from 'fs';
import path from 'path';
import { HistoryRow } from '../types';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
const filePath = path.join(dataDir, 'history.json');

function load(): HistoryRow[] {
  try {
    if (!fs.existsSync(filePath)) return [] as HistoryRow[];
    const s = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(s) as HistoryRow[];
  } catch (e: unknown) {
    console.error('Failed to load history:', e);
    return [] as HistoryRow[];
  }
}

function save(rows: HistoryRow[]) {
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf8');
}

export function insertHistory(entry: Omit<HistoryRow, 'id' | 'createdAt'>) {
  const rows = load();
  const id = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
  const createdAt = new Date().toISOString();
  const row: HistoryRow = { id, createdAt, ...entry } as unknown as HistoryRow;
  rows.unshift(row);
  save(rows);
  return row;
}

export function listHistory(limit = 50) {
  const rows = load();
  return rows.slice(0, limit);
}

export function getHistory(id: number) {
  const rows = load();
  return rows.find((r) => r.id === id);
}

export function deleteHistory(id: number) {
  let rows = load();
  const before = rows.length;
  rows = rows.filter((r) => r.id !== id);
  save(rows);
  return rows.length < before;
}

export function updateHistory(id: number, fields: Partial<Omit<HistoryRow, 'id' | 'createdAt'>>) {
  const rows = load();
  const idx = rows.findIndex((r) => r.id === id);
  if (idx === -1) return undefined;
  rows[idx] = { ...rows[idx], ...fields } as HistoryRow;
  save(rows);
  return rows[idx];
}

class LocalDB {
  insertHistory(entry: Omit<HistoryRow, 'id' | 'createdAt'>) {
    return insertHistory(entry);
  }

  listHistory(limit = 50) {
    return listHistory(limit);
  }

  getHistory(id: number) {
    return getHistory(id);
  }

  deleteHistory(id: number) {
    return deleteHistory(id);
  }

  updateHistory(id: number, fields: Partial<Omit<HistoryRow, 'id' | 'createdAt'>>) {
    return updateHistory(id, fields);
  }
}
export { LocalDB };
