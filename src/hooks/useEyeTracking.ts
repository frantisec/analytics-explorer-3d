import { useRef, useState, useEffect, useCallback } from 'react';
import { WebcamClient, WebEyeTrackProxy, type GazeResult } from 'webeyetrack';
import { useStore } from '../stores/store';

const VIDEO_ELEMENT_ID = 'eye-tracking-video';

export interface UseEyeTrackingReturn {
  gaze: { x: number; y: number } | null;
  isReady: boolean;
  isError: boolean;
  errorMessage: string | null;
  videoElementId: string;
  start: () => Promise<boolean>;
  stop: () => void;
}

export function useEyeTracking(): UseEyeTrackingReturn {
  const [gaze, setGaze] = useState<{ x: number; y: number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  const webcamClientRef = useRef<WebcamClient | null>(null);
  const proxyRef = useRef<WebEyeTrackProxy | null>(null);
  const setGazePosition = useStore((s) => s.setGazePosition);

  const start = useCallback(async (): Promise<boolean> => {
    if (startedRef.current) return true;

    const videoEl = document.getElementById(VIDEO_ELEMENT_ID) as HTMLVideoElement | null;
    if (!videoEl) {
      setIsError(true);
      setErrorMessage('Video element pro kameru nenalezen.');
      return false;
    }

    try {
      setErrorMessage(null);
      setIsError(false);

      const webcamClient = new WebcamClient(VIDEO_ELEMENT_ID);
      const proxy = new WebEyeTrackProxy(webcamClient);

      proxy.onGazeResults = (result: GazeResult) => {
        if (result.normPog && result.normPog.length >= 2) {
          const x = (result.normPog[0] + 0.5) * window.innerWidth;
          const y = (result.normPog[1] + 0.5) * window.innerHeight;
          const pos = { x, y };
          setGaze(pos);
          setGazePosition(pos);
        } else {
          setGaze(null);
          setGazePosition(null);
        }
      };

      await webcamClient.startWebcam();

      webcamClientRef.current = webcamClient;
      proxyRef.current = proxy;
      startedRef.current = true;
      setIsReady(true);
      return true;
    } catch (err) {
      console.error('WebEyeTrack start error:', err);
      setIsError(true);
      setErrorMessage(
        err instanceof Error ? err.message : 'Chyba při spuštění eye-trackingu. Povolte přístup ke kameře.'
      );
      return false;
    }
  }, [setGazePosition]);

  const stop = useCallback(() => {
    if (!startedRef.current) return;

    try {
      webcamClientRef.current?.stopWebcam();
    } catch {
      // ignore
    }
    webcamClientRef.current = null;
    proxyRef.current = null;
    setGaze(null);
    setGazePosition(null);
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
    videoElementId: VIDEO_ELEMENT_ID,
    start,
    stop,
  };
}
