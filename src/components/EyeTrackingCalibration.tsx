import { useState, useCallback } from 'react';

const CLICKS_PER_POINT = 5;

const CALIBRATION_POINTS: Array<{ x: string; y: string }> = [
  { x: '10vw', y: '10vh' },
  { x: '50vw', y: '10vh' },
  { x: '90vw', y: '10vh' },
  { x: '10vw', y: '50vh' },
  { x: '50vw', y: '50vh' },
  { x: '90vw', y: '50vh' },
  { x: '10vw', y: '90vh' },
  { x: '50vw', y: '90vh' },
  { x: '90vw', y: '90vh' },
];

interface EyeTrackingCalibrationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function EyeTrackingCalibration({ onComplete, onCancel }: EyeTrackingCalibrationProps) {
  const [clicks, setClicks] = useState<number[]>(() => new Array(CALIBRATION_POINTS.length).fill(0));
  const [activeIndex, setActiveIndex] = useState(0);

  const totalClicks = clicks.reduce((a, b) => a + b, 0);
  const totalRequired = CALIBRATION_POINTS.length * CLICKS_PER_POINT;

  const handlePointClick = useCallback(
    (index: number, e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      webgazer.recordScreenPosition(cx, cy, 'click');

      setClicks((prev) => {
        const next = [...prev];
        next[index] += 1;
        const allDone = next.every((c) => c >= CLICKS_PER_POINT);
        if (allDone) {
          setTimeout(onComplete, 200);
        } else if (next[index] >= CLICKS_PER_POINT) {
          const nextIncomplete = next.findIndex((c) => c < CLICKS_PER_POINT);
          if (nextIncomplete !== -1) setActiveIndex(nextIncomplete);
        }
        return next;
      });
    },
    [onComplete],
  );

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-sm">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <h2 className="text-xl font-bold text-white mb-1">Kalibrace eye-trackingu</h2>
        <p className="text-sm text-white/60 max-w-md">
          Dívej se na zvýrazněný bod a klikni na něj {CLICKS_PER_POINT}×. Opakuj pro každý bod.
        </p>
        <div className="mt-2 text-xs text-white/40">
          {totalClicks} / {totalRequired} kliků
        </div>
      </div>

      {CALIBRATION_POINTS.map((pt, i) => {
        const done = clicks[i] >= CLICKS_PER_POINT;
        const isActive = i === activeIndex && !done;
        const progress = Math.min(clicks[i] / CLICKS_PER_POINT, 1);

        return (
          <button
            key={i}
            type="button"
            onClick={(e) => handlePointClick(i, e)}
            disabled={done}
            className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-all duration-300"
            style={{
              left: pt.x,
              top: pt.y,
              width: 72,
              height: 72,
            }}
          >
            <svg width={72} height={72} className="absolute inset-0">
              <circle cx={36} cy={36} r={32} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={3} />
              {progress > 0 && (
                <circle
                  cx={36}
                  cy={36}
                  r={32}
                  fill="none"
                  stroke={done ? '#10B981' : '#3B82F6'}
                  strokeWidth={3}
                  strokeDasharray={`${progress * 201} 201`}
                  strokeLinecap="round"
                  transform="rotate(-90 36 36)"
                  className="transition-all duration-200"
                />
              )}
            </svg>
            <div
              className={`w-5 h-5 rounded-full transition-all duration-300 ${
                done
                  ? 'bg-emerald-500 scale-75'
                  : isActive
                    ? 'bg-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse'
                    : 'bg-white/30'
              }`}
            />
            {!done && (
              <span className="absolute -bottom-5 text-[10px] text-white/50 font-mono">
                {clicks[i]}/{CLICKS_PER_POINT}
              </span>
            )}
          </button>
        );
      })}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-5 py-2 text-sm text-white/70 hover:bg-white/10 border border-white/10 transition-colors"
        >
          Zrušit kalibraci
        </button>
      </div>
    </div>
  );
}
