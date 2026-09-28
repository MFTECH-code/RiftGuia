import type { RiftboundCard, TranslationEntry } from '../types';
import { safeImageUrl, TYPE_NAMES } from '../lib/cards';

interface CardTileProps {
  card: RiftboundCard;
  translation?: TranslationEntry;
  onOpen: (card: RiftboundCard) => void;
}

export function CardTile({ card, translation, onOpen }: CardTileProps) {
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
