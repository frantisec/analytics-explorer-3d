import { useStore } from '../stores/store';
import { posts } from '../data/mockData';
import { X, TrendingUp, TrendingDown, AlertTriangle, MessageCircle, Eye, Share2 } from 'lucide-react';

const ContentCard = ({ postId }: { postId: string }) => {
  const post = posts.find((p: any) => p.id === postId);
  if (!post) return null;

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-3 mb-3 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <img 
          src={post.thumbnail} 
          alt="Thumbnail" 
          className="w-16 h-16 object-cover rounded shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{post.platform}</span>
            <span className="text-xs text-white/40">{post.type}</span>
          </div>
          <p className="text-sm text-white/90 line-clamp-2 mb-2 leading-tight">{post.text}</p>
          <div className="flex items-center gap-3 text-xs text-white/60">
            <div className="flex items-center gap-1"><Eye size={12} /> {post.metrics.reach.toLocaleString()}</div>
            <div className="flex items-center gap-1"><Share2 size={12} /> {post.metrics.engagement.toLocaleString()}</div>
            <div className="flex items-center gap-1"><MessageCircle size={12} /> {post.metrics.comments.toLocaleString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const InsightPanel = () => {
  const metric = useStore((state) => state.getSelectedMetric());
  const setSelectedMetric = useStore((state) => state.setSelectedMetric);

  if (!metric) return null;

  const categoryColors = {
    engagement: 'text-blue-400',
    reach: 'text-emerald-400',
    sentiment: 'text-amber-400',
    conversion: 'text-violet-400',
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-black/40 backdrop-blur-md border-l border-white/10 p-6 shadow-2xl overflow-y-auto z-10 transition-transform duration-300 transform translate-x-0">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white/90">Metric Detail</h2>
        <button 
          onClick={() => setSelectedMetric(null)}
          className="p-1 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-sm font-medium uppercase tracking-wider ${categoryColors[metric.category]}`}>
            {metric.category}
          </span>
          {metric.isAnomaly && (
            <span className="flex items-center gap-1 text-xs text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
              <AlertTriangle size={12} /> Anomaly
            </span>
          )}
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-2">{metric.name}</h1>
        
        <div className="flex items-baseline gap-3 mb-6">
          <span className="text-4xl font-light text-white">{metric.value.toLocaleString()}</span>
          <div className={`flex items-center gap-1 text-sm ${metric.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {metric.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
            {metric.trend === 'up' ? 'Up' : 'Down'}
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-500" />
          <h3 className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            AI Insight
          </h3>
          <p className="text-sm text-white/90 leading-relaxed">
            {metric.insight}
          </p>
        </div>
      </div>

      {metric.relatedContent.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-white/70 mb-3 border-b border-white/10 pb-2">Related Content</h3>
          <div>
            {metric.relatedContent.map(postId => (
              <ContentCard key={postId} postId={postId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
