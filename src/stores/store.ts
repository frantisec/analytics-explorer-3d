import { create } from 'zustand';
import { metrics } from '../data/mockData';
import type { MetricDef } from '../data/mockData';

interface AppState {
  selectedMetricId: string | null;
  hoveredMetricId: string | null;
  showAnomaliesOnly: boolean;
  setSelectedMetric: (id: string | null) => void;
  setHoveredMetric: (id: string | null) => void;
  setShowAnomaliesOnly: (show: boolean) => void;

  // Computed values
  getSelectedMetric: () => MetricDef | null;
  isConnectionActive: (from: string, to: string) => boolean;
}

export const useStore = create<AppState>((set, get) => ({
  selectedMetricId: null,
  hoveredMetricId: null,
  showAnomaliesOnly: false,

  setSelectedMetric: (id) => set({ selectedMetricId: id }),
  setHoveredMetric: (id) => set({ hoveredMetricId: id }),
  setShowAnomaliesOnly: (show) => set({ showAnomaliesOnly: show }),

  getSelectedMetric: () => {
    const { selectedMetricId } = get();
    if (!selectedMetricId) return null;
    return metrics.find(m => m.id === selectedMetricId) || null;
  },

  isConnectionActive: (from, to) => {
    const { selectedMetricId, hoveredMetricId } = get();
    const activeId = selectedMetricId || hoveredMetricId;
    if (!activeId) return false;

    // Direct connection logic
    return from === activeId || to === activeId;
  }
}));
