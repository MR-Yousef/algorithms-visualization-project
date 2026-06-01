import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import { ProfileIcon, AddIcon, ShowIcon, HelpIcon, ArrowIcon, SparkleIcon } from "../../assets/Icons/Icon";
import Header from "../../Component/Header/Header";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
    // Navigation and hover state management
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    // Menu items configuration for the home page
    const menuItems = [
        // {   // profile card
        //     id: 1,
        //     title: "Profile",
        //     description: "Manage your account settings and preferences",
        //     icon: <ProfileIcon />,
        //     path: "/profile",
        //     color: "#00d4ff",
        //     stats: "View Profile"
        // },
        {   // instructions card
            id:2,
            title: "Help & Info",
            description: "Get help and learn about AlgoVisual",
            icon: <HelpIcon />,
            path: "/help",
            color: "#f59e0b",
            stats: "Learn More"
            
        },
        {   // show build-in algorithms
            id: 3,
            title: "Show Algorithms",
            description: "Browse and view many existing algorithms",
            icon: <ShowIcon />,
            path: "/algorithms",
            color: "#8b5cf6",
            stats: "View All"
        },
        {   // algorithm builder card
            id: 4,
            title: "Add Algorithm",
            description: "Build ,Test and upload new algorithms",
            icon: <AddIcon />,
            path: "/add-algorithm",
            color: "#00f5a0",
            stats: "New Algorithm"
        },
    ];

    return (
        <div className="home-page">
            {/* ── Animated Background ── */}
            <div className="home-canvas">
                <div className="mesh-wave" />
                <NodesNetworkImg />
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
            {/*end of animated background*/}
            <Header />
            {/* ── Main Content ── */}
            <main className="home-main">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        <span className="title-icon"><SparkleIcon /></span>
                        Welcome to <span className="gradient-text">AlgoVisual</span>
                    </h1>
                    <p className="welcome-subtitle">
                        Your platform for algorithm learning and visualization
                    </p>
                </div>
                {/*end of welcome section*/}
                {/* Menu Cards Grid */}
                <div className="menu-grid">
                    {menuItems.map((item) => (
                        // Each menu card with hover effects and navigation
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
                            {/* Card content */}
                            <div className="card-content">
                                <div className="card-icon" style={{ color: item.color }}>
                                    {item.icon}
                                </div>
                                <h3 className="card-title">{item.title}</h3>
                                <p className="card-description">{item.description}</p>
                                <div className="card-footer">
                                    <span className="card-stats">{item.stats}</span>
                                    <span className="card-arrow"><ArrowIcon /></span>
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
                {/*end of quick stats section*/}
            </main>
        </div>
    );
}