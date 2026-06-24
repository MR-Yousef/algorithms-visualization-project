import "./InfoCard.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowIcon } from "../../assets/Icons/Icon";
function InfoCard({ index, icon, title, description, path, stats, color }) {
    const navigate = useNavigate();
    const [hoveredCard, setHoveredCard] = useState(null);
    return (
        <div
            key={index}
            className={`menu-card ${hoveredCard === index ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(index)}
            onMouseLeave={() => setHoveredCard(null)}
            onClick={() => navigate(path)}
        >
            {/* Neon border effect */}
            <span className="card-border card-border-tl" />
            <span className="card-border card-border-tr" />
            <span className="card-border card-border-bl" />
            <span className="card-border card-border-br" />
            {/* Card content */}
            <div className="card-content">
                <div className="card-icon" style={{ color: color }}>
                    {icon}
                </div>
                <h3 className="card-title">{title}</h3>
                <p className="card-description">{description}</p>
                <div className="card-footer">
                    <span className="card-stats">{stats}</span>
                    <span className="card-arrow"><ArrowIcon /></span>
                </div>
            </div>
        </div>
    )
}
export default InfoCard;