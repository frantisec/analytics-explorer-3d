import { useRef, useState, useEffect } from 'react';
import { useStore } from '../stores/store';

const SMOOTHING = 0.25;

export function GazeCursor() {
  const eyeTrackingEnabled = useStore((s) => s.eyeTrackingEnabled);

  const [displayPos, setDisplayPos] = useState<{ x: number; y: number } | null>(null);
  const smoothedRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!eyeTrackingEnabled) {
      setDisplayPos(null);
      smoothedRef.current = null;
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      const gaze = useStore.getState().gazePosition;
      if (!gaze) {
        setDisplayPos(null);
        smoothedRef.current = null;
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const prev = smoothedRef.current;
      const next = prev
        ? {
            x: prev.x + (gaze.x - prev.x) * SMOOTHING,
            y: prev.y + (gaze.y - prev.y) * SMOOTHING,
          }
        : { x: gaze.x, y: gaze.y };

      smoothedRef.current = next;
      setDisplayPos(next);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [eyeTrackingEnabled]);

  if (!eyeTrackingEnabled || !displayPos) return null;

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: displayPos.x,
        top: displayPos.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="relative w-10 h-10">
        <div
          className="absolute inset-0 rounded-full border-2 border-white/25"
          style={{
            boxShadow: '0 0 12px rgba(255,255,255,0.12)',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
        </div>
      </div>
    </div>
  );
}
