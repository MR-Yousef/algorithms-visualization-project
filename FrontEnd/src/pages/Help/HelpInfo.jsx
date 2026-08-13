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

/**
 * Displays all documentation articles for a given type (Language / Flowchart / Input).
 * Admins can create, edit, and delete articles.
 */
export default function HelpDetail() {
    const { type } = useParams();
    const navigate = useNavigate();
    const { user, isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedDoc, setSelectedDoc] = useState(null);

    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type_documintation: "LANGUAGE",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    // ── Scroll‑to‑top state ──
    const [showScrollTop, setShowScrollTop] = useState(false);

    const typeMap = { language: "LANGUAGE", flowchart: "FLOWCHART", input: "INPUT" };
    const apiType = typeMap[type] || "LANGUAGE";
    const titleMap = { language: "Language Guide", flowchart: "Flowchart Guide", input: "Input Methods" };
    const pageTitle = titleMap[type] || "Documentation";

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
        if (isAuthenticated) {
            fetchDocs();
        }
    }, [fetchDocs, isAuthenticated]);

    const openCreateModal = () => {
        setEditingDoc(null);
        setFormData({ title: "", content: "", type_documintation: apiType });
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
            setSelectedDoc(null);
            fetchDocs();
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        setDeleting(true);
        try {
            let token = getAccessToken();
            const url = `${ENDPOINTS.DOCUMENTATION}${id}/delete/`;
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
            setSelectedDoc(null);
            fetchDocs();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ── Scroll listener ──
    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const truncateContent = (text, maxLength = 190) => {
        if (!text) return "";
        const clean = text.trim().replace(/\s+/g, " ");
        return clean.length <= maxLength ? clean : clean.substring(0, maxLength) + "…";
    };

    if (authLoading) return <div className="help-loading-container">Checking authentication...</div>;
    if (!isAuthenticated) return null;

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

                <div className="help-admin-actions">
                    <button className="help-back-btn" onClick={() => navigate("/help")}>
                        <BackIcon /> Back to Help Page
                    </button>
                    {isAdmin && (
                        <button className="help-create-btn" onClick={openCreateModal}>
                            <AddIcon /> New Document
                        </button>
                    )}
                </div>

                {loading && <div className="help-loading-container">Loading...</div>}
                {error && <div className="help-error-msg">{error}</div>}

                <div className="help-articles-grid">
                    {docs.map((doc) => (
                        <article
                            key={doc.id}
                            className="help-doc-article"
                            onClick={() => setSelectedDoc(doc)}
                        >
                            <h2 className="help-doc-title">{doc.title}</h2>
                            <p className="help-doc-content">{truncateContent(doc.content)}</p>
                            {isAdmin && (
                                <div className="help-admin-controls">
                                    <button
                                        className="help-icon-btn"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditModal(doc);
                                        }}
                                        title="Edit"
                                    >
                                        <EditIcon />
                                    </button>
                                    <button
                                        className="help-icon-btn"
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

            {/* Scroll‑to‑top button */}
            {showScrollTop && (
                <button
                    className="scroll-to-top-btn"
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="18 15 12 9 6 15" />
                    </svg>
                </button>
            )}

            {selectedDoc && (
                <div className="help-modal-overlay" onClick={() => setSelectedDoc(null)}>
                    <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="help-modal-header">
                            <h2 className="help-modal-title">{selectedDoc.title}</h2>
                            <button
                                className="help-modal-close-btn"
                                onClick={() => setSelectedDoc(null)}
                            >
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="help-modal-body help-documentation-body">
                            <p style={{ whiteSpace: "pre-wrap", margin: 0, fontSize: "1.4rem", color: "white" }}>{(selectedDoc.content || "").trim()}</p>
                            {isAdmin && (
                                <div className="help-admin-controls" style={{ marginTop: "1.5rem" }}>
                                    <button className="help-icon-btn" onClick={() => { openEditModal(selectedDoc); }} title="Edit">
                                        <EditIcon />
                                    </button>
                                    <button className="help-icon-btn" onClick={() => { setDeleteTarget(selectedDoc.id); setSelectedDoc(null); }} title="Delete">
                                        <DeleteIcon />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showFormModal && (
                <div className="help-modal-overlay" onClick={() => setShowFormModal(false)}>
                    <div className="help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="help-modal-header">
                            <h2 className="help-modal-title">
                                {editingDoc ? "Edit Document" : "New Document"}
                            </h2>
                            <button className="help-modal-close-btn" onClick={() => setShowFormModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="help-modal-body">
                            {formError && <div className="help-error-msg">{formError}</div>}
                            <form onSubmit={handleFormSubmit}>
                                <div className="help-field-group">
                                    <label className="help-field-label">Title</label>
                                    <input
                                        type="text"
                                        className="help-edit-input"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="help-field-group">
                                    <label className="help-field-label">Content</label>
                                    <textarea
                                        className="help-edit-input help-edit-textarea"
                                        rows="6"
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="help-field-group">
                                    <label className="help-field-label">Type</label>
                                    <select
                                        className="help-edit-input"
                                        value={formData.type_documintation}
                                        onChange={(e) => setFormData({ ...formData, type_documintation: e.target.value })}
                                    >
                                        <option value="LANGUAGE">Language Guide</option>
                                        <option value="FLOWCHART">Flowchart Guide</option>
                                        <option value="INPUT">Input Methods</option>
                                    </select>
                                </div>
                                <div className="help-form-actions">
                                    <button type="submit" className="help-save-btn" disabled={saving}>
                                        {saving ? "Saving..." : <><SaveIcon /> {editingDoc ? "Update" : "Create"}</>}
                                    </button>
                                    <button
                                        type="button"
                                        className="help-cancel-btn"
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

            {deleteTarget && (
                <div className="help-modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="help-delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="help-modal-header">
                            <h2 className="help-modal-title">Delete Document</h2>
                            <button className="help-modal-close-btn" onClick={() => setDeleteTarget(null)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="help-modal-body">
                            <p className="help-danger-description">
                                Are you sure you want to permanently delete this document?
                            </p>
                            <div className="help-modal-actions">
                                <button className="help-modal-cancel-btn" onClick={() => setDeleteTarget(null)}>
                                    Cancel
                                </button>
                                <button
                                    className="help-modal-delete-btn"
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