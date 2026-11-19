import "./Profile.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { useAuth } from "../../hooks/useAuth";
import {
    LogoutIcon,
    DeleteIcon,
    WarningIcon,
    UserIcon,
    MailIcon,
    AddIcon,
    EditIcon,
    SaveIcon,
    ShieldIcon,
    CalendarIcon,
    BellIcon,
    StarIcon,
    LockIcon,
    CodeIcon,
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import {
    apiRequest,
    extractList,
    unwrapData,
} from "../../services/api.service";

const BIO_MAX_LENGTH = 240;
const BIO_MAX_LINES = 4;

export default function Profile() {
    const navigate = useNavigate();
    const {
        user,
        loading,
        logout,
        updateUser,
    } = useAuth();

    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState("");

    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        bio: user?.bio || "",
    });

    const [savedAlgorithmsCount, setSavedAlgorithmsCount] = useState(0);
    const [executedAlgorithmsCount, setExecutedAlgorithmsCount] = useState(0);
    const [executedStatisticsLoading, setExecutedStatisticsLoading] = useState(true);

    const [showPasswordSection, setShowPasswordSection] = useState(false);
    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteError, setDeleteError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            setFormData({ bio: user.bio || "" });
        }
    }, [user]);

    useEffect(() => {
        if (!loading && !user) {
            navigate("/login", { replace: true });
        }
    }, [loading, user, navigate]);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        const loadSavedCount = async () => {
            try {
                const payload = await apiRequest(ENDPOINTS.SAVED);
                const root = unwrapData(payload);

                let count = 0;

                if (typeof payload?.count === "number") {
                    count = payload.count;
                } else if (typeof root?.count === "number") {
                    count = root.count;
                } else {
                    count = extractList(payload).length;
                }

                if (!cancelled) setSavedAlgorithmsCount(count);
            } catch (error) {
                console.error("Failed to load saved algorithms count:", error);
                if (!cancelled) setSavedAlgorithmsCount(0);
            }
        };

        loadSavedCount();

        return () => {
            cancelled = true;
        };
    }, [user]);

    useEffect(() => {
        if (!user) return;

        let cancelled = false;

        const loadMyStatistics = async () => {
            setExecutedStatisticsLoading(true);

            try {
                const payload = await apiRequest(ENDPOINTS.MY_STATISTICS);
                const data = unwrapData(payload) ?? {};

                const executed =
                    data.executed_algorithms_count ??
                    data.executed_algorithms ??
                    data.executed_count ??
                    data.executions_count ??
                    data.total_executed ??
                    data.total_executions ??
                    data.executions ??
                    data.executed ??
                    0;

                if (!cancelled) {
                    setExecutedAlgorithmsCount(Number(executed) || 0);
                }
            } catch (error) {
                console.error("Failed to load my statistics:", error);
                if (!cancelled) setExecutedAlgorithmsCount(0);
            } finally {
                if (!cancelled) setExecutedStatisticsLoading(false);
            }
        };

        loadMyStatistics();

        return () => {
            cancelled = true;
        };
    }, [user]);

    /* =====================================================
   LOAD TOTAL SAVED ALGORITHMS

   Saved =
   Saved Published
   +
   My Algorithms
===================================================== */

    useEffect(() => {

        if (!user) return;


        let cancelled = false;


        const loadSavedAlgorithmsCount =
            async () => {

                try {

                    /* =====================================
                       LOAD BOTH APIs TOGETHER
                    ===================================== */

                    const [
                        savedPublishedPayload,
                        myAlgorithmsPayload
                    ] = await Promise.all([

                        apiRequest(
                            ENDPOINTS.SAVED
                        ),

                        apiRequest(
                            ENDPOINTS.MY_ALGORITHMS
                        )

                    ]);


                    /* =====================================
                       SAVED PUBLISHED
                    ===================================== */

                    const savedPublished =
                        extractList(
                            savedPublishedPayload,
                            [
                                "saved_algorithms",
                                "algorithms",
                                "saved"
                            ]
                        );


                    /* =====================================
                       MY ALGORITHMS
                    ===================================== */

                    const myAlgorithms =
                        extractList(
                            myAlgorithmsPayload,
                            [
                                "my_algorithms",
                                "algorithms"
                            ]
                        );


                    /* =====================================
                       TOTAL
                    ===================================== */

                    const totalSaved =

                        savedPublished.length +

                        myAlgorithms.length;


                    console.log(
                        "Saved Published:",
                        savedPublished.length
                    );


                    console.log(
                        "My Algorithms:",
                        myAlgorithms.length
                    );


                    console.log(
                        "Total Saved:",
                        totalSaved
                    );


                    if (!cancelled) {

                        setSavedAlgorithmsCount(
                            totalSaved
                        );

                    }

                }
                catch (error) {

                    console.error(
                        "Failed to load saved algorithms count:",
                        error
                    );


                    if (!cancelled) {

                        setSavedAlgorithmsCount(0);

                    }

                }

            };


        loadSavedAlgorithmsCount();


        return () => {

            cancelled = true;

        };

    }, [user]);

    const joinedDate = user?.created_at
        ? new Date(user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
        })
        : "Unknown";

    const handleBioChange = (event) => {
        let value = event.target.value;
        const lines = value.split("\n");

        if (lines.length > BIO_MAX_LINES) {
            value = lines.slice(0, BIO_MAX_LINES).join("\n");
        }

        value = value.slice(0, BIO_MAX_LENGTH);

        setFormData({ bio: value });
    };

    const handleAvatarClick = () => {
        if (isEditing) fileInputRef.current?.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setSaveError("Please select an image file.");
            return;
        }

        setAvatarFile(file);

        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setSaveError("");
        setIsSaving(true);

        try {
            const body = new FormData();
            body.append("bio", formData.bio);

            if (avatarFile) {
                body.append("avatar", avatarFile);
            }

            const payload = await apiRequest(ENDPOINTS.ME, {
                method: "PUT",
                body,
            });

            const updatedUser = unwrapData(payload) ?? payload;
            updateUser(updatedUser);

            setIsEditing(false);
            setAvatarFile(null);
            setAvatarPreview(null);
        } catch (error) {
            setSaveError(error.message || "Failed to update profile.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData({ bio: user?.bio || "" });
        setIsEditing(false);
        setSaveError("");
        setAvatarFile(null);
        setAvatarPreview(null);
    };

    const handlePasswordChange = async () => {
        setPasswordError("");
        setPasswordSuccess("");

        if (
            !passwordData.oldPassword ||
            !passwordData.newPassword ||
            !passwordData.confirmPassword
        ) {
            setPasswordError("All fields are required.");
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(passwordData.newPassword)) {
            setPasswordError(
                "New password must be at least 8 characters and include uppercase, lowercase, and a number."
            );
            return;
        }

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        setIsChangingPassword(true);

        try {
            await apiRequest(ENDPOINTS.CHANGE_PASSWORD, {
                method: "POST",
                body: {
                    old_password: passwordData.oldPassword,
                    new_password: passwordData.newPassword,
                    confirm_password: passwordData.confirmPassword,
                },
            });

            setPasswordSuccess("Password changed successfully!");
            setPasswordData({
                oldPassword: "",
                newPassword: "",
                confirmPassword: "",
            });

            setTimeout(() => {
                setShowPasswordSection(false);
                setPasswordSuccess("");
            }, 1200);
        } catch (error) {
            setPasswordError(error.message || "Failed to change password.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError("Please enter your password.");
            return;
        }

        setDeleteError("");
        setIsDeleting(true);

        try {
            await apiRequest(ENDPOINTS.DELETE_ACCOUNT, {
                method: "DELETE",
                body: {
                    password: deletePassword,
                },
            });

            await logout();
            navigate("/signup", { replace: true });
        } catch (error) {
            setDeleteError(error.message || "Failed to delete account.");
        } finally {
            setIsDeleting(false);
        }
    };

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

    return (
        <div className="profile-page">
            <Background />
            <Header />

            <main className="profile-main">
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
                            ) : user.avatar ? (
                                <img src={user.avatar} alt={user.username} />
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
                                <span className="meta-item">
                                    <CalendarIcon /> Joined {joinedDate}
                                </span>
                                {user.role && (
                                    <span className="meta-badge">
                                        <ShieldIcon /> {user.role}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="profile-header-actions">
                            <button
                                className="edit-toggle-btn"
                                onClick={() => isEditing ? handleCancel() : setIsEditing(true)}
                            >
                                {isEditing ? "Cancel" : <><EditIcon /> Edit Profile</>}
                            </button>

                            <button className="logout-btn" onClick={handleLogout}>
                                <LogoutIcon /> Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="profile-grid">
                    <div className="profile-card info-card profile-card-full">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><UserIcon /> Personal Information</h2>

                        {saveError && <div className="error-msg">{saveError}</div>}

                        <div className="info-list">
                            <div className="info-item">
                                <span className="info-label"><MailIcon /> Email</span>
                                <span className="info-value email-value">{user.email || "Not set"}</span>
                            </div>

                            <div className="info-item">
                                <span className="info-label"><EditIcon /> Bio</span>

                                {isEditing ? (
                                    <div className="bio-editor">
                                        <textarea
                                            className="edit-input edit-textarea bio-textarea"
                                            value={formData.bio}
                                            onChange={handleBioChange}
                                            rows={4}
                                            maxLength={BIO_MAX_LENGTH}
                                            placeholder="Tell others a little about yourself..."
                                        />
                                        <div className="bio-counter">
                                            <span>Maximum {BIO_MAX_LINES} lines</span>
                                            <span>{formData.bio.length}/{BIO_MAX_LENGTH}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <span className="info-value bio-display">
                                        {user.bio || "No bio yet."}
                                    </span>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                                {isSaving ? "Saving..." : <><SaveIcon /> Save Changes</>}
                            </button>
                        )}
                    </div>

                    <div className="profile-card stats-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><StarIcon /> Statistics</h2>

                        <div className="stats-grid stats-grid-compact">
                            <div className="stat-box">
                                <span className="stat-value">
                                    {executedStatisticsLoading ? "..." : executedAlgorithmsCount}
                                </span>
                                <span className="stat-desc">Executed</span>
                            </div>

                            <div className="stat-box">
                                <span className="stat-value">{savedAlgorithmsCount}</span>
                                <span className="stat-desc">Saved</span>
                            </div>
                        </div>
                    </div>

                    <div className="profile-card saved-navigation-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><SaveIcon /> Saved Algorithms</h2>

                        <div className="saved-navigation-content">
                            <div className="saved-navigation-info">
                                <div className="saved-navigation-number">{savedAlgorithmsCount}</div>
                                <p>
                                    Access all the algorithms you've saved and continue exploring them anytime.
                                </p>
                            </div>

                            <button
                                className="action-btn saved-open-btn"
                                onClick={() => navigate("/savedAlgo")}
                            >
                                <SaveIcon /> Open Saved Algorithms
                            </button>
                        </div>
                    </div>

                    <div className="profile-card actions-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><BellIcon /> Quick Actions</h2>

                        <div className="actions-list">
                            <button className="action-btn" onClick={() => navigate("/InputAlgo")}>
                                <AddIcon /> Create Algorithm
                            </button>

                            <button className="action-btn" onClick={() => navigate("/show-algorithms")}>
                                <StarIcon /> View Algorithms
                            </button>

                            {user.role === "CONTRIBUTOR" && (
                                <button className="action-btn" onClick={() => navigate("/myAlgo")}>
                                    <CodeIcon /> My Algorithms
                                </button>
                            )}

                            <button className="action-btn" onClick={() => navigate("/help")}>
                                <ShieldIcon /> Get Help
                            </button>
                        </div>
                    </div>

                    <div className="profile-card advanced-settings-card">
                        <span className="card-neon card-neon-top" />
                        <span className="card-neon card-neon-right" />
                        <span className="card-neon card-neon-bottom" />
                        <span className="card-neon card-neon-left" />

                        <h2 className="card-heading"><ShieldIcon /> Advanced Settings</h2>

                        <div className="advanced-settings-list">
                            <div className="advanced-setting-section">
                                <div className="advanced-setting-header">
                                    <div className="advanced-setting-icon"><LockIcon /></div>
                                    <div className="advanced-setting-text">
                                        <h3>Change Password</h3>
                                        <p>Update your account password and keep your account secure.</p>
                                    </div>
                                </div>

                                {!showPasswordSection ? (
                                    <button
                                        className="settings-action-btn"
                                        onClick={() => {
                                            setPasswordError("");
                                            setPasswordSuccess("");
                                            setShowPasswordSection(true);
                                        }}
                                    >
                                        <LockIcon /> Change Password
                                    </button>
                                ) : (
                                    <div className="password-form advanced-password-form">
                                        {passwordError && <div className="error-msg">{passwordError}</div>}
                                        {passwordSuccess && <div className="success-msg">{passwordSuccess}</div>}

                                        <div className="info-item">
                                            <label className="info-label">Current Password</label>
                                            <input
                                                type="password"
                                                className="edit-input"
                                                value={passwordData.oldPassword}
                                                onChange={(event) => setPasswordData({
                                                    ...passwordData,
                                                    oldPassword: event.target.value,
                                                })}
                                                placeholder="Enter current password"
                                            />
                                        </div>

                                        <div className="info-item">
                                            <label className="info-label">New Password</label>
                                            <input
                                                type="password"
                                                className="edit-input"
                                                value={passwordData.newPassword}
                                                onChange={(event) => setPasswordData({
                                                    ...passwordData,
                                                    newPassword: event.target.value,
                                                })}
                                                placeholder="Enter new password"
                                            />
                                        </div>

                                        <div className="info-item">
                                            <label className="info-label">Confirm New Password</label>
                                            <input
                                                type="password"
                                                className="edit-input"
                                                value={passwordData.confirmPassword}
                                                onChange={(event) => setPasswordData({
                                                    ...passwordData,
                                                    confirmPassword: event.target.value,
                                                })}
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
                                                    setPasswordData({
                                                        oldPassword: "",
                                                        newPassword: "",
                                                        confirmPassword: "",
                                                    });
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

                            <div className="advanced-settings-divider" />

                            <div className="advanced-setting-section advanced-danger-section">
                                <div className="advanced-setting-header">
                                    <div className="advanced-setting-icon danger-setting-icon"><DeleteIcon /></div>
                                    <div className="advanced-setting-text">
                                        <h3 className="danger-setting-title">Delete Account</h3>
                                        <p>Permanently delete your account and all associated data.</p>
                                    </div>
                                </div>

                                <button
                                    className="delete-account-btn advanced-delete-btn"
                                    onClick={() => {
                                        setDeleteError("");
                                        setDeletePassword("");
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    <DeleteIcon /> Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {showDeleteModal && (
                <div
                    className="modal-overlay"
                    onClick={() => {
                        setShowDeleteModal(false);
                        setDeletePassword("");
                        setDeleteError("");
                    }}
                >
                    <div className="modal-content" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <WarningIcon />
                            <h2>Delete Account</h2>
                        </div>

                        <div className="modal-body">
                            <p className="modal-warning">
                                This action <strong>cannot be undone</strong>.
                            </p>
                            <p className="modal-instruction">Enter your password to confirm:</p>

                            <input
                                type="password"
                                className="modal-input"
                                value={deletePassword}
                                onChange={(event) => {
                                    setDeletePassword(event.target.value);
                                    setDeleteError("");
                                }}
                                placeholder="Password"
                            />

                            {deleteError && (
                                <div className="error-msg" style={{ marginTop: "0.8rem" }}>
                                    {deleteError}
                                </div>
                            )}
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