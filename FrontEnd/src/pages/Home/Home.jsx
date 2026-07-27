import "./Home.css";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import InfoCard from "../../Component/InfoCard/InfoCard";
import { menuItems } from "../../assets/data/HomeCards";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import { AddIcon, ShowIcon, HelpIcon, ArrowIcon, SparkleIcon } from "../../assets/Icons/Icon";
import { NodesNetworkImg, BarChartImg, GraphImg, PlotChartImg, CubeOutlineImg } from "../../assets/Images/Images"

// ─── Main Component ───────────────────────────────────────────
export default function Home() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    // Redirect to login if not authenticated (after loading finishes)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    if (loading) {
        return <div className="loading-container">Checking authentication...</div>;
    }
    if (!isAuthenticated) {
        return null;
    }

    // Navigation and hover state management
    // Menu items configuration for the home page
    return (
        <div className="home-page">
            {/* ── Animated Background ── */}
            <Background />
            {/*end of animated background*/}
            <Header />
            {/* ── Main Content ── */}
            <main className="home-main">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        <span className="title-icon"><SparkleIcon /></span>
                        Welcome to <span className="gradient-text">AlgoHub</span>
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
                        <InfoCard
                            key={item.id}
                            index={item.id}
                            icon={item.icon}
                            title={item.title}
                            description={item.description}
                            path={item.path}
                            stats={item.stats}
                            color={item.color}
                        />
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