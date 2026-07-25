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
 * Saved Algorithms page – shows all algorithms the user has bookmarked.
 * Any authenticated user can access this page.
 */
export default function SavedAlgo() {
    const navigate = useNavigate();
    const { isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Selected algorithm for the detail modal
    const [selectedAlgo, setSelectedAlgo] = useState(null);

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

    // Fetch saved algorithms
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
            setAlgorithms(Array.isArray(list) ? list : []);
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

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    // Filter by search term
    const filtered = algorithms.filter(
        (algo) =>
            algo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (algo.description && algo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Unsave (remove from saved list)
    const handleUnsave = async (algoId) => {
        try {
            let token = getAccessToken();
            const url = `${ENDPOINTS.SAVED}${algoId}/`;   // DELETE request
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
                    // retry
                    await fetch(url, {
                        method: "DELETE",
                        headers: { Authorization: `Bearer ${newToken}` },
                    });
                } else {
                    throw new Error("Session expired");
                }
            } else if (!res.ok) {
                throw new Error("Failed to unsave");
            }
            // Refresh the list
            fetchSavedAlgorithms();
        } catch (err) {
            alert(err.message);
        }
    };

    // While authentication is checked
    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    // Not authenticated – redirect will happen via useEffect
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
                        <div key={algo.id} className="saved-algo-card" onClick={() => setSelectedAlgo(algo)}>
                            <div className="saved-algo-card-content">
                                <div className="saved-algo-icon"><CodeIcon /></div>
                                <h3 className="saved-algo-title">{algo.title}</h3>
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
                                <h2 className="modal-title">{selectedAlgo.title}</h2>
                                <button className="modal-close-btn" onClick={() => setSelectedAlgo(null)}>
                                    <CloseIcon />
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="algo-meta">
                                    <span><strong>Author:</strong> {selectedAlgo.owner_username || "Unknown"}</span>
                                    <span><strong>Topic:</strong> {selectedAlgo.topic_name || "General"}</span>
                                    <span><strong>Views:</strong> {selectedAlgo.views_count ?? 0}</span>
                                    <span><strong>Created:</strong> {new Date(selectedAlgo.created_at).toLocaleDateString()}</span>
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