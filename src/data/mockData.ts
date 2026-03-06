export interface MetricDef {
    id: string;
    name: string;
    category: 'engagement' | 'reach' | 'sentiment' | 'conversion';
    value: number;
    trend: 'up' | 'down';
    isAnomaly: boolean;
    position: [number, number, number];
    relatedMetrics: string[];
    relatedContent: string[];
    insight: string;
}

export interface ConnectionDef {
    from: string;
    to: string;
    strength: number;
}

export interface PostDef {
    id: string;
    platform: 'linkedin' | 'instagram' | 'twitter' | 'facebook';
    type: 'text' | 'video' | 'image' | 'carousel';
    text: string;
    thumbnail: string;
    metrics: {
        engagement: number;
        reach: number;
        comments: number;
    };
}

export const metrics: MetricDef[] = [
    {
        id: 'engagement-rate',
        name: 'Engagement Rate',
        category: 'engagement',
        value: 4.2,
        trend: 'down',
        isAnomaly: true,
        position: [0, 0, 0],
        relatedMetrics: ['video-views', 'posting-frequency', 'comments'],
        relatedContent: ['post-1', 'post-2'],
        insight: 'Engagement klesl o 18% tento týden. Silná korelace s poklesem video contentu – posty bez videa mají 3x nižší engagement. Doporučení: zvýšit frekvenci video postů.'
    },
    {
        id: 'video-views',
        name: 'Video Views',
        category: 'engagement',
        value: 45200,
        trend: 'down',
        isAnomaly: true,
        position: [3, 1, -2],
        relatedMetrics: ['engagement-rate', 'watch-time'],
        relatedContent: ['post-2'],
        insight: 'Video views klesly o 27%. Minulý týden pouze 2 video posty vs. obvyklých 5. Reels na Instagramu ale performují +34% nad benchmark.'
    },
    {
        id: 'comments',
        name: 'Comments',
        category: 'engagement',
        value: 342,
        trend: 'up',
        isAnomaly: false,
        position: [-2, 2, 1],
        relatedMetrics: ['engagement-rate', 'sentiment-score'],
        relatedContent: ['post-1', 'post-3'],
        insight: 'Komentáře vzrostly o 15%. Posty s otázkou mají 2.5x více komentářů. Post "What\'s your biggest challenge?" vygeneroval 89 komentářů.'
    },
    {
        id: 'reach-organic',
        name: 'Organic Reach',
        category: 'reach',
        value: 125000,
        trend: 'up',
        isAnomaly: false,
        position: [-4, 0, -3],
        relatedMetrics: ['posting-frequency', 'follower-growth'],
        relatedContent: ['post-1', 'post-3'],
        insight: 'Organic reach roste +6%. LinkedIn je hlavní driver (45% celku). Carousel posty mají 2.8x vyšší reach než single image.'
    },
    {
        id: 'follower-growth',
        name: 'Follower Growth',
        category: 'reach',
        value: 1.8,
        trend: 'up',
        isAnomaly: true,
        position: [-2, 3, -2],
        relatedMetrics: ['reach-organic'],
        relatedContent: ['post-3'],
        insight: 'Follower growth +50% vs. minulý týden. Spike koreluje s viral LinkedIn postem – 2.3k new followers za 48h.'
    },
    {
        id: 'sentiment-score',
        name: 'Sentiment Score',
        category: 'sentiment',
        value: 72,
        trend: 'up',
        isAnomaly: false,
        position: [4, 2, 2],
        relatedMetrics: ['comments', 'response-time'],
        relatedContent: ['post-1'],
        insight: 'Sentiment 72% positive (+4 body). Driver: rychlejší response time (23 min vs. 45 min minule).'
    },
    {
        id: 'response-time',
        name: 'Response Time',
        category: 'sentiment',
        value: 23,
        trend: 'up',
        isAnomaly: true,
        position: [3, -2, 4],
        relatedMetrics: ['sentiment-score', 'comments'],
        relatedContent: ['post-1'],
        insight: 'Response time zlepšen o 49%. Přímý dopad na sentiment +4 body. Bot handled 34% first responses.'
    },
    {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        category: 'conversion',
        value: 2.4,
        trend: 'up',
        isAnomaly: false,
        position: [1, -3, -4],
        relatedMetrics: ['demo-requests'],
        relatedContent: ['post-4'],
        insight: 'Conversion +14%. LinkedIn Sponsored má 3.8%. Organic posty se "soft CTA" convertují lépe než hard sell.'
    },
    {
        id: 'demo-requests',
        name: 'Demo Requests',
        category: 'conversion',
        value: 47,
        trend: 'up',
        isAnomaly: true,
        position: [-1, -4, -2],
        relatedMetrics: ['conversion-rate'],
        relatedContent: ['post-4'],
        insight: 'Demo requests +24% – best week v Q1. 62% z LinkedIn. 8 demo requests přišlo přímo z komentářů!'
    },
    {
        id: 'posting-frequency',
        name: 'Posting Frequency',
        category: 'engagement',
        value: 12,
        trend: 'down',
        isAnomaly: true,
        position: [1, 3, 2],
        relatedMetrics: ['engagement-rate', 'reach-organic'],
        relatedContent: ['post-1', 'post-2', 'post-3', 'post-4'],
        insight: 'Posting frequency -33% (z 18 na 12/týden). Přímý dopad na engagement. Quick win: repurpose best content z minulého měsíce.'
    }
];

export const connections: ConnectionDef[] = [
    { from: 'engagement-rate', to: 'video-views', strength: 0.85 },
    { from: 'engagement-rate', to: 'posting-frequency', strength: 0.72 },
    { from: 'engagement-rate', to: 'comments', strength: 0.68 },
    { from: 'video-views', to: 'engagement-rate', strength: 0.85 },
    { from: 'comments', to: 'sentiment-score', strength: 0.58 },
    { from: 'reach-organic', to: 'follower-growth', strength: 0.76 },
    { from: 'reach-organic', to: 'posting-frequency', strength: 0.69 },
    { from: 'response-time', to: 'sentiment-score', strength: 0.79 },
    { from: 'conversion-rate', to: 'demo-requests', strength: 0.89 },
    { from: 'follower-growth', to: 'engagement-rate', strength: 0.44 }
];

export const posts: PostDef[] = [
    {
        id: 'post-1',
        platform: 'linkedin',
        type: 'text',
        text: "What's your biggest customer service challenge in 2024?",
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=LinkedIn',
        metrics: { engagement: 892, reach: 34500, comments: 89 }
    },
    {
        id: 'post-2',
        platform: 'instagram',
        type: 'video',
        text: "5 AI Myths in Customer Service – DEBUNKED 🤖",
        thumbnail: 'https://placehold.co/400x400/E4405F/white?text=Reels',
        metrics: { engagement: 1247, reach: 28900, comments: 43 }
    },
    {
        id: 'post-3',
        platform: 'linkedin',
        type: 'carousel',
        text: "The anatomy of a perfect customer response",
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=Carousel',
        metrics: { engagement: 2156, reach: 52300, comments: 127 }
    },
    {
        id: 'post-4',
        platform: 'linkedin',
        type: 'video',
        text: "See our new AI Bot handle complex inquiry in real-time",
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=Demo',
        metrics: { engagement: 1823, reach: 41200, comments: 98 }
    }
];
