import { useState } from 'react';

const CALIBRATION_POINTS = 9;
const GRID_COLS = 3;

interface EyeTrackingCalibrationProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function EyeTrackingCalibration({ onComplete, onCancel }: EyeTrackingCalibrationProps) {
  const [clickedCount, setClickedCount] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);

  const handlePointClick = (_index: number) => {
    const next = clickedCount + 1;
    setClickedCount(next);
    if (next < CALIBRATION_POINTS) {
      setCurrentPoint(next);
    } else {
      onComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="max-w-md rounded-xl border border-white/20 bg-[#0a0a0f]/95 p-6 shadow-2xl">
        <h2 className="mb-2 text-xl font-bold text-white">
          Kalibrace eye-trackingu
        </h2>
        <p className="mb-6 text-sm text-white/70">
          Klikni na každý bod v pořadí. WebEyeTrack využije tyto vzorky pro lepší přesnost (few-shot personalizace).
        </p>

        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)` }}
        >
          {Array.from({ length: CALIBRATION_POINTS }, (_, i) => (
            <button
              key={i}
              id={`cal-point-${i}`}
              type="button"
              onClick={() => handlePointClick(i)}
              disabled={i > currentPoint}
              className={`flex h-16 w-16 items-center justify-center rounded-full text-lg font-bold transition-all
                ${i < clickedCount
                  ? 'bg-emerald-500/30 text-emerald-400 ring-2 ring-emerald-500'
                  : i === currentPoint
                    ? 'animate-pulse bg-blue-500/40 text-blue-300 ring-2 ring-blue-400'
                    : 'bg-white/10 text-white/40'
                }`}
            >
              {i < clickedCount ? '✓' : i + 1}
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-white/50">
          {clickedCount} / {CALIBRATION_POINTS} bodů
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg px-4 py-2 text-sm text-white/70 hover:bg-white/10"
          >
            Zrušit
          </button>
        </div>
      </div>
    </div>
  );
}
