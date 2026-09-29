import React from 'react';
import type { TranslateCard } from '../../appTypes';
import type { RiftboundCard } from '../../types';
import { displayName } from '../../lib/deckBuilder';
import { DOMAIN_NAMES, isLandscapeCard, safeImageUrl, TYPE_NAMES } from '../../lib/cards';
import { CardRulesText } from '../CardRulesText';

interface CardChoiceGridProps {
  cards: RiftboundCard[];
  selectedIds?: string[];
  quantities?: Record<string, number>;
  recommendedIds?: Set<string>;
  translate: TranslateCard;
  labelFor?: (card: RiftboundCard) => string;
  onChoose?: (card: RiftboundCard) => void;
  onQuantityChange?: (card: RiftboundCard, quantity: number) => void;
  limit?: number;
}

export function CardChoiceGrid({
  cards,
  selectedIds = [],
  quantities = {},
  recommendedIds = new Set<string>(),
  translate,
  labelFor,
  onChoose,
  onQuantityChange,
  limit,
}: CardChoiceGridProps) {
  const [preview, setPreview] = React.useState<{ card: RiftboundCard; left: number; top: number } | null>(null);

  if (!cards.length) return <p className="empty">Nenhuma carta encontrada para esta etapa.</p>;

  const visible = typeof limit === 'number' ? cards.slice(0, limit) : cards;

  function showPreview(card: RiftboundCard, element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    const width = 380;
    const left = rect.right + width + 16 < window.innerWidth
      ? rect.right + 12
      : Math.max(12, rect.left - width - 12);
    const top = Math.min(Math.max(12, rect.top), Math.max(12, window.innerHeight - 540));
    setPreview({ card, left, top });
  }

  return (
    <>
      <div className="builder-card-list">
        {visible.map((card) => {
          const translation = translate(card);
          const name = labelFor?.(card) || displayName(card, translation);
          const selected = selectedIds.includes(card.riftbound_id) || Boolean(quantities[card.riftbound_id]);
          const recommended = recommendedIds.has(card.riftbound_id);
          const hasActions = Boolean(onQuantityChange || selected);
          const domains = card.classification?.domain?.map((domain) => DOMAIN_NAMES[domain] || domain).join(', ') || 'Sem cor';
          const image = safeImageUrl(card);
          const landscape = isLandscapeCard(card);
          return (
            <article
              className={`${selected ? 'selected' : ''} ${landscape ? 'landscape-card' : ''}`.trim()}
              key={card.riftbound_id}
              onBlurCapture={(event) => {
                if (event.currentTarget.contains(event.relatedTarget as Node | null)) return;
                setPreview(null);
              }}
              onFocusCapture={(event) => showPreview(card, event.currentTarget)}
              onMouseEnter={(event) => showPreview(card, event.currentTarget)}
              onMouseLeave={() => setPreview(null)}
            >
              <button className="builder-card-main" type="button" onClick={() => onChoose?.(card)}>
                {recommended && <span className="recommendation-badge">Recomendado</span>}
                {image ? (
                  <img className={`builder-card-thumb ${landscape ? 'landscape' : ''}`.trim()} src={image} alt={card.name} loading="lazy" />
                ) : (
                  <span className={`builder-card-thumb missing-art ${landscape ? 'landscape' : ''}`.trim()}>Sem imagem</span>
                )}
                <span className="builder-card-copy">
                  <strong>{name}</strong>
                  <span>
                    {TYPE_NAMES[card.classification?.type || ''] || card.classification?.type || 'Carta'} · {domains}
                    {typeof card.attributes?.energy === 'number' ? ` · Custo ${card.attributes.energy}` : ''}
                    {typeof card.attributes?.might === 'number' ? ` · Might ${card.attributes.might}` : ''}
                  </span>
                </span>
              </button>

              {hasActions && (
                <div className="builder-card-actions">
                  {onQuantityChange ? (
                    <input
                      aria-label={`Quantidade de ${name}`}
                      min={0}
                      max={99}
                      type="number"
                      value={quantities[card.riftbound_id] || 0}
                      onChange={(event) => onQuantityChange(card, Number(event.target.value))}
                    />
                  ) : selected ? (
                    <span className="selected-pill">Selecionada</span>
                  ) : null}
                </div>
              )}
            </article>
          );
        })}
        {limit && cards.length > limit && <p className="help">Mostrando {limit} de {cards.length}. Use a busca para refinar.</p>}
      </div>
      {preview && (
        <CardHoverPreview
          card={preview.card}
          left={preview.left}
          top={preview.top}
          name={labelFor?.(preview.card) || displayName(preview.card, translate(preview.card))}
          translate={translate}
        />
      )}
    </>
  );
}

function CardHoverPreview({
  card,
  left,
  top,
  name,
  translate,
}: {
  card: RiftboundCard;
  left: number;
  top: number;
  name: string;
  translate: TranslateCard;
}) {
  const translation = translate(card);
  const image = safeImageUrl(card);
  const landscape = isLandscapeCard(card);
  const domains = card.classification?.domain?.map((domain) => DOMAIN_NAMES[domain] || domain).join(', ') || 'Sem cor';

  return (
    <aside className={`builder-card-hover-preview ${landscape ? 'landscape' : ''}`.trim()} style={{ left, top }}>
      {image ? (
        <img src={image} alt={card.name} />
      ) : (
        <div className="missing-art">Sem imagem</div>
      )}
      <div>
        <span className="builder-hover-type">
          {TYPE_NAMES[card.classification?.type || ''] || card.classification?.type || 'Carta'} · {domains}
        </span>
        <h4>{name}</h4>
        <div className="builder-hover-stats">
          {typeof card.attributes?.energy === 'number' && <span>Custo {card.attributes.energy}</span>}
          {typeof card.attributes?.might === 'number' && <span>Might {card.attributes.might}</span>}
        </div>
        <CardRulesText text={translation?.text} fallback="Tradução pendente." />
      </div>
    </aside>
  );
}
