import React from 'react';
import { X } from 'lucide-react';
import type { RiftboundCard, TranslationEntry } from '../types';
import { formatCardText, safeImageUrl, TYPE_NAMES } from '../lib/cards';

interface CardDialogProps {
  card: RiftboundCard;
  translation?: TranslationEntry;
  isCustom: boolean;
  onClose: () => void;
  onSave: (entry: TranslationEntry) => void;
  onRemove: () => void;
}

export function CardDialog({ card, translation, isCustom, onClose, onSave, onRemove }: CardDialogProps) {
  const [name, setName] = React.useState(translation?.name || '');
  const [text, setText] = React.useState(translation?.text || '');
  const image = safeImageUrl(card);

  React.useEffect(() => {
    setName(translation?.name || '');
    setText(translation?.text || '');
  }, [card.riftbound_id, translation?.name, translation?.text]);

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
