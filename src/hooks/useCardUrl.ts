import React from 'react';
import type { View } from '../appTypes';
import { VIEW_PATHS } from '../appTypes';

interface AppRoute {
  view: View;
  selectedCardId: string | null;
}

export function useCardUrl() {
  const [route, setRoute] = React.useState<AppRoute>(() => readRoute());

  React.useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigateView = React.useCallback((view: View) => {
    window.history.pushState({}, '', VIEW_PATHS[view]);
    setRoute({ view, selectedCardId: null });
  }, []);

  const openCardUrl = React.useCallback((cardId: string) => {
    window.history.pushState({}, '', `/cartas/${encodeURIComponent(cardId)}`);
    setRoute({ view: 'library', selectedCardId: cardId });
  }, []);

  const closeCardUrl = React.useCallback(() => {
    const nextView = readRoute().view;
    window.history.pushState({}, '', VIEW_PATHS[nextView]);
    setRoute({ view: nextView, selectedCardId: null });
  }, []);

  return { view: route.view, selectedCardId: route.selectedCardId, navigateView, openCardUrl, closeCardUrl };
}

function readRoute(): AppRoute {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  const legacyCardId = new URLSearchParams(window.location.search).get('card');
  if (legacyCardId) return { view: readView(path), selectedCardId: legacyCardId };

  const cardMatch = path.match(/^\/cartas\/([^/]+)$/);
  if (cardMatch) {
    return { view: 'library', selectedCardId: decodeURIComponent(cardMatch[1]) };
  }

  return { view: readView(path), selectedCardId: null };
}

function readView(path: string): View {
  if (path === VIEW_PATHS.deck) return 'deck';
  if (path === VIEW_PATHS.learn) return 'learn';
  return 'library';
}
