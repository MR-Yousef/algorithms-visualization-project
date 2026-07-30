import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import {
    SearchIcon, CodeIcon, EyeIcon, BackIcon, CloseIcon, StarIcon
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";
import "./SavedAlgo.css";

/**
 * SavedAlgo page – displays all algorithms the current user has bookmarked.
 * Fetches full algorithm details for each saved ID and allows un-saving.
 */
export default function SavedAlgo() {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAlgo, setSelectedAlgo] = useState(null);

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

    const fetchAlgorithmById = async (id, token) => {
        const url = ENDPOINTS.ALGORITHM_DETAIL(id);
        let res = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });
        if (res.status === 401) {
            const refresh = getRefreshToken();
            if (refresh) {
                const newToken = await refreshAccessToken(refresh);
                const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                storage.setItem("access_token", newToken);
                res = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${newToken}`,
                        "Content-Type": "application/json",
                    },
                });
            } else {
                throw new Error("Session expired");
            }
        }
        if (!res.ok) throw new Error(`Failed to fetch algorithm ${id}`);
        const data = await res.json();
        return data.data ?? data;
    };

    const fetchSavedAlgorithms = useCallback(async () => {
        try {
            let token = getAccessToken();
            if (!token) {
                setError("You must be logged in to view saved algorithms.");
                setLoading(false);
                return;
            }

            const makeRequest = async (tok) =>
                fetch(ENDPOINTS.SAVED, {
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
            if (!res.ok) throw new Error("Failed to load saved algorithms");

            const json = await res.json();
            const list = json.data ?? json.results ?? json;
            if (!Array.isArray(list)) {
                setAlgorithms([]);
                setLoading(false);
                return;
            }

            const ids = list
                .map(item => {
                    if (typeof item.algorithm === 'number') return item.algorithm;
                    if (item.algorithm && typeof item.algorithm === 'object' && item.algorithm.id)
                        return item.algorithm.id;
                    if (item.id) return item.id;
                    return null;
                })
                .filter(id => id !== null);

            if (ids.length === 0) {
                setAlgorithms([]);
                setLoading(false);
                return;
            }

            const uniqueIds = [...new Set(ids)];
            const freshToken = getAccessToken() || token;
            const algorithmPromises = uniqueIds.map(id => fetchAlgorithmById(id, freshToken));
            const results = await Promise.all(algorithmPromises);

            setAlgorithms(results);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [getAccessToken, getRefreshToken]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedAlgorithms();
        }
    }, [fetchSavedAlgorithms, isAuthenticated]);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    const filtered = algorithms.filter(
        (algo) =>
            (algo.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (algo.description && algo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    /**
     * Unsave (remove bookmark) for the given algorithm ID.
     * Sends a DELETE request to the backend and instantly updates the local UI.
     * @param {number|string} algoId
     */
    const handleUnsave = useCallback(async (algoId) => {
        try {
            let token = getAccessToken();
            const url = ENDPOINTS.UNSAVE_ALGORITHM(algoId);

            // Use DELETE method as per API documentation
            let res = await fetch(url, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                    // No Content-Type needed for DELETE without body
                },
            });

            if (res.status === 401) {
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage = localStorage.getItem("remember_me") === "true" ? localStorage : sessionStorage;
                    storage.setItem("access_token", newToken);
                    res = await fetch(url, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                        },
                    });
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                const message = errorData.detail || errorData.message || `Failed to unsave (status ${res.status})`;
                throw new Error(message);
            }

            // Remove the algorithm from local state immediately
            setAlgorithms(prev => prev.filter(algo => String(algo.id) !== String(algoId)));
        } catch (err) {
            console.error("Unsave error:", err.message);
        }
    }, [getAccessToken, getRefreshToken]);

    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="saved-algorithms-page">
            <Background />
            <Header />
            <main className="saved-algorithms-main">
                <div className="saved-algorithms-header">
                    <h1 className="page-title">
                        <StarIcon /> Saved Algorithms
                    </h1>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search saved algorithms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon"><SearchIcon /></span>
                    </div>
                </div>

                {loading && <div className="loading-container">Loading your saved algorithms...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="saved-algorithms-grid">
                    {filtered.map((algo) => (
                        <div
                            key={algo.id}
                            className="saved-algo-card"
                            onClick={() => setSelectedAlgo(algo)}
                        >
                            <div className="saved-algo-card-content">
                                <div className="saved-algo-icon"><CodeIcon /></div>
                                <h3 className="saved-algo-title">{algo.title || 'Untitled'}</h3>
                                <p className="saved-algo-desc">
                                    {algo.description
                                        ? algo.description.length > 80
                                            ? algo.description.slice(0, 80) + "..."
                                            : algo.description
                                        : "No description"}
                                </p>
                                <div className="saved-algo-footer">
                                    <span className="saved-algo-owner">{algo.owner_username || "Unknown"}</span>
                                    <span className="saved-algo-views"><EyeIcon /> {algo.views_count ?? 0}</span>
                                </div>
                            </div>
                            <button
                                className="unsave-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnsave(algo.id);
                                }}
                                title="Remove from saved"
                            >
                                <CloseIcon />
                            </button>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <p className="no-results">You haven't saved any algorithms yet.</p>
                    )}
                </div>

                {/* Algorithm detail modal */}
                {selectedAlgo && (
                    <div className="modal-overlay" onClick={() => setSelectedAlgo(null)}>
                        <div className="modal-content algo-modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2 className="modal-title">{selectedAlgo.title || 'Untitled'}</h2>
                                <button
                                    className="modal-close-btn"
                                    onClick={() => setSelectedAlgo(null)}
                                >
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="algo-meta">
                                    <span><strong>Author:</strong> {selectedAlgo.owner_username || "Unknown"}</span>
                                    <span><strong>Topic:</strong> {selectedAlgo.topic_name || "General"}</span>
                                    <span><strong>Views:</strong> {selectedAlgo.views_count ?? 0}</span>
                                    <span>
                                        <strong>Created:</strong>{" "}
                                        {new Date(selectedAlgo.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                                <h3>Description</h3>
                                <p>{selectedAlgo.description || "No description provided."}</p>
                                <h3>Code</h3>
                                <div className="code-block">
                                    <pre><code>{selectedAlgo.code || "// No code available"}</code></pre>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}