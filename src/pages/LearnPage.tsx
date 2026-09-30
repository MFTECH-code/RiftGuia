import { TERMS } from '../data';

export function LearnPage() {
  const groups = unique(TERMS.map((term) => term.group));

  return (
    <section className="learn">
      <div className="page-hero learn-hero">
        <div>
          <p className="eyebrow">Comece com calma</p>
          <h2>Riftbound para quem nunca jogou TCG</h2>
          <p>Use este glossário enquanto lê as cartas. Os nomes em português são explicações de estudo e não substituem as regras oficiais.</p>
        </div>
        <div className="hero-stats learn-stats" aria-label="Resumo do glossário">
          <span><strong>{TERMS.length}</strong> termos</span>
          <span><strong>{groups.length}</strong> grupos</span>
          <span><strong>PT-BR</strong> mesa</span>
        </div>
      </div>

      {groups.map((group, index) => (
        <section className="term-group" key={group}>
          <div className="term-group-header">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <h3>{group}</h3>
            <p>{TERMS.filter((term) => term.group === group).length} termos</p>
          </div>
          <div className="term-grid">
            {TERMS.filter((term) => term.group === group).map((term) => (
              <article className="term-card" key={term.en}>
                <span className="term-en">{term.en}</span>
                <h4>{term.pt}</h4>
                <p>{term.body}</p>
                <strong>Na prática</strong>
                <p>{term.example}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)].sort((a, b) => String(a).localeCompare(String(b), 'pt-BR'));
}
