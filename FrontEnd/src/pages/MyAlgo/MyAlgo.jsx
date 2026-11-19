import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Background from "../../Component/Background/Background";
import Header from "../../Component/Header/Header";
import {
    SearchIcon,
    CodeIcon,
    DeleteIcon,
    CloseIcon,
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import { useAuth } from "../../hooks/useAuth";
import {
    apiRequest,
    extractList,
} from "../../services/api.service";
import "./MyAlgo.css";

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

export default function MyAlgo() {
    const navigate = useNavigate();
    const {
        user,
        isAuthenticated,
        loading: authLoading,
    } = useAuth();

    const canManage = ["CONTRIBUTOR", "ADMIN", "SUPER_ADMIN"].includes(user?.role);

    const [algorithms, setAlgorithms] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAlgo, setSelectedAlgo] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [runningId, setRunningId] = useState(null);

    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                navigate("/login", { replace: true });
            } else if (!canManage) {
                navigate("/home", { replace: true });
            }
        }
    }, [authLoading, isAuthenticated, canManage, navigate]);

    const loadMyAlgorithms = async () => {
        setLoading(true);
        setError("");

        try {
            const payload = await apiRequest(ENDPOINTS.MY_ALGORITHMS);
            setAlgorithms(extractList(payload));
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && canManage) {
            loadMyAlgorithms();
        }
    }, [isAuthenticated, canManage]);

    const handleDelete = async (algorithmId) => {
        setDeleting(true);
        setError("");

        try {
            await apiRequest(ENDPOINTS.DELETE_MY_ALGORITHM(algorithmId), {
                method: "DELETE",
            });

            setAlgorithms((previous) =>
                previous.filter((algorithm) => String(algorithm.id) !== String(algorithmId))
            );
            setDeleteTarget(null);

            if (String(selectedAlgo?.id) === String(algorithmId)) {
                setSelectedAlgo(null);
            }
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setDeleting(false);
        }
    };

    const handleRun = async (algorithm) => {
        setRunningId(algorithm.id);
        setError("");

        try {
            await apiRequest(ENDPOINTS.EXECUTE_ALGORITHM(algorithm.id), {
                method: "POST",
            });

            navigate("/InputAlgo", {
                state: {
                    code: algorithm.code || "",
                    algorithmId: algorithm.id,
                },
            });
        } catch (requestError) {
            setError(requestError.message);
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

    if (!isAuthenticated || !canManage) return null;

    return (
        <div className="my-algorithms-page">
            <Background />
            <Header />

            <main className="my-algorithms-main">
                <div className="my-algorithms-header">
                    <h1 className="page-title"><CodeIcon /> My Algorithms</h1>

                    <div className="search-wrapper">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search my algorithms..."
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                        />
                        <span className="search-icon"><SearchIcon /></span>
                    </div>
                </div>

                {loading && <div className="loading-container">Loading your algorithms...</div>}
                {error && <div className="error-msg">{error}</div>}

                <div className="my-algorithms-grid">
                    {filtered.map((algorithm) => (
                        <div
                            key={algorithm.id}
                            className="my-algo-card"
                            onClick={() => setSelectedAlgo(algorithm)}
                        >
                            <div className="my-algo-card-content">
                                <div className="my-algo-icon"><CodeIcon /></div>
                                <h3 className="my-algo-title">{algorithm.title || "Untitled"}</h3>
                                <p className="my-algo-desc">
                                    {algorithm.description
                                        ? algorithm.description.length > 80
                                            ? `${algorithm.description.slice(0, 80)}...`
                                            : algorithm.description
                                        : "No description"}
                                </p>

                                {topicNames(algorithm).length > 0 && (
                                    <div className="my-algo-footer">
                                        <span>{topicNames(algorithm).join(", ")}</span>
                                    </div>
                                )}
                            </div>

                            <div className="my-algo-controls" onClick={(event) => event.stopPropagation()}>
                                <button
                                    className="icon-btn"
                                    onClick={() => handleRun(algorithm)}
                                    disabled={runningId === algorithm.id || !algorithm.code}
                                    title="Run Code"
                                >
                                    <CodeIcon />
                                </button>

                                <button
                                    className="icon-btn"
                                    onClick={() => setDeleteTarget(algorithm.id)}
                                    title="Delete"
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
                        </div>
                    ))}

                    {!loading && filtered.length === 0 && (
                        <p className="no-results">You haven't created any algorithms yet.</p>
                    )}
                </div>
            </main>

            {selectedAlgo && (
                <div className="modal-overlay" onClick={() => setSelectedAlgo(null)}>
                    <div className="modal-content algo-edit-modal" onClick={(event) => event.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">{selectedAlgo.title || "Untitled"}</h2>
                            <button className="modal-close-btn" onClick={() => setSelectedAlgo(null)}>
                                <CloseIcon />
                            </button>
                        </div>

                        <div className="modal-body">
                            <p>{selectedAlgo.description || "No description provided."}</p>

                            {topicNames(selectedAlgo).length > 0 && (
                                <p><strong>Topics:</strong> {topicNames(selectedAlgo).join(", ")}</p>
                            )}

                            <div className="field-group">
                                <label className="field-label">Code</label>
                                <textarea
                                    className="edit-input edit-textarea"
                                    rows="8"
                                    value={selectedAlgo.code || ""}
                                    readOnly
                                />
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    className="save-btn"
                                    onClick={() => handleRun(selectedAlgo)}
                                    disabled={runningId === selectedAlgo.id || !selectedAlgo.code}
                                >
                                    {runningId === selectedAlgo.id ? "Opening..." : <><CodeIcon /> Run Code</>}
                                </button>

                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => setDeleteTarget(selectedAlgo.id)}
                                >
                                    <DeleteIcon /> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
                    <div className="modal-content delete-confirm-modal" onClick={(event) => event.stopPropagation()}>
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
        </div>
    );
}
