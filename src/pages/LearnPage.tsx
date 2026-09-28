import { TERMS } from '../data';

export function LearnPage() {
  return (
    <section className="learn">
      <div className="panel">
        <p className="eyebrow">Comece com calma</p>
        <h2>Riftbound para quem nunca jogou TCG</h2>
        <p>Use este glossario enquanto le as cartas. Os nomes em portugues sao explicacoes de estudo e nao substituem as regras oficiais.</p>
      </div>
      {unique(TERMS.map((term) => term.group)).map((group) => (
        <section className="term-group" key={group}>
          <h3>{group}</h3>
          <div className="term-grid">
            {TERMS.filter((term) => term.group === group).map((term) => (
              <article className="term-card" key={term.en}>
                <span>{term.en}</span>
                <h4>{term.pt}</h4>
                <p>{term.body}</p>
                <strong>Na pratica</strong>
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
