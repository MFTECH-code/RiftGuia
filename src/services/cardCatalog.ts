import type { CardPrinting, CardSnapshot, RiftboundCard } from '../types';

const API_URL = 'https://api.riftcodex.com/cards';
const SNAPSHOT_URL = '/data/cards.json';
const CACHE_DATABASE = 'rift-guia';
const CACHE_STORE = 'catalog';
const CACHE_KEY = 'riftcodex-cards-v1';
export const CATALOG_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface RiftCodexPage {
  items: RiftboundCard[];
  total: number;
  pages: number;
}

function isCard(value: unknown): value is RiftboundCard {
  if (!value || typeof value !== 'object') return false;
  const card = value as Partial<RiftboundCard>;
  return typeof card.id === 'string' && typeof card.riftbound_id === 'string' && typeof card.name === 'string';
}

function duplicatePreference(card: RiftboundCard): number {
  const set = card.set?.set_id || '';
  return (
    20 * Number(set !== 'OPP') +
    10 * Number(Boolean(card.media?.image_url)) +
    4 * Number(Boolean(card.text?.plain)) +
    2 * Number(!card.metadata?.alternate_art) +
    Number(!card.metadata?.signature)
  );
}

function playableKey(card: RiftboundCard): string {
  return JSON.stringify({
    name: card.name,
    type: card.classification?.type || '',
    domain: card.classification?.domain || [],
    text: card.text?.plain || '',
    attributes: card.attributes || {},
  });
}

function printing(card: RiftboundCard): CardPrinting {
  return {
    id: card.id,
    riftbound_id: card.riftbound_id,
    set_id: card.set?.set_id,
    collector_number: card.collector_number,
  };
}

function mergePrintings(cards: RiftboundCard[]): CardPrinting[] {
  const printings = new Map<string, CardPrinting>();
  for (const card of cards) {
    for (const item of [printing(card), ...(card.printings || [])]) {
      printings.set(item.riftbound_id, item);
    }
  }
  return [...printings.values()].sort((a, b) => a.riftbound_id.localeCompare(b.riftbound_id, undefined, { numeric: true }));
}

function preferredCard(cards: RiftboundCard[]): RiftboundCard {
  return [...cards].sort((a, b) => duplicatePreference(b) - duplicatePreference(a) || a.riftbound_id.localeCompare(b.riftbound_id, undefined, { numeric: true }))[0];
}

function normalizeCards(cards: RiftboundCard[]): RiftboundCard[] {
  const byRiftboundId = new Map<string, RiftboundCard[]>();
  for (const card of cards) {
    byRiftboundId.set(card.riftbound_id, [...(byRiftboundId.get(card.riftbound_id) || []), card]);
  }

  const byPlayableCard = new Map<string, RiftboundCard[]>();
  for (const group of byRiftboundId.values()) {
    const card = preferredCard(group);
    const withPrintings = { ...card, printings: mergePrintings(group) };
    const key = playableKey(withPrintings);
    byPlayableCard.set(key, [...(byPlayableCard.get(key) || []), withPrintings]);
  }

  return [...byPlayableCard.values()].map((group) => {
    const card = preferredCard(group);
    return { ...card, printings: mergePrintings(group) };
  });
}

export function validateCardSnapshot(value: unknown): CardSnapshot {
  if (!value || typeof value !== 'object') throw new Error('Catalogo invalido.');
  const snapshot = value as Partial<CardSnapshot>;
  if (
    snapshot.schemaVersion !== 1 ||
    typeof snapshot.source !== 'string' ||
    typeof snapshot.fetchedAt !== 'string' ||
    !Array.isArray(snapshot.cards) ||
    !snapshot.cards.every(isCard) ||
    snapshot.cards.length !== snapshot.total
  ) {
    throw new Error('Catalogo invalido.');
  }
  const cards = normalizeCards(snapshot.cards);
  return { ...snapshot, total: cards.length, cards } as CardSnapshot;
}

function validatePage(value: unknown, page: number): RiftCodexPage {
  if (!value || typeof value !== 'object') throw new Error(`Pagina ${page} invalida.`);
  const result = value as Partial<RiftCodexPage>;
  if (
    !Array.isArray(result.items) ||
    !result.items.every(isCard) ||
    !Number.isInteger(result.total) ||
    !Number.isInteger(result.pages) ||
    Number(result.pages) < 1 ||
    Number(result.pages) > 200
  ) {
    throw new Error(`Pagina ${page} invalida.`);
  }
  return result as RiftCodexPage;
}

async function fetchPage(page: number, signal?: AbortSignal): Promise<RiftCodexPage> {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({ size: '100', page: String(page), sort: 'collector_number' }).toString();
  const timeoutSignal = AbortSignal.timeout(30_000);
  const requestSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
  const response = await fetch(url, { headers: { Accept: 'application/json' }, signal: requestSignal });
  if (!response.ok) throw new Error(`Riftcodex respondeu ${response.status} na pagina ${page}.`);
  return validatePage(await response.json(), page);
}

async function fetchRemainingPages(
  pageCount: number,
  signal: AbortSignal | undefined,
  onProgress?: (loaded: number, total: number) => void,
): Promise<RiftCodexPage[]> {
  const pageNumbers = Array.from({ length: pageCount - 1 }, (_, index) => index + 2);
  const results = new Array<RiftCodexPage>(pageNumbers.length);
  let cursor = 0;
  let loaded = 1;

  async function worker() {
    while (cursor < pageNumbers.length) {
      const resultIndex = cursor++;
      results[resultIndex] = await fetchPage(pageNumbers[resultIndex], signal);
      loaded += 1;
      onProgress?.(loaded, pageCount);
    }
  }

  await Promise.all(Array.from({ length: Math.min(4, pageNumbers.length) }, () => worker()));
  return results;
}

export async function fetchRiftCodexCatalog(
  signal?: AbortSignal,
  onProgress?: (loaded: number, total: number) => void,
): Promise<CardSnapshot> {
  const first = await fetchPage(1, signal);
  onProgress?.(1, first.pages);
  const remaining = await fetchRemainingPages(first.pages, signal, onProgress);
  const cards = [...first.items, ...remaining.flatMap((page) => page.items)];
  if (cards.length !== first.total) {
    throw new Error(`A API declarou ${first.total} cartas, mas retornou ${cards.length}.`);
  }
  if (new Set(cards.map((card) => card.id)).size !== cards.length) {
    throw new Error('A API retornou IDs internos duplicados.');
  }
  const uniqueCards = normalizeCards(cards);
  return {
    schemaVersion: 1,
    source: API_URL,
    fetchedAt: new Date().toISOString(),
    total: uniqueCards.length,
    cards: uniqueCards,
  };
}

export async function fetchBundledCatalog(signal?: AbortSignal): Promise<CardSnapshot> {
  const response = await fetch(SNAPSHOT_URL, { cache: 'force-cache', signal });
  if (!response.ok) throw new Error(`Catalogo local respondeu ${response.status}.`);
  return validateCardSnapshot(await response.json());
}

function openCatalogDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(CACHE_DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(CACHE_STORE)) request.result.createObjectStore(CACHE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Nao foi possivel abrir o cache.'));
  });
}

export async function readCachedCatalog(): Promise<CardSnapshot | null> {
  if (!('indexedDB' in window)) return null;
  try {
    const database = await openCatalogDatabase();
    const value = await new Promise<unknown>((resolve, reject) => {
      const transaction = database.transaction(CACHE_STORE, 'readonly');
      const request = transaction.objectStore(CACHE_STORE).get(CACHE_KEY);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return value ? validateCardSnapshot(value) : null;
  } catch {
    return null;
  }
}

export async function writeCachedCatalog(snapshot: CardSnapshot): Promise<void> {
  if (!('indexedDB' in window)) return;
  const database = await openCatalogDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(CACHE_STORE, 'readwrite');
    transaction.objectStore(CACHE_STORE).put(snapshot, CACHE_KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
  database.close();
}

export function isCatalogFresh(snapshot: CardSnapshot): boolean {
  const fetchedAt = new Date(snapshot.fetchedAt).valueOf();
  return Number.isFinite(fetchedAt) && Date.now() - fetchedAt < CATALOG_MAX_AGE_MS;
}
