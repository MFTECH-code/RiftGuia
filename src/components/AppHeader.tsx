import { BookOpen, GraduationCap, Languages, Library, Percent, RefreshCw, ScrollText } from 'lucide-react';
import type { View } from '../appTypes';
import { RiftGuiaLogo } from './RiftGuiaLogo';

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
    <>
        <nav className="primary-nav" aria-label="Navegação principal">
          <button className={view === 'library' ? 'active' : ''} onClick={() => onViewChange('library')}><Library size={16} /> Biblioteca</button>
          <button className={view === 'deck' ? 'active' : ''} onClick={() => onViewChange('deck')}><ScrollText size={16} /> Deck Builder</button>
          <button className={view === 'learn' ? 'active' : ''} onClick={() => onViewChange('learn')}><GraduationCap size={16} /> Aprenda</button>
        </nav>
      <header className={`topbar topbar-${view}`}>
      <div className="hero-main">
        <div className="hero-kicker">
          <RiftGuiaLogo />
          <p className="hero-tagline">Projeto de fã em português brasileiro</p>
        </div>
        <h1>Aprenda Riftbound, traduza cartas e monte decks melhores.</h1>
        <p className="hero-copy">Uma central em pt-BR para consultar cartas, estudar regras e construir listas com sugestões enquanto joga.</p>
        <div className="catalog-metrics" aria-label="Resumo do catálogo">
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
      </header>
    </>
  );
}
