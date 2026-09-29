import type { DeckRow, DeckSection, RiftboundCard, TranslationEntry } from '../types';
import { DOMAIN_NAMES, normalize, normalizeSearch } from './cards';

export type BuilderStep = 'legend' | 'champion' | 'battlefields' | 'main' | 'sideboard' | 'guide';

export interface DeckBuilderState {
  name: string;
  legendId: string;
  championId: string;
  battlefieldIds: string[];
  main: Record<string, number>;
  sideboard: Record<string, number>;
  guide: string;
}

export interface LegendSuggestion {
  id: string;
  name: string;
  translatedName: string;
  domains: string[];
  representativeCardId: string;
  aliases: string[];
  recommendedBattlefields: Array<{
    name: string;
    reason: string;
    source: string;
  }>;
  archetype: string;
  gamePlan: string;
  mulligan: string;
  synergyPackages: string[];
  deckbuildingTips: string[];
  weakness: string;
  source: string;
}

export interface LegendSuggestionsFile {
  schemaVersion: number;
  language: string;
  generatedAt: string;
  sources: Array<{ label: string; url: string; usedFor: string }>;
  legends: LegendSuggestion[];
}

export interface DeckStats {
  mainCount: number;
  sideboardCount: number;
  battlefieldCount: number;
  unitCount: number;
  spellCount: number;
  gearCount: number;
  averageEnergy: number;
  averageMight: number;
  energyCurve: Array<{ label: string; count: number }>;
  domains: Array<{ domain: string; label: string; count: number }>;
  suggestedRunes: Array<{ domain: string; count: number }>;
}

export const BUILDER_STORAGE_KEY = 'rift-guia.deck-builder.v1';

export const builderSteps: Array<{ id: BuilderStep; label: string; help: string }> = [
  { id: 'legend', label: '1. Lenda', help: 'Define domínios e plano de jogo.' },
  { id: 'champion', label: '2. Champion Unit', help: 'A unidade garantida que guia o deck.' },
  { id: 'battlefields', label: '3. Battlefields', help: 'Escolha 3 campos únicos.' },
  { id: 'main', label: '4. Main Deck', help: 'Monte as 40 cartas principais.' },
  { id: 'sideboard', label: '5. Side Deck', help: 'Ajustes para partidas diferentes.' },
  { id: 'guide', label: '6. Guia próprio', help: 'Registre seu plano de jogo.' },
];

export const emptyBuilderState: DeckBuilderState = {
  name: 'Meu deck de Riftbound',
  legendId: '',
  championId: '',
  battlefieldIds: [],
  main: {},
  sideboard: {},
  guide: '',
};

const cosmeticSuffix = /\s+\((Metal|Overnumbered|Signature|Starter|Alternate Art|Foil|Numericamente Superior|Supernumer[aá]rio|Assinatura|Inicial|Arte Alternativa)\)$/gi;

export function cleanCardName(value: unknown): string {
  return String(value || '').replace(cosmeticSuffix, '').trim();
}

export function displayName(card: RiftboundCard, translation?: TranslationEntry): string {
  return cleanCardName(translation?.name || card.name);
}

export function championBaseName(legend?: RiftboundCard | null): string {
  const clean = cleanCardName(legend?.name || '');
  const beforeDash = clean.split(/\s+-\s+/)[0];
  return beforeDash || clean.split(',')[0] || clean;
}

export function uniqueByCardId(cards: RiftboundCard[]): RiftboundCard[] {
  return [...new Map(cards.map((card) => [card.riftbound_id, card])).values()];
}

export function readBuilderState(): DeckBuilderState {
  try {
    const parsed = JSON.parse(localStorage.getItem(BUILDER_STORAGE_KEY) || '{}') as Partial<DeckBuilderState>;
    return sanitizeBuilderState(parsed);
  } catch {
    return emptyBuilderState;
  }
}

export function writeBuilderState(state: DeckBuilderState): void {
  localStorage.setItem(BUILDER_STORAGE_KEY, JSON.stringify(state));
}

export function sanitizeBuilderState(value: Partial<DeckBuilderState>): DeckBuilderState {
  return {
    name: typeof value.name === 'string' && value.name.trim() ? value.name.slice(0, 120) : emptyBuilderState.name,
    legendId: typeof value.legendId === 'string' ? value.legendId : '',
    championId: typeof value.championId === 'string' ? value.championId : '',
    battlefieldIds: Array.isArray(value.battlefieldIds) ? value.battlefieldIds.filter((id) => typeof id === 'string').slice(0, 3) : [],
    main: sanitizeQuantities(value.main),
    sideboard: sanitizeQuantities(value.sideboard),
    guide: typeof value.guide === 'string' ? value.guide.slice(0, 20000) : '',
  };
}

function sanitizeQuantities(value: unknown): Record<string, number> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Record<string, number> = {};
  for (const [id, raw] of Object.entries(value)) {
    const quantity = Number(raw);
    if (/^[a-z0-9*-]+$/i.test(id) && Number.isInteger(quantity) && quantity > 0 && quantity <= 99) {
      result[id] = quantity;
    }
  }
  return result;
}

export function canUseCardWithLegend(card: RiftboundCard, legend?: RiftboundCard | null): boolean {
  const type = card.classification?.type;
  if (type === 'Rune' || type === 'Legend' || type === 'Battlefield') return false;
  if (!legend) return true;
  const legendDomains = new Set(legend.classification?.domain || []);
  const domains = card.classification?.domain || [];
  return domains.length === 0 || domains.some((domain) => domain === 'Colorless' || legendDomains.has(domain));
}

export function sortCardsForBuilder(cards: RiftboundCard[], translate: (card: RiftboundCard) => TranslationEntry | undefined): RiftboundCard[] {
  return [...cards].sort((a, b) => {
    const energyA = a.attributes?.energy ?? 999;
    const energyB = b.attributes?.energy ?? 999;
    return energyA - energyB || displayName(a, translate(a)).localeCompare(displayName(b, translate(b)), 'pt-BR');
  });
}

export function findCard(cards: RiftboundCard[], cardId: string): RiftboundCard | undefined {
  return cards.find((card) => card.riftbound_id === cardId || card.printings?.some((printing) => printing.riftbound_id === cardId));
}

export function cardsFromQuantities(cards: RiftboundCard[], quantities: Record<string, number>, section: DeckSection): DeckRow[] {
  return Object.entries(quantities)
    .map(([id, quantity]) => {
      const card = findCard(cards, id);
      return card ? { card, quantity, section } : null;
    })
    .filter((row): row is DeckRow => Boolean(row));
}

export function rowsFromBuilder(cards: RiftboundCard[], state: DeckBuilderState, includeRunes = true): DeckRow[] {
  const rows: DeckRow[] = [];
  const legend = findCard(cards, state.legendId);
  const champion = findCard(cards, state.championId);
  if (legend) rows.push({ card: legend, quantity: 1, section: 'legend' });
  if (champion) rows.push({ card: champion, quantity: 1, section: 'champion' });
  for (const id of state.battlefieldIds) {
    const card = findCard(cards, id);
    if (card) rows.push({ card, quantity: 1, section: 'battlefields' });
  }
  rows.push(...cardsFromQuantities(cards, state.main, 'main'));
  if (includeRunes) rows.push(...runeRows(cards, calculateStats(cards, state).suggestedRunes));
  rows.push(...cardsFromQuantities(cards, state.sideboard, 'sideboard'));
  return rows;
}

function runeRows(cards: RiftboundCard[], runes: DeckStats['suggestedRunes']): DeckRow[] {
  return runes
    .map(({ domain, count }) => {
      const card = cards.find((candidate) => candidate.classification?.type === 'Rune' && candidate.classification.domain?.includes(domain));
      return card ? { card, quantity: count, section: 'runes' as DeckSection } : null;
    })
    .filter((row): row is DeckRow => Boolean(row));
}

export function calculateStats(cards: RiftboundCard[], state: DeckBuilderState): DeckStats {
  const mainRows = cardsFromQuantities(cards, state.main, 'main');
  const sideRows = cardsFromQuantities(cards, state.sideboard, 'sideboard');
  const mainCards = expandRows(mainRows);
  const energyCards = mainCards.filter((card) => typeof card.attributes?.energy === 'number');
  const mightCards = mainCards.filter((card) => typeof card.attributes?.might === 'number');
  const domainCounts = new Map<string, number>();
  const energyCounts = new Map<string, number>();

  for (const card of mainCards) {
    const energy = card.attributes?.energy;
    const bucket = typeof energy === 'number' ? String(Math.min(energy, 7)) : 'Sem custo';
    energyCounts.set(bucket, (energyCounts.get(bucket) || 0) + 1);
    for (const domain of card.classification?.domain || []) {
      if (domain !== 'Colorless') domainCounts.set(domain, (domainCounts.get(domain) || 0) + 1);
    }
  }

  const legend = findCard(cards, state.legendId);
  for (const domain of legend?.classification?.domain || []) {
    if (domain !== 'Colorless' && !domainCounts.has(domain)) domainCounts.set(domain, 0);
  }

  const suggestedRunes = suggestRunes(legend?.classification?.domain || [], domainCounts);

  return {
    mainCount: mainRows.reduce((sum, row) => sum + row.quantity, 0),
    sideboardCount: sideRows.reduce((sum, row) => sum + row.quantity, 0),
    battlefieldCount: state.battlefieldIds.length,
    unitCount: countType(mainCards, 'Unit'),
    spellCount: countType(mainCards, 'Spell'),
    gearCount: countType(mainCards, 'Gear'),
    averageEnergy: average(energyCards.map((card) => card.attributes?.energy ?? 0)),
    averageMight: average(mightCards.map((card) => card.attributes?.might ?? 0)),
    energyCurve: ['0', '1', '2', '3', '4', '5', '6', '7', 'Sem custo'].map((label) => ({
      label: label === '7' ? '7+' : label,
      count: energyCounts.get(label) || 0,
    })),
    domains: [...domainCounts.entries()].map(([domain, count]) => ({ domain, label: DOMAIN_NAMES[domain] || domain, count })),
    suggestedRunes,
  };
}

function suggestRunes(legendDomains: string[], counts: Map<string, number>): DeckStats['suggestedRunes'] {
  const playable = legendDomains.filter((domain) => domain !== 'Colorless');
  if (!playable.length) return [];
  if (playable.length === 1) return [{ domain: playable[0], count: 12 }];
  const total = playable.reduce((sum, domain) => sum + (counts.get(domain) || 0), 0);
  if (!total) {
    const first = Math.ceil(12 / playable.length);
    return playable.map((domain, index) => ({ domain, count: index === 0 ? first : 12 - first }));
  }
  const raw = playable.map((domain) => ({ domain, count: Math.max(3, Math.round(((counts.get(domain) || 0) / total) * 12)) }));
  while (raw.reduce((sum, item) => sum + item.count, 0) > 12) {
    const target = [...raw].sort((a, b) => b.count - a.count)[0];
    target.count -= 1;
  }
  while (raw.reduce((sum, item) => sum + item.count, 0) < 12) {
    const target = [...raw].sort((a, b) => (counts.get(b.domain) || 0) - (counts.get(a.domain) || 0))[0];
    target.count += 1;
  }
  return raw;
}

function expandRows(rows: DeckRow[]): RiftboundCard[] {
  return rows.flatMap((row) => Array.from({ length: row.quantity }, () => row.card));
}

function countType(cards: RiftboundCard[], type: string): number {
  return cards.filter((card) => card.classification?.type === type).length;
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function updateQuantity(section: Record<string, number>, cardId: string, quantity: number): Record<string, number> {
  const next = { ...section };
  if (quantity <= 0) delete next[cardId];
  else next[cardId] = Math.min(99, Math.max(1, Math.round(quantity)));
  return next;
}

export function filterCardsForPicker(
  cards: RiftboundCard[],
  query: string,
  translate: (card: RiftboundCard) => TranslationEntry | undefined,
): RiftboundCard[] {
  const term = normalizeSearch(query);
  if (!term) return cards;
  return cards.filter((card) => {
    const translation = translate(card);
    return normalizeSearch([
      card.name,
      card.riftbound_id,
      translation?.name,
      card.text?.plain,
      translation?.text,
      card.classification?.type,
      ...(card.classification?.domain || []),
    ].join(' ')).includes(term) || normalize(displayName(card, translation)).includes(normalize(query));
  });
}
