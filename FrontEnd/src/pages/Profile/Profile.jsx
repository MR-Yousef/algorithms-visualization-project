import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { UserIcon, MailIcon, EditIcon, SaveIcon, ShieldIcon, CheckIcon, CalendarIcon, BellIcon, StarIcon } from "../../assets/Icons/Icon";

// ─── Main Component ───────────────────────────────────────────
export default function Profile() {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [userData, setUserData] = useState({
        username: "AlgoMaster",
        email: "algomaster@example.com",
        bio: "Algorithm enthusiast & visualization expert",
        joinedDate: "January 2024",
        algorithmsCreated: 23,
        visualizationsViewed: 156,
        badges: ["Top Contributor", "Algorithm Pro", "Visualizer"]
    });

    const [formData, setFormData] = useState({ ...userData });

    const handleSave = () => {
        setUserData({ ...formData });
        setIsEditing(false);
    };

    const handleCancel = () => {
        setFormData({ ...userData });
        setIsEditing(false);
    };

    return (
        <div className="profile-page">
            {/* ── Animated Background ── */}
            <Background/>
            {/* ── Header ── */}
            <Header />

            {/* ── Profile Content ── */}
            <main className="profile-main">
                {/* Profile Header Card */}
                <div className="profile-header-card">
                    <span className="neon-border neon-tl" />
                    <span className="neon-border neon-tr" />
                    <span className="neon-border neon-bl" />
                    <span className="neon-border neon-br" />
                    <span className="corner-dot dot-tl" />
                    <span className="corner-dot dot-tr" />
                    <span className="corner-dot dot-bl" />
                    <span className="corner-dot dot-br" />

                    <div className="profile-avatar-section">
                        <div className="avatar">
                            <UserIcon />
                        </div>
                        <div className="avatar-info">
                            {isEditing ? (
                                <input
                                    type="text"
                                    className="edit-input name-input"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    placeholder="Username"
                                />
                            ) : (
                                <h1 className="profile-name">{userData.username}</h1>
                            )}
                            <div className="profile-meta">
                                <span className="meta-item">
                                    <CalendarIcon />
                                    Joined {userData.joinedDate}
                                </span>
                                <span className="meta-badge">
                                    <ShieldIcon />
                                    Verified
                                </span>
                            </div>
                        </div>
                        <button
                            className="edit-toggle-btn"
                            onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                        >
                            {isEditing ? (
                                <>Cancel</>
                            ) : (
                                <><EditIcon /> Edit Profile</>
                            )}
                        </button>
                    </div>
                </div>

                {/* Profile Details Grid */}
                <div className="profile-grid">
                    {/* Info Card */}
                    <div className="profile-card info-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading">
                            <UserIcon />
                            Personal Information
                        </h2>

                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-label"><MailIcon /> Email</span>
                                {isEditing ? (
                                    <input
                                        type="email"
                                        className="edit-input"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                ) : (
                                    <span className="info-value">{userData.email}</span>
                                )}
                            </div>

                            <div className="info-item">
                                <span className="info-label"><EditIcon /> Bio</span>
                                {isEditing ? (
                                    <textarea
                                        className="edit-input edit-textarea"
                                        value={formData.bio}
                                        onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                        rows="3"
                                    />
                                ) : (
                                    <span className="info-value">{userData.bio}</span>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <button className="save-btn" onClick={handleSave}>
                                <SaveIcon />
                                Save Changes
                            </button>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="profile-card stats-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading">
                            <StarIcon />
                            Statistics
                        </h2>

                        <div className="stats-grid">
                            <div className="stat-box">
                                <span className="stat-value">{userData.algorithmsCreated}</span>
                                <span className="stat-desc">Algorithms Created</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{userData.visualizationsViewed}</span>
                                <span className="stat-desc">Visualizations</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{userData.badges.length}</span>
                                <span className="stat-desc">Badges Earned</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">
                                    <StarIcon />
                                    4.9
                                </span>
                                <span className="stat-desc">Rating</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Card */}
                    <div className="profile-card actions-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading">
                            <BellIcon />
                            Quick Actions
                        </h2>

                        <div className="actions-list">
                            <button className="action-btn" onClick={() => navigate("/add-algorithm")}>
                                <EditIcon />
                                Create Algorithm
                            </button>
                            <button className="action-btn" onClick={() => navigate("/algorithms")}>
                                <StarIcon />
                                View Algorithms
                            </button>
                            <button className="action-btn" onClick={() => navigate("/help")}>
                                <ShieldIcon />
                                Get Help
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}