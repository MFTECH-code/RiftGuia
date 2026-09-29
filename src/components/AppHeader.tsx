import { BookOpen, Languages, Percent, RefreshCw } from 'lucide-react';
import type { View } from '../appTypes';

interface AppHeaderProps {
  status: string;
  view: View;
  cardCount: number;
  translatedCount: number;
  isRefreshing: boolean;
  onRefresh: () => void;
  onViewChange: (view: View) => void;
}

export function AppHeader({ status, view, cardCount = 0, translatedCount = 0, isRefreshing, onRefresh, onViewChange }: AppHeaderProps) {
  const translationPercent = cardCount ? Math.round((translatedCount / cardCount) * 100) : 0;

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Rift Guia</p>
        <h1>Cartas, decks e regras em portugues.</h1>
        <div className="catalog-metrics" aria-label="Resumo do catalogo">
          <span><BookOpen size={16} /> {cardCount.toLocaleString('pt-BR')} cartas</span>
          <span><Languages size={16} /> {translatedCount.toLocaleString('pt-BR')} traduzidas</span>
          <span><Percent size={16} /> {translationPercent}% em pt-BR</span>
        </div>
        <div className="catalog-status">
          <p>{status}</p>
          <button type="button" disabled={isRefreshing} onClick={onRefresh}>
            <RefreshCw size={16} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar cartas'}
          </button>
        </div>
      </div>
      <nav aria-label="Navegacao principal">
        <button className={view === 'library' ? 'active' : ''} onClick={() => onViewChange('library')}>Biblioteca</button>
        <button className={view === 'deck' ? 'active' : ''} onClick={() => onViewChange('deck')}>Meu deck</button>
        <button className={view === 'learn' ? 'active' : ''} onClick={() => onViewChange('learn')}>Aprenda</button>
      </nav>
    </header>
  );
}
