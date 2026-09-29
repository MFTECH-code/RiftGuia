import { BarChart3, Gauge, Layers3, Palette, Swords } from 'lucide-react';
import type React from 'react';
import type { DeckStats } from '../../lib/deckBuilder';
import { DOMAIN_NAMES } from '../../lib/cards';

interface DeckStatsPanelProps {
  stats: DeckStats;
}

export function DeckStatsPanel({ stats }: DeckStatsPanelProps) {
  const maxCurve = Math.max(1, ...stats.energyCurve.map((item) => item.count));
  const maxDomain = Math.max(1, ...stats.domains.map((item) => item.count));

  return (
    <aside className="deck-stats-panel">
      <p className="eyebrow">Estatísticas</p>
      <div className="stat-grid">
        <Stat icon={<Layers3 size={16} />} label="Main deck" value={`${stats.mainCount}/40`} />
        <Stat icon={<Swords size={16} />} label="Units" value={String(stats.unitCount)} />
        <Stat icon={<BarChart3 size={16} />} label="Spells" value={String(stats.spellCount)} />
        <Stat icon={<Gauge size={16} />} label="Custo médio" value={stats.averageEnergy.toFixed(1)} />
        <Stat icon={<Swords size={16} />} label="Might médio" value={stats.averageMight.toFixed(1)} />
        <Stat icon={<Layers3 size={16} />} label="Side deck" value={`${stats.sideboardCount}/10`} />
      </div>

      <section>
        <h4>Curva de custo</h4>
        <div className="mini-bars">
          {stats.energyCurve.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <i style={{ height: `${Math.max(6, (item.count / maxCurve) * 72)}px` }} />
              <strong>{item.count}</strong>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h4><Palette size={16} /> Cores do main deck</h4>
        <div className="domain-bars">
          {stats.domains.length ? stats.domains.map((item) => (
            <div key={item.domain}>
              <span>{item.label}</span>
              <i style={{ width: `${Math.max(4, (item.count / maxDomain) * 100)}%` }} />
              <strong>{item.count}</strong>
            </div>
          )) : <p className="help">Adicione cartas para ver a distribuição.</p>}
        </div>
      </section>

      <section>
        <h4>Runas sugeridas</h4>
        <p className="help">Geradas pela proporção de cores do main deck. Ajuste manualmente depois de testar.</p>
        <div className="rune-suggestion-list">
          {stats.suggestedRunes.map((item) => (
            <span key={item.domain}>{item.count} {DOMAIN_NAMES[item.domain] || item.domain}</span>
          ))}
        </div>
      </section>
    </aside>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="stat-card">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
