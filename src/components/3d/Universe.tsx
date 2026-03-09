import { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars as Particles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics, connections } from '../../data/mockData';
import type { MetricDef } from '../../data/mockData';
import { Star } from './Star';
import { Connection } from './Connection';
import { GazeRaycaster } from './GazeRaycaster';

const CATEGORY_COLORS: Record<string, string> = {
  engagement: '#3B82F6',
  reach: '#10B981',
  sentiment: '#F59E0B',
  conversion: '#8B5CF6',
};

export const Universe = () => {
  const { scene } = useThree();

  useEffect(() => {
    scene.fog = new THREE.Fog('#0a0a0f', 20, 50);
    return () => {
      scene.fog = null;
    };
  }, [scene]);

  const controlsRef = useRef<any>(null);
  const selectedMetricId = useStore((s) => s.selectedMetricId);
  const setSelectedMetric = useStore((s) => s.setSelectedMetric);

  const clusterCenters = useMemo(() => {
    const centers: Record<string, THREE.Vector3> = {
      engagement: new THREE.Vector3(),
      reach: new THREE.Vector3(),
      sentiment: new THREE.Vector3(),
      conversion: new THREE.Vector3(),
    };
    const counts = { engagement: 0, reach: 0, sentiment: 0, conversion: 0 };

    metrics.forEach((m) => {
      centers[m.category].add(new THREE.Vector3(...m.position));
      counts[m.category as keyof typeof counts]++;
    });

    Object.keys(centers).forEach((cat) => {
      const c = cat as keyof typeof counts;
      if (counts[c] > 0) {
        centers[c].divideScalar(counts[c]);
        centers[c].z -= 2;
      }
    });

    return centers;
  }, []);

  useFrame((state) => {
    if (!controlsRef.current) return;

    if (selectedMetricId) {
      const metric = metrics.find((m) => m.id === selectedMetricId);
      if (metric) {
        const target = new THREE.Vector3(...metric.position);
        controlsRef.current.target.lerp(target, 0.05);

        const offset = new THREE.Vector3(0, 0, 10);
        const desiredPos = target.clone().add(offset);
        state.camera.position.lerp(desiredPos, 0.02);
      }
    } else {
      controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), 0.02);
    }
  });

  const handleSelect = (metric: MetricDef) => {
    setSelectedMetric(metric.id);
  };

  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      <pointLight position={[0, 5, 5]} intensity={0.3} color="#3B82F6" />

      <Particles radius={50} depth={50} count={2000} factor={4} saturation={0} fade speed={1} />

      {Object.entries(clusterCenters).map(([category, pos]) => (
        <Text
          key={category}
          position={pos}
          fontSize={3.5}
          color={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
          fillOpacity={0.08}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          {category.toUpperCase()}
        </Text>
      ))}

      {connections.map((conn, i) => (
        <Connection key={i} fromId={conn.from} toId={conn.to} strength={conn.strength} />
      ))}

      {metrics.map((metric) => (
        <Star key={metric.id} metric={metric} onSelect={handleSelect} />
      ))}

      <GazeRaycaster />

      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        zoomSpeed={0.8}
        rotateSpeed={0.8}
      />
    </>
  );
};
