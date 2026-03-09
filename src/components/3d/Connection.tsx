import { useRef, useState, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics, connections as allConnections } from '../../data/mockData';

const TUBE_RADIUS = 0.6;
const TUBE_TUBULAR_SEGMENTS = 16;
const TUBE_RADIAL_SEGMENTS = 4;

const CATEGORY_COLORS: Record<string, string> = {
  engagement: '#3B82F6',
  reach: '#10B981',
  sentiment: '#F59E0B',
  conversion: '#8B5CF6',
};

interface ConnectionProps {
  fromId: string;
  toId: string;
  strength: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16) / 255, parseInt(result[2], 16) / 255, parseInt(result[3], 16) / 255]
    : [1, 1, 1];
}

function strengthLabel(strength: number): string {
  if (strength >= 0.7) return 'Silná pozitivní korelace';
  if (strength >= 0.4) return 'Střední korelace';
  return 'Slabá korelace';
}

export const Connection = ({ fromId, toId, strength }: ConnectionProps) => {
  const lineRef = useRef<any>(null);
  const glowLineRef = useRef<any>(null);
  const [hovered, setHovered] = useState(false);

  const isConnectionActive = useStore((s) => s.isConnectionActive);
  const showAnomaliesOnly = useStore((s) => s.showAnomaliesOnly);
  const setHoveredConnection = useStore((s) => s.setHoveredConnection);

  const fromMetric = metrics.find((m) => m.id === fromId);
  const toMetric = metrics.find((m) => m.id === toId);

  const connectionData = useMemo(
    () => allConnections.find((c) => c.from === fromId && c.to === toId),
    [fromId, toId],
  );

  if (!fromMetric || !toMetric) return null;

  const [sx, sy, sz] = fromMetric.position;
  const [ex, ey, ez] = toMetric.position;
  const mx = (sx + ex) / 2 + (sy - ey) * 0.15;
  const my = (sy + ey) / 2 + (sz - ez) * 0.1;
  const mz = (sz + ez) / 2 + (sx - ex) * 0.1;

  const curve = useMemo(
    () =>
      new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(sx, sy, sz),
        new THREE.Vector3(mx, my, mz),
        new THREE.Vector3(ex, ey, ez),
      ),
    [sx, sy, sz, ex, ey, ez, mx, my, mz],
  );

  const segments = 24;
  const points = useMemo(() => curve.getPoints(segments), [curve]);

  const tubeGeometry = useMemo(
    () => new THREE.TubeGeometry(curve, TUBE_TUBULAR_SEGMENTS, TUBE_RADIUS, TUBE_RADIAL_SEGMENTS, false),
    [curve],
  );

  useEffect(() => () => tubeGeometry.dispose(), [tubeGeometry]);

  const fromColor = CATEGORY_COLORS[fromMetric.category] ?? '#888888';
  const toColor = CATEGORY_COLORS[toMetric.category] ?? '#888888';
  const fromRgb = hexToRgb(fromColor);
  const toRgb = hexToRgb(toColor);

  const vertexColors = useMemo(() => {
    return points.map((_, i) => {
      const t = i / Math.max(1, points.length - 1);
      return new THREE.Color(
        fromRgb[0] + (toRgb[0] - fromRgb[0]) * t,
        fromRgb[1] + (toRgb[1] - fromRgb[1]) * t,
        fromRgb[2] + (toRgb[2] - fromRgb[2]) * t,
      );
    });
  }, [points, fromRgb, toRgb]);

  const midPoint = new THREE.Vector3((sx + ex) / 2, (sy + ey) / 2, (sz + ez) / 2);

  const active = isConnectionActive(fromId, toId) || hovered;
  const isDimmed = showAnomaliesOnly && !active;

  const lineWidth = strength > 0.7 ? 2.5 : strength < 0.5 ? 1 : 1.5;
  const baseOpacity = strength > 0.7 ? 0.25 : strength < 0.5 ? 0.12 : 0.18;

  useFrame((state) => {
    if (lineRef.current) {
      const material = lineRef.current.material;
      const targetOpacity = active ? 0.9 : isDimmed ? 0.03 : baseOpacity;
      material.opacity += (targetOpacity - material.opacity) * 0.12;

      if (material.dashed) {
        material.dashOffset = state.clock.getElapsedTime() * -0.3;
      }
    }

    if (glowLineRef.current) {
      const glowMat = glowLineRef.current.material;
      const targetGlow = active ? 0.25 : 0;
      glowMat.opacity += (targetGlow - glowMat.opacity) * 0.12;
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredConnection({ from: fromId, to: toId });
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredConnection(null);
    document.body.style.cursor = 'auto';
  };

  return (
    <group>
      <mesh
        geometry={tubeGeometry}
        userData={{ connectionFrom: fromId, connectionTo: toId }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        renderOrder={-1}
      >
        <meshBasicMaterial transparent opacity={0} depthWrite={false} colorWrite={false} />
      </mesh>

      {/* Glow line (wider, additive blending) */}
      <Line
        ref={glowLineRef}
        points={points}
        color={0xffffff}
        vertexColors={vertexColors}
        lineWidth={lineWidth * 3}
        transparent
        opacity={0}
      />

      <Line
        ref={lineRef}
        points={points}
        color={0xffffff}
        vertexColors={vertexColors}
        lineWidth={lineWidth}
        transparent
        opacity={baseOpacity}
        dashed={active}
        dashSize={0.5}
        gapSize={0.2}
      />

      {hovered && (
        <Html position={midPoint} center className="pointer-events-none z-50">
          <div
            className="rounded-xl px-4 py-3 text-xs backdrop-blur-xl shadow-2xl whitespace-nowrap overflow-hidden max-w-[320px]"
            style={{
              background: `linear-gradient(135deg, ${fromColor}18 0%, ${toColor}18 100%)`,
              border: `1px solid ${fromColor}40`,
              color: 'white',
              boxShadow: `0 0 30px ${fromColor}10`,
            }}
          >
            <div className="font-semibold mb-2 flex items-center justify-between gap-4">
              <span>{fromMetric.name}</span>
              <span className="opacity-50">→</span>
              <span>{toMetric.name}</span>
            </div>

            <div className="flex items-center gap-2 mb-1">
              <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${strength * 100}%`,
                    background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
                  }}
                />
              </div>
              <span className="font-mono font-bold text-emerald-400">{Math.round(strength * 100)}%</span>
            </div>

            <div className="text-white/50 text-[10px] mb-2">{strengthLabel(strength)}</div>

            {connectionData?.description && (
              <p className="text-white/70 text-[11px] leading-relaxed mb-1 whitespace-normal">
                📊 {connectionData.description}
              </p>
            )}

            {connectionData?.recommendation && (
              <p className="text-emerald-400/80 text-[10px] leading-relaxed whitespace-normal mt-1.5 pt-1.5 border-t border-white/10">
                💡 {connectionData.recommendation}
              </p>
            )}
          </div>
        </Html>
      )}
    </group>
  );
};
