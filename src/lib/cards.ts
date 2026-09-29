import type { RiftboundCard, TranslationEntry, TranslationMap } from '../types';

export const TYPE_NAMES: Record<string, string> = {
  Unit: 'Unidade',
  Spell: 'Feitico',
  Gear: 'Equipamento',
  Legend: 'Lenda',
  Battlefield: 'Campo de batalha',
  Rune: 'Runa',
  Token: 'Ficha',
};

export const DOMAIN_NAMES: Record<string, string> = {
  Fury: 'Furia',
  Calm: 'Calma',
  Mind: 'Mente',
  Body: 'Corpo',
  Chaos: 'Caos',
  Order: 'Ordem',
  Colorless: 'Incolor',
  Rainbow: 'qualquer dominio',
};

export const TRANSLATION_STORAGE = 'rift-guia.translations.v2';

export function normalize(value: unknown): string {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’‘]/g, "'")
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeSearch(value: unknown): string {
  return normalize(value)
    .replace(/[^a-z0-9*]+/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function safeImageUrl(card: RiftboundCard): string {
  try {
    const url = new URL(card.media?.image_url ?? '');
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

export function formatCardText(text?: string | null): string {
  return String(text || '')
    .replace(/:rb_energy_(\d+):/g, '[$1 energia]')
    .replace(/:rb_rune_(\w+):/g, (_, domain: string) => {
      const key = domain[0]?.toUpperCase() + domain.slice(1);
      return `[1 poder de ${DOMAIN_NAMES[key] || domain}]`;
    })
    .replace(/:rb_might:/g, '[forca]')
    .replace(/:rb_exhaust:/g, '[exaurir]')
    .replace(/:rb_([a-z0-9_]+):/g, (_, token: string) => `[${token.replace(/_/g, ' ')}]`)
    .replace(/\)(?=[A-Z\[])/g, ')\n')
    .replace(/\. ?(?=\[?[A-Z])/g, '.\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function snapshotDate(value?: string): string {
  const date = new Date(value || '');
  if (Number.isNaN(date.valueOf())) return 'data desconhecida';
  return date.toLocaleDateString('pt-BR', { dateStyle: 'medium' });
}

export function validateTranslations(value: unknown): TranslationMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Arquivo de traducoes invalido.');
  }

  const result: TranslationMap = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!/^[a-z0-9*-]+$/i.test(key) || !raw || typeof raw !== 'object') {
      throw new Error('Entrada de traducao invalida.');
    }

    const entry = raw as Partial<TranslationEntry>;
    if (
      typeof entry.name !== 'string' ||
      entry.name.length > 160 ||
      typeof entry.text !== 'string' ||
      !entry.text.trim() ||
      entry.text.length > 12000 ||
      typeof entry.source !== 'string' ||
      entry.source.length > 20000
    ) {
      throw new Error('Entrada de traducao invalida.');
    }

    result[key] = {
      name: entry.name,
      text: entry.text,
      source: entry.source,
      updatedAt: typeof entry.updatedAt === 'string' ? entry.updatedAt : undefined,
    };
  }
  return result;
}

export function readStoredTranslations(): TranslationMap {
  try {
    return validateTranslations(JSON.parse(localStorage.getItem(TRANSLATION_STORAGE) || '{}'));
  } catch {
    return {};
  }
}

export function writeStoredTranslations(translations: TranslationMap): void {
  localStorage.setItem(TRANSLATION_STORAGE, JSON.stringify(translations));
}

export function mergedTranslation(
  card: RiftboundCard,
  initial: TranslationMap,
  custom: TranslationMap,
): TranslationEntry | undefined {
  const ids = [card.riftbound_id, ...(card.printings?.map((printing) => printing.riftbound_id) || [])];
  const uniqueIds = [...new Set(ids)];
  const source = card.text?.plain || '';

  for (const id of uniqueIds) {
    const translation = custom[id];
    if (translation?.source === source) return translation;
  }

  for (const id of uniqueIds) {
    const translation = initial[id];
    if (translation?.source === source) return translation;
  }

  return undefined;
}

export function cardHasId(card: RiftboundCard, cardId: string): boolean {
  return card.riftbound_id === cardId || Boolean(card.printings?.some((printing) => printing.riftbound_id === cardId));
}

export function cardSearchText(
  card: RiftboundCard,
  translation?: TranslationEntry,
): string {
  return normalizeSearch([
    card.name,
    card.riftbound_id,
    ...(card.printings?.map((printing) => printing.riftbound_id) || []),
    card.text?.plain,
    translation?.name,
    translation?.text,
    ...(card.tags || []),
  ].join(' '));
}
