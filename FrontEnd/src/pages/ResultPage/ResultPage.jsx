import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResultManager } from "../../Component/ResultManager/ResultManager";
import { FlowchartCanvas } from "./FlowchartCanvas";
import { useAuth } from "../../hooks/useAuth";
import { SaveIcon, BackIcon, CloseIcon, CloudIcon, DownloadIcon } from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import CloudSavePopup from "../../Component/CloudSavePopUp/CloudSavePopUp";
import "./ResultPage.css";

const resultManager = new ResultManager();

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, loading, getAccessToken, getRefreshToken } = useAuth();

    const [showOptionsModal, setShowOptionsModal] = useState(false);
    const [showCloudForm, setShowCloudForm] = useState(false);

    const [topics, setTopics] = useState([]);
    const [, setTopicsLoading] = useState(false);
    const [, setTopicsError] = useState("");

    // Cloud save feedback
    const [, setSavingCloud] = useState(false);
    const [cloudMessage, setCloudMessage] = useState("");

    const ast = location.state?.ast ?? null;

    const { result, error } = useMemo(() => {
        if (!ast) return { result: null, error: null };
        try {
            return { result: resultManager.build(ast), error: null };
        } catch (buildError) {
            return {
                result: null,
                error:
                    buildError instanceof Error
                        ? buildError
                        : new Error("An unknown error occurred while building the flowchart."),
            };
        }
    }, [ast]);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

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

    useEffect(() => {
        if (!showCloudForm) return;

        const fetchTopics = async () => {
            setTopicsLoading(true);
            setTopicsError("");
            try {
                let token = getAccessToken();
                if (!token) {
                    setTopicsError("You must be logged in.");
                    setTopicsLoading(false);
                    return;
                }

                let res = await fetch(ENDPOINTS.TOPICS, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (res.status === 401) {
                    const refresh = getRefreshToken();
                    if (refresh) {
                        const newToken = await refreshAccessToken(refresh);
                        const storage =
                            localStorage.getItem("remember_me") === "true"
                                ? localStorage
                                : sessionStorage;
                        storage.setItem("access_token", newToken);
                        res = await fetch(ENDPOINTS.TOPICS, {
                            headers: {
                                Authorization: `Bearer ${newToken}`,
                                "Content-Type": "application/json",
                            },
                        });
                    } else {
                        throw new Error("Session expired. Please log in again.");
                    }
                }

                if (!res.ok) throw new Error("Failed to load topics");

                const json = await res.json();
                const list = json.data ?? json.results ?? json;
                setTopics(Array.isArray(list) ? list : []);
            } catch (err) {
                setTopicsError(err.message);
            } finally {
                setTopicsLoading(false);
            }
        };

        fetchTopics();
    }, [showCloudForm, getAccessToken, getRefreshToken]);

    // ─── Local Save ─────────────────────────────────────────────
    const handleLocalSave = () => {
        try {
            const code = localStorage.getItem("algoInputCode") || "";
            const blob = new Blob([code], { type: "text/plain" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "algorithm.txt";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error("Local save failed:", err);
        }
        setShowOptionsModal(false);
    };

    const handleCloudSaveOption = () => {
        setShowOptionsModal(false);
        setCloudMessage("");
        setShowCloudForm(true);
    };

    // ─── Cloud Save (API call) ────────────────────────────────
    const handleCloudSaveSubmit = async (data) => {
        setSavingCloud(true);
        setCloudMessage("");
        try {
            let token = getAccessToken();
            const url = ENDPOINTS.SAVE_ALGORITHM_CLOUD;

            const payload = {
                title: data.title,
                description: data.description,
                code: data.code,
                topic: data.topic,   // a single topic ID (or null)
            };

            let res = await fetch(url, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

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
                        body: JSON.stringify(payload),
                    });
                } else {
                    throw new Error("Session expired. Please log in again.");
                }
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.detail || errData.message || "Failed to save algorithm");
            }

            // Success – show a brief message in the modal area
            setCloudMessage("Algorithm saved successfully!");
            setShowCloudForm(false);
            // Clear the success message after 3 seconds
            setTimeout(() => setCloudMessage(""), 3000);
        } catch (err) {
            // Show error message and clear it after 4 seconds
            setCloudMessage(err.message);
            setTimeout(() => setCloudMessage(""), 4000);
        } finally {
            setSavingCloud(false);
        }
    };

    if (loading) {
        return (
            <main className="result-page">
                <div className="result-page__message">Checking authentication...</div>
            </main>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    if (!ast) {
        return (
            <main className="result-page">
                <div className="result-page__message">
                    No compiled AST was provided.
                </div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="result-page">
                <div className="result-page__error" role="alert">
                    {error.message}
                </div>
            </main>
        );
    }

    // Get the code for the popup
    const algoCode = localStorage.getItem("algoInputCode") || "";

    return (
        <main className="result-page">
            <div className="result-page__header">
                <button
                    className="back-flowchart-btn"
                    onClick={() => navigate("/inputAlgo")}
                    title="Back to code editor"
                >
                    <BackIcon />
                    Back to Editor
                </button>

                <button
                    className="save-flowchart-btn"
                    onClick={() => setShowOptionsModal(true)}
                    title="Save your algorithm"
                >
                    <SaveIcon />
                    Save Algorithm
                </button>
            </div>

            <FlowchartCanvas nodes={result.nodes} edges={result.edges} />

            {/* Save Options Modal */}
            {showOptionsModal && (
                <div className="modal-overlay" onClick={() => setShowOptionsModal(false)}>
                    <div className="modal-content save-options-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Save Algorithm</h2>
                            <button className="modal-close-btn" onClick={() => setShowOptionsModal(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <div className="modal-body">
                            <p style={{ color: "#cbd5e1", marginBottom: "1.5rem", textAlign: "center" }}>
                                Choose how you want to save your algorithm.
                            </p>
                            <div className="save-options-actions">
                                <button className="option-btn local-btn" onClick={handleLocalSave}>
                                    <DownloadIcon />
                                    Save Locally
                                </button>
                                <button className="option-btn cloud-btn" onClick={handleCloudSaveOption}>
                                    <CloudIcon />
                                    Save to Cloud
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cloud Save Multi‑Step Popup */}
            {showCloudForm && (
                <CloudSavePopup
                    onClose={() => setShowCloudForm(false)}
                    onSubmit={handleCloudSaveSubmit}
                    topics={topics}
                    code={algoCode}
                />
            )}

            {/* Cloud save status message (optional) */}
            {cloudMessage && (
                <div className="cloud-save-message">
                    {cloudMessage}
                </div>
            )}
        </main>
    );
}