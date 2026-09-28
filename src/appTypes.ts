import type { RiftboundCard, TranslationEntry } from './types';

export type View = 'library' | 'deck' | 'learn';

export const VIEW_PATHS: Record<View, string> = {
  library: '/biblioteca',
  deck: '/meu-deck',
  learn: '/aprenda',
};

export interface Filters {
  query: string;
  type: string;
  domain: string;
  set: string;
  translatedOnly: boolean;
}

export interface Guide {
  id: string;
  name: string;
  text: string;
  kind: 'manual' | 'legend';
}

export type TranslateCard = (card: RiftboundCard) => TranslationEntry | undefined;

export const emptyFilters: Filters = {
  query: '',
  type: '',
  domain: '',
  set: '',
  translatedOnly: false,
};
