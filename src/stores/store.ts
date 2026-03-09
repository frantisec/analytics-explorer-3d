import { create } from 'zustand';
import { metrics } from '../data/mockData';
import type { MetricDef } from '../data/mockData';

interface AppState {
  selectedMetricId: string | null;
  hoveredMetricId: string | null;
  hoveredConnectionId: { from: string; to: string } | null;
  hoveredScreenPosition: { x: number; y: number } | null;
  gazeDwellProgress: number;
  showAnomaliesOnly: boolean;
  eyeTrackingEnabled: boolean;
  gazePosition: { x: number; y: number } | null;

  setSelectedMetric: (id: string | null) => void;
  setHoveredMetric: (id: string | null) => void;
  setHoveredConnection: (conn: { from: string; to: string } | null) => void;
  setHoveredScreenPosition: (pos: { x: number; y: number } | null) => void;
  setGazeDwellProgress: (progress: number) => void;
  setShowAnomaliesOnly: (show: boolean) => void;
  setEyeTrackingEnabled: (enabled: boolean) => void;
  setGazePosition: (pos: { x: number; y: number } | null) => void;

  getSelectedMetric: () => MetricDef | null;
  getHoveredMetric: () => MetricDef | null;
  isConnectionActive: (from: string, to: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  selectedMetricId: null,
  hoveredMetricId: null,
  hoveredConnectionId: null,
  hoveredScreenPosition: null,
  gazeDwellProgress: 0,
  showAnomaliesOnly: false,
  eyeTrackingEnabled: false,
  gazePosition: null,

  setSelectedMetric: (id) => set({ selectedMetricId: id }),
  setHoveredMetric: (id) => set({ hoveredMetricId: id }),
  setHoveredConnection: (conn) => set({ hoveredConnectionId: conn }),
  setHoveredScreenPosition: (pos) => set({ hoveredScreenPosition: pos }),
  setGazeDwellProgress: (progress) => set({ gazeDwellProgress: progress }),
  setShowAnomaliesOnly: (show) => set({ showAnomaliesOnly: show }),
  setEyeTrackingEnabled: (enabled) => set({ eyeTrackingEnabled: enabled }),
  setGazePosition: (pos) => set({ gazePosition: pos }),

  getSelectedMetric: () => {
    const { selectedMetricId } = get();
    if (!selectedMetricId) return null;
    return metrics.find(m => m.id === selectedMetricId) || null;
  },

  getHoveredMetric: () => {
    const { hoveredMetricId } = get();
    if (!hoveredMetricId) return null;
    return metrics.find(m => m.id === hoveredMetricId) || null;
  },

  isConnectionActive: (from, to) => {
    const { selectedMetricId, hoveredMetricId, hoveredConnectionId } = get();
    const activeId = selectedMetricId || hoveredMetricId;

    if (hoveredConnectionId) {
      if (hoveredConnectionId.from === from && hoveredConnectionId.to === to) return true;
    }

    if (!activeId) return false;
    return from === activeId || to === activeId;
  },
}));
