import { useState } from 'react';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Universe } from './components/3d/Universe';
import { DetailPanel } from './components/DetailPanel';
import { HoverCard } from './components/HoverCard';
import { GazeCursor } from './components/GazeCursor';
import { EyeTrackingCalibration } from './components/EyeTrackingCalibration';
import { useStore } from './stores/store';
import { useEyeTracking } from './hooks/useEyeTracking';
import { metrics } from './data/mockData';

export default function App() {
  const [showCalibration, setShowCalibration] = useState(false);
  const setSelectedMetric = useStore(state => state.setSelectedMetric);
  const showAnomaliesOnly = useStore(state => state.showAnomaliesOnly);
  const setShowAnomaliesOnly = useStore(state => state.setShowAnomaliesOnly);
  const eyeTrackingEnabled = useStore(state => state.eyeTrackingEnabled);
  const setEyeTrackingEnabled = useStore(state => state.setEyeTrackingEnabled);

  const { start, stop, isError, errorMessage } = useEyeTracking();

  const handleEnableEyeTracking = async () => {
    const success = await start();
    if (success) {
      setShowCalibration(true);
    }
  };

  const handleCalibrationComplete = () => {
    setShowCalibration(false);
    setEyeTrackingEnabled(true);
  };

  const handleCalibrationCancel = () => {
    setShowCalibration(false);
    stop();
  };

  const handleDisableEyeTracking = () => {
    stop();
    setEyeTrackingEnabled(false);
  };

  const totalMetrics = metrics.length;
  const anomaliesCount = metrics.filter(m => m.isAnomaly).length;
  const downTrendsCount = metrics.filter(m => m.trend === 'down').length;

  return (
    <div className="w-full h-screen bg-[#0a0a0f] relative overflow-hidden text-white font-sans">

      <div className="absolute inset-0 z-0 cursor-crosshair">
        <Canvas
          camera={{ position: [0, 0, 15], fov: 60 }}
          onPointerMissed={() => setSelectedMetric(null)}
        >
          <Suspense fallback={null}>
            <Universe />
          </Suspense>
        </Canvas>
      </div>

      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h1
          className="text-3xl font-bold tracking-tight mb-1 drop-shadow-lg flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 50%, #818cf8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Analytics Explorer
        </h1>

        <div className="pointer-events-auto mt-2 flex flex-col sm:flex-row items-start sm:items-center gap-3 px-3 py-2 rounded-lg backdrop-blur-md shadow-xl text-sm transition-all hover:bg-white/10 border border-white/10 bg-white/5 hover:border-white/20" style={{ boxShadow: '0 0 0 1px rgba(255,255,255,0.05) inset' }}>
          <div className="flex gap-4 items-center">
            <span className="text-white/70">
              <strong className="text-white">{totalMetrics}</strong> metrik
            </span>
            <span className="text-white/30">•</span>
            <span className="text-rose-400">
              <strong>{anomaliesCount}</strong> anomálie
            </span>
            <span className="text-white/30">•</span>
            <span className="text-amber-400">
              <strong>{downTrendsCount}</strong> klesající trendy
            </span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/20 mx-2"></div>
          <button
            onClick={() => setShowAnomaliesOnly(!showAnomaliesOnly)}
            className={`px-3 py-1 rounded-md transition-colors text-xs font-semibold cursor-pointer ${showAnomaliesOnly ? 'bg-rose-500 text-white shadow-[0_0_15px_rgba(244,63,94,0.5)]' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {showAnomaliesOnly ? 'Zobrazit všechny' : 'Zobrazit anomálie'}
          </button>
          <button
            onClick={eyeTrackingEnabled ? handleDisableEyeTracking : handleEnableEyeTracking}
            disabled={showCalibration}
            className={`px-3 py-1 rounded-md transition-colors text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${eyeTrackingEnabled ? 'bg-emerald-500/30 text-emerald-400 ring-1 ring-emerald-500/50' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
          >
            {eyeTrackingEnabled ? 'Vypnout oči' : 'Ovládání očima'}
          </button>
        </div>
        {isError && errorMessage && (
          <div className="mt-2 rounded-lg bg-rose-500/20 px-3 py-2 text-xs text-rose-300">
            {errorMessage}
          </div>
        )}
      </div>

      {showCalibration && (
        <EyeTrackingCalibration
          onComplete={handleCalibrationComplete}
          onCancel={handleCalibrationCancel}
        />
      )}

      <div className="absolute bottom-6 left-6 z-10 pointer-events-auto">
        <div className="bg-[#0a0a0f]/60 border border-white/10 p-4 rounded-xl backdrop-blur-xl shadow-2xl flex flex-col gap-3">
          <div className="text-xs font-semibold tracking-wider text-white/50 uppercase mb-1">
            Kategorie Metrik
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 max-w-[280px] text-sm text-white/80">
            <div className="flex items-center gap-2 transition-opacity hover:opacity-100 opacity-90 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></span> Engagement
            </div>
            <div className="flex items-center gap-2 transition-opacity hover:opacity-100 opacity-90 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span> Reach
            </div>
            <div className="flex items-center gap-2 transition-opacity hover:opacity-100 opacity-90 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"></span> Sentiment
            </div>
            <div className="flex items-center gap-2 transition-opacity hover:opacity-100 opacity-90 cursor-default">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(139,92,246,0.6)]"></span> Conversion
            </div>
          </div>
          <div className="mt-2 pt-3 border-t border-white/10 text-sm text-rose-300/90 flex items-center gap-2 bg-rose-500/10 -mx-4 px-4 pb-1 rounded-b-xl">
            <span className="animate-pulse">⚠️</span> Pulzující hvězdy vyžadují pozornost
          </div>
          {eyeTrackingEnabled && (
            <div className="mt-2 pt-3 border-t border-white/10 text-sm text-emerald-400/90 flex items-center gap-2">
              Pohled na hvězdu 1200 ms = výběr
            </div>
          )}
        </div>
      </div>

      <HoverCard />
      <DetailPanel />
      <GazeCursor />

    </div>
  );
}
