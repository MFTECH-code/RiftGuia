import type { BuilderStep } from '../../lib/deckBuilder';
import { builderSteps } from '../../lib/deckBuilder';

interface StepNavigationProps {
  current: BuilderStep;
  completed: Partial<Record<BuilderStep, boolean>>;
  onStepChange: (step: BuilderStep) => void;
}

export function StepNavigation({ current, completed, onStepChange }: StepNavigationProps) {
  return (
    <div className="builder-steps" aria-label="Etapas do construtor">
      {builderSteps.map((step) => (
        <button
          key={step.id}
          className={`${current === step.id ? 'active' : ''} ${completed[step.id] ? 'done' : ''}`}
          type="button"
          onClick={() => onStepChange(step.id)}
        >
          <strong>{step.label}</strong>
          <span>{step.help}</span>
        </button>
      ))}
    </div>
  );
}
