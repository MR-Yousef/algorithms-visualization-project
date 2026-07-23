import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Help.css";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import {
    BackIcon, EditIcon, DeleteIcon, AddIcon, SaveIcon, CloseIcon
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";

export default function HelpDetail() {
    const { type } = useParams(); // e.g. 'language', 'flowchart', 'input'
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();

    // ---- Protect the page – redirect to login if not authenticated ----
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Admin check (only meaningful after auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selected article for viewing in a modal
    const [selectedDoc, setSelectedDoc] = useState(null);

    // Create / Edit modal state (shared)
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type_documintation: "LANGUAGE",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // Delete confirmation modal state
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // Map URL param to API type and a nice title
    const typeMap = {
        language: "LANGUAGE",
        flowchart: "FLOWCHART",
        input: "INPUT",
    };
    const apiType = typeMap[type] || "LANGUAGE";
    const titleMap = {
        language: "Language Guide",
        flowchart: "Flowchart Guide",
        input: "Input Methods",
    };
    const pageTitle = titleMap[type] || "Documentation";

    // Token refresh helper
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

    // Fetch all documentation and filter by the current type
    const fetchDocs = useCallback(async () => {
        try {
            let token = getAccessToken();
            if (!token) {
                setError("You must be logged in to view documentation.");
                setLoading(false);
                return;
            }

            const makeRequest = async (tok) =>
                fetch(ENDPOINTS.DOCUMENTATION, {
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

            if (!res.ok) throw new Error("Failed to load documentation");

            const json = await res.json();
            const list = json.data ?? json.results ?? json;
            const allDocs = Array.isArray(list) ? list : [];
            // Keep only articles of the current type
            const filtered = allDocs.filter(
                (doc) => (doc.type_documintation || "").toUpperCase() === apiType
            );
            setDocs(filtered);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, getRefreshToken, apiType]);

    useEffect(() => {
        // Only fetch documentation if the user is authenticated
        if (isAuthenticated) {
            fetchDocs();
        }
    }, [fetchDocs, isAuthenticated]);

    // ---------- Form handlers ----------
    const openCreateModal = () => {
        setEditingDoc(null);
        setFormData({
            title: "",
            content: "",
            type_documintation: apiType,   // pre-select the current type
        });
        setFormError("");
        setShowFormModal(true);
    };

    const openEditModal = (doc) => {
        setEditingDoc(doc);
        setFormData({
            title: doc.title || "",
            content: doc.content || "",
            type_documintation: doc.type_documintation || apiType,
        });
        setFormError("");
        setShowFormModal(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setFormError("");

        try {
            let token = getAccessToken();
            const url = editingDoc
                ? `${ENDPOINTS.DOCUMENTATION}${editingDoc.id}/update/`
                : `${ENDPOINTS.DOCUMENTATION}create/`;
            const method = editingDoc ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
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
                        method,
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(formData),
                    });
                    if (!retryRes.ok) {
                        const errData = await retryRes.json().catch(() => ({}));
                        throw new Error(errData.detail || "Operation failed");
                    }
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            } else if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || "Operation failed");
            }

            setShowFormModal(false);
            setSelectedDoc(null);   // close detail modal if open
            fetchDocs();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ---------- Delete handler ----------
    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            let token = getAccessToken();
            const url = `${ENDPOINTS.DOCUMENTATION}${id}/delete/`;

            const res = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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
            setSelectedDoc(null);
            fetchDocs();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ----- If auth is still loading, show a loader -----
    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    // ----- If not authenticated, don't render anything (will redirect) -----
    if (!isAuthenticated) {
        return null;
    }

    return (
        <>
            <Background />
            <Header />
            <div className="help-main">
                <div className="help-title-section">
                    <h1 className="help-main-title">{pageTitle}</h1>
                    <p className="help-subtitle">
                        {docs.length} article{docs.length !== 1 ? "s" : ""}
                    </p>
                </div>

                <div className="admin-actions">
                    <button className="back-btn" onClick={() => navigate("/help")}>
                        <BackIcon /> Back to Help
                    </button>
                    {isAdmin && (
                        <button className="create-btn" onClick={openCreateModal}>
                            <AddIcon /> New Document
                        </button>
                    )}
                </div>

                {loading && <div className="loading-container">Loading...</div>}
                {error && <div className="error-msg">{error}</div>}

                {/* List of articles */}
                <div className="articles-list">
                    {docs.map((doc) => (
                        <article
                            key={doc.id}
                            className="doc-article"
                            onClick={() => setSelectedDoc(doc)}
                        >
                            <h2>{doc.title}</h2>
                            <p style={{ whiteSpace: "pre-wrap" }}>{doc.content}</p>
                            {isAdmin && (
                                <div className="admin-controls">
                                    <button
                                        className="icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(doc);
                                        }}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDeleteTarget(doc.id);
                                        }}
                                        title="Delete"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            )}
                        </article>
                    ))}
                    {!loading && docs.length === 0 && (
                        <p className="no-results">No articles found for this section.</p>
                    )}
                </div>
            </div>

            {/* Article detail modal (opens when clicking an article) */}
            {selectedDoc && (
                <div className="modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedDoc.title}</h2>
                            <button
                                className="modal-close-btn"
                                onClick={() => setSelectedDoc(null)}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body documentation-body">
                            <p style={{ whiteSpace: "pre-wrap" }}>{selectedDoc.content}</p>
                            {isAdmin && (
                                <div className="admin-controls" style={{ marginTop: "1.5rem" }}>
                                    <button
                                        className="icon-btn"
                                        onClick={() => {
                                            openEditModal(selectedDoc);
                                        }}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className="icon-btn"
                                        onClick={() => {
                                            setDeleteTarget(selectedDoc.id);
                                            setSelectedDoc(null); // close detail modal before showing delete confirmation
                                        }}
                                        title="Delete"
                                    >
                                        <DeleteIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Create/Edit modal (same as before) */}
            {showFormModal && (
                <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">
                                {editingDoc ? "Edit Document" : "New Document"}
                            </h2>
                            <button className="modal-close-btn" onClick={() => setShowFormModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            {formError && <div className="error-msg">{formError}</div>}
                            <form onSubmit={handleFormSubmit}>
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
                                    <label className="field-label">Content</label>
                                    <textarea
                                        className="edit-input edit-textarea"
                                        rows="6"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="field-group">
                                    <label className="field-label">Type</label>
                                    <select
                                        className="edit-input"
                                        value={formData.type_documintation}
                                        onChange={(e) => setFormData({ ...formData, type_documintation: e.target.value })}
                                    >
                                        <option value="LANGUAGE">Language Guide</option>
                                        <option value="FLOWCHART">Flowchart Guide</option>
                                        <option value="INPUT">Input Methods</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button type="submit" className="save-btn" disabled={saving}>
                                        {saving ? "Saving..." : <><SaveIcon /> {editingDoc ? "Update" : "Create"}</>}
                                    </button>
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setShowFormModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-content delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Delete Document</h2>
                            <button className="modal-close-btn" onClick={() => setDeleteTarget(null)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="danger-description">
                                Are you sure you want to permanently delete this document?
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
        </>
    );
}