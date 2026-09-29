export type CardType =
  | 'Unit'
  | 'Spell'
  | 'Gear'
  | 'Legend'
  | 'Battlefield'
  | 'Rune'
  | 'Token'
  | string;

export interface RiftboundCard {
  id: string;
  name: string;
  riftbound_id: string;
  printings?: CardPrinting[];
  collector_number?: number | null;
  attributes?: {
    energy?: number | null;
    might?: number | null;
    power?: number | null;
  };
  classification?: {
    type?: CardType;
    supertype?: string | null;
    rarity?: string | null;
    domain?: string[];
  };
  text?: {
    plain?: string | null;
    rich?: string | null;
    flavour?: string | null;
  };
  set?: {
    set_id?: string;
    label?: string;
  };
  orientation?: 'portrait' | 'landscape' | string;
  media?: {
    image_url?: string | null;
    artist?: string | null;
    accessibility_text?: string | null;
  };
  tags?: string[];
  metadata?: {
    clean_name?: string;
    alternate_art?: boolean;
    overnumbered?: boolean;
    signature?: boolean;
    updated_on?: string;
  };
}

export interface CardPrinting {
  id: string;
  riftbound_id: string;
  set_id?: string;
  collector_number?: number | null;
}

export interface CardSnapshot {
  schemaVersion: number;
  source: string;
  fetchedAt: string;
  total: number;
  cards: RiftboundCard[];
}

export interface TranslationEntry {
  name: string;
  text: string;
  source: string;
  updatedAt?: string;
}

export interface TranslationFile {
  schemaVersion: number;
  language: string;
  translations: Record<string, TranslationEntry>;
}

export type TranslationMap = Record<string, TranslationEntry>;

export interface DeckRow {
  card: RiftboundCard;
  quantity: number;
  section: DeckSection;
}

export type DeckSection = 'legend' | 'champion' | 'main' | 'runes' | 'battlefields' | 'sideboard';

export interface DeckProblem {
  line: number;
  text: string;
  message: string;
}

export interface ParsedDeck {
  rows: DeckRow[];
  errors: DeckProblem[];
  notices: string[];
}
