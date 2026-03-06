import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import type { MetricDef } from '../../data/mockData';

interface StarProps {
  metric: MetricDef;
  onSelect: (metric: MetricDef, position: THREE.Vector3) => void;
}

const CATEGORY_COLORS = {
  engagement: '#3B82F6', // Blue
  reach: '#10B981',      // Green
  sentiment: '#F59E0B',  // Orange
  conversion: '#8B5CF6', // Purple
};

export const Star = ({ metric, onSelect }: StarProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const auraRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);

  const selectedMetricId = useStore(state => state.selectedMetricId);
  const setHoveredMetric = useStore(state => state.setHoveredMetric);
  const showAnomaliesOnly = useStore(state => state.showAnomaliesOnly);

  const isSelected = selectedMetricId === metric.id;

  let isOtherSelected = selectedMetricId !== null && !isSelected;
  if (showAnomaliesOnly && !metric.isAnomaly && !isSelected) {
    isOtherSelected = true;
  }

  // Normalize value using log scale for size (0.5 to 1.5)
  const logVal = Math.log10(metric.value + 1);
  const normalizedValue = Math.min(Math.max((logVal - 0.4) / 4.7, 0), 1);
  let baseScale = 0.5 + (normalizedValue * 1.0);
  if (metric.isAnomaly) {
    baseScale += 0.3; // Anomaly bonus
  }

  useFrame((state) => {
    if (!meshRef.current) return;

    // Anomaly pulsing animation (2s period)
    let pulse = 1;
    if (metric.isAnomaly) {
      const time = state.clock.getElapsedTime();
      pulse = 1.0 + (Math.sin(time * Math.PI) + 1) / 2 * 0.15; // 1.0 to 1.15

      if (auraRef.current) {
        auraRef.current.scale.setScalar(baseScale * pulse * 1.4);
        const auraMat = auraRef.current.material as THREE.MeshBasicMaterial;
        auraMat.opacity = (Math.sin(time * Math.PI) + 1) / 2 * 0.3 + 0.1; // 0.1 to 0.4
      }
    }

    // Smooth scale transition for hover/select
    const scaleMultiplier = isSelected ? 1.5 : (hovered ? 1.3 : 1);
    const targetScale = baseScale * scaleMultiplier * (metric.isAnomaly && !isSelected && !hovered ? pulse : 1);

    meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

    if (materialRef.current) {
      materialRef.current.emissiveIntensity = isSelected || hovered ? 1 : 0.5;

      const targetOpacity = isOtherSelected ? 0.1 : 1;
      materialRef.current.opacity += (targetOpacity - materialRef.current.opacity) * 0.1;
      materialRef.current.transparent = true;
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

  return (
    <group position={metric.position}>
      {metric.isAnomaly && (
        <mesh ref={auraRef}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      <mesh
        ref={meshRef}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          ref={materialRef}
          color={CATEGORY_COLORS[metric.category]}
          emissive={CATEGORY_COLORS[metric.category]}
          emissiveIntensity={0.5}
          toneMapped={false}
        />
      </mesh>

      <Html center position={[0, baseScale * 1.8, 0]} className="pointer-events-none transition-opacity duration-300" style={{ opacity: isOtherSelected ? 0.1 : 1, zIndex: isSelected || hovered ? 10 : 0 }}>
        <div className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-[10px] sm:text-xs backdrop-blur-md border shadow-lg
          ${isSelected ? 'bg-white text-black font-bold border-white' : 'bg-[#0a0a0f]/80 text-white border-white/10'}`}
          style={{ opacity: hovered || isSelected ? 1 : 0.7 }}
        >
          <div className="flex flex-col">
            <span className="font-bold whitespace-nowrap text-[12px]">{metric.name}</span>
            <span className="flex items-center gap-1 font-mono text-current opacity-80">
              {formatValue(metric.value)}
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
