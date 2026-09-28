import React from 'react';

export function useCardUrl() {
  const [selectedCardId, setSelectedCardId] = React.useState(() => readCardId());

  React.useEffect(() => {
    const onPopState = () => setSelectedCardId(readCardId());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const openCardUrl = React.useCallback((cardId: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set('card', cardId);
    window.history.pushState({}, '', url);
    setSelectedCardId(cardId);
  }, []);

  const closeCardUrl = React.useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('card');
    window.history.pushState({}, '', url);
    setSelectedCardId(null);
  }, []);

  return { selectedCardId, openCardUrl, closeCardUrl };
}

function readCardId(): string | null {
  return new URLSearchParams(window.location.search).get('card');
}
