import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { SearchIcon, CodeIcon, EyeIcon, BackIcon } from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";
import "./ShowAlgorithms.css";

export default function ShowAlgorithms() {
    const { isAuthenticated, loading: authLoading, getAccessToken, getRefreshToken } = useAuth();
    const navigate = useNavigate();

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAlgo, setSelectedAlgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Save feature states
    const [savingId, setSavingId] = useState(null);
    const [saveMessage, setSaveMessage] = useState("");

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, authLoading, navigate]);

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

    // Fetch algorithms (unchanged)
    useEffect(() => {
        if (!isAuthenticated) return;

        const fetchAlgorithms = async () => {
            try {
                let token = getAccessToken();
                if (!token) {
                    setError("You must be logged in to view algorithms.");
                    setLoading(false);
                    return;
                }

                const makeRequest = async (tok) =>
                    fetch(ENDPOINTS.ALGORITHMS, {
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
                        const storage =
                            localStorage.getItem("remember_me") === "true"
                                ? localStorage
                                : sessionStorage;
                        storage.setItem("access_token", newToken);
                        res = await makeRequest(newToken);
                    } else {
                        throw new Error("Session expired. Please log in again.");
                    }
                }

                if (!res.ok) throw new Error("Failed to load algorithms");

                const json = await res.json();
                const list = json.data ?? json.results ?? json;
                setAlgorithms(Array.isArray(list) ? list : []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchAlgorithms();
    }, [isAuthenticated, getAccessToken, getRefreshToken]);

    /**
     * Save (bookmark) an algorithm.
     * Automatically refreshes the access token if it has expired.
     * @param {number} algoId - Algorithm ID
     */
    const handleSave = async (algoId) => {
        setSavingId(algoId);
        setSaveMessage("");

        try {
            let token = getAccessToken();
            const url = ENDPOINTS.SAVE_ALGORITHM(algoId);

            // First attempt
            let res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            // If token expired, refresh and retry
            if (res.status === 401) {
                const refresh = getRefreshToken();
                if (refresh) {
                    const newToken = await refreshAccessToken(refresh);
                    const storage =
                        localStorage.getItem("remember_me") === "true"
                            ? localStorage
                            : sessionStorage;
                    storage.setItem("access_token", newToken);
                    res = await fetch(url, {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${newToken}`,
                            "Content-Type": "application/json",
                        },
                    });
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            }

            // Handle server errors that are not 401
            if (!res.ok) {
                // Try to read the error message from the response body
                const errorData = await res.json().catch(() => ({}));
                const msg = errorData.detail || errorData.message || `Server error (status ${res.status})`;

                // Special handling for 500 – notify the user that the server crashed
                if (res.status === 500) {
                    throw new Error("The server encountered an internal error. This algorithm may already be saved or the server is busy. Please try again.");
                }
                throw new Error(msg);
            }

            // Success
            setSaveMessage("Algorithm saved successfully!");
            setSavingId(null);
            setTimeout(() => setSaveMessage(""), 2000);
        } catch (err) {
            setSaveMessage(err.message);
            setSavingId(null);
        }
    };

    /**
     * Run algorithm – navigates to InputAlgo with the algorithm code.
     * @param {object} algo - Algorithm object
     */
    const handleRun = (algo) => {
        setSelectedAlgo(null);
        navigate("/InputAlgo", { state: { code: algo.code } });
    };

    // Filter by title or description
    const filtered = algorithms.filter(
        (algo) =>
            (algo.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (algo.description && algo.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="show-algorithms-page">
            <Background />
            <Header />

            <main className="algorithms-main">
                <div className="algorithms-header">
                    <h1 className="page-title">
                        <CodeIcon />
                        Algorithms
                    </h1>
                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search algorithms..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <span className="search-icon"><SearchIcon /></span>
                    </div>
                </div>

                {loading && <div className="loading-container">Loading algorithms...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="algorithms-grid">
                    {filtered.map((algo) => (
                        <div
                            key={algo.id}
                            className="algo-card"
                            onClick={() => setSelectedAlgo(algo)}
                        >
                            <span className="card-neon card-neon-top" />
                            <span className="card-neon card-neon-right" />
                            <span className="card-neon card-neon-bottom" />
                            <span className="card-neon card-neon-left" />

                            <div className="algo-card-content">
                                <div className="algo-icon">
                                    <CodeIcon />
                                </div>
                                <h3 className="algo-name">{algo.title}</h3>
                                <p className="algo-desc">
                                    {algo.description
                                        ? algo.description.length > 80
                                            ? algo.description.slice(0, 80) + "..."
                                            : algo.description
                                        : "No description"}
                                </p>
                                {/* Topic badge */}
                                {algo.topic_name && (
                                    <span className="algo-topic-badge">{algo.topic_name}</span>
                                )}
                                <div className="algo-footer">
                                    <span className="algo-owner">{algo.owner_username || "Unknown"}</span>
                                    <span className="algo-views"><EyeIcon /> {algo.views_count ?? 0}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {!loading && filtered.length === 0 && (
                        <p className="no-results">No algorithms found.</p>
                    )}
                </div>
            </main>

            {/* Algorithm details modal */}
            {selectedAlgo && (
                <div className="modal-overlay" onClick={() => setSelectedAlgo(null)}>
                    <div className="modal-content algo-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedAlgo.title}</h2>
                            <button className="modal-close-btn" onClick={() => setSelectedAlgo(null)}>
                                <BackIcon />
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

                            {/* Action buttons */}
                            <div className="modal-actions" style={{ marginTop: "1.5rem", display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
                                {saveMessage && (
                                    <div className={`save-message ${saveMessage.includes("successfully") ? "success" : "error"}`}
                                        style={{ marginRight: "auto" }}>
                                        {saveMessage}
                                    </div>
                                )}
                                <button className="run-btn" onClick={() => handleRun(selectedAlgo)}>
                                    Run Code
                                </button>
                                <button
                                    className="save-btn"
                                    onClick={() => handleSave(selectedAlgo.id)}
                                    disabled={savingId === selectedAlgo.id}
                                >
                                    {savingId === selectedAlgo.id ? "Saving..." : "Save Algorithm"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}