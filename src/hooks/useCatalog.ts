import React from 'react';
import type { CardSnapshot, RiftboundCard, TranslationFile, TranslationMap } from '../types';
import { snapshotDate, validateTranslations } from '../lib/cards';

export function useCatalog() {
  const [cards, setCards] = React.useState<RiftboundCard[]>([]);
  const [initialTranslations, setInitialTranslations] = React.useState<TranslationMap>({});
  const [status, setStatus] = React.useState('Abrindo catalogo local...');

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

  return { cards, initialTranslations, status, setStatus };
}
