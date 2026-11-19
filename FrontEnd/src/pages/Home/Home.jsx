import "./Home.css";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import InfoCard from "../../Component/InfoCard/InfoCard";
import { menuItems } from "../../assets/data/HomeCards";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { SparkleIcon } from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { apiRequest, unwrapData } from "../../services/api.service";

export default function Home() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();

    const [statistics, setStatistics] = useState({
        algorithms: 0,
        users: 0,
        visualizations: 0,
    });
    const [statisticsLoading, setStatisticsLoading] = useState(true);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (loading || !isAuthenticated) return;

        let cancelled = false;

        const loadStatistics = async () => {
            setStatisticsLoading(true);

            try {
                const payload = await apiRequest(ENDPOINTS.STATISTICS);
                const data = unwrapData(payload) ?? {};

                const algorithms = data.published_algorithms ??
                    0;

                const users = data.total_users ??
                    0;

                const visualizations = data.total_algorithm_executions ??
                    0;

                if (!cancelled) {
                    setStatistics({ algorithms, users, visualizations });
                }
            } catch (error) {
                console.error("Failed to load Home statistics:", error);

                if (!cancelled) {
                    setStatistics({
                        algorithms: 0,
                        users: 0,
                        visualizations: 0,
                    });
                }
            } finally {
                if (!cancelled) setStatisticsLoading(false);
            }
        };

        loadStatistics();

        return () => {
            cancelled = true;
        };
    }, [loading, isAuthenticated]);

    const formatStat = (value) => {
        const number = Number(value);
        return Number.isFinite(number) ? number.toLocaleString() : "0";
    };

    if (loading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="home-page">
            <Background />
            <Header />

            <main className="home-main">
                <div className="welcome-section">
                    <h1 className="welcome-title">
                        <span className="title-icon"><SparkleIcon /></span>
                        Welcome to <span className="gradient-text">AlgoHub</span>
                    </h1>
                    <p className="welcome-subtitle">
                        Your platform for algorithm learning and visualization
                    </p>
                </div>

                <div className="menu-grid">
                    {menuItems.map((item) => (
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

                <div className="stats-section">
                    <div className="stat-card">
                        <span className="stat-number">
                            {statisticsLoading ? "..." : formatStat(statistics.algorithms)}
                        </span>
                        <span className="stat-label">Algorithms</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-number">
                            {statisticsLoading ? "..." : formatStat(statistics.users)}
                        </span>
                        <span className="stat-label">Users</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-number">
                            {statisticsLoading ? "..." : formatStat(statistics.visualizations)}
                        </span>
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