import type { TranslateCard } from '../appTypes';
import type { DeckRow, DeckSection, RiftboundCard } from '../types';
import { SECTION_LABELS } from '../lib/deckParser';
import { isLandscapeCard, safeImageUrl } from '../lib/cards';
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
              const image = safeImageUrl(row.card);
              const landscape = isLandscapeCard(row.card);
              return (
                <button key={`${section}-${row.card.riftbound_id}`} onClick={() => onOpen(row.card)}>
                  {image ? (
                    <img className={`deck-preview-thumb ${landscape ? 'landscape' : ''}`.trim()} src={image} alt={row.card.name} loading="lazy" />
                  ) : (
                    <span className={`deck-preview-thumb missing-art ${landscape ? 'landscape' : ''}`.trim()}>Sem imagem</span>
                  )}
                  <span className="deck-preview-copy">
                    <strong>{row.quantity}x {translation?.name || row.card.name}</strong>
                    <CardRulesText text={translation?.text} fallback="Traducao pendente" compact />
                  </span>
                </button>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
