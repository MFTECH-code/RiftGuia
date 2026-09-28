import React from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { GUIDE_SOURCE } from '../data';
import type { Guide, TranslateCard } from '../appTypes';
import type { RiftboundCard } from '../types';
import { download } from '../lib/download';
import { parseDeck, serializeDeck } from '../lib/deckParser';
import { DeckPreview } from '../components/DeckPreview';
import { ProblemList } from '../components/ProblemList';

interface DeckPageProps {
  cards: RiftboundCard[];
  guides: Guide[];
  translate: TranslateCard;
  onOpenCard: (card: RiftboundCard) => void;
}

export function DeckPage({ cards, guides, translate, onOpenCard }: DeckPageProps) {
  const [deckList, setDeckList] = React.useState('');
  const [deckName, setDeckName] = React.useState('Meu primeiro deck');
  const [deckPlan, setDeckPlan] = React.useState('');
  const [guideId, setGuideId] = React.useState('');

  const parsedDeck = React.useMemo(() => parseDeck(deckList, cards, translate), [cards, deckList, translate]);
  const selectedGuide = guides.find((guide) => guide.id === guideId);

  return (
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
        <DeckPreview rows={parsedDeck.rows} translate={translate} onOpen={onOpenCard} />
      </div>

      <div className="panel wide">
        <h2>Plano de jogo</h2>
        <div className="guide-row">
          <select value={guideId} onChange={(event) => setGuideId(event.target.value)}>
            <option value="">Escolher guia ou lenda</option>
            {guides.map((guide) => <option key={guide.id} value={guide.id}>{guide.name}</option>)}
          </select>
          <button disabled={!selectedGuide} onClick={() => selectedGuide && setDeckPlan((value) => `${value}${value ? '\n\n' : ''}${selectedGuide.name}\n${selectedGuide.text}${selectedGuide.kind === 'manual' ? `\nFonte: ${GUIDE_SOURCE}` : ''}`)}>
            <RefreshCw size={16} /> Adicionar ao plano
          </button>
        </div>
        {selectedGuide && <p className="guide-preview">{selectedGuide.text}</p>}
        <textarea value={deckPlan} onChange={(event) => setDeckPlan(event.target.value)} rows={10} placeholder="Objetivo do deck, mao inicial, primeiros turnos, combinacoes e ajustes apos jogar..." />
      </div>
    </section>
  );
}
