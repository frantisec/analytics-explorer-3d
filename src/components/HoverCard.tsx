import { useEffect, useState, useRef, useMemo } from 'react';
import { useStore } from '../stores/store';
import { metrics, connections } from '../data/mockData';

const CATEGORY_COLORS: Record<string, string> = {
  engagement: '#3B82F6',
  reach: '#10B981',
  sentiment: '#F59E0B',
  conversion: '#8B5CF6',
};

const CARD_WIDTH = 320;
const CARD_HEIGHT_EST = 280;
const OFFSET_X = 24;
const OFFSET_Y = -20;

function formatValue(val: number, unit: string): string {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString() + (unit ? unit : '');
}

function formatDelta(current: number, previous: number, unit: string): string {
  const diff = current - previous;
  const sign = diff >= 0 ? '+' : '';
  if (Math.abs(diff) < 0.01) return 'beze změny';
  if (unit === '%' || unit === 'min') return `${sign}${diff.toFixed(1)}${unit}`;
  if (Math.abs(diff) >= 1000) return `${sign}${(diff / 1000).toFixed(1)}k`;
  return `${sign}${diff.toFixed(0)}`;
}

function DwellRing({ progress }: { progress: number }) {
  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="shrink-0">
      <circle cx="12" cy="12" r={radius} fill="none" stroke="white" strokeOpacity={0.15} strokeWidth="2.5" />
      <circle
        cx="12"
        cy="12"
        r={radius}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        transform="rotate(-90 12 12)"
        style={{ transition: 'stroke-dashoffset 80ms linear' }}
      />
    </svg>
  );
}

export function HoverCard() {
  const hoveredMetricId = useStore((s) => s.hoveredMetricId);
  const selectedMetricId = useStore((s) => s.selectedMetricId);
  const screenPos = useStore((s) => s.hoveredScreenPosition);
  const eyeTrackingEnabled = useStore((s) => s.eyeTrackingEnabled);
  const gazeDwellProgress = useStore((s) => s.gazeDwellProgress);

  const [visible, setVisible] = useState(false);
  const [displayedMetricId, setDisplayedMetricId] = useState<string | null>(null);
  const showTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (!hoveredMetricId || selectedMetricId) {
      setVisible(false);
      setDisplayedMetricId(null);
      return;
    }

    if (eyeTrackingEnabled) {
      setDisplayedMetricId(hoveredMetricId);
      setVisible(true);
    } else {
      showTimerRef.current = setTimeout(() => {
        setDisplayedMetricId(hoveredMetricId);
        setVisible(true);
      }, 150);
    }

    return () => {
      if (showTimerRef.current) clearTimeout(showTimerRef.current);
    };
  }, [hoveredMetricId, selectedMetricId, eyeTrackingEnabled]);

  const metric = useMemo(
    () => (displayedMetricId ? metrics.find((m) => m.id === displayedMetricId) : null),
    [displayedMetricId],
  );

  const topConnections = useMemo(() => {
    if (!metric) return [];
    const map = new Map<string, number>();
    connections.forEach((c) => {
      if (c.from === metric.id) {
        const existing = map.get(c.to);
        if (existing === undefined || c.strength > existing) map.set(c.to, c.strength);
      } else if (c.to === metric.id) {
        const existing = map.get(c.from);
        if (existing === undefined || c.strength > existing) map.set(c.from, c.strength);
      }
    });
    return Array.from(map.entries())
      .map(([otherId, strength]) => ({
        metric: metrics.find((m) => m.id === otherId),
        strength,
      }))
      .filter((c) => c.metric)
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 3);
  }, [metric]);

  if (!metric || !screenPos || !visible) return null;

  const categoryColor = CATEGORY_COLORS[metric.category] ?? '#6366f1';
  const delta = formatDelta(metric.value, metric.previousValue, metric.unit);
  const isDown = metric.value < metric.previousValue;

  let left = screenPos.x + OFFSET_X;
  let top = screenPos.y + OFFSET_Y;
  if (left + CARD_WIDTH > window.innerWidth - 16) left = screenPos.x - CARD_WIDTH - OFFSET_X;
  if (top + CARD_HEIGHT_EST > window.innerHeight - 16) top = window.innerHeight - CARD_HEIGHT_EST - 16;
  if (top < 16) top = 16;
  if (left < 16) left = 16;

  const insightSnippet = metric.insight.split('.')[0] + '.';

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left,
        top,
        width: CARD_WIDTH,
        opacity: visible ? 1 : 0,
        transition: 'opacity 200ms ease-out',
      }}
    >
      <div
        className="rounded-xl border backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 15, 0.88)',
          borderColor: `${categoryColor}40`,
          boxShadow: `0 0 40px ${categoryColor}15, 0 8px 32px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Header */}
        <div className="px-4 pt-3.5 pb-2 flex items-center justify-between gap-2" style={{ borderBottom: `1px solid ${categoryColor}20` }}>
          <span className="text-sm font-bold text-white tracking-wide">{metric.name.toUpperCase()}</span>
          {metric.isAnomaly && (
            <span className="text-xs bg-rose-500/20 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/30">
              ⚠️
            </span>
          )}
        </div>

        {/* Value + Delta */}
        <div className="px-4 pt-2.5 pb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-light text-white">{formatValue(metric.value, metric.unit)}</span>
            <span className={`text-xs font-medium ${isDown ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isDown ? '▼' : '▲'} {delta} vs minulý týden
            </span>
          </div>
        </div>

        {/* Correlations */}
        {topConnections.length > 0 && (
          <div className="px-4 py-2" style={{ borderTop: `1px solid rgba(255,255,255,0.06)` }}>
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">Souvislosti</div>
            {topConnections.map(({ metric: connMetric, strength }) => {
              if (!connMetric) return null;
              const pct = Math.round(strength * 100);
              return (
                <div key={connMetric.id} className="flex items-center gap-2 mb-1.5 last:mb-0">
                  <span className="text-white/50 text-xs">→</span>
                  <span className="text-xs text-white/80 flex-1 truncate">{connMetric.name}</span>
                  <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background: CATEGORY_COLORS[connMetric.category] ?? '#888',
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white/50 w-7 text-right">{pct}%</span>
                </div>
              );
            })}
          </div>
        )}

        {/* AI Snippet */}
        <div className="px-4 py-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-xs text-white/60 leading-relaxed">
            <span className="text-white/80 mr-1">💡</span>
            {insightSnippet}
          </p>
        </div>

        {/* CTA */}
        <div className="px-4 pb-3 pt-1">
          {eyeTrackingEnabled ? (
            <div className="flex items-center gap-2 text-[10px] text-white/40">
              <DwellRing progress={gazeDwellProgress} />
              <span>Podívej se déle pro detaily</span>
            </div>
          ) : (
            <div className="text-[10px] text-white/30 text-center">
              Klikni pro detaily
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
