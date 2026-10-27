import { CATALOG, type CatalogItem } from '../config/catalog';

const normalise = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\p{L}\p{N}]+/gu, '');

/** Rank catalog entries: name prefix > word prefix > alias match > substring. */
export function searchCatalog(query: string, catalog: CatalogItem[] = CATALOG): CatalogItem[] {
  const q = normalise(query);
  if (!q) return catalog;
  const scored: { item: CatalogItem; score: number }[] = [];
  for (const item of catalog) {
    const name = normalise(item.name);
    const zh = item.nameZh ? normalise(item.nameZh) : '';
    const words = item.name.toLowerCase().split(/[\s+.-]+/).map(normalise);
    const aliases = (item.aliases ?? []).map(normalise);
    let score = 0;
    if (name.startsWith(q) || zh.startsWith(q)) score = 4;
    else if (words.some((w) => w.startsWith(q))) score = 3;
    else if (aliases.some((a) => a.startsWith(q))) score = 2;
    else if (name.includes(q) || zh.includes(q) || aliases.some((a) => a.includes(q))) score = 1;
    if (score) scored.push({ item, score });
  }
  return scored.sort((a, b) => b.score - a.score || a.item.name.localeCompare(b.item.name)).map((s) => s.item);
}
