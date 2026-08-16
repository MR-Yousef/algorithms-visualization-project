import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ResultManager } from "../../Component/ResultManager/ResultManager";
import { FlowchartCanvas } from "./FlowchartCanvas";
import { useAuth } from "../../hooks/useAuth";
import {
    SaveIcon,
    BackIcon,
    CloseIcon,
    CloudIcon,
    DownloadIcon,
} from "../../assets/Icons/Icon";
import { ENDPOINTS } from "../../config/api.config";
import {
    apiRequest,
    extractList,
} from "../../services/api.service";
import CloudSavePopup from "../../Component/CloudSavePopUp/CloudSavePopUp";
import "./ResultPage.css";

const resultManager = new ResultManager();

export default function ResultPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, loading } = useAuth();

    const [topics, setTopics] = useState([]);
    const [topicsLoading, setTopicsLoading] = useState(false);
    const [topicsError, setTopicsError] = useState("");

    const [cloudMessage, setCloudMessage] = useState("");

    const ast = location.state?.ast ?? null;

    const { result, error } = useMemo(() => {
        if (!ast) return { result: null, error: null };

        try {
            return {
                result: resultManager.build(ast),
                error: null,
            };
        } catch (buildError) {
            return {
                result: null,
                error: buildError instanceof Error
                    ? buildError
                    : new Error("An unknown error occurred while building the flowchart."),
            };
        }
    }, [ast]);
    const [showOptionsModal, setShowOptionsModal] =
        useState(false);

    const [showCloudForm, setShowCloudForm] =
        useState(false);


    /* =====================================================
       LOCAL SAVE
    ===================================================== */

    const [
        showLocalNameModal,
        setShowLocalNameModal
    ] = useState(false);


    const [
        localFileName,
        setLocalFileName
    ] = useState("algorithm");


    const [
        localSaveError,
        setLocalSaveError
    ] = useState("");

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    useEffect(() => {
        if (!showCloudForm) return;

        let cancelled = false;

        const loadTopics = async () => {
            setTopicsLoading(true);
            setTopicsError("");

            try {
                const payload = await apiRequest(ENDPOINTS.TOPICS);
                const list = extractList(payload);

                const normalized = list
                    .map((topic) => ({
                        ...topic,
                        id: topic?.id ?? topic?.pk,
                        name:
                            topic?.name ??
                            topic?.title ??
                            topic?.topic_name ??
                            topic?.label ??
                            "Unnamed topic",
                    }))
                    .filter((topic) => topic.id !== undefined && topic.id !== null);

                if (!cancelled) setTopics(normalized);
            } catch (requestError) {
                if (!cancelled) setTopicsError(requestError.message);
            } finally {
                if (!cancelled) setTopicsLoading(false);
            }
        };

        loadTopics();

        return () => {
            cancelled = true;
        };
    }, [showCloudForm]);

    /* =====================================================
   OPEN LOCAL SAVE POPUP
===================================================== */

    const handleLocalSaveOption = () => {

        /*
         * Close first save options popup.
         */

        setShowOptionsModal(false);


        /*
         * Default file name.
         */

        setLocalFileName(
            "algorithm"
        );


        setLocalSaveError(
            ""
        );


        /*
         * Open file-name popup.
         */

        setShowLocalNameModal(
            true
        );

    };


    /* =====================================================
       SAVE CODE LOCALLY
    ===================================================== */

    const handleLocalSaveConfirm = (event) => {

        event.preventDefault();


        setLocalSaveError(
            ""
        );


        try {

            /* =============================================
               FILE NAME
            ============================================= */

            let safeFileName =
                localFileName
                    .trim();


            /*
             * User can write:
             *
             * bubble_sort
             *
             * OR:
             *
             * bubble_sort.txt
             *
             * We remove .txt here so it isn't duplicated.
             */

            safeFileName =
                safeFileName.replace(
                    /\.txt$/i,
                    ""
                );


            /*
             * Remove characters that are not valid
             * in common file systems.
             */

            safeFileName =
                safeFileName.replace(
                    /[<>:"/\\|?*]/g,
                    "_"
                );


            /*
             * Remove trailing dots/spaces.
             */

            safeFileName =
                safeFileName.replace(
                    /[.\s]+$/g,
                    ""
                );


            if (!safeFileName) {

                setLocalSaveError(
                    "Please enter a valid file name."
                );

                return;
            }


            /* =============================================
               GET CODE
            ============================================= */

            const code =
                localStorage.getItem(
                    "algoInputCode"
                ) || "";


            if (!code.trim()) {

                setLocalSaveError(
                    "There is no algorithm code to save."
                );

                return;
            }


            /* =============================================
               CREATE TXT FILE
            ============================================= */

            const blob =
                new Blob(
                    [code],
                    {
                        type:
                            "text/plain;charset=utf-8"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                url;


            link.download =
                `${safeFileName}.txt`;


            /* =============================================
               DOWNLOAD
            ============================================= */

            document.body.appendChild(
                link
            );


            link.click();


            document.body.removeChild(
                link
            );


            /*
             * Release temporary URL.
             */

            setTimeout(
                () => {

                    URL.revokeObjectURL(
                        url
                    );

                },
                100
            );


            /* =============================================
               CLOSE POPUP
            ============================================= */

            setShowLocalNameModal(
                false
            );


            setLocalFileName(
                "algorithm"
            );


            setLocalSaveError(
                ""
            );

        }
        catch (error) {

            console.error(
                "Local save failed:",
                error
            );


            setLocalSaveError(
                "Failed to save the file."
            );

        }

    };

    const handleCloudSaveOption = () => {
        setShowOptionsModal(false);
        setCloudMessage("");
        setShowCloudForm(true);
    };

    const handleCloudSaveSubmit = async (data) => {
        setCloudMessage("");

        try {
            await apiRequest(ENDPOINTS.CREATE_MY_ALGORITHM, {
                method: "POST",
                body: {
                    title: data.title,
                    description: data.description,
                    code: data.code,
                    topics: data.topics,
                },
            });

            setCloudMessage("Algorithm saved successfully!");
            setTimeout(() => setCloudMessage(""), 3000);
            return true;
        } catch (requestError) {
            setCloudMessage(requestError.message);
            return false;
        }
    };

    if (loading) {
        return (
            <main className="result-page">
                <div className="result-page__message">Checking authentication...</div>
            </main>
        );
    }

    if (!isAuthenticated) return null;

    if (!ast) {
        return (
            <main className="result-page">
                <div className="result-page__message">No compiled AST was provided.</div>
            </main>
        );
    }

    if (error) {
        return (
            <main className="result-page">
                <div className="result-page__error" role="alert">{error.message}</div>
            </main>
        );
    }

    const algoCode = localStorage.getItem("algoInputCode") || "";

    return (
        <main className="result-page">
            <div className="result-page__header">
                <button
                    className="back-flowchart-btn"
                    onClick={() => navigate("/InputAlgo")}
                    title="Back to code editor"
                >
                    <BackIcon /> Back to Editor
                </button>

                <button
                    className="save-flowchart-btn"
                    onClick={() => setShowOptionsModal(true)}
                    title="Save your algorithm"
                >
                    <SaveIcon /> Save Algorithm
                </button>
            </div>

            <FlowchartCanvas nodes={result.nodes} edges={result.edges} />

            {showOptionsModal && (
                <div className="modal-overlay" onClick={() => setShowOptionsModal(false)}>
                    <div className="modal-content save-options-modal" onClick={(event) => event.stopPropagation()}>
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
                                <button
                                    type="button"

                                    className="option-btn local-btn"

                                    onClick={
                                        handleLocalSaveOption
                                    }
                                >

                                    <DownloadIcon />

                                    Save Locally

                                </button>

                                <button className="option-btn cloud-btn" onClick={handleCloudSaveOption}>
                                    <CloudIcon /> Save to Cloud
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* =====================================================
    LOCAL SAVE FILE NAME POPUP
===================================================== */}

            {showLocalNameModal && (

                <div
                    className="modal-overlay"

                    onClick={() => {

                        setShowLocalNameModal(
                            false
                        );

                        setLocalSaveError(
                            ""
                        );

                    }}
                >

                    <div
                        className="modal-content local-save-modal"

                        onClick={
                            (event) =>
                                event.stopPropagation()
                        }
                    >


                        {/* =========================================
                HEADER
            ========================================= */}

                        <div className="modal-header">


                            <h2 className="modal-title">

                                Save Locally

                            </h2>


                            <button
                                type="button"

                                className="modal-close-btn"

                                onClick={() => {

                                    setShowLocalNameModal(
                                        false
                                    );

                                    setLocalSaveError(
                                        ""
                                    );

                                }}
                            >

                                <CloseIcon />

                            </button>


                        </div>


                        {/* =========================================
                FORM
            ========================================= */}

                        <form
                            className="local-save-form"

                            onSubmit={
                                handleLocalSaveConfirm
                            }
                        >


                            <p className="local-save-description">

                                Choose a name for your algorithm file.

                            </p>


                            {/* =====================================
                    FILE NAME
                ===================================== */}

                            <label
                                className="local-file-label"

                                htmlFor="local-file-name"
                            >

                                File Name

                            </label>


                            <div className="local-file-input-wrapper">


                                <input
                                    id="local-file-name"

                                    type="text"

                                    className="local-file-name-input"

                                    value={
                                        localFileName
                                    }

                                    maxLength={60}

                                    autoFocus

                                    autoComplete="off"

                                    placeholder="algorithm"

                                    onChange={
                                        (event) => {

                                            setLocalFileName(
                                                event.target.value
                                            );

                                            setLocalSaveError(
                                                ""
                                            );

                                        }
                                    }
                                />


                                <span className="local-file-extension">

                                    .txt

                                </span>


                            </div>


                            {/* =====================================
                    FILE PREVIEW
                ===================================== */}

                            <div className="local-file-preview">

                                Your file will be saved as:

                                <strong>

                                    {localFileName
                                        .trim()
                                        .replace(
                                            /\.txt$/i,
                                            ""
                                        ) || "algorithm"
                                    }.txt

                                </strong>

                            </div>


                            {/* =====================================
                    ERROR
                ===================================== */}

                            {localSaveError && (

                                <div className="local-save-error">

                                    {localSaveError}

                                </div>

                            )}


                            {/* =====================================
                    INFO
                ===================================== */}

                            <span className="local-file-hint">

                                Only the algorithm code will be saved in the text file.

                            </span>


                            {/* =====================================
                    ACTIONS
                ===================================== */}

                            <div className="local-save-actions">


                                <button
                                    type="button"

                                    className="local-cancel-btn"

                                    onClick={() => {

                                        setShowLocalNameModal(
                                            false
                                        );

                                        setLocalSaveError(
                                            ""
                                        );

                                    }}
                                >

                                    Cancel

                                </button>


                                <button
                                    type="submit"

                                    className="local-confirm-btn"

                                    disabled={
                                        !localFileName.trim()
                                    }
                                >

                                    <DownloadIcon />

                                    Save File

                                </button>


                            </div>


                        </form>


                    </div>

                </div>

            )}

            {showCloudForm && (
                <CloudSavePopup
                    onClose={() => setShowCloudForm(false)}
                    onSubmit={handleCloudSaveSubmit}
                    topics={topics}
                    topicsLoading={topicsLoading}
                    topicsError={topicsError}
                    code={algoCode}
                />
            )}

            {cloudMessage && (
                <div className="cloud-save-message">{cloudMessage}</div>
            )}
        </main>
    );
}