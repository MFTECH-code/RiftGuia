import { Lightbulb, Target, TriangleAlert } from 'lucide-react';
import type { LegendSuggestion } from '../../lib/deckBuilder';

interface SuggestionPanelProps {
  suggestion?: LegendSuggestion;
}

export function SuggestionPanel({ suggestion }: SuggestionPanelProps) {
  if (!suggestion) {
    return (
      <aside className="builder-suggestions">
        <p className="eyebrow">Sugestões</p>
        <h3>Escolha uma lenda para começar</h3>
        <p>Quando a lenda for selecionada, este painel mostra plano de jogo, mulligan, sinergias e cuidados para guiar as próximas etapas.</p>
      </aside>
    );
  }

  return (
    <aside className="builder-suggestions">
      <p className="eyebrow">Sugestões da lenda</p>
      <h3>{suggestion.translatedName || suggestion.name}</h3>
      <span className="builder-archetype">{suggestion.archetype}</span>

      <section>
        <h4><Target size={16} /> Plano de jogo</h4>
        <p>{suggestion.gamePlan}</p>
      </section>

      <section>
        <h4><Lightbulb size={16} /> Mulligan</h4>
        <p>{suggestion.mulligan}</p>
      </section>

      <section>
        <h4>Pacotes de sinergia</h4>
        <ul>
          {suggestion.synergyPackages.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h4>Como construir</h4>
        <ul>
          {suggestion.deckbuildingTips.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h4>Battlefields recomendados</h4>
        <ul>
          {(suggestion.recommendedBattlefields || []).map((item) => (
            <li key={item.name}><strong>{item.name}:</strong> {item.reason}</li>
          ))}
        </ul>
      </section>

      <section className="builder-warning">
        <h4><TriangleAlert size={16} /> Ponto fraco</h4>
        <p>{suggestion.weakness}</p>
      </section>
    </aside>
  );
}
