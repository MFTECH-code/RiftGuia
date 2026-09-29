import type { View } from '../appTypes';

interface AppHeaderProps {
  status: string;
  view: View;
  isRefreshing: boolean;
  onRefresh: () => void;
  onViewChange: (view: View) => void;
}

export function AppHeader({ status, view, isRefreshing, onRefresh, onViewChange }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Rift Guia</p>
        <h1>Cartas, decks e regras em portugues.</h1>
        <div className="catalog-status">
          <p>{status}</p>
          <button type="button" disabled={isRefreshing} onClick={onRefresh}>
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
