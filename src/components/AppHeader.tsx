import type { View } from '../appTypes';

interface AppHeaderProps {
  status: string;
  view: View;
  onViewChange: (view: View) => void;
}

export function AppHeader({ status, view, onViewChange }: AppHeaderProps) {
  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">Rift Guia</p>
        <h1>Cartas, decks e regras em portugues.</h1>
        <p>{status}</p>
      </div>
      <nav aria-label="Navegacao principal">
        <button className={view === 'library' ? 'active' : ''} onClick={() => onViewChange('library')}>Biblioteca</button>
        <button className={view === 'deck' ? 'active' : ''} onClick={() => onViewChange('deck')}>Meu deck</button>
        <button className={view === 'learn' ? 'active' : ''} onClick={() => onViewChange('learn')}>Aprenda</button>
      </nav>
    </header>
  );
}
