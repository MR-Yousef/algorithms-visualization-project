import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import { SearchIcon, CodeIcon, BackIcon } from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";
import {
    apiRequest,
    extractList,
    unwrapData,
} from "../../services/api.service";
import "./ShowAlgorithms.css";

function topicNames(algorithm) {
    if (Array.isArray(algorithm?.topic_names)) {
        return algorithm.topic_names.filter(Boolean);
    }

    if (Array.isArray(algorithm?.topics)) {
        return algorithm.topics
            .map((topic) => {
                if (typeof topic === "string") return topic;
                return topic?.name ?? topic?.title ?? topic?.topic_name ?? null;
            })
            .filter(Boolean);
    }

    const single =
        algorithm?.topic_name ??
        algorithm?.topic?.name ??
        algorithm?.topic?.title ??
        null;

    return single ? [single] : [];
}

export default function ShowAlgorithms() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAlgo, setSelectedAlgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [error, setError] = useState("");

    const [savingId, setSavingId] = useState(null);
    const [runningId, setRunningId] = useState(null);
    const [actionMessage, setActionMessage] = useState("");

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [authLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (!isAuthenticated) return;

        let cancelled = false;

        const loadAlgorithms = async () => {
            setLoading(true);
            setError("");

            try {
                const payload = await apiRequest(ENDPOINTS.ALGORITHMS);
                const list = extractList(payload);

                if (!cancelled) setAlgorithms(list);
            } catch (requestError) {
                if (!cancelled) setError(requestError.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        loadAlgorithms();

        return () => {
            cancelled = true;
        };
    }, [isAuthenticated]);

    const openAlgorithm = async (algorithm) => {
        setSelectedAlgo(algorithm);
        setActionMessage("");
        setDetailLoading(true);

        try {
            const payload = await apiRequest(
                ENDPOINTS.ALGORITHM_DETAIL(algorithm.id)
            );
            const detail = unwrapData(payload) ?? algorithm;
            setSelectedAlgo(detail);
        } catch (requestError) {
            console.error("Failed to load algorithm detail:", requestError);
        } finally {
            setDetailLoading(false);
        }
    };

    const handleSave = async (algorithmId) => {
        setSavingId(algorithmId);
        setActionMessage("");

        try {
            await apiRequest(ENDPOINTS.SAVE_ALGORITHM(algorithmId), {
                method: "POST",
            });
            setActionMessage("Algorithm saved successfully!");
        } catch (requestError) {
            setActionMessage(requestError.message);
        } finally {
            setSavingId(null);
        }
    };

    const handleRun = async (algorithm) => {
        setRunningId(algorithm.id);
        setActionMessage("");

        try {
            await apiRequest(ENDPOINTS.EXECUTE_ALGORITHM(algorithm.id), {
                method: "POST",
            });

            setSelectedAlgo(null);
            navigate("/InputAlgo", {
                state: {
                    code: algorithm.code || "",
                    algorithmId: algorithm.id,
                },
            });
        } catch (requestError) {
            setActionMessage(requestError.message);
        } finally {
            setRunningId(null);
        }
    };

    const filtered = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();
        if (!query) return algorithms;

        return algorithms.filter((algorithm) =>
            (algorithm.title || "").toLowerCase().includes(query) ||
            (algorithm.description || "").toLowerCase().includes(query) ||
            topicNames(algorithm).some((topic) => topic.toLowerCase().includes(query))
        );
    }, [algorithms, searchTerm]);

    if (authLoading) {
        return <div className="loading-container">Checking authentication...</div>;
    }

    if (!isAuthenticated) return null;

    return (
        <div className="show-algorithms-page">
            <Background />
            <Header />

            <main className="algorithms-main">
                <div className="algorithms-header">
                    <h1 className="page-title"><CodeIcon /> Algorithms</h1>

                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search algorithms..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        <span className="search-icon"><SearchIcon /></span>
                    </div>
                </div>

                {loading && <div className="loading-container">Loading algorithms...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="algorithms-grid">
                    {filtered.map((algorithm) => {
                        const topics = topicNames(algorithm);

                        return (
                            <div
                                key={algorithm.id}
                                className="algo-card"
                                onClick={() => openAlgorithm(algorithm)}
                            >
                                <span className="card-neon card-neon-top" />
                                <span className="card-neon card-neon-right" />
                                <span className="card-neon card-neon-bottom" />
                                <span className="card-neon card-neon-left" />

                                <div className="algo-card-content">
                                    <div className="algo-icon"><CodeIcon /></div>
                                    <h3 className="algo-name">{algorithm.title || "Untitled"}</h3>
                                    <p className="algo-desc">
                                        {algorithm.description
                                            ? algorithm.description.length > 80
                                                ? `${algorithm.description.slice(0, 80)}...`
                                                : algorithm.description
                                            : "No description"}
                                    </p>

                                    {topics.map((topic) => (
                                        <span key={topic} className="algo-topic-badge">
                                            {topic}
                                        </span>
                                    ))}

                                    <div className="algo-footer">
                                        <span className="algo-owner">
                                            {algorithm.owner_username || algorithm.owner?.username || "Unknown"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {!loading && filtered.length === 0 && (
                        <p className="no-results">No algorithms found.</p>
                    )}
                </div>
            </main>

            {selectedAlgo && (
                <div className="modal-overlay" onClick={() => setSelectedAlgo(null)}>
                    <div className="modal-content algo-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedAlgo.title || "Untitled"}</h2>
                            <button className="modal-close-btn" onClick={() => setSelectedAlgo(null)}>
                                <BackIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            {detailLoading && <p>Loading details...</p>}

                            <div className="algo-meta">
                                <span>
                                    <strong>Author:</strong>{" "}
                                    {selectedAlgo.owner_username || selectedAlgo.owner?.username || "Unknown"}
                                </span>
                                <span>
                                    <strong>Topic:</strong>{" "}
                                    {topicNames(selectedAlgo).join(", ") || "General"}
                                </span>
                                {selectedAlgo.created_at && (
                                    <span>
                                        <strong>Created:</strong>{" "}
                                        {new Date(selectedAlgo.created_at).toLocaleDateString()}
                                    </span>
                                )}
                            </div>

                            <h3>Description</h3>
                            <p>{selectedAlgo.description || "No description provided."}</p>

                            <h3>Code</h3>
                            <div className="code-block">
                                <pre><code>{selectedAlgo.code || "// No code available"}</code></pre>
                            </div>

                            <div className="show-algo-modal-actions">

                                {actionMessage && (

                                    <div
                                        className={`save-message ${actionMessage.includes("successfully")
                                            ? "success"
                                            : "error"
                                            }`}
                                    >

                                        {actionMessage}

                                    </div>

                                )}


                                <div className="show-algo-modal-buttons">

                                    <button
                                        type="button"
                                        className="show-algo-run-btn"
                                        onClick={() =>
                                            handleRun(selectedAlgo)
                                        }
                                        disabled={
                                            runningId === selectedAlgo.id ||
                                            !selectedAlgo.code
                                        }
                                    >

                                        <CodeIcon />

                                        {runningId === selectedAlgo.id
                                            ? "Opening..."
                                            : "Run Code"
                                        }

                                    </button>


                                    <button
                                        type="button"
                                        className="show-algo-save-btn"
                                        onClick={() =>
                                            handleSave(selectedAlgo.id)
                                        }
                                        disabled={
                                            savingId === selectedAlgo.id
                                        }
                                    >

                                        {savingId === selectedAlgo.id
                                            ? "Saving..."
                                            : "Save Algorithm"
                                        }

                                    </button>

                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}