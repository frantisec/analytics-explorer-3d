export interface MetricDef {
    id: string;
    name: string;
    category: 'engagement' | 'reach' | 'sentiment' | 'conversion';
    value: number;
    previousValue: number;
    unit: string;
    trend: 'up' | 'down';
    isAnomaly: boolean;
    position: [number, number, number];
    relatedMetrics: string[];
    relatedContent: string[];
    insight: string;
    breakdownByPlatform: { platform: string; value: number }[];
    breakdownByContentType: { type: string; value: number }[];
    trendHistory: number[];
}

export interface ConnectionDef {
    from: string;
    to: string;
    strength: number;
    description: string;
    recommendation?: string;
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
        previousValue: 4.5,
        unit: '%',
        trend: 'down',
        isAnomaly: true,
        position: [0, 0, 0],
        relatedMetrics: ['video-views', 'posting-frequency', 'comments'],
        relatedContent: ['post-1', 'post-2'],
        insight: 'Engagement klesl o 18% tento týden. Silná korelace s poklesem video contentu – posty bez videa mají 3x nižší engagement. Doporučení: zvýšit frekvenci video postů.',
        breakdownByPlatform: [
            { platform: 'Instagram', value: 5.1 },
            { platform: 'Facebook', value: 3.8 },
            { platform: 'LinkedIn', value: 2.9 },
            { platform: 'Twitter', value: 1.2 },
        ],
        breakdownByContentType: [
            { type: 'Video', value: 6.2 },
            { type: 'Carousel', value: 4.5 },
            { type: 'Image', value: 3.1 },
            { type: 'Text', value: 1.8 },
        ],
        trendHistory: [5.1, 5.3, 5.0, 4.9, 5.2, 5.4, 5.1, 4.8, 4.7, 4.9, 5.0, 4.8, 4.6, 4.5, 4.7, 4.6, 4.4, 4.5, 4.3, 4.2, 4.5, 4.6, 4.3, 4.1, 4.0, 4.3, 4.2, 4.1, 4.3, 4.2],
    },
    {
        id: 'video-views',
        name: 'Video Views',
        category: 'engagement',
        value: 45200,
        previousValue: 62000,
        unit: '',
        trend: 'down',
        isAnomaly: true,
        position: [6, 2, -4],
        relatedMetrics: ['engagement-rate', 'posting-frequency'],
        relatedContent: ['post-2'],
        insight: 'Video views klesly o 27%. Minulý týden pouze 2 video posty vs. obvyklých 5. Reels na Instagramu ale performují +34% nad benchmark.',
        breakdownByPlatform: [
            { platform: 'Instagram', value: 28400 },
            { platform: 'Facebook', value: 9800 },
            { platform: 'LinkedIn', value: 5200 },
            { platform: 'Twitter', value: 1800 },
        ],
        breakdownByContentType: [
            { type: 'Reels', value: 24600 },
            { type: 'Stories', value: 12100 },
            { type: 'Long-form', value: 5800 },
            { type: 'Live', value: 2700 },
        ],
        trendHistory: [61000, 63000, 58000, 62000, 65000, 60000, 59000, 57000, 55000, 58000, 56000, 54000, 52000, 55000, 53000, 50000, 52000, 49000, 48000, 51000, 49000, 47000, 48000, 46000, 47000, 45000, 46000, 44000, 45000, 45200],
    },
    {
        id: 'comments',
        name: 'Comments',
        category: 'engagement',
        value: 342,
        previousValue: 297,
        unit: '',
        trend: 'up',
        isAnomaly: false,
        position: [-4, 4, 2],
        relatedMetrics: ['engagement-rate', 'sentiment-score'],
        relatedContent: ['post-1', 'post-3'],
        insight: 'Komentáře vzrostly o 15%. Posty s otázkou mají 2.5x více komentářů. Post "What\'s your biggest challenge?" vygeneroval 89 komentářů.',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 156 },
            { platform: 'Instagram', value: 98 },
            { platform: 'Facebook', value: 62 },
            { platform: 'Twitter', value: 26 },
        ],
        breakdownByContentType: [
            { type: 'Text', value: 145 },
            { type: 'Carousel', value: 98 },
            { type: 'Video', value: 67 },
            { type: 'Image', value: 32 },
        ],
        trendHistory: [210, 225, 230, 245, 240, 255, 260, 248, 265, 270, 258, 275, 280, 268, 285, 290, 278, 295, 300, 288, 305, 310, 298, 315, 320, 308, 325, 330, 338, 342],
    },
    {
        id: 'reach-organic',
        name: 'Organic Reach',
        category: 'reach',
        value: 125000,
        previousValue: 118000,
        unit: '',
        trend: 'up',
        isAnomaly: false,
        position: [-8, 0, -6],
        relatedMetrics: ['posting-frequency', 'follower-growth'],
        relatedContent: ['post-1', 'post-3'],
        insight: 'Organic reach roste +6%. LinkedIn je hlavní driver (45% celku). Carousel posty mají 2.8x vyšší reach než single image.',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 56200 },
            { platform: 'Instagram', value: 38800 },
            { platform: 'Facebook', value: 21000 },
            { platform: 'Twitter', value: 9000 },
        ],
        breakdownByContentType: [
            { type: 'Carousel', value: 48500 },
            { type: 'Video', value: 38200 },
            { type: 'Text', value: 24800 },
            { type: 'Image', value: 13500 },
        ],
        trendHistory: [98000, 100000, 102000, 99000, 103000, 105000, 101000, 106000, 108000, 104000, 109000, 111000, 107000, 112000, 114000, 110000, 115000, 117000, 113000, 118000, 120000, 116000, 121000, 123000, 119000, 122000, 124000, 120000, 123000, 125000],
    },
    {
        id: 'follower-growth',
        name: 'Follower Growth',
        category: 'reach',
        value: 1.8,
        previousValue: 1.2,
        unit: '%',
        trend: 'up',
        isAnomaly: true,
        position: [-4, 6, -4],
        relatedMetrics: ['reach-organic'],
        relatedContent: ['post-3'],
        insight: 'Follower growth +50% vs. minulý týden. Spike koreluje s viral LinkedIn postem – 2.3k new followers za 48h.',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 2.8 },
            { platform: 'Instagram', value: 1.4 },
            { platform: 'Facebook', value: 0.9 },
            { platform: 'Twitter', value: 0.6 },
        ],
        breakdownByContentType: [
            { type: 'Carousel', value: 2.3 },
            { type: 'Video', value: 1.9 },
            { type: 'Text', value: 1.2 },
            { type: 'Image', value: 0.8 },
        ],
        trendHistory: [0.8, 0.9, 0.7, 0.8, 0.9, 1.0, 0.8, 0.9, 1.0, 1.1, 0.9, 1.0, 1.1, 1.0, 1.1, 1.2, 1.0, 1.1, 1.2, 1.1, 1.2, 1.3, 1.1, 1.2, 1.3, 1.4, 1.2, 1.4, 1.6, 1.8],
    },
    {
        id: 'sentiment-score',
        name: 'Sentiment Score',
        category: 'sentiment',
        value: 72,
        previousValue: 68,
        unit: '%',
        trend: 'up',
        isAnomaly: false,
        position: [8, 4, 4],
        relatedMetrics: ['comments', 'response-time'],
        relatedContent: ['post-1'],
        insight: 'Sentiment 72% positive (+4 body). Driver: rychlejší response time (23 min vs. 45 min minule).',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 81 },
            { platform: 'Instagram', value: 74 },
            { platform: 'Facebook', value: 65 },
            { platform: 'Twitter', value: 58 },
        ],
        breakdownByContentType: [
            { type: 'Video', value: 78 },
            { type: 'Carousel', value: 74 },
            { type: 'Text', value: 70 },
            { type: 'Image', value: 62 },
        ],
        trendHistory: [62, 63, 61, 64, 63, 65, 64, 66, 65, 67, 66, 68, 67, 66, 68, 67, 69, 68, 70, 69, 68, 70, 69, 71, 70, 69, 71, 70, 71, 72],
    },
    {
        id: 'response-time',
        name: 'Response Time',
        category: 'sentiment',
        value: 23,
        previousValue: 45,
        unit: 'min',
        trend: 'up',
        isAnomaly: true,
        position: [6, -4, 8],
        relatedMetrics: ['sentiment-score', 'comments'],
        relatedContent: ['post-1'],
        insight: 'Response time zlepšen o 49%. Přímý dopad na sentiment +4 body. Bot handled 34% first responses.',
        breakdownByPlatform: [
            { platform: 'Twitter', value: 12 },
            { platform: 'Instagram', value: 18 },
            { platform: 'Facebook', value: 28 },
            { platform: 'LinkedIn', value: 34 },
        ],
        breakdownByContentType: [
            { type: 'Bot-handled', value: 8 },
            { type: 'Quick reply', value: 15 },
            { type: 'Standard', value: 28 },
            { type: 'Complex', value: 45 },
        ],
        trendHistory: [52, 50, 48, 51, 47, 45, 48, 44, 42, 46, 43, 41, 44, 40, 38, 42, 39, 37, 40, 36, 34, 38, 35, 33, 30, 28, 32, 27, 25, 23],
    },
    {
        id: 'conversion-rate',
        name: 'Conversion Rate',
        category: 'conversion',
        value: 2.4,
        previousValue: 2.1,
        unit: '%',
        trend: 'up',
        isAnomaly: false,
        position: [2, -6, -8],
        relatedMetrics: ['demo-requests'],
        relatedContent: ['post-4'],
        insight: 'Conversion +14%. LinkedIn Sponsored má 3.8%. Organic posty se "soft CTA" convertují lépe než hard sell.',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 3.8 },
            { platform: 'Facebook', value: 2.1 },
            { platform: 'Instagram', value: 1.6 },
            { platform: 'Twitter', value: 0.9 },
        ],
        breakdownByContentType: [
            { type: 'Video', value: 3.2 },
            { type: 'Carousel', value: 2.6 },
            { type: 'Text', value: 1.9 },
            { type: 'Image', value: 1.4 },
        ],
        trendHistory: [1.6, 1.7, 1.5, 1.8, 1.7, 1.9, 1.8, 2.0, 1.9, 1.8, 2.0, 1.9, 2.1, 2.0, 1.9, 2.1, 2.0, 2.2, 2.1, 2.0, 2.2, 2.1, 2.3, 2.2, 2.1, 2.3, 2.2, 2.3, 2.4, 2.4],
    },
    {
        id: 'demo-requests',
        name: 'Demo Requests',
        category: 'conversion',
        value: 47,
        previousValue: 38,
        unit: '/week',
        trend: 'up',
        isAnomaly: true,
        position: [-2, -8, -4],
        relatedMetrics: ['conversion-rate'],
        relatedContent: ['post-4'],
        insight: 'Demo requests +24% – best week v Q1. 62% z LinkedIn. 8 demo requests přišlo přímo z komentářů!',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 29 },
            { platform: 'Facebook', value: 9 },
            { platform: 'Instagram', value: 6 },
            { platform: 'Twitter', value: 3 },
        ],
        breakdownByContentType: [
            { type: 'Video', value: 18 },
            { type: 'Carousel', value: 14 },
            { type: 'Text', value: 10 },
            { type: 'Image', value: 5 },
        ],
        trendHistory: [22, 24, 21, 25, 23, 26, 28, 25, 27, 29, 26, 30, 28, 31, 33, 30, 32, 34, 31, 35, 33, 36, 38, 35, 37, 39, 41, 43, 45, 47],
    },
    {
        id: 'posting-frequency',
        name: 'Posting Frequency',
        category: 'engagement',
        value: 12,
        previousValue: 18,
        unit: '/week',
        trend: 'down',
        isAnomaly: true,
        position: [2, 6, 4],
        relatedMetrics: ['engagement-rate', 'reach-organic'],
        relatedContent: ['post-1', 'post-2', 'post-3', 'post-4'],
        insight: 'Posting frequency -33% (z 18 na 12/týden). Přímý dopad na engagement. Quick win: repurpose best content z minulého měsíce.',
        breakdownByPlatform: [
            { platform: 'LinkedIn', value: 4 },
            { platform: 'Instagram', value: 4 },
            { platform: 'Facebook', value: 2 },
            { platform: 'Twitter', value: 2 },
        ],
        breakdownByContentType: [
            { type: 'Text', value: 4 },
            { type: 'Image', value: 3 },
            { type: 'Carousel', value: 3 },
            { type: 'Video', value: 2 },
        ],
        trendHistory: [20, 19, 21, 18, 20, 19, 18, 17, 19, 18, 17, 16, 18, 17, 16, 15, 17, 16, 15, 14, 16, 15, 14, 13, 15, 14, 13, 12, 13, 12],
    },
];

export const connections: ConnectionDef[] = [
    {
        from: 'engagement-rate',
        to: 'video-views',
        strength: 0.85,
        description: 'Více video obsahu = výrazně vyšší engagement',
        recommendation: 'Zvýšit video frekvenci na 5+/týden',
    },
    {
        from: 'engagement-rate',
        to: 'posting-frequency',
        strength: 0.72,
        description: 'Častější posty udržují vyšší engagement',
        recommendation: 'Aktuálně: 12 postů/týden. Optimum: 15–18 postů/týden',
    },
    {
        from: 'engagement-rate',
        to: 'comments',
        strength: 0.68,
        description: 'Komentáře jsou hlavní driver engagement rate',
    },
    {
        from: 'video-views',
        to: 'engagement-rate',
        strength: 0.85,
        description: 'Video views přímo korelují s celkovým engagement',
        recommendation: 'Reels mají 2x vyšší engagement než static posty',
    },
    {
        from: 'comments',
        to: 'sentiment-score',
        strength: 0.58,
        description: 'Více komentářů zlepšuje sentiment score',
        recommendation: 'Posty s otázkami generují 2.5x více komentářů',
    },
    {
        from: 'reach-organic',
        to: 'follower-growth',
        strength: 0.76,
        description: 'Vyšší organic reach přináší nové followery',
    },
    {
        from: 'reach-organic',
        to: 'posting-frequency',
        strength: 0.69,
        description: 'Častější posty = vyšší organický reach',
        recommendation: 'Aktuálně: 12 postů/týden. Optimum: 15–18 postů/týden',
    },
    {
        from: 'response-time',
        to: 'sentiment-score',
        strength: 0.79,
        description: 'Rychlejší odpovědi = vyšší sentiment score',
        recommendation: 'Cíl: pod 20 min. Bot handled 34% first responses',
    },
    {
        from: 'conversion-rate',
        to: 'demo-requests',
        strength: 0.89,
        description: 'Vyšší conversion přímo generuje více demo requests',
        recommendation: 'Soft CTA v organic postech convertuje lépe než hard sell',
    },
    {
        from: 'follower-growth',
        to: 'engagement-rate',
        strength: 0.44,
        description: 'Noví followeré mírně zvyšují engagement',
    },
];

export const posts: PostDef[] = [
    {
        id: 'post-1',
        platform: 'linkedin',
        type: 'text',
        text: "What's your biggest customer service challenge in 2024?",
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=LinkedIn',
        metrics: { engagement: 892, reach: 34500, comments: 89 },
    },
    {
        id: 'post-2',
        platform: 'instagram',
        type: 'video',
        text: '5 AI Myths in Customer Service – DEBUNKED',
        thumbnail: 'https://placehold.co/400x400/E4405F/white?text=Reels',
        metrics: { engagement: 1247, reach: 28900, comments: 43 },
    },
    {
        id: 'post-3',
        platform: 'linkedin',
        type: 'carousel',
        text: 'The anatomy of a perfect customer response',
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=Carousel',
        metrics: { engagement: 2156, reach: 52300, comments: 127 },
    },
    {
        id: 'post-4',
        platform: 'linkedin',
        type: 'video',
        text: 'See our new AI Bot handle complex inquiry in real-time',
        thumbnail: 'https://placehold.co/400x400/0A66C2/white?text=Demo',
        metrics: { engagement: 1823, reach: 41200, comments: 98 },
    },
];
