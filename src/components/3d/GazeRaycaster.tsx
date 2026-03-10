import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics } from '../../data/mockData';

const DWELL_MS = 1200;
const SNAP_RADIUS_PX = 150;
const STICKY_MS = 400;
const GAZE_POS_MULTIPLIER = 1.5;

const _projected = new THREE.Vector3();

export function GazeRaycaster() {
  const { camera, size } = useThree();

  const dwellStartRef = useRef<number | null>(null);
  const lastMetricIdRef = useRef<string | null>(null);
  const stickyLeaveTimeRef = useRef<number | null>(null);

  const gazePosition = useStore((s) => s.gazePosition);
  const eyeTrackingEnabled = useStore((s) => s.eyeTrackingEnabled);
  const setHoveredMetric = useStore((s) => s.setHoveredMetric);
  const setSelectedMetric = useStore((s) => s.setSelectedMetric);
  const setHoveredScreenPosition = useStore((s) => s.setHoveredScreenPosition);
  const setGazeDwellProgress = useStore((s) => s.setGazeDwellProgress);
  const setHoveredConnection = useStore((s) => s.setHoveredConnection);

  useFrame(() => {
    if (!eyeTrackingEnabled || !gazePosition) {
      setHoveredMetric(null);
      setHoveredScreenPosition(null);
      setGazeDwellProgress(0);
      setHoveredConnection(null);
      dwellStartRef.current = null;
      lastMetricIdRef.current = null;
      stickyLeaveTimeRef.current = null;
      return;
    }

    const gx = gazePosition.x;
    const gy = gazePosition.y;

    let nearestId: string | null = null;
    let nearestDist = Infinity;
    let nearestScreenX = 0;
    let nearestScreenY = 0;

    for (const m of metrics) {
      const pm = GAZE_POS_MULTIPLIER;
      _projected.set(m.position[0] * pm, m.position[1] * pm, m.position[2] * pm);
      _projected.project(camera);

      const sx = (_projected.x * 0.5 + 0.5) * size.width;
      const sy = (-_projected.y * 0.5 + 0.5) * size.height;

      const dx = gx - sx;
      const dy = gy - sy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < nearestDist && dist < SNAP_RADIUS_PX) {
        nearestDist = dist;
        nearestId = m.id;
        nearestScreenX = sx;
        nearestScreenY = sy;
      }
    }

    const now = performance.now();
    const lastId = lastMetricIdRef.current;

    if (nearestId) {
      stickyLeaveTimeRef.current = null;

      if (nearestId === lastId) {
        if (dwellStartRef.current === null) {
          dwellStartRef.current = now;
        } else {
          const elapsed = now - dwellStartRef.current;
          setGazeDwellProgress(Math.min(elapsed / DWELL_MS, 1));
          if (elapsed >= DWELL_MS) {
            setSelectedMetric(nearestId);
            setGazeDwellProgress(0);
            dwellStartRef.current = null;
            lastMetricIdRef.current = null;
            setHoveredMetric(null);
            setHoveredScreenPosition(null);
            return;
          }
        }
      } else {
        dwellStartRef.current = now;
        lastMetricIdRef.current = nearestId;
        setGazeDwellProgress(0);
      }

      setHoveredMetric(nearestId);
      setHoveredScreenPosition({ x: nearestScreenX, y: nearestScreenY });
      setHoveredConnection(null);
    } else if (lastId) {
      if (stickyLeaveTimeRef.current === null) {
        stickyLeaveTimeRef.current = now;
      }

      if (now - stickyLeaveTimeRef.current < STICKY_MS) {
        // Grace period: keep the current hover/dwell alive
        return;
      }

      stickyLeaveTimeRef.current = null;
      lastMetricIdRef.current = null;
      dwellStartRef.current = null;
      setHoveredMetric(null);
      setHoveredScreenPosition(null);
      setGazeDwellProgress(0);
      setHoveredConnection(null);
    } else {
      setHoveredMetric(null);
      setHoveredScreenPosition(null);
      setGazeDwellProgress(0);
      setHoveredConnection(null);
    }
  });

  return null;
}
