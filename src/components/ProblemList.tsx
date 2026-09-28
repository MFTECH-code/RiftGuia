import type { DeckProblem } from '../types';

interface ProblemListProps {
  problems: DeckProblem[];
}

export function ProblemList({ problems }: ProblemListProps) {
  return (
    <div className="problems">
      <h3>{problems.length} linha(s) precisam de revisao</h3>
      {problems.map((problem) => (
        <p key={`${problem.line}-${problem.text}`}>
          <strong>Linha {problem.line}: {problem.text}</strong>
          <br />
          {problem.message}
        </p>
      ))}
    </div>
  );
}
