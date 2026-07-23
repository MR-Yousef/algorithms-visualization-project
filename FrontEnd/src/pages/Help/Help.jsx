import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Help.css";
import InfoCard from "../../Component/InfoCard/InfoCard";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import { sections } from "../../assets/data/InfoSectios";
import {
    BookIcon, BackIcon, EditIcon, DeleteIcon, AddIcon, SaveIcon, CloseIcon
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";

export default function Help() {
    const [selectedSection, setSelectedSection] = useState(null);
    const [apiDocs, setApiDocs] = useState([]);
    const [loading, setLoading] = useState(true);         // loading docs
    const [error, setError] = useState("");
    const { user, isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();
    const navigate = useNavigate();

    // Protect the page – redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // Check if the current user has admin privileges (only after auth)
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    // ---- State for create / edit modal ----
    const [showFormModal, setShowFormModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState(null);
    const [formData, setFormData] = useState({
        title: "",
        content: "",
        type_documintation: "LANGUAGE",
    });
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    // ---- Delete confirmation ----
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

    // ---- Fetch all documentation from the API ----
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
            setApiDocs(Array.isArray(list) ? list : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, getRefreshToken]);

    useEffect(() => {
        // Only fetch docs if authenticated
        if (isAuthenticated) {
            fetchDocs();
        }
    }, [fetchDocs, isAuthenticated]);

    // ---- Form handlers ----
    const openCreateModal = () => {
        setEditingDoc(null);
        setFormData({ title: "", content: "", type_documintation: "LANGUAGE" });
        setFormError("");
        setShowFormModal(true);
    };

    const openEditModal = (doc) => {
        setEditingDoc(doc);
        setFormData({
            title: doc.title || "",
            content: doc.content || "",
            type_documintation: doc.type_documintation || "LANGUAGE",
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
                // Attempt token refresh
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                    storage.setItem("access_token", newToken);
                    // Retry with new token
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
            fetchDocs();  // Refresh the list after successful operation
        } catch (err) {
            setFormError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ---- Delete handler ----
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
            fetchDocs();  // Refresh list
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ---- Group documents by their type ----
    const groupedDocs = {
        LANGUAGE: [],
        FLOWCHART: [],
        INPUT: [],
    };
    apiDocs.forEach((doc) => {
        const type = (doc.type_documintation || "").toUpperCase();
        if (groupedDocs.hasOwnProperty(type)) {
            groupedDocs[type].push(doc);
        }
    });

    // ---- Merge static sections with dynamic content ----
    const mergedSections = sections.map((section) => {
        const typeMap = {
            "Language Guide": "LANGUAGE",
            "Flowchart Guide": "FLOWCHART",
            "Input Methods": "INPUT",
        };
        const apiType = typeMap[section.title];

        if (apiType) {
            const docsOfType = groupedDocs[apiType] || [];
            if (docsOfType.length > 0) {
                return {
                    ...section,
                    description: `${docsOfType.length} article${docsOfType.length > 1 ? "s" : ""}`,
                    details: (
                        <div>
                            {docsOfType.map((doc) => (
                                <article
                                    key={doc.id}
                                    style={{
                                        marginBottom: "1.5rem",
                                        paddingBottom: "1rem",
                                        borderBottom: "1px solid rgba(0,245,228,0.1)",
                                    }}
                                >
                                    <h3>{doc.title}</h3>
                                    <p style={{ whiteSpace: "pre-wrap" }}>{doc.content}</p>
                                    {isAdmin && (
                                        <div
                                            className="admin-controls"
                                            onClick={(e) => e.stopPropagation()}
                                        >
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
                        </div>
                    ),
                    isApiDoc: true,
                };
            }
        }
        return { ...section, isApiDoc: false };
    });

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
                    <h1 className="help-main-title">
                        <span className="title-icon"><BookIcon /></span>
                        Help & Documentation
                    </h1>
                    <p className="help-subtitle">
                        Click on a topic to view the full guide.
                    </p>
                </div>

                {/* Admin: Create new documentation */}
                {isAdmin && (
                    <div className="admin-actions">
                        <button className="create-btn" onClick={openCreateModal}>
                            <AddIcon /> New Document
                        </button>
                    </div>
                )}

                {loading && <div className="loading-container">Loading documentation...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="info-cards-grid">
                    {mergedSections.map((item, index) => {
                        const typeMap = {
                            "Language Guide": "language",
                            "Flowchart Guide": "flowchart",
                            "Input Methods": "input",
                        };
                        const routeType = typeMap[item.title];
                        return (
                            <div
                                key={item.title + index}
                                className="info-card-wrapper"
                                onClick={() => {
                                    if (routeType) {
                                        navigate(`/help/${routeType}`);
                                    } else {
                                        // Roles & Permissions – open modal
                                        setSelectedSection(item);
                                    }
                                }}
                            >
                                <InfoCard
                                    index={index}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Section detail modal (Roles & Permissions) */}
            {selectedSection && (
                <div className="modal-overlay" onClick={() => setSelectedSection(null)}>
                    <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-icon">{selectedSection.icon}</span>
                            <h2 className="modal-title">{selectedSection.title}</h2>
                            <button className="modal-close-btn" onClick={() => setSelectedSection(null)}>
                                <BackIcon />
                            </button>
                        </div>
                        <div className="modal-body documentation-body">
                            {selectedSection.details}
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
                                {/* ... form fields ... */}
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
                            <p className="danger-description">Are you sure you want to permanently delete this document?</p>
                            <div className="modal-actions">
                                <button
                                    className="modal-cancel-btn"
                                    onClick={() => setDeleteTarget(null)}
                                >
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