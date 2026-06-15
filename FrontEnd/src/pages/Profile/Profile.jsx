import "./Profile.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { useAuth } from "../../hooks/useAuth";
import { LogoutIcon, DeleteIcon, WarningIcon, UserIcon, MailIcon, EditIcon, SaveIcon, ShieldIcon, CheckIcon, CalendarIcon, BellIcon, StarIcon } from "../../assets/Icons/Icon";

export default function Profile() {
    const navigate = useNavigate();
    const { logout, deleteAccount, user } = useAuth(); // 👈 Get deleteAccount from context
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");

    const [userData, setUserData] = useState({
        username: user?.username || "AlgoMaster",
        email: user?.email || "algomaster@example.com",
        bio: "Algorithm enthusiast & visualization expert",
        joinedDate: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "January 2024",
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

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            alert("Please enter your password");
            return;
        }

        setIsDeleting(true);

        const result = await deleteAccount(deletePassword);

        if (result.success) {
            navigate('/login', { state: { message: 'Account deleted successfully' } });
        } else {
            alert(result.error || 'Failed to delete account');
            setIsDeleting(false);
            setShowDeleteModal(false);
            setDeletePassword(""); // Reset password
        }
    };

    return (
        <div className="profile-page">
            <Background />
            <Header />

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
                        <div className="profile-header-actions">
                            <button
                                className="edit-toggle-btn"
                                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                            >
                                {isEditing ? <>Cancel</> : <><EditIcon /> Edit Profile</>}
                            </button>

                            <button className="logout-btn" onClick={handleLogout} title="Logout">
                                <LogoutIcon />
                                Logout
                            </button>
                        </div>
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

                        <h2 className="card-heading"><UserIcon /> Personal Information</h2>

                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-label"><MailIcon /> Email</span>
                                {isEditing ? (
                                    <input type="email" className="edit-input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                ) : (
                                    <span className="info-value">{userData.email}</span>
                                )}
                            </div>

                            <div className="info-item">
                                <span className="info-label"><EditIcon /> Bio</span>
                                {isEditing ? (
                                    <textarea className="edit-input edit-textarea" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows="3" />
                                ) : (
                                    <span className="info-value">{userData.bio}</span>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <button className="save-btn" onClick={handleSave}>
                                <SaveIcon /> Save Changes
                            </button>
                        )}
                    </div>

                    {/* Stats Card */}
                    <div className="profile-card stats-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><StarIcon /> Statistics</h2>

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
                                <span className="stat-value"><StarIcon /> 4.9</span>
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

                        <h2 className="card-heading"><BellIcon /> Quick Actions</h2>

                        <div className="actions-list">
                            <button className="action-btn" onClick={() => navigate("/add-algorithm")}>
                                <EditIcon /> Create Algorithm
                            </button>
                            <button className="action-btn" onClick={() => navigate("/algorithms")}>
                                <StarIcon /> View Algorithms
                            </button>
                            <button className="action-btn" onClick={() => navigate("/help")}>
                                <ShieldIcon /> Get Help
                            </button>
                        </div>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="profile-card danger-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading danger-heading"><WarningIcon /> Danger Zone</h2>

                        <p className="danger-description">
                            Once you delete your account, there is no going back. Please be certain.
                        </p>

                        <button className="delete-account-btn" onClick={() => setShowDeleteModal(true)}>
                            <DeleteIcon /> Delete Account
                        </button>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <WarningIcon />
                            <h2>Delete Account</h2>
                        </div>

                        <div className="modal-body">
                            <p className="modal-warning">
                                This action <strong>cannot be undone</strong>. This will permanently delete your account and all associated data.
                            </p>

                            <p className="modal-instruction" style={{ marginTop: '1rem' }}>
                                Enter your <strong>password</strong> to continue:
                            </p>

                            <input
                                type="password"
                                className="modal-input"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password"
                            />
                        </div>

                        <div className="modal-actions">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-delete-btn"
                                onClick={handleDeleteAccount}
                                disabled={!deletePassword || isDeleting}
                            >
                                {isDeleting ? (
                                    "Deleting..."
                                ) : (
                                    <><DeleteIcon /> Delete My Account</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}