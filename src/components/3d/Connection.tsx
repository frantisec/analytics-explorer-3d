import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics } from '../../data/mockData';

interface ConnectionProps {
  fromId: string;
  toId: string;
  strength: number;
}

export const Connection = ({ fromId, toId, strength }: ConnectionProps) => {
  const lineRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  const isConnectionActive = useStore(state => state.isConnectionActive);
  const showAnomaliesOnly = useStore(state => state.showAnomaliesOnly);

  const fromMetric = metrics.find(m => m.id === fromId);
  const toMetric = metrics.find(m => m.id === toId);

  if (!fromMetric || !toMetric) return null;

  const points = [
    new THREE.Vector3(...fromMetric.position),
    new THREE.Vector3(...toMetric.position)
  ];

  const midPoint = new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5);

  const active = isConnectionActive(fromId, toId) || hovered;
  const isDimmed = showAnomaliesOnly && !active;

  const lineWidth = strength > 0.7 ? 2 : (strength < 0.5 ? 0.5 : 1);
  const baseColor = strength > 0.7 ? '#aaaaaa' : '#555555';

  useFrame(() => {
    if (!lineRef.current) return;
    const material = lineRef.current.material;

    const targetOpacity = active ? 0.8 : (isDimmed ? 0.02 : 0.08);
    material.opacity += (targetOpacity - material.opacity) * 0.1;

    if (active) {
      material.color.setHex(0xffffff);
    } else {
      material.color.set(baseColor);
    }
  });

  return (
    <group>
      <Line
        ref={lineRef}
        points={points}
        color={baseColor}
        lineWidth={lineWidth}
        transparent
        opacity={0.08}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      />

      {hovered && (
        <Html position={midPoint} center className="pointer-events-none z-50">
          <div className="bg-[#0a0a0f]/90 border border-white/20 text-white px-3 py-2 rounded-lg text-xs backdrop-blur-md shadow-xl whitespace-nowrap">
            <div className="font-semibold mb-1 flex items-center justify-between gap-4">
              <span>{fromMetric.name}</span>
              <span className="text-white/50">→</span>
              <span>{toMetric.name}</span>
            </div>
            <div className="flex items-center justify-between text-white/70">
              <span>Korelace:</span>
              <span className="font-mono text-emerald-400 font-bold">{Math.round(strength * 100)}%</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};
