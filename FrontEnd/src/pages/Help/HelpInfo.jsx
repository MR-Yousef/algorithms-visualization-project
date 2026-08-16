import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import "./Help.css";

import Header
    from "../../Component/Header/Header";

import Background
    from "../../Component/Background/Background";

import {
    BackIcon,
    CloseIcon
} from "../../assets/Icons/Icon";

import {
    ENDPOINTS
} from "../../config/api.config";

import {
    useAuth
} from "../../hooks/useAuth";

import {
    apiRequest,
    extractList,
    unwrapData
} from "../../services/api.service";


/* =========================================================
   PAGE TITLES
========================================================= */

const TITLE_MAP = {

    language:
        "Language Guide",

    flowchart:
        "Flowchart Guide",

    input:
        "Input Methods"

};


/* =========================================================
   NORMALIZE DOCUMENTATION TYPE
========================================================= */

function getDocumentationType(
    doc
) {

    const rawValue =

        doc?.documentation_type ??

        doc?.documentation_type_display ??

        doc?.type_documentation ??

        doc?.type_documintation ??

        doc?.documentationType ??

        doc?.type ??

        doc?.category ??

        "";


    const value =
        String(
            rawValue
        )
            .trim()
            .toLowerCase()
            .replace(
                /[_-]+/g,
                " "
            );


    if (
        value.includes(
            "language"
        )
    ) {

        return "language";

    }


    if (
        value.includes(
            "flow"
        )
    ) {

        return "flowchart";

    }


    if (
        value.includes(
            "input"
        )
    ) {

        return "input";

    }


    return value;

}


/* =========================================================
   HELP DETAIL
========================================================= */

export default function HelpDetail() {

    const {
        type
    } = useParams();


    const navigate =
        useNavigate();


    const {
        isAuthenticated,
        loading:
        authLoading
    } = useAuth();


    const pageType =
        [
            "language",
            "flowchart",
            "input"
        ].includes(type)
            ? type
            : "language";


    const pageTitle =
        TITLE_MAP[
        pageType
        ] ??
        "Documentation";


    const [
        docs,
        setDocs
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    const [
        selectedDoc,
        setSelectedDoc
    ] = useState(null);


    const [
        selectedLoading,
        setSelectedLoading
    ] = useState(false);


    const [
        showScrollTop,
        setShowScrollTop
    ] = useState(false);


    /* =====================================================
       AUTH
    ===================================================== */

    useEffect(() => {

        if (
            !authLoading &&
            !isAuthenticated
        ) {

            navigate(
                "/login",
                {
                    replace:
                        true
                }
            );

        }

    }, [
        authLoading,
        isAuthenticated,
        navigate
    ]);


    /* =====================================================
       LOAD DOCS
    ===================================================== */

    const fetchDocs =
        async () => {

            setLoading(
                true
            );


            setError(
                ""
            );


            try {

                const payload =
                    await apiRequest(
                        ENDPOINTS.DOCUMENTATION
                    );


                console.log(
                    "HELP DETAIL DOCUMENTATION RESPONSE:",
                    payload
                );


                const allDocs =
                    extractList(
                        payload,
                        [
                            "documentation_sections",
                            "documentation",
                            "documents",
                            "sections"
                        ]
                    );


                /* =========================================
                   LOAD DETAILS WHEN LIST DOESN'T INCLUDE
                   DOCUMENTATION TYPE.
                ========================================= */

                const hydratedDocs =
                    await Promise.all(

                        allDocs.map(
                            async (
                                doc
                            ) => {

                                const currentType =
                                    getDocumentationType(
                                        doc
                                    );


                                if (
                                    currentType &&
                                    doc.title &&
                                    doc.content
                                ) {

                                    return doc;

                                }


                                if (
                                    !doc?.id
                                ) {

                                    return doc;

                                }


                                try {

                                    const detailPayload =
                                        await apiRequest(

                                            ENDPOINTS
                                                .DOCUMENTATION_DETAIL(
                                                    doc.id
                                                )

                                        );


                                    return (

                                        unwrapData(
                                            detailPayload
                                        ) ??

                                        doc

                                    );

                                }
                                catch (
                                detailError
                                ) {

                                    console.error(
                                        `Could not load documentation ${doc.id}:`,
                                        detailError
                                    );


                                    return doc;

                                }

                            }
                        )

                    );


                console.log(
                    "ALL DOCUMENTATION AFTER HYDRATE:",
                    hydratedDocs
                );


                const filtered =
                    hydratedDocs.filter(
                        (
                            doc
                        ) =>

                            getDocumentationType(
                                doc
                            ) ===
                            pageType
                    );


                console.log(
                    `${pageTitle} DOCUMENTATION:`,
                    filtered
                );


                setDocs(
                    filtered
                );

            }
            catch (
            requestError
            ) {

                console.error(
                    "Failed to load documentation:",
                    requestError
                );


                setError(
                    requestError.message
                );


                setDocs(
                    []
                );

            }
            finally {

                setLoading(
                    false
                );

            }

        };


    useEffect(() => {

        if (
            isAuthenticated
        ) {

            fetchDocs();

        }

    }, [
        isAuthenticated,
        pageType
    ]);


    /* =====================================================
       SCROLL BUTTON
    ===================================================== */

    useEffect(() => {

        const handleScroll =
            () => {

                setShowScrollTop(
                    window.scrollY >
                    300
                );

            };


        window.addEventListener(
            "scroll",
            handleScroll,
            {
                passive:
                    true
            }
        );


        return () => {

            window.removeEventListener(
                "scroll",
                handleScroll
            );

        };

    }, []);


    /* =====================================================
       OPEN DOCUMENT
    ===================================================== */

    const openDocument =
        async (
            doc
        ) => {

            setSelectedDoc(
                doc
            );


            if (
                !doc?.id
            ) {

                return;

            }


            setSelectedLoading(
                true
            );


            try {

                const payload =
                    await apiRequest(

                        ENDPOINTS
                            .DOCUMENTATION_DETAIL(
                                doc.id
                            )

                    );


                const detail =
                    unwrapData(
                        payload
                    );


                if (
                    detail
                ) {

                    setSelectedDoc(
                        detail
                    );

                }

            }
            catch (
            requestError
            ) {

                console.error(
                    "Failed to load documentation detail:",
                    requestError
                );

            }
            finally {

                setSelectedLoading(
                    false
                );

            }

        };


    /* =====================================================
       PREVIEW CONTENT
    ===================================================== */

    const truncateContent =
        (
            text,
            maxLength = 190
        ) => {

            if (!text) {

                return "";

            }


            const clean =
                String(text)
                    .trim()
                    .replace(
                        /\s+/g,
                        " "
                    );


            if (
                clean.length <=
                maxLength
            ) {

                return clean;

            }


            return (
                `${clean.substring(
                    0,
                    maxLength
                )}…`
            );

        };


    /* =====================================================
       SORT
    ===================================================== */

    const sortedDocs =
        useMemo(
            () => {

                return [
                    ...docs
                ].sort(
                    (
                        a,
                        b
                    ) => {

                        const aOrder =
                            Number(

                                a.order ??

                                a.position ??

                                a.id ??

                                0

                            );


                        const bOrder =
                            Number(

                                b.order ??

                                b.position ??

                                b.id ??

                                0

                            );


                        return (
                            aOrder -
                            bOrder
                        );

                    }
                );

            },
            [
                docs
            ]
        );


    /* =====================================================
       AUTH LOADING
    ===================================================== */

    if (
        authLoading
    ) {

        return (

            <div className="help-loading-container">

                Checking authentication...

            </div>

        );

    }


    if (
        !isAuthenticated
    ) {

        return null;

    }


    /* =====================================================
       PAGE
    ===================================================== */

    return (

        <>


            <Background />


            <Header />


            <div className="help-main help-detail-page">

                {/* =====================================================
        BACK BUTTON
    ===================================================== */}

                <div className="help-detail-topbar">

                    <button
                        type="button"
                        className="help-back-btn"
                        onClick={() => navigate("/help")}
                    >

                        <BackIcon />

                        <span>
                            Back to Help
                        </span>

                    </button>

                </div>


                {/* =====================================================
        TITLE
    ===================================================== */}

                <div className="help-title-section help-detail-title-section">

                    <h1 className="help-main-title">

                        {pageTitle}

                    </h1>


                    <p className="help-subtitle">

                        {docs.length} article
                        {docs.length === 1 ? "" : "s"}

                    </p>

                </div>


                {/* =========================================
                    LOADING
                ========================================= */}

                {loading && (

                    <div className="help-loading-container">

                        Loading documentation...

                    </div>

                )}


                {/* =========================================
                    ERROR
                ========================================= */}

                {!loading &&
                    error && (

                        <div className="help-error-msg">


                            <span>

                                {error}

                            </span>


                            <button
                                type="button"

                                onClick={
                                    fetchDocs
                                }
                            >

                                Retry

                            </button>


                        </div>

                    )}


                {/* =========================================
                    ARTICLES
                ========================================= */}

                {!loading &&
                    !error && (

                        <div className="help-articles-grid help-articles-list">


                            {sortedDocs.map(
                                (
                                    doc
                                ) => (

                                    <article
                                        key={
                                            doc.id
                                        }

                                        className="help-doc-article"

                                        onClick={() =>
                                            openDocument(
                                                doc
                                            )
                                        }
                                    >


                                        <h2>

                                            {doc.title ||
                                                "Documentation"
                                            }

                                        </h2>


                                        <p>

                                            {truncateContent(
                                                doc.content
                                            )}

                                        </p>


                                    </article>

                                )
                            )}


                            {sortedDocs.length ===
                                0 && (

                                    <p className="no-results">

                                        No articles found for this section.

                                    </p>

                                )}


                        </div>

                    )}


            </div>


            {/* =============================================
                SCROLL TOP
            ============================================= */}

            {showScrollTop && (

                <button
                    className="scroll-to-top-btn"

                    onClick={() =>
                        window.scrollTo({
                            top:
                                0,

                            behavior:
                                "smooth"
                        })
                    }

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

                        <polyline
                            points="18 15 12 9 6 15"
                        />

                    </svg>


                </button>

            )}


            {/* =============================================
                DOCUMENT MODAL
            ============================================= */}

            {selectedDoc && (

                <div
                    className="help-modal-overlay"

                    onClick={() =>
                        setSelectedDoc(
                            null
                        )
                    }
                >


                    <div
                        className="help-modal help-article-modal"

                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="help-modal-header">


                            <span />


                            <h2 className="help-modal-title">

                                {selectedDoc.title ||
                                    "Documentation"
                                }

                            </h2>


                            <button
                                type="button"

                                className="help-modal-close-btn"

                                onClick={() =>
                                    setSelectedDoc(
                                        null
                                    )
                                }
                            >

                                <CloseIcon />

                            </button>


                        </div>


                        <div className="help-modal-body help-documentation-body">


                            {selectedLoading
                                ? (
                                    <p>
                                        Loading article...
                                    </p>
                                )
                                : (
                                    <p
                                        style={{
                                            whiteSpace:
                                                "pre-wrap",

                                            margin:
                                                0
                                        }}
                                    >

                                        {String(
                                            selectedDoc.content ??
                                            ""
                                        ).trim()}

                                    </p>
                                )
                            }


                        </div>


                    </div>


                </div>

            )}


        </>

    );

}