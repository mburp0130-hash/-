import { useCountUp } from '../hooks/useCountUp';
import { easeOutCubic } from '../utils/easing';

export function YearDisplay({
  year,
  fromYear,
  duration,
  onDone,
}: {
  year: number;
  fromYear: number;
  duration: number;
  onDone?: () => void;
}) {
  const value = useCountUp(fromYear, year, duration, easeOutCubic, onDone);
  const rolling = value !== year;
  return (
    <div
      data-testid="year-display"
      aria-live="polite"
      className="t-year-lg text-center transition-colors duration-300"
      style={{ color: rolling ? 'var(--c-accent)' : 'var(--c-text)' }}
    >
      {value}
    </div>
  );
}
