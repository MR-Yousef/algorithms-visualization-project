// ─── Node Network SVG ─────────────────────────────────────────
export const NodesNetworkImg = () => (
    <svg className="node-network" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f5e4" stopOpacity="1" />
                <stop offset="100%" stopColor="#00f5e4" stopOpacity="0" />
            </radialGradient>
        </defs>
        {/* Lines */}
        {[
            [80, 600, 220, 520], [220, 520, 380, 570], [380, 570, 520, 490],
            [520, 490, 700, 540], [700, 540, 860, 480], [860, 480, 1000, 560],
            [1000, 560, 1180, 500], [220, 520, 300, 420], [300, 420, 500, 380],
            [500, 380, 700, 540], [700, 540, 900, 360], [900, 360, 1100, 420],
            [300, 420, 480, 300], [480, 300, 640, 340], [640, 340, 900, 360],
            [80, 600, 160, 480], [160, 480, 300, 420],
        ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,245,228,0.25)" strokeWidth="1"
            />
        ))}
        {/* Nodes */}
        {[
            [80, 600], [220, 520], [380, 570], [520, 490], [700, 540],
            [860, 480], [1000, 560], [1180, 500], [300, 420], [500, 380],
            [900, 360], [1100, 420], [480, 300], [640, 340], [160, 480],
        ].map(([cx, cy], i) => (
            <g key={i}>
                <circle cx={cx} cy={cy} r="10" fill="rgba(0,245,228,0.06)" />
                <circle cx={cx} cy={cy} r="4" fill="rgba(0,245,228,0.7)" />
                <circle cx={cx} cy={cy} r="2" fill="#00f5e4" />
            </g>
        ))}
    </svg>
);

// ─── Mini Bar Chart for deco panels ──────────────────────────
export const BarChartImg = () => (
    <div className="mini-chart">
        {[40, 65, 50, 85, 55, 75, 45].map((h, i) => (
            <div key={i} className="bar" style={{ height: `${h}%` }} />
        ))}
    </div>
);

export const GraphImg = () => (
    <svg width="100%" height="100%" viewBox="0 0 240 160" style={{ opacity: 0.6 }}>
        <circle cx="120" cy="28" r="10" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
        <line x1="120" y1="38" x2="80" y2="60" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        <line x1="120" y1="38" x2="160" y2="60" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        <circle cx="80" cy="70" r="8" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
        <circle cx="160" cy="70" r="8" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
        <line x1="80" y1="78" x2="55" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        <line x1="80" y1="78" x2="105" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        <line x1="160" y1="78" x2="135" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        <line x1="160" y1="78" x2="185" y2="100" stroke="#00c9b8" strokeWidth="1" opacity="0.5" />
        {[55, 105, 135, 185].map((x, i) => (
            <circle key={i} cx={x} cy="108" r="7" fill="none" stroke="#007a72" strokeWidth="1.5" />
        ))}
    </svg>
)

export const PlotChartImg = () => (
    <svg width="100%" height="100%" viewBox="0 0 160 110" style={{ padding: 12, overflow: 'visible' }}>
        <polyline
            points="10,80 35,55 60,65 85,35 110,45 140,20"
            fill="none" stroke="#00f5e4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
        />
        <polyline
            points="10,80 35,55 60,65 85,35 110,45 140,20"
            fill="none" stroke="#00f5e4" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" opacity="0.08"
        />
    </svg>
);

export const CubeOutlineImg = () => (
    <svg width="100%" height="100%" viewBox="0 0 180 120" style={{ opacity: 0.7 }}>
        <rect x="55" y="30" width="50" height="50" fill="none" stroke="#00c9b8" strokeWidth="1.5" />
        <rect x="75" y="45" width="50" height="50" fill="none" stroke="#007a72" strokeWidth="1" />
        <line x1="55" y1="30" x2="75" y2="45" stroke="#00c9b8" strokeWidth="1" />
        <line x1="105" y1="30" x2="125" y2="45" stroke="#00c9b8" strokeWidth="1" />
        <line x1="55" y1="80" x2="75" y2="95" stroke="#00c9b8" strokeWidth="1" />
        <line x1="105" y1="80" x2="125" y2="95" stroke="#00c9b8" strokeWidth="1" />
        {[[55, 30], [105, 30], [55, 80], [105, 80], [75, 45], [125, 45], [75, 95], [125, 95]].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="3" fill="#00f5e4" opacity="0.8" />
        ))}
    </svg>
);