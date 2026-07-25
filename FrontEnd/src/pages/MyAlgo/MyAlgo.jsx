import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import {
    SearchIcon, CodeIcon, EyeIcon, BackIcon, EditIcon,
    DeleteIcon, SaveIcon, CloseIcon
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";
import "./MyAlgo.css";

export default function MyAlgo() {
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();

    // Determine if the user has the right role
    const canManage = user?.role === "Contributor" || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    // Redirect if not authenticated or lacking role
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate("/login", { replace: true });
            } else if (!canManage) {
                // Optional: redirect to home or show an error page
                navigate("/home", { replace: true });
            }
        }
    }, [authLoading, isAuthenticated, canManage, navigate]);


    // ... rest of your component code (unchanged) ...
    // (the fetching, editing, deleting logic stays the same)

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Edit modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingAlgo, setEditingAlgo] = useState(null);
    const [formData, setFormData] = useState({ title: "", description: "", code: "", topic_name: "" });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Refresh token helper
    const refreshAccessToken = async (refreshToken) => {
        const res = await fetch(ENDPOINTS.REFRESH, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
        });
        if (!res.ok) throw new Error("Session expired");
        const data = await res.json();
        return data.access;
    };

    // Fetch user's published algorithms
    const fetchMyAlgorithms = useCallback(async () => {
        try {
            let token = getAccessToken();
            if (!token) {
                setError("You must be logged in.");
                setLoading(false);
                return;
            }

            const makeRequest = async (tok) =>
                fetch(ENDPOINTS.MY_PUBLISHED, {
                    headers: {
                        Authorization: `Bearer ${tok}`,
                        "Content-Type": "application/json",
                    },
                });

            let res = await makeRequest(token);

            if (res.status === 401) {
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                    storage.setItem("access_token", newToken);
                    res = await makeRequest(newToken);
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            }

            if (!res.ok) throw new Error("Failed to load your algorithms");

            const json = await res.json();
            const list = json.data ?? json.results ?? json;
            setAlgorithms(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, getRefreshToken]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMyAlgorithms();
        }
    }, [fetchMyAlgorithms, isAuthenticated]);

    // Open edit modal with prefilled data
    const openEditModal = (algo) => {
        setEditingAlgo(algo);
        setFormData({
            title: algo.title || "",
            description: algo.description || "",
            code: algo.code || "",
            topic_name: algo.topic_name || "",
        });
        setFormError("");
        setShowEditModal(true);
    };
    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated || !canManage) {
        // The useEffect will handle the redirect, so just return null here
        return null;
    }

    // Submit edited algorithm
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            let token = getAccessToken();
            const url = `${ENDPOINTS.ALGORITHMS}${editingAlgo.id}/update/`;

            const res = await fetch(url, {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (res.status === 401) {
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                    storage.setItem("access_token", newToken);
                    const retryRes = await fetch(url, {
                        method: "PUT",
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    });
                    if (!retryRes.ok) {
                        const errData = await retryRes.json().catch(() => ({}));
                        throw new Error(errData.detail || "Update failed");
                    }
                } else {
                    throw new Error("Session expired");
                }
            } else if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Update failed");
            }

            setShowEditModal(false);
            fetchMyAlgorithms();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Delete an algorithm
    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            let token = getAccessToken();
            const url = `${ENDPOINTS.ALGORITHMS}${id}/delete/`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === 401) {
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                    storage.setItem("access_token", newToken);
                    const retryRes = await fetch(url, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${newToken}` },
                    });
                    if (!retryRes.ok) throw new Error("Delete failed");
                } else {
                    throw new Error("Session expired");
                }
            } else if (!res.ok) {
                throw new Error("Delete failed");
            }

            setDeleteTarget(null);
            fetchMyAlgorithms();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // Filter by search term
    const filtered = algorithms.filter(
        (algo) =>
            algo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (algo.description && algo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="my-algorithms-page">
            <Background />
            <Header />
            <main className="my-algorithms-main">
                <div className="my-algorithms-header">
                    <h1 className="page-title">
                        <CodeIcon /> My Published Algorithms
                    </h1>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search my algorithms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon"><SearchIcon /></span>
                    </div>
                </div>

                {loading && <div className="loading-container">Loading your algorithms...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="my-algorithms-grid">
                    {filtered.map((algo) => (
                        <div key={algo.id} className="my-algo-card">
                            <div className="my-algo-card-content">
                                <div className="my-algo-icon"><CodeIcon /></div>
                                <h3 className="my-algo-title">{algo.title}</h3>
                                <p className="my-algo-desc">
                                    {algo.description
                                        ? algo.description.length > 80
                                            ? algo.description.slice(0, 80) + "..."
                                            : algo.description
                                        : "No description"}
                                </p>
                                <div className="my-algo-footer">
                                    <span className="my-algo-views"><EyeIcon /> {algo.views_count ?? 0}</span>
                                </div>
                            </div>
                            <div className="my-algo-controls">
                                <button className="icon-btn" onClick={() => openEditModal(algo)} title="Edit">
                                    <EditIcon />
                                </button>
                                <button className="icon-btn" onClick={() => setDeleteTarget(algo.id)} title="Delete">
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <p className="no-results">You haven't published any algorithms yet.</p>
                    )}
                </div>

                {/* Edit Modal */}
                {showEditModal && (
                    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
                        <div className="modal-content algo-edit-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Edit Algorithm</h2>
                                <button className="modal-close-btn" onClick={() => setShowEditModal(false)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="modal-body">
                                {formError && <div className="error-msg">{formError}</div>}
                                <form onSubmit={handleEditSubmit}>
                                    <div className="field-group">
                                        <label className="field-label">Title</label>
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Description</label>
                                        <textarea
                                            className="edit-input edit-textarea"
                                            rows="3"
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Code</label>
                                        <textarea
                                            className="edit-input edit-textarea"
                                            rows="6"
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="field-group">
                                        <label className="field-label">Topic</label>
                                        <input
                                            type="text"
                                            className="edit-input"
                                            value={formData.topic_name}
                                            onChange={(e) => setFormData({ ...formData, topic_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-actions">
                                        <button type="submit" className="save-btn" disabled={saving}>
                                            {saving ? "Saving..." : <><SaveIcon /> Update</>}
                                        </button>
                                        <button
                                            type="button"
                                            className="cancel-btn"
                                            onClick={() => setShowEditModal(false)}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteTarget && (
                    <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                        <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Delete Algorithm</h2>
                                <button className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="modal-body">
                                <p className="danger-description">
                                    Are you sure you want to permanently delete this algorithm?
                                </p>
                                <div className="modal-actions">
                                    <button className="modal-cancel-btn" onClick={() => setDeleteTarget(null)}>
                                        Cancel
                                    </button>
                                    <button
                                        className="modal-delete-btn"
                                        onClick={() => handleDelete(deleteTarget)}
                                        disabled={deleting}
                                    >
                                        {deleting ? "Deleting..." : <><DeleteIcon /> Delete</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}