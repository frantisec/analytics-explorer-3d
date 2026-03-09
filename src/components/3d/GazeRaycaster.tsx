import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../stores/store';

const DWELL_MS = 800;
const CONNECTION_HOVER_THRESHOLD_MS = 300;

export function GazeRaycaster() {
  const { camera, scene, size } = useThree();
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());
  const dwellStartRef = useRef<number | null>(null);
  const lastMetricIdRef = useRef<string | null>(null);
  const connHoverStartRef = useRef<number | null>(null);
  const lastConnRef = useRef<{ from: string; to: string } | null>(null);

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
      connHoverStartRef.current = null;
      lastConnRef.current = null;
      return;
    }

    mouse.current.x = (gazePosition.x / window.innerWidth) * 2 - 1;
    mouse.current.y = -(gazePosition.y / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(scene.children, true);

    const starIntersect = intersects.find((i) => i.object.userData?.metricId != null);
    const connIntersect = intersects.find(
      (i) => i.object.userData?.connectionFrom != null && i.object.userData?.connectionTo != null,
    );

    const metricId = starIntersect ? (starIntersect.object.userData.metricId as string) : null;

    if (metricId) {
      setHoveredMetric(metricId);

      const worldPos = new THREE.Vector3();
      starIntersect!.object.getWorldPosition(worldPos);
      const projected = worldPos.clone().project(camera);
      const sx = (projected.x * 0.5 + 0.5) * size.width;
      const sy = (-projected.y * 0.5 + 0.5) * size.height;
      setHoveredScreenPosition({ x: sx, y: sy });

      setHoveredConnection(null);
      connHoverStartRef.current = null;
      lastConnRef.current = null;

      const now = performance.now();
      if (metricId === lastMetricIdRef.current) {
        if (dwellStartRef.current === null) {
          dwellStartRef.current = now;
        } else {
          const elapsed = now - dwellStartRef.current;
          setGazeDwellProgress(Math.min(elapsed / DWELL_MS, 1));
          if (elapsed >= DWELL_MS) {
            setSelectedMetric(metricId);
            setGazeDwellProgress(0);
            dwellStartRef.current = null;
            lastMetricIdRef.current = null;
          }
        }
      } else {
        dwellStartRef.current = now;
        lastMetricIdRef.current = metricId;
        setGazeDwellProgress(0);
      }
    } else if (connIntersect) {
      setHoveredMetric(null);
      setHoveredScreenPosition(null);
      setGazeDwellProgress(0);
      dwellStartRef.current = null;
      lastMetricIdRef.current = null;

      const from = connIntersect.object.userData.connectionFrom as string;
      const to = connIntersect.object.userData.connectionTo as string;
      const now = performance.now();

      if (lastConnRef.current?.from === from && lastConnRef.current?.to === to) {
        if (connHoverStartRef.current !== null && now - connHoverStartRef.current >= CONNECTION_HOVER_THRESHOLD_MS) {
          setHoveredConnection({ from, to });
        }
      } else {
        lastConnRef.current = { from, to };
        connHoverStartRef.current = now;
        setHoveredConnection(null);
      }
    } else {
      setHoveredMetric(null);
      setHoveredScreenPosition(null);
      setGazeDwellProgress(0);
      setHoveredConnection(null);
      dwellStartRef.current = null;
      lastMetricIdRef.current = null;
      connHoverStartRef.current = null;
      lastConnRef.current = null;
    }
  });

  return null;
}
