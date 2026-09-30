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
  const translatedTotal = React.useMemo(() => cards.filter((card) => Boolean(translate(card))).length, [cards, translate]);

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
  const activeFilters = buildActiveFilters(filters);

  function updateFilters(next: Partial<Filters>) {
    setFilters({ ...filters, ...next });
  }

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
    <section className="workspace library-page">
      <div className="page-hero library-hero">
        <div>
          <p className="eyebrow">Biblioteca</p>
          <h2>Encontre cartas por nome, texto, tipo ou domínio.</h2>
          <p>Use os filtros para reduzir a lista e abra qualquer carta para ver a tradução completa, texto original e detalhes do catálogo.</p>
        </div>
        <div className="hero-stats" aria-label="Resumo da biblioteca">
          <span><strong>{cards.length.toLocaleString('pt-BR')}</strong> cartas</span>
          <span><strong>{translatedTotal.toLocaleString('pt-BR')}</strong> traduzidas</span>
          <span><strong>{filtered.length.toLocaleString('pt-BR')}</strong> no resultado</span>
        </div>
      </div>

      <div className="toolbar library-toolbar">
        <label className="search">
          <Search size={18} />
          <input value={filters.query} onChange={(event) => updateFilters({ query: event.target.value })} placeholder="Buscar por nome, texto, código ou tag" />
        </label>
        <select value={filters.type} onChange={(event) => updateFilters({ type: event.target.value })} aria-label="Tipo">
          <option value="">Tipo</option>
          {types.map((type) => <option key={type} value={type}>{TYPE_NAMES[type] || type}</option>)}
        </select>
        <select value={filters.domain} onChange={(event) => updateFilters({ domain: event.target.value })} aria-label="Dominio">
          <option value="">Domínio</option>
          {domains.map((domain) => <option key={domain} value={domain}>{DOMAIN_NAMES[domain] || domain}</option>)}
        </select>
        <select value={filters.set} onChange={(event) => updateFilters({ set: event.target.value })} aria-label="Colecao">
          <option value="">Coleção</option>
          {sets.map((set) => <option key={set} value={set}>{set}</option>)}
        </select>
        <label className="check">
          <input type="checkbox" checked={filters.translatedOnly} onChange={(event) => updateFilters({ translatedOnly: event.target.checked })} />
          Só traduzidas
        </label>
        <button className="icon-only" title="Limpar filtros" onClick={() => setFilters(emptyFilters)}><X size={18} /></button>
      </div>

      <div className="filter-summary">
        <div className="filter-chips" aria-label="Filtros ativos">
          {activeFilters.length ? activeFilters.map((filter) => (
            <button key={filter.key} type="button" onClick={() => updateFilters(filter.clear)}>
              {filter.label} <X size={14} />
            </button>
          )) : <span>Nenhum filtro ativo</span>}
        </div>
        <p>{visibleCards.length ? `Mostrando ${visibleCards.length} cartas nesta página.` : 'Nenhuma carta encontrada com os filtros atuais.'}</p>
      </div>

      <div className="section-title">
        <div>
          <p className="eyebrow">Resultado</p>
          <h2>{filtered.length.toLocaleString('pt-BR')} cartas encontradas</h2>
        </div>
        <div className="actions">
          <label className="file-button secondary-action">
            <FileUp size={16} /> Importar traduções
            <input type="file" accept="application/json,.json" onChange={(event) => void importTranslations(event.target.files?.[0])} />
          </label>
          <button className="secondary-action" onClick={() => download('rift-guia-traducoes.json', JSON.stringify({ format: 'rift-guia', version: 1, translations: customTranslations }, null, 2), 'application/json')}>
            <Download size={16} /> Exportar minhas traduções
          </button>
        </div>
      </div>

      <div className="card-grid">
        {visibleCards.map((card) => <CardTile key={`${card.riftbound_id}-${card.id}`} card={card} translation={translate(card)} onOpen={onOpenCard} />)}
      </div>

      {!visibleCards.length && <p className="empty empty-state">Tente limpar os filtros ou buscar por outro nome.</p>}

      <Pagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}

function buildActiveFilters(filters: Filters): Array<{ key: string; label: string; clear: Partial<Filters> }> {
  const result: Array<{ key: string; label: string; clear: Partial<Filters> }> = [];
  if (filters.query.trim()) result.push({ key: 'query', label: `Busca: ${filters.query.trim()}`, clear: { query: '' } });
  if (filters.type) result.push({ key: 'type', label: `Tipo: ${TYPE_NAMES[filters.type] || filters.type}`, clear: { type: '' } });
  if (filters.domain) result.push({ key: 'domain', label: `Domínio: ${DOMAIN_NAMES[filters.domain] || filters.domain}`, clear: { domain: '' } });
  if (filters.set) result.push({ key: 'set', label: `Coleção: ${filters.set}`, clear: { set: '' } });
  if (filters.translatedOnly) result.push({ key: 'translatedOnly', label: 'Só traduzidas', clear: { translatedOnly: false } });
  return result;
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}
