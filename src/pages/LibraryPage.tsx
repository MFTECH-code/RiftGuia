import React from 'react';
import { Download, FileUp, Search, X } from 'lucide-react';
import type { Filters, TranslateCard } from '../appTypes';
import { emptyFilters } from '../appTypes';
import type { RiftboundCard, TranslationMap } from '../types';
import { cardSearchText, DOMAIN_NAMES, normalizeSearch, TYPE_NAMES, validateTranslations } from '../lib/cards';
import { download } from '../lib/download';
import { CardTile } from '../components/CardTile';
import { Pagination } from '../components/Pagination';

interface LibraryPageProps {
  cards: RiftboundCard[];
  customTranslations: TranslationMap;
  translate: TranslateCard;
  onOpenCard: (card: RiftboundCard) => void;
  onImportTranslations: (translations: TranslationMap) => void;
  onStatusChange: (status: string) => void;
}

const pageSize = 24;

export function LibraryPage({ cards, customTranslations, translate, onOpenCard, onImportTranslations, onStatusChange }: LibraryPageProps) {
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const [page, setPage] = React.useState(1);

  const types = React.useMemo(() => unique(cards.map((card) => card.classification?.type).filter(Boolean) as string[]), [cards]);
  const domains = React.useMemo(() => unique(cards.flatMap((card) => card.classification?.domain || [])), [cards]);
  const sets = React.useMemo(() => unique(cards.map((card) => card.set?.set_id).filter(Boolean) as string[]), [cards]);

  const filtered = React.useMemo(() => {
    const query = filters.query.trim();
    const normalizedQuery = normalizeSearch(query);
    const queryTerms = normalizedQuery ? normalizedQuery.split(' ') : [];
    return cards.filter((card) => {
      const translation = translate(card);
      const searchText = cardSearchText(card, translation);
      const matchesQuery = !normalizedQuery || (
        queryTerms.length > 1 ? searchText.includes(normalizedQuery) : searchText.includes(queryTerms[0])
      );
      return (
        matchesQuery &&
        (!filters.type || card.classification?.type === filters.type) &&
        (!filters.domain || card.classification?.domain?.includes(filters.domain)) &&
        (!filters.set || card.set?.set_id === filters.set) &&
        (!filters.translatedOnly || Boolean(translation))
      );
    });
  }, [cards, filters, translate]);

  React.useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const visibleCards = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  async function importTranslations(file: File | undefined) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { format?: string; version?: number; translations?: unknown };
      if (data.format !== 'rift-guia' || data.version !== 1) throw new Error('formato invalido');
      onImportTranslations(validateTranslations(data.translations));
      onStatusChange('Traducoes importadas. Suas edicoes locais existentes foram preservadas.');
    } catch {
      onStatusChange('Nao foi possivel importar. Use um arquivo exportado pelo Rift Guia.');
    }
  }

  return (
    <section className="workspace">
      <div className="toolbar">
        <label className="search">
          <Search size={18} />
          <input value={filters.query} onChange={(event) => setFilters({ ...filters, query: event.target.value })} placeholder="Buscar por nome, texto, codigo ou tag" />
        </label>
        <select value={filters.type} onChange={(event) => setFilters({ ...filters, type: event.target.value })} aria-label="Tipo">
          <option value="">Tipo</option>
          {types.map((type) => <option key={type} value={type}>{TYPE_NAMES[type] || type}</option>)}
        </select>
        <select value={filters.domain} onChange={(event) => setFilters({ ...filters, domain: event.target.value })} aria-label="Dominio">
          <option value="">Dominio</option>
          {domains.map((domain) => <option key={domain} value={domain}>{DOMAIN_NAMES[domain] || domain}</option>)}
        </select>
        <select value={filters.set} onChange={(event) => setFilters({ ...filters, set: event.target.value })} aria-label="Colecao">
          <option value="">Colecao</option>
          {sets.map((set) => <option key={set} value={set}>{set}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={filters.translatedOnly} onChange={(event) => setFilters({ ...filters, translatedOnly: event.target.checked })} />
          Traduzidas
        </label>
        <button title="Limpar filtros" onClick={() => setFilters(emptyFilters)}><X size={18} /></button>
      </div>

      <div className="section-title">
        <h2>{filtered.length.toLocaleString('pt-BR')} cartas encontradas</h2>
        <div className="actions">
          <label className="file-button">
            <FileUp size={16} /> Importar traducoes
            <input type="file" accept="application/json,.json" onChange={(event) => void importTranslations(event.target.files?.[0])} />
          </label>
          <button onClick={() => download('rift-guia-traducoes.json', JSON.stringify({ format: 'rift-guia', version: 1, translations: customTranslations }, null, 2), 'application/json')}>
            <Download size={16} /> Exportar minhas traducoes
          </button>
        </div>
      </div>

      <div className="card-grid">
        {visibleCards.map((card) => <CardTile key={`${card.riftbound_id}-${card.id}`} card={card} translation={translate(card)} onOpen={onOpenCard} />)}
      </div>

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}
