import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars as Particles } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../stores/store';
import { metrics, connections } from '../../data/mockData';
import type { MetricDef } from '../../data/mockData';
import { Star } from './Star';
import { Connection } from './Connection';
import { GazeRaycaster } from './GazeRaycaster';

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
