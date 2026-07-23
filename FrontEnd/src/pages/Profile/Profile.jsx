import "./Profile.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { useAuth } from "../../hooks/useAuth";
import {
    LogoutIcon, DeleteIcon, WarningIcon, UserIcon, MailIcon,
    EditIcon, SaveIcon, ShieldIcon, CheckIcon, CalendarIcon, BellIcon, StarIcon, LockIcon
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";

/**
 * Profile page component – displays user information, allows editing,
 * password change, avatar upload, and account deletion.
 */
export default function Profile() {
    const navigate = useNavigate();
    const { user, loading, logout, getAccessToken, getRefreshToken, updateUser } = useAuth();

    // ---------- General UI states ----------
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [deleteError, setDeleteError] = useState("");

    // ---------- Password change states ----------
    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    // ---------- Avatar upload states ----------
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    // Form fields for editing profile (email & bio)
    const [formData, setFormData] = useState({
        email: user?.email || "",
        bio: user?.bio || "",
    });

    // Keep form fields in sync with user data
    useEffect(() => {
        if (user) {
            setFormData({
                email: user.email || "",
                bio: user.bio || "",
            });
        }
    }, [user]);

    // Redirect to login if user is no longer authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [loading, user, navigate]);

    // Format the account creation date
    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
        : "Unknown";

    // ---------- Avatar handlers ----------
    const handleAvatarClick = () => {
        if (isEditing) {
            fileInputRef.current?.click();
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSaveError("Please select an image file.");
            return;
        }

        setAvatarFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    /**
     * Refreshes the access token using the provided refresh token.
     * @param {string} refreshToken - The refresh token.
     * @returns {Promise<string>} The new access token.
     */
    const refreshAccessToken = async (refreshToken) => {
        const response = await fetch(ENDPOINTS.REFRESH, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.detail || "Session expired. Please log in again.");
        }

        const data = await response.json().catch(() => ({}));
        if (!data.access) {
            throw new Error("Session expired. Please log in again.");
        }

        return data.access;
    };

    // ---------- Profile update (email, bio, avatar) ----------
    const handleSave = async () => {
        setSaveError("");
        setIsSaving(true);
        try {
            let token = getAccessToken();
            if (!token) {
                throw new Error("Authentication token missing. Please log in again.");
            }

            const formDataToSend = new FormData();
            formDataToSend.append("email", formData.email);
            formDataToSend.append("bio", formData.bio);
            if (avatarFile) {
                formDataToSend.append("avatar", avatarFile);
            }

            // Inner function that attempts the save; if token expired (401), it can be retried
            const attemptSave = async (currentToken) => {
                const response = await fetch(ENDPOINTS.ME, {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${currentToken}`,
                    },
                    body: formDataToSend,
                });

                // Token expired – refresh and retry
                if (response.status === 401) {
                    const refreshToken = getRefreshToken;
                    if (!refreshToken) {
                        throw new Error("Session expired. Please log in again.");
                    }
                    const newToken = await refreshAccessToken(refreshToken);
                    const storage = localStorage.getItem('remember_me') === 'true' ? localStorage : sessionStorage;
                    storage.setItem('access_token', newToken);

                    const retryResponse = await fetch(ENDPOINTS.ME, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                        body: formDataToSend,
                    });
                    if (!retryResponse.ok) {
                        const errData = await retryResponse.json().catch(() => ({}));
                        throw new Error(errData.detail || "Failed to update profile");
                    }
                    return retryResponse.json();
                }

                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.detail || "Failed to update profile");
                }
                return response.json();
            };

            const updatedUser = await attemptSave(token);
            updateUser(updatedUser);

            // Exit editing mode
            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            setSaveError(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // Cancel editing – revert form fields
    const handleCancel = () => {
        setFormData({
            email: user?.email || "",
            bio: user?.bio || "",
        });
        setIsEditing(false);
        setSaveError("");
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    // ---------- Password change ----------
    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        // Basic client-side validation
        if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
            setPasswordError("All fields are required.");
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwordData.newPassword)) {
            setPasswordError("New password must be at least 8 characters and include uppercase, lowercase, and a number.");
            return;
        }
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        setIsChangingPassword(true);
        try {
            const token = getAccessToken();
            if (!token) {
                throw new Error("Authentication token missing. Please log in again.");
            }

            const response = await fetch(ENDPOINTS.CHANGE_PASSWORD, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword,
                    confirm_password: passwordData.confirmPassword,
                }),
            });

            const responseData = await response.json().catch(() => ({}));

            if (!response.ok) {
                let errorMessage = responseData.detail || "Failed to change password.";
                // Extract field-specific errors if available
                if (responseData.old_password) {
                    errorMessage = Array.isArray(responseData.old_password)
                        ? responseData.old_password.join(" ")
                        : responseData.old_password;
                } else if (responseData.new_password) {
                    errorMessage = Array.isArray(responseData.new_password)
                        ? responseData.new_password.join(" ")
                        : responseData.new_password;
                } else if (responseData.confirm_password) {
                    errorMessage = Array.isArray(responseData.confirm_password)
                        ? responseData.confirm_password.join(" ")
                        : responseData.confirm_password;
                }
                throw new Error(errorMessage);
            }

            setPasswordSuccess("Password changed successfully!");
            // Close the form after a short delay
            setTimeout(() => {
                setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                setShowPasswordSection(false);
                setPasswordSuccess("");
            }, 1500);
        } catch (error) {
            setPasswordError(error.message);
        } finally {
            setIsChangingPassword(false);
        }
    };

    // ---------- Logout ----------
    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    // ---------- Account deletion ----------
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError("Please enter your password.");
            return;
        }

        setIsDeleting(true);
        setDeleteError("");

        try {
            let token = getAccessToken();
            if (!token) throw new Error("Session expired. Please log in again.");

            // Helper to perform the delete request
            const attemptDelete = async (tok) => {
                const res = await fetch(ENDPOINTS.DELETE_ACCOUNT, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${tok}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        password: deletePassword,
                        confirm_password: deletePassword,
                    }),
                });

                const data = await res.json().catch(() => null);

                if (res.ok) return { success: true };
                if (res.status === 401) return { status: 401 };

                const msg =
                    data?.detail ||
                    data?.password?.[0] ||
                    data?.confirm_password?.[0] ||
                    'Failed to delete account.';
                return { success: false, error: msg };
            };

            let result = await attemptDelete(token);

            // If token expired, refresh and retry
            if (result.status === 401) {
                const refreshToken = getRefreshToken;
                if (!refreshToken) throw new Error("Session expired. Please log in again.");
                const newToken = await refreshAccessToken(refreshToken);
                const storage = localStorage.getItem('remember_me') === 'true' ? localStorage : sessionStorage;
                storage.setItem('access_token', newToken);
                result = await attemptDelete(newToken);
            }

            if (result.success) {
                // Clear session and user; redirect is handled by the useEffect
                await logout();
            } else {
                setDeleteError(result.error || 'Failed to delete account.');
                setIsDeleting(false);
                setDeletePassword('');
            }
        } catch (error) {
            setDeleteError(error.message || 'An unexpected error occurred.');
            setIsDeleting(false);
            setDeletePassword('');
        }
    };

    // ---------- Badge generation based on user stats ----------
    const getBadges = () => {
        const badges = [];
        if (user?.published_algorithms_count > 0) badges.push("Algorithm Publisher");
        if (user?.executed_algorithms_count > 5) badges.push("Active Executor");
        if (user?.rating >= 4) badges.push("Highly Rated");
        if (user?.impact_score > 10) badges.push("High Impact");
        if (user?.role === "CONTRIBUTOR") badges.push("Contributor");
        if (user?.role === "ADMIN") badges.push("Admin");
        return badges.length > 0 ? badges : ["Newcomer"];
    };

    // ---------- Render ----------
    if (loading) {
        return (
            <div className="profile-page">
                <Background />
                <Header />
                <div className="loading-container">Loading profile...</div>
            </div>
        );
    }

    if (!user) return null;

    const badges = getBadges();

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
                        <div
                            className={`avatar ${isEditing ? "editable" : ""}`}
                            onClick={handleAvatarClick}
                            title={isEditing ? "Click to change avatar" : ""}
                        >
                            {avatarPreview ? (
                                <img src={avatarPreview} alt="Preview" />
                            ) : user?.avatar ? (
                                <img
                                    src={user.avatar}
                                    alt={user.username}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            ) : (
                                <UserIcon />
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: "none" }}
                            />
                        </div>
                        <div className="avatar-info">
                            <h1 className="profile-name">{user.username}</h1>
                            <div className="profile-meta">
                                <span className="meta-item"><CalendarIcon /> Joined {joinedDate}</span>
                                {user.role && <span className="meta-badge"><ShieldIcon /> {user.role}</span>}
                            </div>
                        </div>
                        <div className="profile-header-actions">
                            <button className="edit-toggle-btn" onClick={() => isEditing ? handleCancel() : setIsEditing(true)}>
                                {isEditing ? "Cancel" : <><EditIcon /> Edit Profile</>}
                            </button>
                            <button className="logout-btn" onClick={handleLogout}><LogoutIcon /> Logout</button>
                        </div>
                    </div>
                </div>

                {/* Profile Grid */}
                <div className="profile-grid">
                    {/* Info Card */}
                    <div className="profile-card info-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />
                        <h2 className="card-heading"><UserIcon /> Personal Information</h2>
                        {saveError && <div className="error-msg">{saveError}</div>}
                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-label"><MailIcon /> Email</span>
                                <span className="info-value">{user.email || "Not set"}</span>
                            </div>
                            <div className="info-item">
                                <span className="info-label"><EditIcon /> Bio</span>
                                {isEditing ? (
                                    <textarea className="edit-input edit-textarea" value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows="3" />
                                ) : (
                                    <span className="info-value">{user.bio || "No bio yet."}</span>
                                )}
                            </div>
                        </div>
                        {isEditing && (
                            <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : <><SaveIcon /> Save Changes</>}
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
                                <span className="stat-value">{user.published_algorithms_count ?? 0}</span>
                                <span className="stat-desc">Published</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{user.executed_algorithms_count ?? 0}</span>
                                <span className="stat-desc">Executed</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{user.total_algorithm_runs ?? 0}</span>
                                <span className="stat-desc">Total Runs</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value"><StarIcon /> {user.rating ?? "N/A"}</span>
                                <span className="stat-desc">Rating</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{user.impact_score ?? 0}</span>
                                <span className="stat-desc">Impact</span>
                            </div>
                            <div className="stat-box">
                                <span className="stat-value">{badges.length}</span>
                                <span className="stat-desc">Badges</span>
                            </div>
                        </div>
                    </div>

                    {/* Badges Card */}
                    <div className="profile-card badges-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />
                        <h2 className="card-heading"><CheckIcon /> Badges</h2>
                        <div className="badges-list">
                            {badges.map((badge, i) => (
                                <div key={i} className="badge-item">
                                    <span className="badge-icon"><CheckIcon /></span>
                                    <span className="badge-name">{badge}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Change Password Card */}
                    <div className="profile-card password-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />
                        <h2 className="card-heading"><LockIcon /> Change Password</h2>
                        {!showPasswordSection ? (
                            <button className="action-btn" onClick={() => setShowPasswordSection(true)}>
                                <LockIcon /> Change Password
                            </button>
                        ) : (
                            <div className="password-form">
                                {passwordError && <div className="error-msg">{passwordError}</div>}
                                {passwordSuccess && <div className="success-msg">{passwordSuccess}</div>}
                                <div className="info-item">
                                    <label className="info-label">Current Password</label>
                                    <input
                                        type="password"
                                        className="edit-input"
                                        value={passwordData.oldPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                        placeholder="Enter current password"
                                    />
                                </div>
                                <div className="info-item">
                                    <label className="info-label">New Password</label>
                                    <input
                                        type="password"
                                        className="edit-input"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        placeholder="New password"
                                    />
                                </div>
                                <div className="info-item">
                                    <label className="info-label">Confirm New Password</label>
                                    <input
                                        type="password"
                                        className="edit-input"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        placeholder="Re-enter new password"
                                    />
                                </div>
                                <div className="password-actions">
                                    <button
                                        className="save-btn"
                                        onClick={handlePasswordChange}
                                        disabled={isChangingPassword}
                                    >
                                        {isChangingPassword ? "Updating..." : "Update Password"}
                                    </button>
                                    <button
                                        className="cancel-btn"
                                        onClick={() => {
                                            setShowPasswordSection(false);
                                            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
                                            setPasswordError("");
                                            setPasswordSuccess("");
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Actions Card */}
                    <div className="profile-card actions-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />
                        <h2 className="card-heading"><BellIcon /> Quick Actions</h2>
                        <div className="actions-list">
                            <button className="action-btn" onClick={() => navigate("/InputAlgo")}><EditIcon /> Create Algorithm</button>
                            <button className="action-btn" onClick={() => navigate("/show-algorithms")}><StarIcon /> View Algorithms</button>
                            <button className="action-btn" onClick={() => navigate("/help")}><ShieldIcon /> Get Help</button>
                        </div>
                    </div>

                    {/* Danger Zone Card */}
                    <div className="profile-card danger-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />
                        <h2 className="card-heading danger-heading"><WarningIcon /> Danger Zone</h2>
                        <p className="danger-description">Once you delete your account, there is no going back.</p>
                        <button className="delete-account-btn" onClick={() => setShowDeleteModal(true)}><DeleteIcon /> Delete Account</button>
                    </div>
                </div>
            </main>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={() => { setShowDeleteModal(false); setDeletePassword(""); setDeleteError(""); }}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header"><WarningIcon /><h2>Delete Account</h2></div>
                        <div className="modal-body">
                            <p className="modal-warning">This action <strong>cannot be undone</strong>.</p>
                            <p className="modal-instruction">Enter your password to confirm:</p>
                            <input
                                type="password"
                                className="modal-input"
                                value={deletePassword}
                                onChange={(e) => {
                                    setDeletePassword(e.target.value);
                                    setDeleteError("");
                                }}
                                placeholder="Password"
                            />
                            {deleteError && <div className="error-msg" style={{ marginTop: '0.8rem' }}>{deleteError}</div>}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="modal-cancel-btn"
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setDeletePassword("");
                                    setDeleteError("");
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                className="modal-delete-btn"
                                onClick={handleDeleteAccount}
                                disabled={!deletePassword || isDeleting}
                            >
                                {isDeleting ? "Deleting..." : <><DeleteIcon /> Delete My Account</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}