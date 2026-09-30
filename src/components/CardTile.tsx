import type { RiftboundCard, TranslationEntry } from '../types';
import { DOMAIN_NAMES, isLandscapeCard, safeImageUrl, TYPE_NAMES } from '../lib/cards';

interface CardTileProps {
  card: RiftboundCard;
  translation?: TranslationEntry;
  onOpen: (card: RiftboundCard) => void;
}

export function CardTile({ card, translation, onOpen }: CardTileProps) {
  const image = safeImageUrl(card);
  const landscape = isLandscapeCard(card);
  const type = TYPE_NAMES[card.classification?.type || ''] || card.classification?.type || 'Carta';
  const domains = card.classification?.domain?.map((domain) => DOMAIN_NAMES[domain] || domain).join(', ') || 'Sem domínio';
  const collector = card.set?.set_id ? `${card.set.set_id} ${String(card.collector_number || '').padStart(3, '0')}` : '';
  const energy = typeof card.attributes?.energy === 'number' ? card.attributes.energy : undefined;
  const might = typeof card.attributes?.might === 'number' ? card.attributes.might : undefined;

  return (
    <button className={`card-tile ${landscape ? 'landscape-card' : ''}`.trim()} onClick={() => onOpen(card)}>
      <span className="card-art-frame">
        {image ? <img src={image} alt={card.name} loading="lazy" /> : <span className="missing-art">Imagem indisponível</span>}
        <span className={translation ? 'translation-badge ready' : 'translation-badge'}>{translation ? 'PT-BR' : 'Pendente'}</span>
        {collector && <span className="card-set-chip">{collector}</span>}
      </span>
      <span className="card-tile-body">
        <span className="card-type-pill">{type}</span>
        <h3>{translation?.name || card.name}</h3>
        {translation?.name && translation.name !== card.name && <span className="card-original-name">{card.name}</span>}
        <span className="card-meta">{domains}</span>
        {(energy !== undefined || might !== undefined) && (
          <span className="card-stat-row">
            {energy !== undefined && <span>Custo {energy}</span>}
            {might !== undefined && <span>Might {might}</span>}
          </span>
        )}
      </span>
    </button>
  );
}
