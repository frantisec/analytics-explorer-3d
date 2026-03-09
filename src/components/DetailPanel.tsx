import { useMemo, useEffect, useRef } from 'react';
import { useStore } from '../stores/store';
import { posts, connections, metrics } from '../data/mockData';
import type { MetricDef } from '../data/mockData';
import {
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  MessageCircle,
  Eye,
  Share2,
  Link2,
  BarChart3,
  Sparkles,
} from 'lucide-react';

const CATEGORY_HEX: Record<string, string> = {
  engagement: '#3B82F6',
  reach: '#10B981',
  sentiment: '#F59E0B',
  conversion: '#8B5CF6',
};

const CATEGORY_LABELS: Record<string, string> = {
  engagement: 'Engagement',
  reach: 'Reach',
  sentiment: 'Sentiment',
  conversion: 'Conversion',
};

function formatValue(val: number, unit?: string): string {
  if (val >= 1000) return (val / 1000).toFixed(1) + 'k';
  return val.toString() + (unit || '');
}

function formatDelta(current: number, previous: number): { text: string; pct: string } {
  const diff = current - previous;
  const pctChange = previous !== 0 ? ((diff / previous) * 100) : 0;
  const sign = diff >= 0 ? '+' : '';
  const absDiff = Math.abs(diff);
  const diffStr = absDiff >= 1000 ? `${sign}${(diff / 1000).toFixed(1)}k` : `${sign}${diff.toFixed(diff % 1 === 0 ? 0 : 1)}`;
  return {
    text: diffStr,
    pct: `${sign}${pctChange.toFixed(1)}%`,
  };
}

function Sparkline({ data, color, anomalyIndices }: { data: number[]; color: string; anomalyIndices?: number[] }) {
  const width = 360;
  const height = 60;
  const padding = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const avg = data.reduce((a, b) => a + b, 0) / data.length;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((v - min) / range) * (height - padding * 2);
    return { x, y, value: v };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const avgY = height - padding - ((avg - min) / range) * (height - padding * 2);

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sparkGrad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0.02} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkGrad-${color.replace('#', '')})`} />
      <line x1={padding} y1={avgY} x2={width - padding} y2={avgY} stroke="white" strokeOpacity={0.15} strokeDasharray="4 3" strokeWidth={1} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {anomalyIndices?.map((idx) => {
        const p = points[idx];
        if (!p) return null;
        return <circle key={idx} cx={p.x} cy={p.y} r={3} fill="#EF4444" stroke="#0a0a0f" strokeWidth={1.5} />;
      })}
    </svg>
  );
}

function BreakdownBar({ label, value, maxValue, unit, color }: { label: string; value: number; maxValue: number; unit: string; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="flex items-center gap-2 mb-1.5">
      <span className="text-xs text-white/70 w-20 truncate">{label}</span>
      <span className="text-xs font-mono text-white/90 w-12 text-right">{formatValue(value, unit)}</span>
      <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

function ConnectionRow({ connectedMetric, strength, onSelect }: { connectedMetric: MetricDef; strength: number; onSelect: () => void }) {
  const hex = CATEGORY_HEX[connectedMetric.category] ?? '#888';
  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-left mb-2"
      style={{ borderLeftWidth: 3, borderLeftColor: hex }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: hex }} />
        <span className="text-sm font-medium text-white/90 truncate">{connectedMetric.name}</span>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={connectedMetric.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}>
          {connectedMetric.trend === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        </span>
        <span className="text-xs font-mono text-emerald-400 font-semibold">{Math.round(strength * 100)}%</span>
      </div>
    </button>
  );
}

function ContentCard({ postId }: { postId: string }) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-2 transition-all duration-200 hover:bg-white/10 hover:border-white/20">
      <div className="flex items-start gap-3">
        <img src={post.thumbnail} alt="" className="w-12 h-12 object-cover rounded shadow-sm" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider">{post.platform}</span>
            <span className="text-[10px] text-white/40">{post.type}</span>
          </div>
          <p className="text-xs text-white/90 line-clamp-2 leading-tight mb-1.5">{post.text}</p>
          <div className="flex items-center gap-3 text-[10px] text-white/50">
            <div className="flex items-center gap-1"><Eye size={10} /> {post.metrics.reach.toLocaleString()}</div>
            <div className="flex items-center gap-1"><Share2 size={10} /> {post.metrics.engagement.toLocaleString()}</div>
            <div className="flex items-center gap-1"><MessageCircle size={10} /> {post.metrics.comments}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DetailPanel() {
  const metric = useStore((s) => s.getSelectedMetric());
  const setSelectedMetric = useStore((s) => s.setSelectedMetric);
  const eyeTrackingEnabled = useStore((s) => s.eyeTrackingEnabled);
  const hoveredMetricId = useStore((s) => s.hoveredMetricId);
  const panelRef = useRef<HTMLDivElement>(null);
  const gazeAwayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMetric(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setSelectedMetric]);

  useEffect(() => {
    if (!eyeTrackingEnabled || !metric) {
      if (gazeAwayTimerRef.current) clearTimeout(gazeAwayTimerRef.current);
      return;
    }

    if (hoveredMetricId === metric.id) {
      if (gazeAwayTimerRef.current) {
        clearTimeout(gazeAwayTimerRef.current);
        gazeAwayTimerRef.current = null;
      }
    } else {
      if (!gazeAwayTimerRef.current) {
        gazeAwayTimerRef.current = setTimeout(() => {
          setSelectedMetric(null);
          gazeAwayTimerRef.current = null;
        }, 2000);
      }
    }

    return () => {
      if (gazeAwayTimerRef.current) clearTimeout(gazeAwayTimerRef.current);
    };
  }, [eyeTrackingEnabled, metric, hoveredMetricId, setSelectedMetric]);

  const metricConnections = useMemo(() => {
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
      .map(([otherId, strength]) => ({ otherId, strength }))
      .sort((a, b) => b.strength - a.strength);
  }, [metric?.id]);

  const categoryHex = metric ? CATEGORY_HEX[metric.category] ?? '#6366f1' : '#6366f1';

  const platformMax = metric ? Math.max(...metric.breakdownByPlatform.map((b) => b.value)) : 0;
  const contentTypeMax = metric ? Math.max(...metric.breakdownByContentType.map((b) => b.value)) : 0;

  const delta = metric ? formatDelta(metric.value, metric.previousValue) : { text: '', pct: '' };
  const isDown = metric ? metric.value < metric.previousValue : false;

  return (
    <div
      ref={panelRef}
      className="absolute top-0 right-0 w-[420px] h-full z-10 transition-transform duration-300 ease-out"
      style={{ transform: metric ? 'translateX(0)' : 'translateX(100%)' }}
    >
      {!metric ? null : (
        <div
          className="h-full bg-black/50 backdrop-blur-xl border-l overflow-y-auto"
          style={{ borderLeftColor: `${categoryHex}40` }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 backdrop-blur-xl border-b border-white/10" style={{ background: 'rgba(10,10,15,0.92)' }}>
            <div className="px-5 pt-4 pb-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
                    style={{ background: `${categoryHex}20`, color: categoryHex }}
                  >
                    {CATEGORY_LABELS[metric.category]}
                  </span>
                  {metric.isAnomaly && (
                    <span className="flex items-center gap-1 text-[10px] text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                      <AlertTriangle size={10} /> Anomálie
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedMetric(null)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">{metric.name}</h1>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-light text-white">{formatValue(metric.value, metric.unit)}</span>
                <span className={`text-sm font-medium ${isDown ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {isDown ? '▼' : '▲'} {delta.text} ({delta.pct})
                </span>
              </div>
              <span className="text-xs text-white/40">vs minulý týden</span>
            </div>
          </div>

          <div className="px-5 py-4 space-y-5">
            {/* Trend Sparkline */}
            <section>
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <TrendingUp size={12} /> Evoluce (30 dní)
              </h3>
              <div className="bg-white/5 rounded-lg p-2 border border-white/8">
                <Sparkline data={metric.trendHistory} color={categoryHex} />
              </div>
            </section>

            {/* Breakdown by Platform */}
            <section>
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart3 size={12} /> Breakdown podle platformy
              </h3>
              <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                {metric.breakdownByPlatform.map((b) => (
                  <BreakdownBar key={b.platform} label={b.platform} value={b.value} maxValue={platformMax} unit={metric.unit} color={categoryHex} />
                ))}
              </div>
            </section>

            {/* Breakdown by Content Type */}
            <section>
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BarChart3 size={12} /> Breakdown podle typu obsahu
              </h3>
              <div className="bg-white/5 rounded-lg p-3 border border-white/8">
                {metric.breakdownByContentType.map((b) => (
                  <BreakdownBar key={b.type} label={b.type} value={b.value} maxValue={contentTypeMax} unit={metric.unit} color={categoryHex} />
                ))}
              </div>
            </section>

            {/* Related Metrics */}
            {metricConnections.length > 0 && (
              <section>
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Link2 size={12} /> Související metriky
                </h3>
                <div>
                  {metricConnections.map(({ otherId, strength }) => {
                    const connectedMetric = metrics.find((m) => m.id === otherId);
                    if (!connectedMetric) return null;
                    return (
                      <ConnectionRow
                        key={otherId}
                        connectedMetric={connectedMetric}
                        strength={strength}
                        onSelect={() => setSelectedMetric(otherId)}
                      />
                    );
                  })}
                </div>
              </section>
            )}

            {/* AI Analysis */}
            <section>
              <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={12} /> AI Analýza
              </h3>
              <div
                className="rounded-lg p-3 relative overflow-hidden border border-white/10"
                style={{
                  background: `linear-gradient(135deg, ${categoryHex}10 0%, transparent 100%)`,
                }}
              >
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: `linear-gradient(to bottom, ${categoryHex}, ${categoryHex}60)` }} />
                <p className="text-sm text-white/85 leading-relaxed pl-2">{metric.insight}</p>
              </div>
            </section>

            {/* Related Content */}
            {metric.relatedContent.length > 0 && (
              <section>
                <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Top obsah</h3>
                <div>
                  {metric.relatedContent.map((postId) => (
                    <ContentCard key={postId} postId={postId} />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
