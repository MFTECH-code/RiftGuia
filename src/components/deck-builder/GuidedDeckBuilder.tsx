import React from 'react';
import { Download, FileJson, Import, RotateCcw, Save, Search } from 'lucide-react';
import type { TranslateCard } from '../../appTypes';
import type { ParsedDeck, RiftboundCard } from '../../types';
import { download } from '../../lib/download';
import { parseDeck, serializeDeck } from '../../lib/deckParser';
import {
  BUILDER_STORAGE_KEY,
  builderSteps,
  calculateStats,
  canUseCardWithLegend,
  championBaseName,
  displayName,
  emptyBuilderState,
  filterCardsForPicker,
  findCard,
  readBuilderState,
  rowsFromBuilder,
  sanitizeBuilderState,
  sortCardsForBuilder,
  uniqueByCardId,
  updateQuantity,
  writeBuilderState,
  type BuilderStep,
  type DeckBuilderState,
  type LegendSuggestion,
  type LegendSuggestionsFile,
} from '../../lib/deckBuilder';
import { CardChoiceGrid } from './CardChoiceGrid';
import { DeckStatsPanel } from './DeckStatsPanel';
import { StepNavigation } from './StepNavigation';
import { SuggestionPanel } from './SuggestionPanel';
import { DeckPreview } from '../DeckPreview';
import { ProblemList } from '../ProblemList';

interface GuidedDeckBuilderProps {
  cards: RiftboundCard[];
  translate: TranslateCard;
  onOpenCard: (card: RiftboundCard) => void;
}

export function GuidedDeckBuilder({ cards, translate, onOpenCard }: GuidedDeckBuilderProps) {
  const [state, setState] = React.useState<DeckBuilderState>(() => readBuilderState());
  const [step, setStep] = React.useState<BuilderStep>('legend');
  const [query, setQuery] = React.useState('');
  const [importText, setImportText] = React.useState('');
  const [importResult, setImportResult] = React.useState<ParsedDeck | null>(null);
  const [suggestions, setSuggestions] = React.useState<LegendSuggestion[]>([]);

  React.useEffect(() => {
    let active = true;
    fetch('/data/legend-suggestions.pt-BR.json', { cache: 'no-cache' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Base de sugestões indisponível.')))
      .then((file: LegendSuggestionsFile) => {
        if (active) setSuggestions(Array.isArray(file.legends) ? file.legends : []);
      })
      .catch(() => {
        if (active) setSuggestions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  React.useEffect(() => {
    writeBuilderState(state);
  }, [state]);

  const legend = React.useMemo(() => findCard(cards, state.legendId), [cards, state.legendId]);
  const champion = React.useMemo(() => findCard(cards, state.championId), [cards, state.championId]);
  const stats = React.useMemo(() => calculateStats(cards, state), [cards, state]);
  const suggestion = React.useMemo(() => {
    if (!legend) return undefined;
    return suggestions.find((item) => item.representativeCardId === legend.riftbound_id || item.aliases.includes(legend.riftbound_id) || item.name === displayName(legend, translate(legend)));
  }, [legend, suggestions, translate]);
  const legendLabels = React.useMemo(() => {
    const labels = new Map<string, string>();
    for (const item of suggestions) {
      for (const id of [item.representativeCardId, ...item.aliases]) {
        labels.set(id, item.translatedName || item.name);
      }
    }
    return labels;
  }, [suggestions]);

  const completed = React.useMemo(() => ({
    legend: Boolean(state.legendId),
    champion: Boolean(state.championId),
    battlefields: state.battlefieldIds.length === 3,
    main: stats.mainCount >= 40,
    sideboard: true,
    guide: Boolean(state.guide.trim()),
  }), [state, stats.mainCount]);

  const rows = React.useMemo(() => rowsFromBuilder(cards, state), [cards, state]);
  const availableLegends = React.useMemo(
    () => {
      if (suggestions.length) {
        const picked = suggestions
          .map((item) => {
            const aliases = cards.filter((card) => item.aliases.includes(card.riftbound_id));
            return aliases.find((card) => cleanComparableName(card.name) === cleanComparableName(item.name))
              || aliases.find((card) => card.riftbound_id === item.representativeCardId)
              || aliases[0];
          })
          .filter((card): card is RiftboundCard => Boolean(card));
        return picked.sort((a, b) => (legendLabels.get(a.riftbound_id) || displayName(a, translate(a))).localeCompare(legendLabels.get(b.riftbound_id) || displayName(b, translate(b)), 'pt-BR'));
      }
      return sortCardsForBuilder(uniqueByCardId(cards.filter((card) => card.classification?.type === 'Legend')), translate);
    },
    [cards, legendLabels, suggestions, translate],
  );
  const championOptions = React.useMemo(() => {
    const championName = suggestion?.name ? suggestion.name.split(/\s+-\s+/)[0] : championBaseName(legend);
    if (!championName) return [];
    return sortCardsForBuilder(uniqueByCardId(cards.filter((card) => {
      if (card.classification?.type !== 'Unit') return false;
      if (!canUseCardWithLegend(card, legend)) return false;
      return displayName(card, translate(card)).toLowerCase().startsWith(championName.toLowerCase()) || card.name.toLowerCase().startsWith(championName.toLowerCase());
    })), translate);
  }, [cards, legend, suggestion, translate]);
  const battlefieldOptions = React.useMemo(
    () => sortCardsForBuilder(uniqueByCardId(cards.filter((card) => card.classification?.type === 'Battlefield')), translate),
    [cards, translate],
  );
  const recommendedBattlefieldIds = React.useMemo(() => {
    const recommendedNames = new Set((suggestion?.recommendedBattlefields || []).map((item) => cleanComparableName(item.name)));
    return new Set(
      battlefieldOptions
        .filter((card) => recommendedNames.has(cleanComparableName(card.name)))
        .map((card) => card.riftbound_id),
    );
  }, [battlefieldOptions, suggestion]);
  const deckCardOptions = React.useMemo(
    () => sortCardsForBuilder(uniqueByCardId(cards.filter((card) => canUseCardWithLegend(card, legend))), translate),
    [cards, legend, translate],
  );

  const filtered = React.useMemo(() => {
    const source = step === 'legend'
      ? availableLegends
      : step === 'champion'
        ? championOptions
        : step === 'battlefields'
          ? battlefieldOptions
          : deckCardOptions;
    const result = filterCardsForPicker(source, query, translate);
    if (step !== 'battlefields') return result;
    return [...result].sort((a, b) => Number(recommendedBattlefieldIds.has(b.riftbound_id)) - Number(recommendedBattlefieldIds.has(a.riftbound_id)));
  }, [availableLegends, battlefieldOptions, championOptions, deckCardOptions, query, recommendedBattlefieldIds, step, translate]);

  function update(next: DeckBuilderState) {
    setState(sanitizeBuilderState(next));
  }

  function selectLegend(card: RiftboundCard) {
    update({
      ...state,
      legendId: card.riftbound_id,
      championId: '',
      main: {},
      sideboard: {},
      guide: suggestion?.gamePlan && state.legendId === card.riftbound_id ? state.guide : state.guide,
    });
    setStep('champion');
    setQuery('');
  }

  function selectChampion(card: RiftboundCard) {
    update({ ...state, championId: card.riftbound_id });
    setStep('battlefields');
    setQuery('');
  }

  function toggleBattlefield(card: RiftboundCard) {
    const exists = state.battlefieldIds.includes(card.riftbound_id);
    const next = exists ? state.battlefieldIds.filter((id) => id !== card.riftbound_id) : [...state.battlefieldIds, card.riftbound_id].slice(0, 3);
    update({ ...state, battlefieldIds: next });
    if (!exists && next.length === 3) {
      setStep('main');
      setQuery('');
    }
  }

  function applyImport() {
    const parsed = parseDeck(importText, cards, translate);
    setImportResult(parsed);
    if (parsed.errors.length) return;

    const next: DeckBuilderState = { ...state, main: {}, sideboard: {}, battlefieldIds: [] };
    for (const row of parsed.rows) {
      if (row.section === 'legend') next.legendId = row.card.riftbound_id;
      if (row.section === 'champion') next.championId = row.card.riftbound_id;
      if (row.section === 'battlefields') next.battlefieldIds = [...next.battlefieldIds, row.card.riftbound_id].slice(0, 3);
      if (row.section === 'main') next.main = updateQuantity(next.main, row.card.riftbound_id, row.quantity);
      if (row.section === 'sideboard') next.sideboard = updateQuantity(next.sideboard, row.card.riftbound_id, row.quantity);
    }
    update(next);
  }

  function exportGuideJson() {
    const payload = {
      schemaVersion: 1,
      name: state.name,
      legend: legend ? displayName(legend, translate(legend)) : '',
      champion: champion ? displayName(champion, translate(champion)) : '',
      guide: state.guide,
      suggestion,
      deck: rows.map((row) => ({
        section: row.section,
        quantity: row.quantity,
        id: row.card.riftbound_id,
        name: row.card.name,
        translatedName: translate(row.card)?.name,
      })),
      stats,
    };
    download(`${state.name || 'rift-guia-deck'}-guia.json`, JSON.stringify(payload, null, 2), 'application/json');
  }

  const nextStep = builderSteps[Math.min(builderSteps.findIndex((item) => item.id === step) + 1, builderSteps.length - 1)]?.id || step;
  const previousStep = builderSteps[Math.max(builderSteps.findIndex((item) => item.id === step) - 1, 0)]?.id || step;

  return (
    <section className="panel wide guided-builder">
      <div className="guide-header">
        <div>
          <p className="eyebrow">Deck builder guiado</p>
          <h2>Monte o deck por etapas com sugestões durante a construção</h2>
        </div>
        <div className="builder-header-actions">
          <button type="button" onClick={() => download(`${state.name || 'rift-guia-deck'}.txt`, serializeDeck(rows), 'text/plain')} disabled={!rows.length}>
            <Download size={16} /> Exportar deck
          </button>
          <button type="button" onClick={exportGuideJson} disabled={!rows.length && !state.guide.trim()}>
            <FileJson size={16} /> Exportar guia
          </button>
          <button type="button" onClick={() => { localStorage.removeItem(BUILDER_STORAGE_KEY); setState(emptyBuilderState); setStep('legend'); }}>
            <RotateCcw size={16} /> Limpar
          </button>
        </div>
      </div>

      <label className="builder-name">
        Nome do deck
        <input value={state.name} onChange={(event) => update({ ...state, name: event.target.value })} />
      </label>

      <StepNavigation current={step} completed={completed} onStepChange={(next) => { setStep(next); setQuery(''); }} />

      <div className="builder-layout">
        <div className="builder-workspace">
          <div className="builder-toolbar">
            <div className="search">
              <Search size={18} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, texto, tipo, cor ou código..." />
            </div>
            <button type="button" disabled={previousStep === step} onClick={() => { setStep(previousStep); setQuery(''); }}>Voltar</button>
            <button type="button" disabled={nextStep === step} onClick={() => { setStep(nextStep); setQuery(''); }}>Próxima etapa</button>
          </div>

          {step === 'legend' && (
            <BuilderStepBlock title="Escolha a lenda" help="A lenda define os domínios legais e a habilidade principal do deck.">
              <CardChoiceGrid cards={filtered} selectedIds={[state.legendId]} translate={translate} labelFor={(card) => legendLabels.get(card.riftbound_id) || displayName(card, translate(card))} onChoose={selectLegend} limit={80} />
            </BuilderStepBlock>
          )}

          {step === 'champion' && (
            <BuilderStepBlock title="Escolha a Champion Unit" help={legend ? `Opções encontradas para ${championBaseName(legend)} dentro dos domínios da lenda.` : 'Escolha uma lenda antes de selecionar a Champion Unit.'}>
              <CardChoiceGrid cards={filtered} selectedIds={[state.championId]} translate={translate} onChoose={selectChampion} limit={80} />
            </BuilderStepBlock>
          )}

          {step === 'battlefields' && (
            <BuilderStepBlock title={`Escolha 3 Battlefields (${state.battlefieldIds.length}/3)`} help="Battlefields precisam ser únicos. Clique novamente para remover um campo selecionado.">
              <CardChoiceGrid cards={filtered} selectedIds={state.battlefieldIds} recommendedIds={recommendedBattlefieldIds} translate={translate} onChoose={toggleBattlefield} limit={80} />
            </BuilderStepBlock>
          )}

          {step === 'main' && (
            <BuilderStepBlock title={`Monte o Main Deck (${stats.mainCount}/40)`} help="Use até 3 cópias como ponto de partida e priorize cartas que ativam a lenda ou vencem combates.">
              <CardChoiceGrid cards={filtered} quantities={state.main} translate={translate} onQuantityChange={(card, quantity) => update({ ...state, main: updateQuantity(state.main, card.riftbound_id, quantity) })} limit={120} />
            </BuilderStepBlock>
          )}

          {step === 'sideboard' && (
            <BuilderStepBlock title={`Monte o Side Deck (${stats.sideboardCount}/10)`} help="Use para respostas contra estratégias específicas. Pode deixar vazio enquanto testa.">
              <CardChoiceGrid cards={filtered} quantities={state.sideboard} translate={translate} onQuantityChange={(card, quantity) => update({ ...state, sideboard: updateQuantity(state.sideboard, card.riftbound_id, quantity) })} limit={120} />
            </BuilderStepBlock>
          )}

          {step === 'guide' && (
            <BuilderStepBlock title="Escreva seu guia" help="Registre como jogar, mãos iniciais, combos, ajustes e observações de teste.">
              <div className="builder-guide-tools">
                <button type="button" disabled={!suggestion} onClick={() => suggestion && update({
                  ...state,
                  guide: [
                    state.guide,
                    `${suggestion.translatedName || suggestion.name}\nArquétipo: ${suggestion.archetype}\n\nPlano: ${suggestion.gamePlan}\n\nMulligan: ${suggestion.mulligan}\n\nSinergias:\n- ${suggestion.synergyPackages.join('\n- ')}\n\nCuidados: ${suggestion.weakness}`,
                  ].filter(Boolean).join('\n\n'),
                })}>
                  <Save size={16} /> Inserir sugestão da lenda
                </button>
              </div>
              <textarea value={state.guide} onChange={(event) => update({ ...state, guide: event.target.value })} rows={12} placeholder="Ex.: plano de jogo, prioridades de mulligan, combos, como jogar contra pressão, como ajustar o side deck..." />
            </BuilderStepBlock>
          )}

          <div className="builder-import-box">
            <h3><Import size={18} /> Importar lista</h3>
            <textarea value={importText} onChange={(event) => setImportText(event.target.value)} rows={6} placeholder="Cole uma lista com Legend, Champion, Battlefields, Main Deck e Sideboard..." />
            <button type="button" onClick={applyImport} disabled={!importText.trim()}>Importar para o construtor</button>
            {importResult?.errors.length ? <ProblemList problems={importResult.errors} /> : null}
            {importResult && !importResult.errors.length ? <p className="help">Lista importada para o construtor.</p> : null}
          </div>
        </div>

        <div className="builder-side">
          <div className="builder-preview">
            <h3>Deck em montagem</h3>
            <DeckPreview rows={rows} translate={translate} onOpen={onOpenCard} />
          </div>
          <SuggestionPanel suggestion={suggestion} />
          <DeckStatsPanel stats={stats} />
        </div>
      </div>
    </section>
  );
}

function BuilderStepBlock({ title, help, children }: { title: string; help: string; children: React.ReactNode }) {
  return (
    <section className="builder-step-block">
      <div>
        <h3>{title}</h3>
        <p className="help">{help}</p>
      </div>
      {children}
    </section>
  );
}

function cleanComparableName(value: string): string {
  return value
    .replace(/\s+\((Metal|Overnumbered|Signature|Starter|Alternate Art|Foil|Numericamente Superior|Supernumer[aá]rio|Assinatura|Inicial|Arte Alternativa)\)$/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
