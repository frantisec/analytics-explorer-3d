import { useRef, useState, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics as allMetrics } from '../../data/mockData';
import type { MetricDef } from '../../data/mockData';

interface StarProps {
  metric: MetricDef;
  onSelect: (metric: MetricDef, position: THREE.Vector3) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  engagement: '#3B82F6',
  reach: '#10B981',
  sentiment: '#F59E0B',
  conversion: '#8B5CF6',
};

export const Star = ({ metric, onSelect }: StarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const categoryGlowRef = useRef<THREE.Mesh>(null);
  const anomalyAuraRef = useRef<THREE.Mesh>(null);
  const highlightRingRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const { camera, size } = useThree();

  const selectedMetricId = useStore((s) => s.selectedMetricId);
  const hoveredMetricId = useStore((s) => s.hoveredMetricId);
  const hoveredConnectionId = useStore((s) => s.hoveredConnectionId);
  const setHoveredMetric = useStore((s) => s.setHoveredMetric);
  const setHoveredScreenPosition = useStore((s) => s.setHoveredScreenPosition);
  const showAnomaliesOnly = useStore((s) => s.showAnomaliesOnly);
  const eyeTrackingEnabled = useStore((s) => s.eyeTrackingEnabled);

  const GAZE_POS_MULTIPLIER = 1.5;

  const isSelected = selectedMetricId === metric.id;
  const isHoveredByGaze = hoveredMetricId === metric.id;
  const effectiveHovered = hovered || isHoveredByGaze;

  const isRelatedToHovered = useMemo(() => {
    if (!hoveredMetricId || hoveredMetricId === metric.id) return false;
    const hoveredMetric = allMetrics.find((m) => m.id === hoveredMetricId);
    return hoveredMetric?.relatedMetrics.includes(metric.id) ?? false;
  }, [hoveredMetricId, metric.id]);

  const isConnectionEndpoint = useMemo(() => {
    if (!hoveredConnectionId) return false;
    return hoveredConnectionId.from === metric.id || hoveredConnectionId.to === metric.id;
  }, [hoveredConnectionId, metric.id]);

  const shouldHighlight = isRelatedToHovered || isConnectionEndpoint;

  const isDimmed = useMemo(() => {
    if (showAnomaliesOnly && !metric.isAnomaly && !isSelected) return true;
    if (selectedMetricId && !isSelected) return true;
    if (hoveredMetricId && !effectiveHovered && !isRelatedToHovered && !isConnectionEndpoint) return true;
    return false;
  }, [showAnomaliesOnly, metric.isAnomaly, isSelected, selectedMetricId, hoveredMetricId, effectiveHovered, isRelatedToHovered, isConnectionEndpoint]);

  const logVal = Math.log10(metric.value + 1);
  const normalizedValue = Math.min(Math.max((logVal - 0.4) / 4.7, 0), 1);
  let baseScale = eyeTrackingEnabled
    ? 0.5 + normalizedValue * 0.5
    : 0.25 + normalizedValue * 0.35;
  if (metric.isAnomaly) baseScale += 0.1;

  useFrame((state) => {
    if (!meshRef.current) return;

    let pulse = 1;
    if (metric.isAnomaly && anomalyAuraRef.current) {
      const time = state.clock.getElapsedTime();
      pulse = 1.0 + ((Math.sin(time * Math.PI * 0.8) + 1) / 2) * 0.06;

      anomalyAuraRef.current.scale.setScalar(baseScale * pulse * 1.25);
      const auraMat = anomalyAuraRef.current.material as THREE.MeshBasicMaterial;
      auraMat.opacity = ((Math.sin(time * Math.PI * 0.8) + 1) / 2) * 0.1 + 0.05;
    }

    if (categoryGlowRef.current) {
      categoryGlowRef.current.scale.setScalar(baseScale * 1.2);
    }

    if (highlightRingRef.current) {
      const ringMat = highlightRingRef.current.material as THREE.MeshBasicMaterial;
      const targetRingOpacity = shouldHighlight ? 0.35 : 0;
      ringMat.opacity += (targetRingOpacity - ringMat.opacity) * 0.15;
      highlightRingRef.current.scale.setScalar(baseScale * 1.6);
      highlightRingRef.current.lookAt(state.camera.position);
    }

    const scaleMultiplier = isSelected ? 1.5 : effectiveHovered ? 1.3 : 1;
    const targetScale = baseScale * scaleMultiplier * (metric.isAnomaly && !isSelected && !hovered ? pulse : 1);
    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = isSelected || effectiveHovered ? 1 : shouldHighlight ? 0.7 : 0.5;
      const targetOpacity = isDimmed ? 0.15 : 1;
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1;
      materialRef.current.transparent = true;
    }

    if (effectiveHovered && !selectedMetricId) {
      const pos = new THREE.Vector3();
      meshRef.current.getWorldPosition(pos);
      pos.project(camera);
      const sx = (pos.x * 0.5 + 0.5) * size.width;
      const sy = (-pos.y * 0.5 + 0.5) * size.height;
      setHoveredScreenPosition({ x: sx, y: sy });
    }
  });

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    setHovered(true);
    setHoveredMetric(metric.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    setHoveredMetric(null);
    setHoveredScreenPosition(null);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (meshRef.current) {
      const position = new THREE.Vector3();
      meshRef.current.getWorldPosition(position);
      onSelect(metric, position);
    }
  };

  const formatValue = (val: number) => {
    if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
    return val.toString();
  };

  const categoryColor = CATEGORY_COLORS[metric.category];

  const renderPosition: [number, number, number] = eyeTrackingEnabled
    ? [metric.position[0] * GAZE_POS_MULTIPLIER, metric.position[1] * GAZE_POS_MULTIPLIER, metric.position[2] * GAZE_POS_MULTIPLIER]
    : metric.position;

  return (
    <group position={renderPosition}>
      {/* Highlight ring for related stars */}
      <mesh ref={highlightRingRef}>
        <ringGeometry args={[0.85, 1, 32]} />
        <meshBasicMaterial
          color={categoryColor}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Category glow */}
      <mesh ref={categoryGlowRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color={categoryColor}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {metric.isAnomaly && (
        <mesh ref={anomalyAuraRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.1} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}

      <mesh
        ref={meshRef}
        userData={{ metricId: metric.id }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={categoryColor}
          emissive={categoryColor}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      <Html
        center
        position={[0, baseScale * 1.8, 0]}
        className="pointer-events-none transition-opacity duration-300"
        style={{
          opacity: isDimmed ? 0.1 : effectiveHovered && !selectedMetricId ? 0.4 : isSelected ? 1 : 0.7,
          zIndex: isSelected || effectiveHovered ? 10 : 0,
        }}
      >
        <div
          className={`flex items-center gap-2 px-2 py-1.5 rounded-md backdrop-blur-md border shadow-lg
            ${isSelected ? 'bg-white text-black font-bold border-white' : 'bg-[#0a0a0f]/80 text-white border-white/10'}`}
          style={{
            borderLeftWidth: 3,
            borderLeftColor: categoryColor,
            borderLeftStyle: 'solid',
          }}
        >
          <div className="flex flex-col">
            <span className="font-bold whitespace-nowrap text-[11px]">{metric.name}</span>
            <span className="flex items-center gap-1 font-mono text-[10px] text-current opacity-80">
              {formatValue(metric.value)}{metric.unit}
              {metric.trend === 'up' ? <span className="text-emerald-500">↑</span> : <span className="text-rose-500">↓</span>}
            </span>
          </div>
          {metric.isAnomaly && (
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 animate-pulse">
              ⚠️
            </div>
          )}
        </div>
      </Html>
    </group>
  );
};
