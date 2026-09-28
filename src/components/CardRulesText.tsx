import { RotateCw, Sparkles, Swords, Zap } from 'lucide-react';
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

const tokenPattern = /:rb_[a-z0-9_]+:/gi;

export function CardRulesText({ text, fallback = 'Esta carta nao possui texto.', compact = false }: CardRulesTextProps) {
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
          {line}
          {index < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}

function TokenIcon({ token }: { token: string }) {
  const energy = token.match(/^:rb_energy_(\d+):$/i);
  if (energy) {
    return (
      <span className="game-symbol energy" title={`${energy[1]} energia`} aria-label={`${energy[1]} energia`}>
        <Zap size={13} aria-hidden="true" />
        <span>{energy[1]}</span>
      </span>
    );
  }

  const rune = token.match(/^:rb_rune_(\w+):$/i);
  if (rune) {
    const key = rune[1][0]?.toUpperCase() + rune[1].slice(1).toLowerCase();
    const label = key === 'Rainbow' ? 'qualquer poder' : `1 poder de ${DOMAIN_NAMES[key] || key}`;
    return (
      <span className={`game-symbol rune rune-${rune[1].toLowerCase()}`} title={label} aria-label={label}>
        <Sparkles size={12} aria-hidden="true" />
      </span>
    );
  }

  if (/^:rb_might:$/i.test(token)) {
    return (
      <span className="game-symbol might" title="forca" aria-label="forca">
        <Swords size={13} aria-hidden="true" />
      </span>
    );
  }

  if (/^:rb_exhaust:$/i.test(token)) {
    return (
      <span className="game-symbol exhaust" title="exaurir" aria-label="exaurir">
        <RotateCw size={13} aria-hidden="true" />
      </span>
    );
  }

  return <span className="game-symbol unknown">{token.replace(/:rb_|:/g, '').replace(/_/g, ' ')}</span>;
}
