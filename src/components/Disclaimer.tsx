import { S } from '../data/strings';

export function Disclaimer({ isOrigin, onInfo }: { isOrigin: boolean; onInfo?: () => void }) {
  return (
    <section className="mt-8 flex items-start gap-2 text-dim" data-testid="disclaimer">
      <button type="button" onClick={onInfo} className="pressable shrink-0 w-6 h-6 rounded-full border border-line text-xs" aria-label="기록의 종류 보기">
        i
      </button>
      <p className="t-caption">{isOrigin ? S.result.disclaimerOrigin : S.result.disclaimerAlt}</p>
    </section>
  );
}
