import { BookOpen, Lightbulb, PlusCircle, Target, TriangleAlert } from 'lucide-react';
import type { LegendSuggestion } from '../../lib/deckBuilder';

interface SuggestionPanelProps {
  suggestion?: LegendSuggestion;
  onAppendToGuide?: (text: string) => void;
}

interface GamePlanStage {
  title: string;
  items: string[];
}

export function SuggestionPanel({ suggestion, onAppendToGuide }: SuggestionPanelProps) {
  if (!suggestion) {
    return (
      <aside className="builder-suggestions">
        <p className="eyebrow">Sugestões</p>
        <h3>Escolha uma lenda para começar</h3>
        <p>Quando a lenda for selecionada, este painel mostra plano de jogo, mulligan, sinergias e cuidados para guiar as próximas etapas.</p>
      </aside>
    );
  }

  const detailedPlan = buildDetailedGamePlan(suggestion);
  const guideText = buildGuideText(suggestion, detailedPlan);

  return (
    <aside className="builder-suggestions">
      <p className="eyebrow">Sugestões da lenda</p>
      <h3>{suggestion.translatedName || suggestion.name}</h3>
      <span className="builder-archetype">{suggestion.archetype}</span>

      <section>
        <h4><Target size={16} /> Resumo da lenda</h4>
        <p>{suggestion.gamePlan}</p>
      </section>

      <section className="builder-game-plan">
        <div className="builder-game-plan-heading">
          <h4><BookOpen size={16} /> Plano de jogo detalhado</h4>
          {onAppendToGuide ? (
            <button type="button" className="secondary-action compact-action" onClick={() => onAppendToGuide(guideText)}>
              <PlusCircle size={15} /> Usar no guia próprio
            </button>
          ) : null}
        </div>
        <div className="game-plan-timeline">
          {detailedPlan.map((stage, index) => (
            <article key={stage.title} className="game-plan-stage">
              <span>{index + 1}</span>
              <div>
                <strong>{stage.title}</strong>
                <ul>
                  {stage.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
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

function buildDetailedGamePlan(suggestion: LegendSuggestion): GamePlanStage[] {
  const earlyGame = [
    suggestion.mulligan,
    'Priorize cartas que colocam presença na mesa cedo ou deixam energia disponível para responder ao adversário.',
  ];

  const midGame = [
    ...suggestion.synergyPackages.slice(0, 2),
    ...suggestion.deckbuildingTips.slice(0, 1),
  ];

  const finishPlan = finishPlanFor(suggestion);
  const adaptation = [
    ...suggestion.deckbuildingTips.slice(1, 3),
    `Proteja-se deste ponto fraco: ${suggestion.weakness}`,
  ];

  return [
    {
      title: 'Começo da partida',
      items: earlyGame,
    },
    {
      title: 'Meio de jogo',
      items: midGame.length ? midGame : [suggestion.gamePlan],
    },
    {
      title: 'Como vencer',
      items: finishPlan,
    },
    {
      title: 'Ajustes durante a montagem',
      items: adaptation,
    },
  ];
}

function finishPlanFor(suggestion: LegendSuggestion): string[] {
  const text = `${suggestion.archetype} ${suggestion.gamePlan}`.toLowerCase();

  if (/(agress|press|assault|queimar|burn|rápid|rapida|rápida|rush)/i.test(text)) {
    return [
      'Transforme os primeiros pontos de vantagem em pressão constante nos campos de batalha.',
      'Use cartas de remoção, movimento ou dano para abrir caminho no turno em que você pretende pontuar.',
    ];
  }

  if (/(control|controle|lento|valor|late|defens)/i.test(text)) {
    return [
      'Segure a mesa nos primeiros turnos e force o adversário a gastar recursos antes das suas cartas mais fortes.',
      'Vença quando suas cartas caras ou repetíveis criarem mais valor do que o oponente consegue responder.',
    ];
  }

  if (/(combo|sinerg|copy|copiar|fluxo|flow)/i.test(text)) {
    return [
      'Monte a sequência principal antes de se comprometer com ataques arriscados.',
      'Procure turnos em que duas ou mais cartas se somam para gerar vantagem, remover bloqueadores ou pontuar de uma vez.',
    ];
  }

  if (/(tempo|mover|movimento|stun|exaust)/i.test(text)) {
    return [
      'Ganhe tempo impedindo boas trocas do adversário e atacando os campos certos no momento certo.',
      'Converta exaustão, movimento e preparação em turnos em que suas unidades pontuam sem perder muita força.',
    ];
  }

  return [
    'Use a habilidade da lenda para transformar pequenas vantagens em controle de campo.',
    'Feche a partida quando a mesa estiver favorável e o adversário tiver poucas respostas disponíveis.',
  ];
}

function buildGuideText(suggestion: LegendSuggestion, detailedPlan: GamePlanStage[]): string {
  const lines = [
    `${suggestion.translatedName || suggestion.name}`,
    `Arquétipo: ${suggestion.archetype}`,
    '',
    'Plano de jogo detalhado:',
    ...detailedPlan.flatMap((stage) => [
      '',
      `${stage.title}:`,
      ...stage.items.map((item) => `- ${item}`),
    ]),
    '',
    'Battlefields recomendados:',
    ...(suggestion.recommendedBattlefields || []).map((item) => `- ${item.name}: ${item.reason}`),
    '',
    `Ponto fraco: ${suggestion.weakness}`,
  ];

  return lines.join('\n').trim();
}
