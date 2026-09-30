import type { SVGProps } from 'react';

export type RiftboundIconName =
  | 'energy'
  | 'might'
  | 'exhaust'
  | 'rune-fury'
  | 'rune-calm'
  | 'rune-mind'
  | 'rune-body'
  | 'rune-chaos'
  | 'rune-order'
  | 'rune-rainbow'
  | 'unknown';

interface RiftboundIconProps extends SVGProps<SVGSVGElement> {
  name: RiftboundIconName;
}

export function RiftboundIcon({ name, ...props }: RiftboundIconProps) {
  switch (name) {
    case 'might':
      return <MightIcon {...props} />;
    case 'exhaust':
      return <ExhaustIcon {...props} />;
    case 'rune-fury':
      return <RuneIcon domain="fury" {...props} />;
    case 'rune-calm':
      return <RuneIcon domain="calm" {...props} />;
    case 'rune-mind':
      return <RuneIcon domain="mind" {...props} />;
    case 'rune-body':
      return <RuneIcon domain="body" {...props} />;
    case 'rune-chaos':
      return <RuneIcon domain="chaos" {...props} />;
    case 'rune-order':
      return <RuneIcon domain="order" {...props} />;
    case 'rune-rainbow':
      return <RuneIcon domain="rainbow" {...props} />;
    case 'energy':
    case 'unknown':
    default:
      return <EnergyIcon {...props} />;
  }
}

function EnergyIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" role="img" {...props}>
      <circle cx="16" cy="16" r="14" fill="currentColor" />
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="rgba(0,0,0,.24)" strokeWidth="1.8" />
    </svg>
  );
}

function MightIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" role="img" {...props}>
      <path fill="currentColor" d="M16 3.2 26 6.9v8.2c0 6.1-3.7 11.2-10 13.7C9.7 26.3 6 21.2 6 15.1V6.9l10-3.7Z" />
      <path fill="rgba(0,0,0,.18)" d="M16 6.5 23 9v6c0 4.4-2.4 8-7 10-4.6-2-7-5.6-7-10V9l7-2.5Z" />
      <path fill="#fff8e7" d="M15 7.3h2v11.2l3.9-3.9 1.4 1.4-6.3 6.3L9.7 16l1.4-1.4 3.9 3.9V7.3Z" />
    </svg>
  );
}

function ExhaustIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" role="img" {...props}>
      <path fill="currentColor" d="M7.2 20.1v5.1h17.6v-5.1h3.4v8.5H3.8v-8.5h3.4Z" />
      <path fill="currentColor" d="M16.5 3.8c5.4 0 9.8 4.2 10.1 9.5h3.1l-5.2 6-5.2-6h3.1a6.2 6.2 0 0 0-10.3-4.1L9.2 6.5a10 10 0 0 1 7.3-2.7Z" />
      <path fill="currentColor" d="M11.2 13.7H8.1l5.2 6 5.2-6h-3.1c-.1-1.3-.7-2.5-1.7-3.3l-2.9 2.7c.2.2.4.4.4.6Z" />
    </svg>
  );
}

const runeIconAssets: Record<string, string> = {
  fury: '/icons/runes/fury.webp',
  calm: '/icons/runes/calm.webp',
  mind: '/icons/runes/mind.webp',
  body: '/icons/runes/body.webp',
  chaos: '/icons/runes/chaos.webp',
  order: '/icons/runes/order.webp',
  rainbow: '/icons/runes/rainbow.webp',
};

function RuneIcon({ domain, ...props }: SVGProps<SVGSVGElement> & { domain: string }) {
  const href = runeIconAssets[domain] || runeIconAssets.rainbow;

  return (
    <svg viewBox="0 0 32 32" role="img" {...props}>
      <image href={href} x="1.5" y="1.5" width="29" height="29" preserveAspectRatio="xMidYMid meet" />
    </svg>
  );
}
