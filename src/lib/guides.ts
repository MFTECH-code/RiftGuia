import { DECK_GUIDES } from '../data';
import type { Guide, TranslateCard } from '../appTypes';
import type { RiftboundCard } from '../types';
import { DOMAIN_NAMES } from './cards';

export function buildGuides(cards: RiftboundCard[], translate: TranslateCard): Guide[] {
  return [...DECK_GUIDES.map((guide) => ({ ...guide, kind: 'manual' as const })), ...buildLegendGuides(cards, translate)];
}

function buildLegendGuides(cards: RiftboundCard[], translate: TranslateCard): Guide[] {
  const picked = new Map<string, RiftboundCard>();
  for (const card of cards.filter((item) => item.classification?.type === 'Legend')) {
    const key = `${(card.classification?.domain || []).join('|')}|${card.text?.plain || ''}`;
    if (!picked.has(key)) picked.set(key, card);
  }

  return [...picked.values()]
    .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    .map((card) => {
      const translation = translate(card);
      const name = translation?.name || card.name;
      const domains = (card.classification?.domain || []).map((domain) => DOMAIN_NAMES[domain] || domain).join(' e ') || 'os dominios indicados pela carta';
      return {
        id: `legend:${card.riftbound_id}`,
        name: `Lenda - ${name}`,
        kind: 'legend',
        text: `Roteiro inicial para ${name}: construa dentro dos dominios ${domains}. Leia a habilidade impressa e escolha cartas que ajudam a cumprir sua condicao, pagar seu custo ou aproveitar o efeito. Defina um Campeao Escolhido que contribua para essa mesma ideia. Depois das primeiras partidas, anote quais cartas ficaram sem funcao e ajuste o plano.`,
      };
    });
}
