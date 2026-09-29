import type { DeckRow, DeckSection, ParsedDeck, RiftboundCard, TranslationEntry } from '../types';
import { normalize } from './cards';

export const SECTION_LABELS: Record<DeckSection, string> = {
  legend: 'Lenda',
  champion: 'Campeao escolhido',
  main: 'Deck principal',
  runes: 'Runas',
  battlefields: 'Campos de batalha',
  sideboard: 'Reserva',
};

const HEADINGS: Record<string, DeckSection> = {
  legend: 'legend',
  legends: 'legend',
  lenda: 'legend',
  'champion legend': 'legend',
  champion: 'champion',
  'chosen champion': 'champion',
  'champion unit': 'champion',
  campeao: 'champion',
  'campeao escolhido': 'champion',
  'main deck': 'main',
  mainboard: 'main',
  main: 'main',
  deck: 'main',
  'deck principal': 'main',
  runes: 'runes',
  rune: 'runes',
  'rune deck': 'runes',
  runas: 'runes',
  battlefields: 'battlefields',
  battlefield: 'battlefields',
  'campos de batalha': 'battlefields',
  sideboard: 'sideboard',
  reserva: 'sideboard',
};

const order: DeckSection[] = ['legend', 'champion', 'main', 'runes', 'battlefields', 'sideboard'];

function nameKey(value: unknown): string {
  return normalize(value).replace(/[,]/g, '').replace(/\s*-\s*/g, ' ');
}

function heading(line: string): string {
  return normalize(line.replace(/^[#*~\[\]\s-]+|[#*~\[\]\s:-]+$/g, '').replace(/\s*\(\d+\)\s*$/, '').replace(/:\s*\d+$/, ''));
}

function inferred(card: RiftboundCard): DeckSection {
  if (card.classification?.type === 'Legend') return 'legend';
  if (card.classification?.type === 'Rune') return 'runes';
  if (card.classification?.type === 'Battlefield') return 'battlefields';
  return 'main';
}

function aliases(card: RiftboundCard): string[] {
  const result: string[] = [];
  const printings = card.printings?.length ? card.printings : [{
    riftbound_id: card.riftbound_id,
    set_id: card.set?.set_id,
    collector_number: card.collector_number,
  }];

  for (const printing of printings) {
    result.push(printing.riftbound_id);
    const set = printing.set_id;
    const number = printing.collector_number;
    if (set && number != null) {
      result.push(`${set}-${String(number).padStart(3, '0')}`, `${set} ${String(number).padStart(3, '0')}`);
    }
    const match = String(printing.riftbound_id).match(/^([a-z]+)-(\d+)-(\d+)$/i);
    if (match) {
      result.push(`${match[1]}-${match[2]}`, `${match[1]} ${match[2]}`, `${match[1]} ${match[2]}/${match[3]}`);
    }
  }
  return result.map(normalize);
}

function rank(card: RiftboundCard): number {
  const id = String(card.riftbound_id);
  const code = id.match(/^([a-z]+)-(\d+)-(\d+)$/i);
  return (
    10 * Number(Boolean(card.metadata?.alternate_art)) +
    10 * Number(Boolean(card.metadata?.overnumbered)) +
    10 * Number(Boolean(card.metadata?.signature)) +
    5 * Number(/promo/i.test(JSON.stringify(card.set || {}))) +
    3 * Number(!code) +
    2 * Number(Boolean(code && Number(code[2]) > Number(code[3]))) +
    Number(!/^(ogn|ogs)-/i.test(id))
  );
}

function preferred(cards: RiftboundCard[]): RiftboundCard {
  return [...cards].sort((a, b) => rank(a) - rank(b) || a.riftbound_id.localeCompare(b.riftbound_id, undefined, { numeric: true }))[0];
}

export function parseDeck(
  text: string,
  catalog: RiftboundCard[],
  getTranslation: (card: RiftboundCard) => TranslationEntry | undefined,
): ParsedDeck {
  const rows: DeckRow[] = [];
  const errors: ParsedDeck['errors'] = [];
  const notices: string[] = [];
  let section: DeckSection | null = null;
  let blocked = false;

  if (typeof text !== 'string' || text.length > 100000) {
    return { rows, errors: [{ line: 0, text: '', message: 'A lista deve ter ate 100 mil caracteres.' }], notices };
  }

  const names = new Map<string, RiftboundCard[]>();
  const codes = new Map<string, RiftboundCard[]>();
  const add = (map: Map<string, RiftboundCard[]>, key: string, card: RiftboundCard) => {
    if (key) map.set(key, [...(map.get(key) || []), card]);
  };

  for (const card of catalog) {
    add(names, nameKey(card.name), card);
    const translated = getTranslation(card)?.name;
    if (translated) add(names, nameKey(translated), card);
    for (const alias of aliases(card)) add(codes, alias, card);
  }

  text.replace(/^\uFEFF/, '').split(/\r?\n/).forEach((raw, index) => {
    const line = raw.trim();
    if (!line || line.startsWith('//')) return;

    const sectionKey = heading(line);
    if (HEADINGS[sectionKey]) {
      section = HEADINGS[sectionKey];
      blocked = false;
      return;
    }

    if (/^(?:[#~*]{2,}|\[)/.test(line) || /:$/.test(line)) {
      errors.push({ line: index + 1, text: line, message: 'Cabecalho desconhecido. Use Legend, Champion, Main Deck, Runes, Battlefields ou Sideboard.' });
      blocked = true;
      return;
    }

    if (blocked) {
      errors.push({ line: index + 1, text: line, message: 'Corrija o cabecalho anterior antes de importar esta carta.' });
      return;
    }

    let quantity = 1;
    let query = line.replace(/^[-•]\s+/, '');
    let match = query.match(/^(\d+)\s*[x×]?\s+(.+)$/i) || query.match(/^(\d+)[x×](.+)$/i);
    if (match) {
      quantity = Number(match[1]);
      query = match[2].trim();
    } else {
      match = query.match(/^(.+?)\s+[x×]\s*(\d+)$/i);
      if (match) {
        query = match[1].trim();
        quantity = Number(match[2]);
      }
    }

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      errors.push({ line: index + 1, text: line, message: 'Quantidade invalida: use de 1 a 99.' });
      return;
    }

    let candidates = codes.get(normalize(query)) || names.get(nameKey(query)) || [];
    if (!candidates.length) {
      const suffix = query.match(/^(.*?)\s*[[(]([a-z]+[- ]\d+(?:[-/]\d+)?)[\])]$/i);
      if (suffix) {
        const byCode = codes.get(normalize(suffix[2])) || [];
        candidates = byCode.filter((card) => !suffix[1].trim() || nameKey(card.name) === nameKey(suffix[1]) || nameKey(getTranslation(card)?.name) === nameKey(suffix[1]));
      }
    }

    candidates = [...new Map(candidates.map((card) => [card.riftbound_id, card])).values()];
    if (!candidates.length) {
      errors.push({ line: index + 1, text: line, message: catalog.length ? 'Carta nao encontrada. Confira nome, traducao ou codigo.' : 'O catalogo ainda nao carregou.' });
      return;
    }

    const distinct = new Set(candidates.map((card) => nameKey(card.name)));
    if (distinct.size > 1) {
      errors.push({ line: index + 1, text: line, message: `Nome ambiguo. Use o codigo completo: ${candidates.map((card) => card.riftbound_id).join(', ')}` });
      return;
    }

    const card = preferred(candidates);
    const natural = inferred(card);
    const bucket: DeckSection = section === 'sideboard' ? 'sideboard' : natural !== 'main' ? natural : section || natural;
    if ((bucket === 'legend' && natural !== 'legend') || (bucket === 'runes' && natural !== 'runes') || (bucket === 'battlefields' && natural !== 'battlefields')) {
      errors.push({ line: index + 1, text: line, message: `O tipo da carta nao corresponde a secao ${SECTION_LABELS[bucket]}.` });
      return;
    }

    if (candidates.length > 1) {
      notices.push(`Linha ${index + 1}: ${candidates.length} impressoes de ${card.name}; usando ${card.riftbound_id}.`);
    }

    const existing = rows.find((row) => row.section === bucket && row.card.riftbound_id === card.riftbound_id);
    if (existing) existing.quantity += quantity;
    else rows.push({ card, quantity, section: bucket });
  });

  return { rows, errors, notices };
}

export function serializeDeck(rows: DeckRow[]): string {
  const headings: Record<DeckSection, string> = {
    legend: 'Legend',
    champion: 'Champion',
    main: 'Main Deck',
    runes: 'Runes',
    battlefields: 'Battlefields',
    sideboard: 'Sideboard',
  };

  return order
    .map((section) => {
      const group = rows.filter((row) => row.section === section);
      if (!group.length) return '';
      return `${headings[section]}\n${group.map((row) => `${row.quantity} ${row.card.name} [${row.card.riftbound_id}]`).join('\n')}`;
    })
    .filter(Boolean)
    .join('\n\n');
}
