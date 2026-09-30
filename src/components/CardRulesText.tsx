import { RiftboundIcon, type RiftboundIconName } from './RiftboundIcon';
import { DOMAIN_NAMES } from '../lib/cards';

interface CardRulesTextProps {
  text?: string | null;
  fallback?: string;
  compact?: boolean;
}

interface TextPart {
  kind: 'text';
  value: string;
}

interface TokenPart {
  kind: 'token';
  value: string;
}

type Part = TextPart | TokenPart;

type InlineTextPart =
  | { kind: 'text'; value: string }
  | { kind: 'keyword'; value: string; tone: KeywordTone };

type KeywordTone = 'power' | 'combat' | 'defense' | 'token' | 'timing' | 'value';

const tokenPattern = /:rb_[a-z0-9_]+:/gi;
const bracketKeywordPattern = /\[([^\]]+)\]/g;
const looseKeywordPattern = /\b(Empower(?:ed)?|Assault|Shield|Tank|Temporary|Tempor[aá]rio|Flow|Burn|Copy|Token Unit|Ficha de Unidade|Reaction|Action|Hidden|Ambush|Ganking|Deflect|Accelerate|Repeat|Equip|Weaponmaster|Mighty|Stun|Banish|Recycle|Ready|Add|Channel|Conquer|Hold|Legion|Vision)\b/gi;
const keywordTones: Array<{ pattern: RegExp; tone: KeywordTone }> = [
  { pattern: /^(empower|empowered|aprimorar|aprimorado)/i, tone: 'power' },
  { pattern: /^(assault|mighty|weaponmaster|ganking)/i, tone: 'combat' },
  { pattern: /^(shield|tank|deflect)/i, tone: 'defense' },
  { pattern: /^(temporary|tempor[aá]rio|token unit|ficha de unidade|copy|c[oó]pia)/i, tone: 'token' },
  { pattern: /^(reaction|action|hidden|ambush|accelerate|repeat|equip|stun|ready)/i, tone: 'timing' },
  { pattern: /^(flow|burn|banish|recycle|add|channel|conquer|hold|legion|vision)/i, tone: 'value' },
];

const keywordDescriptions: Record<string, string> = {
  empower: 'Pague o custo indicado para deixar esta carta Empowered. O efeito exato aparece no texto da própria carta.',
  empowered: 'Estado de uma carta que foi Empower. Use os trechos marcados como Empowered enquanto ela estiver nesse estado.',
  assault: 'Aumenta o Might da unidade enquanto ela estiver atacando. Assault 2, por exemplo, dá +2 Might no ataque.',
  shield: 'Aumenta o Might da unidade enquanto ela estiver defendendo. Shield 2, por exemplo, dá +2 Might na defesa.',
  tank: 'O dano de combate deve ser atribuído a esta unidade primeiro.',
  temporary: 'Esse objeto é abatido no início da Beginning Phase do controlador, antes da pontuação, salvo se outro efeito mudar isso.',
  temporário: 'Esse objeto é abatido no início da Beginning Phase do controlador, antes da pontuação, salvo se outro efeito mudar isso.',
  flow: 'Permite jogar a carta do descarte pelo custo de Flow. Depois ela normalmente é banida.',
  burn: 'Coloque a quantidade indicada de cartas do topo do Main Deck no descarte. Não é dano.',
  copy: 'Cria uma cópia conforme o efeito descreve. Leia a carta para saber o que é copiado e por quanto tempo.',
  copia: 'Cria uma cópia conforme o efeito descreve. Leia a carta para saber o que é copiado e por quanto tempo.',
  'token unit': 'Uma unidade criada por efeito de carta. Ela usa as características indicadas pelo efeito ou pela ficha.',
  'ficha de unidade': 'Uma unidade criada por efeito de carta. Ela usa as características indicadas pelo efeito ou pela ficha.',
  reaction: 'Pode ser jogada em janelas de reação, inclusive antes de magias e habilidades resolverem.',
  action: 'Pode ser jogada no seu turno ou durante showdowns, conforme as regras da carta.',
  hidden: 'Você pode esconder a carta agora para reagir com ela depois pelo custo indicado.',
  ambush: 'Permite jogar a unidade como Reaction em um campo de batalha onde você tenha presença, salvo exceção no texto.',
  ganking: 'A unidade pode se mover entre campos de batalha.',
  deflect: 'O oponente precisa pagar o custo adicional indicado para escolher esta carta com magia ou habilidade.',
  accelerate: 'Custo adicional opcional para a unidade entrar pronta em vez de exaurida.',
  repeat: 'Você pode pagar o custo adicional indicado para repetir o efeito da magia.',
  equip: 'Anexa um equipamento a uma unidade. Depois disso, o equipamento passa a afetar aquela unidade.',
  weaponmaster: 'Quando você joga esta unidade, pode anexar um dos seus equipamentos a ela pelo custo indicado, mesmo que já esteja anexado.',
  mighty: 'A unidade é Mighty enquanto tiver 5 ou mais Might.',
  stun: 'Deixe a unidade exaurida. Uma unidade atordoada normalmente perde a prontidão e fica mais vulnerável no turno.',
  banish: 'Mova a carta para fora do jogo, em vez de colocá-la no descarte.',
  recycle: 'Coloque a carta no fundo do baralho correspondente, virada para baixo.',
  ready: 'Coloque a carta na vertical, pronta para ser usada novamente.',
  add: 'Adiciona o recurso indicado ao seu pool. Habilidades que adicionam recursos normalmente não podem receber reação.',
  channel: 'Prepare ou reutilize uma runa exaurida conforme o efeito indicar.',
  conquer: 'Você conquista um campo quando vence a disputa ali e marca progresso naquele battlefield.',
  hold: 'Você segura um campo quando mantém controle dele na etapa indicada pelo jogo.',
  legion: 'Receba o efeito se você tiver jogado uma carta neste turno.',
  vision: 'Quando jogar a carta, olhe o topo do seu Main Deck e siga a instrução de Vision.',
};

export function CardRulesText({ text, fallback = 'Esta carta não possui texto.', compact = false }: CardRulesTextProps) {
  const parts = parseRulesText(text || fallback);

  return (
    <p className={compact ? 'card-rules-text compact' : 'card-rules-text'}>
      {parts.map((part, index) => (
        part.kind === 'token'
          ? <TokenIcon key={`${part.value}-${index}`} token={part.value} />
          : <TextFragment key={`${part.value}-${index}`} value={part.value} />
      ))}
    </p>
  );
}

function parseRulesText(text: string): Part[] {
  const normalized = text
    .replace(/\)(?=[A-Z\[])/g, ')\n')
    .replace(/\. ?(?=(?:\[|[A-Z]))/g, '.\n')
    .replace(/\n{3,}/g, '\n\n');

  const parts: Part[] = [];
  let cursor = 0;

  for (const match of normalized.matchAll(tokenPattern)) {
    if (match.index == null) continue;
    if (match.index > cursor) {
      parts.push({ kind: 'text', value: normalized.slice(cursor, match.index) });
    }
    parts.push({ kind: 'token', value: match[0] });
    cursor = match.index + match[0].length;
  }

  if (cursor < normalized.length) {
    parts.push({ kind: 'text', value: normalized.slice(cursor) });
  }

  return parts;
}

function TextFragment({ value }: { value: string }) {
  return (
    <>
      {value.split('\n').map((line, index, lines) => (
        <span key={`${line}-${index}`}>
          {parseInlineText(line).map((part, partIndex) => (
            part.kind === 'keyword'
              ? <KeywordBadge key={`${part.value}-${partIndex}`} value={part.value} tone={part.tone} />
              : <span key={`${part.value}-${partIndex}`}>{part.value}</span>
          ))}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function parseInlineText(value: string): InlineTextPart[] {
  const parts: InlineTextPart[] = [];
  let cursor = 0;

  for (const match of value.matchAll(bracketKeywordPattern)) {
    if (match.index == null) continue;
    if (match.index > cursor) {
      pushLooseKeywordParts(parts, value.slice(cursor, match.index));
    }
    parts.push({ kind: 'keyword', value: `[${match[1]}]`, tone: keywordTone(match[1]) });
    cursor = match.index + match[0].length;
  }

  if (cursor < value.length) {
    pushLooseKeywordParts(parts, value.slice(cursor));
  }

  return parts;
}

function pushLooseKeywordParts(parts: InlineTextPart[], value: string) {
  let cursor = 0;
  for (const match of value.matchAll(looseKeywordPattern)) {
    if (match.index == null) continue;
    if (match.index > cursor) parts.push({ kind: 'text', value: value.slice(cursor, match.index) });
    parts.push({ kind: 'keyword', value: match[0], tone: keywordTone(match[0]) });
    cursor = match.index + match[0].length;
  }
  if (cursor < value.length) parts.push({ kind: 'text', value: value.slice(cursor) });
}

function keywordTone(value: string): KeywordTone {
  const clean = value.replace(/[\[\]]/g, '').trim();
  return keywordTones.find((item) => item.pattern.test(clean))?.tone || 'value';
}

function KeywordBadge({ value, tone }: { value: string; tone: KeywordTone }) {
  const description = keywordDescription(value);
  return (
    <span
      className={`keyword-badge keyword-${tone}`}
      data-tooltip={description}
      tabIndex={0}
      title={description}
    >
      {value}
    </span>
  );
}

function keywordDescription(value: string): string {
  const key = normalizeKeyword(value);
  return keywordDescriptions[key] || 'Palavra-chave de Riftbound. Leia o texto da carta para ver como ela se aplica neste caso.';
}

function normalizeKeyword(value: string): string {
  return value
    .replace(/[\[\]]/g, '')
    .replace(/\d+/g, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function TokenIcon({ token }: { token: string }) {
  const energy = token.match(/^:rb_energy_(\d+):$/i);
  if (energy) {
    return (
      <span className="game-symbol energy official-style" title={`${energy[1]} energia`} aria-label={`${energy[1]} energia`}>
        <RiftboundIcon name="energy" aria-hidden="true" />
        <span>{energy[1]}</span>
      </span>
    );
  }

  const rune = token.match(/^:rb_rune_(\w+):$/i);
  if (rune) {
    const domain = rune[1].toLowerCase();
    const key = rune[1][0]?.toUpperCase() + rune[1].slice(1).toLowerCase();
    const label = key === 'Rainbow' ? 'qualquer poder' : `1 poder de ${DOMAIN_NAMES[key] || key}`;
    return (
      <span className={`game-symbol rune rune-${domain} official-style`} title={label} aria-label={label}>
        <RiftboundIcon name={`rune-${domain}` as RiftboundIconName} aria-hidden="true" />
      </span>
    );
  }

  if (/^:rb_might:$/i.test(token)) {
    return (
      <span className="game-symbol might official-style" title="força" aria-label="força">
        <RiftboundIcon name="might" aria-hidden="true" />
      </span>
    );
  }

  if (/^:rb_exhaust:$/i.test(token)) {
    return (
      <span className="game-symbol exhaust official-style" title="exaurir" aria-label="exaurir">
        <RiftboundIcon name="exhaust" aria-hidden="true" />
      </span>
    );
  }

  return <span className="game-symbol unknown">{token.replace(/:rb_|:/g, '').replace(/_/g, ' ')}</span>;
}
