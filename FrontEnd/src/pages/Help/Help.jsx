import { useState, useEffect } from "react";
import "./Help.css";
import InfoCard from "../../Component/InfoCard/InfoCard";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import { sections } from "../../assets/data/InfoSectios";
import { BookIcon, BackIcon, EditIcon, DeleteIcon, AddIcon } from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";

export default function Help() {
    const [selectedSection, setSelectedSection] = useState(null);   // the card whose modal is open
    const [apiDocs, setApiDocs] = useState([]);                     // all documents from API
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const { user, getAccessToken, getRefreshToken } = useAuth();

    // true if the current user can manage documentation (admin / superadmin)
    const isAdmin = user?.role === "ADMIN" || user?.role === "SUPERADMIN";

    // Helper to refresh an expired access token
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

    // Load all documentation sections from the API
    useEffect(() => {
        const fetchDocs = async () => {
            try {
                let token = getAccessToken();
                if (!token) {
                    setError("You must be logged in to view documentation.");
                    setLoading(false);
                    return;
                }

                // send the request with the current token
                const makeRequest = async (tok) =>
                    fetch(ENDPOINTS.DOCUMENTATION, {
                        headers: {
                            Authorization: `Bearer ${tok}`,
                            "Content-Type": "application/json",
                        },
                    });

                let res = await makeRequest(token);

                // if the token was expired, try to refresh it once
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
                // the API returns an array directly (or inside data/results)
                const list = json.data ?? json.results ?? json;
                setApiDocs(Array.isArray(list) ? list : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [getAccessToken, getRefreshToken]);

    // Group the fetched documents by their type_documintation field
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
        // ignore any other types (like empty strings)
    });

    // Build the final array of sections that will be rendered as cards.
    // For LANGUAGE, FLOWCHART and INPUT we create a JSX list of articles.
    const mergedSections = sections.map((section) => {
        // Map section title to the API type string
        const typeMap = {
            "Language Guide": "LANGUAGE",
            "Flowchart Guide": "FLOWCHART",
            "Input Methods": "INPUT",
        };
        const apiType = typeMap[section.title];

        if (apiType) {
            const docsOfType = groupedDocs[apiType] || [];
            if (docsOfType.length > 0) {
                // Replace the static content with a dynamic list of all articles
                return {
                    ...section,
                    description: `${docsOfType.length} article${docsOfType.length > 1 ? "s" : ""}`,
                    details: (
                        <div>
                            {docsOfType.map((doc) => (
                                <article key={doc.id} style={{ marginBottom: "1.5rem" }}>
                                    <h3>{doc.title}</h3>
                                    <p style={{ whiteSpace: "pre-wrap" }}>{doc.content}</p>
                                </article>
                            ))}
                        </div>
                    ),
                    isApiDoc: true,   // so admin buttons can appear if needed
                };
            }
            // if no documents of this type yet, keep the original section (details might be null)
        }

        // Roles & Permissions or cards with no API data – keep unchanged
        return { ...section, isApiDoc: false };
    });

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

                {/* Admin-only create button */}
                {isAdmin && (
                    <div className="admin-actions">
                        <button className="create-btn">
                            <AddIcon /> New Document
                        </button>
                    </div>
                )}

                {loading && <div className="loading-container">Loading documentation...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="info-cards-grid">
                    {mergedSections.map((item, index) => (
                        <div
                            key={item.title + index}
                            className="info-card-wrapper"
                            onClick={() => setSelectedSection(item)}
                        >
                            <InfoCard
                                index={index}
                                icon={item.icon}
                                title={item.title}
                                description={item.description}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal showing the full content of a card */}
            {selectedSection && (
                <div className="modal-overlay" onClick={() => setSelectedSection(null)}>
                    <div className="modal-content help-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <span className="modal-icon">{selectedSection.icon}</span>
                            <h2 className="modal-title">{selectedSection.title}</h2>
                            <div className="modal-header-actions">
                                {isAdmin && selectedSection.isApiDoc && (
                                    <>
                                        <button className="icon-btn" title="Edit">
                                            <EditIcon />
                                        </button>
                                        <button className="icon-btn" title="Delete">
                                            <DeleteIcon />
                                        </button>
                                    </>
                                )}
                                <button className="modal-close-btn" onClick={() => setSelectedSection(null)}>
                                    <BackIcon />
                                </button>
                            </div>
                        </div>
                        <div className="modal-body documentation-body">
                            {selectedSection.details}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}