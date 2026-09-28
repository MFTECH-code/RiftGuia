import React from 'react';
import { AppHeader } from './components/AppHeader';
import { CardDialog } from './components/CardDialog';
import { useCardUrl } from './hooks/useCardUrl';
import { useCatalog } from './hooks/useCatalog';
import type { View } from './appTypes';
import { buildGuides } from './lib/guides';
import { mergedTranslation, readStoredTranslations, writeStoredTranslations } from './lib/cards';
import type { RiftboundCard, TranslationEntry, TranslationMap } from './types';
import { DeckPage } from './pages/DeckPage';
import { LearnPage } from './pages/LearnPage';
import { LibraryPage } from './pages/LibraryPage';

export function App() {
  const [view, setView] = React.useState<View>('library');
  const [customTranslations, setCustomTranslations] = React.useState<TranslationMap>(() => readStoredTranslations());
  const { cards, initialTranslations, status, setStatus } = useCatalog();
  const { selectedCardId, openCardUrl, closeCardUrl } = useCardUrl();

  const translate = React.useCallback(
    (card: RiftboundCard): TranslationEntry | undefined => mergedTranslation(card, initialTranslations, customTranslations),
    [initialTranslations, customTranslations],
  );

  const guides = React.useMemo(() => buildGuides(cards, translate), [cards, translate]);
  const selectedCard = React.useMemo(
    () => cards.find((card) => card.riftbound_id === selectedCardId) || null,
    [cards, selectedCardId],
  );

  function saveCustom(next: TranslationMap) {
    writeStoredTranslations(next);
    setCustomTranslations(next);
  }

  function importTranslations(translations: TranslationMap) {
    saveCustom({ ...translations, ...customTranslations });
  }

  function openCard(card: RiftboundCard) {
    openCardUrl(card.riftbound_id);
  }

  return (
    <main>
      <AppHeader status={status} view={view} onViewChange={setView} />

      {view === 'library' && (
        <LibraryPage
          cards={cards}
          customTranslations={customTranslations}
          translate={translate}
          onOpenCard={openCard}
          onImportTranslations={importTranslations}
          onStatusChange={setStatus}
        />
      )}

      {view === 'deck' && (
        <DeckPage cards={cards} guides={guides} translate={translate} onOpenCard={openCard} />
      )}

      {view === 'learn' && <LearnPage />}

      {selectedCard && (
        <CardDialog
          card={selectedCard}
          translation={translate(selectedCard)}
          isCustom={Boolean(customTranslations[selectedCard.riftbound_id])}
          onClose={closeCardUrl}
          onSave={(entry) => saveCustom({ ...customTranslations, [selectedCard.riftbound_id]: entry })}
          onRemove={() => {
            const next = { ...customTranslations };
            delete next[selectedCard.riftbound_id];
            saveCustom(next);
          }}
        />
      )}
    </main>
  );
}
