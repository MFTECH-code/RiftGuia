import { mkdir, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const api = 'https://api.riftcodex.com/cards';
const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const output = resolve(root, 'public', 'data', 'cards.json');

function assertPage(value, page) {
  if (!value || !Array.isArray(value.items) || !Number.isInteger(value.total) || !Number.isInteger(value.pages) || value.pages < 1 || value.pages > 200) {
    throw new Error(`Resposta inválida da API na página ${page}.`);
  }
  for (const card of value.items) {
    if (!card || typeof card.id !== 'string' || typeof card.name !== 'string' || typeof card.riftbound_id !== 'string') {
      throw new Error(`Uma carta inválida foi recebida na página ${page}.`);
    }
  }
}

async function getPage(page) {
  const url = new URL(api);
  url.search = new URLSearchParams({ size: '100', page: String(page), sort: 'collector_number' });
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`API respondeu ${response.status} na página ${page}.`);
  const result = await response.json();
  assertPage(result, page);
  return result;
}

const first = await getPage(1);
const pages = await Promise.all(Array.from({ length: first.pages - 1 }, (_, index) => getPage(index + 2)));
const cards = [...first.items, ...pages.flatMap(page => page.items)];
if (cards.length !== first.total) throw new Error(`A API declarou ${first.total} cartas, mas retornou ${cards.length}.`);
if (new Set(cards.map(card => card.id)).size !== cards.length) throw new Error('A API retornou IDs de carta duplicados.');

const snapshot = {
  schemaVersion: 1,
  source: 'https://api.riftcodex.com/cards',
  fetchedAt: new Date().toISOString(),
  total: cards.length,
  cards,
};
await mkdir(resolve(root, 'public', 'data'), { recursive: true });
const temporary = `${output}.tmp`;
await writeFile(temporary, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
await rename(temporary, output);
console.log(`Snapshot salvo: ${cards.length} cartas em ${output}`);
