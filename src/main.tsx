import React from 'react';
import ReactDOM from 'react-dom/client';
import { Download, FileUp, RefreshCw, Search, X } from 'lucide-react';
import { DECK_GUIDES, GUIDE_SOURCE, TERMS } from './data';
import { cardSearchText, DOMAIN_NAMES, formatCardText, mergedTranslation, readStoredTranslations, safeImageUrl, snapshotDate, TYPE_NAMES, validateTranslations, writeStoredTranslations } from './lib/cards';
import { parseDeck, SECTION_LABELS, serializeDeck } from './lib/deckParser';
import type { CardSnapshot, DeckRow, RiftboundCard, TranslationEntry, TranslationFile, TranslationMap } from './types';
import './styles.css';

type View = 'library' | 'deck' | 'learn';

interface Filters {
  query: string;
  type: string;
  domain: string;
  set: string;
  translatedOnly: boolean;
}

interface LegendGuide {
  id: string;
  name: string;
  text: string;
  kind: 'legend';
}

const emptyFilters: Filters = { query: '', type: '', domain: '', set: '', translatedOnly: false };
const pageSize = 24;

function App() {
  const [view, setView] = React.useState<View>('library');
  const [cards, setCards] = React.useState<RiftboundCard[]>([]);
  const [initialTranslations, setInitialTranslations] = React.useState<TranslationMap>({});
  const [customTranslations, setCustomTranslations] = React.useState<TranslationMap>(() => readStoredTranslations());
  const [filters, setFilters] = React.useState<Filters>(emptyFilters);
  const [selected, setSelected] = React.useState<RiftboundCard | null>(null);
  const [page, setPage] = React.useState(1);
  const [status, setStatus] = React.useState('Abrindo catalogo local...');
  const [deckList, setDeckList] = React.useState('');
  const [deckName, setDeckName] = React.useState('Meu primeiro deck');
  const [deckPlan, setDeckPlan] = React.useState('');
  const [guideId, setGuideId] = React.useState('');

  const translate = React.useCallback(
    (card: RiftboundCard): TranslationEntry | undefined => mergedTranslation(card, initialTranslations, customTranslations),
    [initialTranslations, customTranslations],
  );

  React.useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const [cardsResponse, translationsResponse] = await Promise.all([
          fetch('/data/cards.json', { cache: 'no-store' }),
          fetch('/data/translations.pt-BR.json', { cache: 'no-store' }),
        ]);
        if (!cardsResponse.ok) throw new Error(`catalogo ${cardsResponse.status}`);
        const snapshot = (await cardsResponse.json()) as CardSnapshot;
        if (snapshot.schemaVersion !== 1 || !Array.isArray(snapshot.cards) || snapshot.cards.length !== snapshot.total) {
          throw new Error('snapshot invalido');
        }

        let translations: TranslationMap = {};
        if (translationsResponse.ok) {
          const file = (await translationsResponse.json()) as TranslationFile;
          translations = validateTranslations(file.translations);
        }

        if (!alive) return;
        setCards(snapshot.cards);
        setInitialTranslations(translations);
        setStatus(`${snapshot.cards.length.toLocaleString('pt-BR')} cartas no catalogo local, atualizado em ${snapshotDate(snapshot.fetchedAt)}. ${Object.keys(translations).length.toLocaleString('pt-BR')} traducoes pt-BR.`);
      } catch {
        if (alive) setStatus('Nao foi possivel abrir o catalogo local. Confira public/data/cards.json e tente novamente.');
      }
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  const types = React.useMemo(() => unique(cards.map((card) => card.classification?.type).filter(Boolean) as string[]), [cards]);
  const domains = React.useMemo(() => unique(cards.flatMap((card) => card.classification?.domain || [])), [cards]);
  const sets = React.useMemo(() => unique(cards.map((card) => card.set?.set_id).filter(Boolean) as string[]), [cards]);

  const filtered = React.useMemo(() => {
    const query = filters.query.trim();
    const normalizedQuery = query ? cardSearchText({ id: '', name: query, riftbound_id: query } as RiftboundCard) : '';
    return cards.filter((card) => {
      const translation = translate(card);
      return (
        (!normalizedQuery || cardSearchText(card, translation).includes(normalizedQuery)) &&
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
  const visibleCards = filtered.slice((page - 1) * pageSize, page * pageSize);
  const parsedDeck = React.useMemo(() => parseDeck(deckList, cards, translate), [cards, deckList, translate]);
  const legendGuides = React.useMemo(() => buildLegendGuides(cards, translate), [cards, translate]);
  const allGuides = React.useMemo(() => [...DECK_GUIDES.map((guide) => ({ ...guide, kind: 'manual' as const })), ...legendGuides], [legendGuides]);
  const selectedGuide = allGuides.find((guide) => guide.id === guideId);

  function saveCustom(next: TranslationMap) {
    writeStoredTranslations(next);
    setCustomTranslations(next);
  }

  function exportTranslations() {
    download('rift-guia-traducoes.json', JSON.stringify({ format: 'rift-guia', version: 1, translations: customTranslations }, null, 2), 'application/json');
  }

  async function importTranslations(file: File | undefined) {
    if (!file) return;
    try {
      const data = JSON.parse(await file.text()) as { format?: string; version?: number; translations?: unknown };
      if (data.format !== 'rift-guia' || data.version !== 1) throw new Error('formato invalido');
      saveCustom({ ...validateTranslations(data.translations), ...customTranslations });
      setStatus('Traducoes importadas. Suas edicoes locais existentes foram preservadas.');
    } catch {
      setStatus('Nao foi possivel importar. Use um arquivo exportado pelo Rift Guia.');
    }
  }

  return (
    <main>
      <header className="topbar">
        <div>
          <p className="eyebrow">Rift Guia</p>
          <h1>Cartas, decks e regras em portugues.</h1>
          <p>{status}</p>
        </div>
        <nav aria-label="Navegacao principal">
          <button className={view === 'library' ? 'active' : ''} onClick={() => setView('library')}>Biblioteca</button>
          <button className={view === 'deck' ? 'active' : ''} onClick={() => setView('deck')}>Meu deck</button>
          <button className={view === 'learn' ? 'active' : ''} onClick={() => setView('learn')}>Aprenda</button>
        </nav>
      </header>

      {view === 'library' && (
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
              <button onClick={exportTranslations}><Download size={16} /> Exportar minhas traducoes</button>
            </div>
          </div>

          <div className="card-grid">
            {visibleCards.map((card) => <CardTile key={card.riftbound_id} card={card} translation={translate(card)} onOpen={setSelected} />)}
          </div>

          <div className="pager">
            <button disabled={page <= 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Anterior</button>
            <span>{Math.min(page, totalPages)} / {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Proxima</button>
          </div>
        </section>
      )}

      {view === 'deck' && (
        <section className="deck-layout">
          <div className="panel">
            <p className="eyebrow">Da lista para a mesa</p>
            <h2>Importe um deck</h2>
            <label>
              Nome do deck
              <input value={deckName} onChange={(event) => setDeckName(event.target.value)} />
            </label>
            <label>
              Lista de cartas
              <textarea value={deckList} onChange={(event) => setDeckList(event.target.value)} rows={14} placeholder={'Legend\n1 Jinx, Loose Cannon\n\nMain Deck\n3 Blazing Scorcher\n3 Flame Chompers\n\nRunes\n6 Fury Rune'} />
            </label>
            <div className="actions">
              <button onClick={() => download(`${deckName || 'rift-guia-deck'}.txt`, serializeDeck(parsedDeck.rows), 'text/plain')} disabled={!parsedDeck.rows.length || Boolean(parsedDeck.errors.length)}>
                <Download size={16} /> Exportar lista resolvida
              </button>
            </div>
            {parsedDeck.errors.length > 0 && <ProblemList problems={parsedDeck.errors} />}
            {parsedDeck.notices.map((notice) => <p className="help" key={notice}>{notice}</p>)}
          </div>

          <div className="panel">
            <h2>Previa do deck</h2>
            <p className="help">{parsedDeck.rows.reduce((sum, row) => sum + row.quantity, 0)} cartas resolvidas em {parsedDeck.rows.length} entradas.</p>
            <DeckPreview rows={parsedDeck.rows} translate={translate} onOpen={setSelected} />
          </div>

          <div className="panel wide">
            <h2>Plano de jogo</h2>
            <div className="guide-row">
              <select value={guideId} onChange={(event) => setGuideId(event.target.value)}>
                <option value="">Escolher guia ou lenda</option>
                {allGuides.map((guide) => <option key={guide.id} value={guide.id}>{guide.name}</option>)}
              </select>
              <button disabled={!selectedGuide} onClick={() => selectedGuide && setDeckPlan((value) => `${value}${value ? '\n\n' : ''}${selectedGuide.name}\n${selectedGuide.text}${selectedGuide.kind === 'manual' ? `\nFonte: ${GUIDE_SOURCE}` : ''}`)}>
                <RefreshCw size={16} /> Adicionar ao plano
              </button>
            </div>
            {selectedGuide && <p className="guide-preview">{selectedGuide.text}</p>}
            <textarea value={deckPlan} onChange={(event) => setDeckPlan(event.target.value)} rows={10} placeholder="Objetivo do deck, mao inicial, primeiros turnos, combinacoes e ajustes apos jogar..." />
          </div>
        </section>
      )}

      {view === 'learn' && (
        <section className="learn">
          <div className="panel">
            <p className="eyebrow">Comece com calma</p>
            <h2>Riftbound para quem nunca jogou TCG</h2>
            <p>Use este glossario enquanto le as cartas. Os nomes em portugues sao explicacoes de estudo e nao substituem as regras oficiais.</p>
          </div>
          {unique(TERMS.map((term) => term.group)).map((group) => (
            <section className="term-group" key={group}>
              <h3>{group}</h3>
              <div className="term-grid">
                {TERMS.filter((term) => term.group === group).map((term) => (
                  <article className="term-card" key={term.en}>
                    <span>{term.en}</span>
                    <h4>{term.pt}</h4>
                    <p>{term.body}</p>
                    <strong>Na pratica</strong>
                    <p>{term.example}</p>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </section>
      )}

      {selected && (
        <CardDialog
          card={selected}
          translation={translate(selected)}
          isCustom={Boolean(customTranslations[selected.riftbound_id])}
          onClose={() => setSelected(null)}
          onSave={(entry) => saveCustom({ ...customTranslations, [selected.riftbound_id]: entry })}
          onRemove={() => {
            const next = { ...customTranslations };
            delete next[selected.riftbound_id];
            saveCustom(next);
          }}
        />
      )}
    </main>
  );
}

function CardTile({ card, translation, onOpen }: { card: RiftboundCard; translation?: TranslationEntry; onOpen: (card: RiftboundCard) => void }) {
  const image = safeImageUrl(card);
  return (
    <button className="card-tile" onClick={() => onOpen(card)}>
      {image ? <img src={image} alt={card.name} loading="lazy" /> : <div className="missing-art">Imagem indisponivel</div>}
      <span>{translation ? 'PT-BR' : 'Pendente'}</span>
      <h3>{translation?.name || card.name}</h3>
      <p>{TYPE_NAMES[card.classification?.type || ''] || card.classification?.type || 'Carta'} · {card.set?.set_id || ''} {String(card.collector_number || '').padStart(3, '0')}</p>
    </button>
  );
}

function CardDialog({ card, translation, isCustom, onClose, onSave, onRemove }: { card: RiftboundCard; translation?: TranslationEntry; isCustom: boolean; onClose: () => void; onSave: (entry: TranslationEntry) => void; onRemove: () => void }) {
  const [name, setName] = React.useState(translation?.name || '');
  const [text, setText] = React.useState(translation?.text || '');
  const image = safeImageUrl(card);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="card-title">
      <article className="card-detail">
        <button className="icon-button" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        {image && <img src={image} alt={card.name} />}
        <div>
          <p className="eyebrow">{card.riftbound_id}</p>
          <h2 id="card-title">{translation?.name || card.name}</h2>
          <p className="help">{card.name} · {TYPE_NAMES[card.classification?.type || ''] || card.classification?.type || 'Carta'}</p>
          <div className="rules">
            <section>
              <h3>Portugues</h3>
              <p>{translation?.text || 'Esta carta ainda nao tem traducao.'}</p>
            </section>
            <section>
              <h3>Original</h3>
              <p>{formatCardText(card.text?.plain)}</p>
            </section>
          </div>
          <form onSubmit={(event) => {
            event.preventDefault();
            if (!text.trim()) return;
            onSave({ name: name.trim() || card.name, text: text.trim(), source: card.text?.plain || '', updatedAt: new Date().toISOString() });
          }}>
            <label>
              Nome traduzido
              <input value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label>
              Texto traduzido
              <textarea value={text} onChange={(event) => setText(event.target.value)} rows={6} />
            </label>
            <div className="actions">
              <button type="submit">Salvar traducao</button>
              <button type="button" disabled={!isCustom} onClick={onRemove}>Remover minha edicao</button>
            </div>
          </form>
        </div>
      </article>
    </div>
  );
}

function ProblemList({ problems }: { problems: { line: number; text: string; message: string }[] }) {
  return (
    <div className="problems">
      <h3>{problems.length} linha(s) precisam de revisao</h3>
      {problems.map((problem) => <p key={`${problem.line}-${problem.text}`}><strong>Linha {problem.line}: {problem.text}</strong><br />{problem.message}</p>)}
    </div>
  );
}

function DeckPreview({ rows, translate, onOpen }: { rows: DeckRow[]; translate: (card: RiftboundCard) => TranslationEntry | undefined; onOpen: (card: RiftboundCard) => void }) {
  if (!rows.length) return <p className="empty">Cole uma lista para visualizar as cartas.</p>;
  return (
    <div className="deck-preview">
      {(Object.keys(SECTION_LABELS) as Array<keyof typeof SECTION_LABELS>).map((section) => {
        const group = rows.filter((row) => row.section === section);
        if (!group.length) return null;
        return (
          <section key={section}>
            <h3>{SECTION_LABELS[section]} · {group.reduce((sum, row) => sum + row.quantity, 0)}</h3>
            {group.map((row) => {
              const translation = translate(row.card);
              return (
                <button key={`${section}-${row.card.riftbound_id}`} onClick={() => onOpen(row.card)}>
                  <strong>{row.quantity}x {translation?.name || row.card.name}</strong>
                  <span>{translation?.text || 'Traducao pendente'}</span>
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

function buildLegendGuides(cards: RiftboundCard[], translate: (card: RiftboundCard) => TranslationEntry | undefined): LegendGuide[] {
  const picked = new Map<string, RiftboundCard>();
  for (const card of cards.filter((item) => item.classification?.type === 'Legend')) {
    const key = `${(card.classification?.domain || []).join('|')}|${card.text?.plain || ''}`;
    if (!picked.has(key)) picked.set(key, card);
  }

  return [...picked.values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((card) => {
      const translation = translate(card);
      const name = translation?.name || card.name;
      const domains = (card.classification?.domain || []).map((domain) => DOMAIN_NAMES[domain] || domain).join(' e ') || 'os dominios indicados pela carta';
      return {
        id: `legend:${card.riftbound_id}`,
        name: `Lenda - ${name}`,
        kind: 'legend' as const,
        text: `Roteiro inicial para ${name}: construa dentro dos dominios ${domains}. Leia a habilidade impressa e escolha cartas que ajudam a cumprir sua condicao, pagar seu custo ou aproveitar o efeito. Defina um Campeao Escolhido que contribua para essa mesma ideia. Depois das primeiras partidas, anote quais cartas ficaram sem funcao e ajuste o plano.`,
      };
    });
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}

function download(name: string, value: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
