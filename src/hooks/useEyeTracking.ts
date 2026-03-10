import { useRef, useState, useEffect, useCallback } from 'react';
import { useStore } from '../stores/store';

export interface UseEyeTrackingReturn {
  gaze: { x: number; y: number } | null;
  isReady: boolean;
  isError: boolean;
  errorMessage: string | null;
  start: () => Promise<boolean>;
  stop: () => void;
}

const GAZE_EMA_FACTOR = 0.15;

export function useEyeTracking(): UseEyeTrackingReturn {
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  const smoothedRef = useRef<{ x: number; y: number } | null>(null);
  const setGazePosition = useStore((s) => s.setGazePosition);

  const start = useCallback(async (): Promise<boolean> => {
    if (startedRef.current) return true;

    try {
      setErrorMessage(null);
      setIsError(false);

      webgazer.params.showVideoPreview = false;
      webgazer.params.showVideo = false;
      webgazer.params.showFaceOverlay = false;
      webgazer.params.showFaceFeedbackBox = false;
      webgazer.params.showGazeDot = false;
      webgazer.params.faceMeshSolutionPath = '/mediapipe/face_mesh';
      webgazer.saveDataAcrossSessions(true);

      webgazer.setGazeListener((data: { x: number; y: number } | null) => {
        if (data && data.x != null && data.y != null) {
          const prev = smoothedRef.current;
          const smoothed = prev
            ? {
                x: prev.x + (data.x - prev.x) * GAZE_EMA_FACTOR,
                y: prev.y + (data.y - prev.y) * GAZE_EMA_FACTOR,
              }
            : { x: data.x, y: data.y };
          smoothedRef.current = smoothed;
          setGaze(smoothed);
          setGazePosition(smoothed);
        } else {
          setGaze(null);
          setGazePosition(null);
        }
      });

      await webgazer.begin();

      startedRef.current = true;
      setIsReady(true);
      return true;
    } catch (err) {
      console.error('WebGazer start error:', err);
      setIsError(true);
      setErrorMessage(
        err instanceof Error ? err.message : 'Chyba při spuštění eye-trackingu. Povolte přístup ke kameře.',
      );
      return false;
    }
  }, [setGazePosition]);

  const stop = useCallback(() => {
    if (!startedRef.current) return;

    try {
      webgazer.clearGazeListener();
      webgazer.pause();
    } catch {
      // ignore
    }
    setGaze(null);
    setGazePosition(null);
    smoothedRef.current = null;
    startedRef.current = false;
    setIsReady(false);
  }, [setGazePosition]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    gaze,
    isReady,
    isError,
    errorMessage,
    start,
    stop,
  };
}
