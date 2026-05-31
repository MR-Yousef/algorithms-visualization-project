import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { IconProfile, IconAdd, IconShow, IconHelp, IconArrow, IconSparkle } from "../../assets/Component/Icons/Icon";
import Header from "../../assets/Component/Header/Header";



// ─── Node Network SVG ─────────────────────────────────────────
const NodeNetwork = () => (
    <svg className="node-network" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
        <defs>
            <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#00f5e4" stopOpacity="1" />
                <stop offset="100%" stopColor="#00f5e4" stopOpacity="0" />
            </radialGradient>
        </defs>
        {[
            [80, 600, 220, 520], [220, 520, 380, 570], [380, 570, 520, 490],
            [520, 490, 700, 540], [700, 540, 860, 480], [860, 480, 1000, 560],
            [1000, 560, 1180, 500], [220, 520, 300, 420], [300, 420, 500, 380],
            [500, 380, 700, 540], [700, 540, 900, 360], [900, 360, 1100, 420],
            [300, 420, 480, 300], [480, 300, 640, 340], [640, 340, 900, 360],
            [80, 600, 160, 480], [160, 480, 300, 420],
        ].map(([x1, y1, x2, y2], i) => (
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="rgba(0,245,228,0.2)" strokeWidth="1"
            />
        ))}
        {[
            [80, 600], [220, 520], [380, 570], [520, 490], [700, 540],
            [860, 480], [1000, 560], [1180, 500], [300, 420], [500, 380],
            [900, 360], [1100, 420], [480, 300], [640, 340], [160, 480],
        ].map(([cx, cy], i) => (
            <g key={i}>
                <circle cx={cx} cy={cy} r="10" fill="rgba(0,245,228,0.04)" />
                <circle cx={cx} cy={cy} r="4" fill="rgba(0,245,228,0.5)" />
                <circle cx={cx} cy={cy} r="2" fill="#00f5e4" />
            </g>
        ))}
    </svg>
);

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);

    const menuItems = [
        {
            id: 1,
            title: "Profile",
            description: "Manage your account settings and preferences",
            icon: <IconProfile />,
            path: "/profile",
            color: "#00d4ff",
            stats: "View Profile"
        },
        {
            id: 2,
            title: "Add Algorithm",
            description: "Create and upload new algorithms",
            icon: <IconAdd />,
            path: "/add-algorithm",
            color: "#00f5a0",
            stats: "New Algorithm"
        },
        {
            id: 3,
            title: "Show Algorithms",
            description: "Browse and visualize existing algorithms",
            icon: <IconShow />,
            path: "/algorithms",
            color: "#8b5cf6",
            stats: "View All"
        },
        {
            id: 4,
            title: "Help & Info",
            description: "Get help and learn about AlgoVisual",
            icon: <IconHelp />,
            path: "/help",
            color: "#f59e0b",
            stats: "Learn More"
        },
    ];

    return (
        <div className="home-page">
            {/* ── Animated Background ── */}
            <div className="home-canvas">
                <div className="mesh-wave" />
                <NodeNetwork />
                <div className="center-glow" />
                <div className="floating-particles">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }} />
                    ))}
                </div>
            </div>
            {/* ── Header ── */}
            <Header />
            {/* ── Main Content ── */}
            <main className="home-main">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        <span className="title-icon"><IconSparkle /></span>
                        Welcome to <span className="gradient-text">AlgoVisual</span>
                    </h1>
                    <p className="welcome-subtitle">
                        Your platform for algorithm visualization and learning
                    </p>
                </div>

                {/* Menu Cards Grid */}
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        <div
                            key={item.id}
                            className={`menu-card ${hoveredCard === item.id ? 'hovered' : ''}`}
                            onMouseEnter={() => setHoveredCard(item.id)}
                            onMouseLeave={() => setHoveredCard(null)}
                            onClick={() => navigate(item.path)}
                        >
                            {/* Neon border effect */}
                            <span className="card-border card-border-tl" />
                            <span className="card-border card-border-tr" />
                            <span className="card-border card-border-bl" />
                            <span className="card-border card-border-br" />

                            <div className="card-content">
                                <div className="card-icon" style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <h3 className="card-title">{item.title}</h3>
                                <p className="card-description">{item.description}</p>
                                <div className="card-footer">
                                    <span className="card-stats">{item.stats}</span>
                                    <span className="card-arrow"><IconArrow /></span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Stats Section */}
                <div className="stats-section">
                    <div className="stat-card">
                        <span className="stat-number">150+</span>
                        <span className="stat-label">Algorithms</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">10K+</span>
                        <span className="stat-label">Users</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">50K+</span>
                        <span className="stat-label">Visualizations</span>
                    </div>
                    <div className="stat-card">
                        <span className="stat-number">24/7</span>
                        <span className="stat-label">Support</span>
                    </div>
                </div>
            </main>
        </div>
    );
}