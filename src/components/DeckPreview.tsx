import type { TranslateCard } from '../appTypes';
import type { DeckRow, DeckSection, RiftboundCard } from '../types';
import { SECTION_LABELS } from '../lib/deckParser';
import { CardRulesText } from './CardRulesText';

interface DeckPreviewProps {
  rows: DeckRow[];
  translate: TranslateCard;
  onOpen: (card: RiftboundCard) => void;
}

export function DeckPreview({ rows, translate, onOpen }: DeckPreviewProps) {
  if (!rows.length) return <p className="empty">Cole uma lista para visualizar as cartas.</p>;

  return (
    <div className="deck-preview">
      {(Object.keys(SECTION_LABELS) as DeckSection[]).map((section) => {
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
                  <CardRulesText text={translation?.text} fallback="Traducao pendente" compact />
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
