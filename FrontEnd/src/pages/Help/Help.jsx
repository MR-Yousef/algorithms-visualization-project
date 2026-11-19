import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import "./Help.css";

import InfoCard
    from "../../Component/InfoCard/InfoCard";

import Header
    from "../../Component/Header/Header";

import Background
    from "../../Component/Background/Background";

import {
    sections
} from "../../assets/data/InfoSectios";

import {
    BookIcon,
    BackIcon
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
   ROUTES
========================================================= */

const ROUTE_BY_TITLE = {

    "Language Guide":
        "language",

    "Flowchart Guide":
        "flowchart",

    "Input Methods":
        "input"

};


/* =========================================================
   GET DOCUMENTATION TYPE
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
   SECTION TYPE
========================================================= */

function getSectionType(
    title
) {

    switch (title) {

        case "Language Guide":
            return "language";

        case "Flowchart Guide":
            return "flowchart";

        case "Input Methods":
            return "input";

        default:
            return null;

    }

}


/* =========================================================
   CHECK IF DOC NEEDS DETAIL REQUEST
========================================================= */

function needsDocumentationDetail(
    doc
) {

    if (
        !doc?.id
    ) {

        return false;

    }


    const type =
        getDocumentationType(
            doc
        );


    return (

        !doc.title ||

        !doc.content ||

        !type

    );

}


/* =========================================================
   HELP
========================================================= */

export default function Help() {

    const navigate =
        useNavigate();


    const {
        isAuthenticated,
        loading:
        authLoading
    } = useAuth();


    const [
        selectedSection,
        setSelectedSection
    ] = useState(null);


    const [
        apiDocs,
        setApiDocs
    ] = useState([]);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


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
       LOAD DOCUMENTATION
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
                    "DOCUMENTATION API RESPONSE:",
                    payload
                );


                const list =
                    extractList(
                        payload,
                        [
                            "documentation_sections",
                            "documentation",
                            "documents",
                            "sections"
                        ]
                    );


                console.log(
                    "DOCUMENTATION LIST:",
                    list
                );


                /* =========================================
                   HYDRATE LIST ITEMS WHEN NECESSARY

                   If list endpoint returns only:
                   {
                       id,
                       title
                   }

                   fetch detail endpoint to get type/content.
                ========================================= */

                const hydrated =
                    await Promise.all(

                        list.map(
                            async (
                                doc
                            ) => {

                                if (
                                    !needsDocumentationDetail(
                                        doc
                                    )
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
                    "DOCUMENTATION HYDRATED:",
                    hydrated
                );


                setApiDocs(
                    hydrated
                );

            }
            catch (
            requestError
            ) {

                console.error(
                    "Documentation error:",
                    requestError
                );


                setError(
                    requestError.message
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
        isAuthenticated
    ]);


    /* =====================================================
       API COUNTS
    ===================================================== */

    const mergedSections =
        useMemo(
            () => {

                return sections.map(
                    (
                        section
                    ) => {

                        const sectionType =
                            getSectionType(
                                section.title
                            );


                        if (
                            !sectionType
                        ) {

                            return section;

                        }


                        const count =
                            apiDocs.filter(
                                (
                                    doc
                                ) =>

                                    getDocumentationType(
                                        doc
                                    ) ===
                                    sectionType
                            )
                                .length;


                        return {

                            ...section,

                            description:
                                `${count} article${count === 1
                                    ? ""
                                    : "s"
                                }`

                        };

                    }
                );

            },
            [
                apiDocs
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


            <div className="help-main">


                <div className="help-title-section">


                    <h1 className="help-main-title">


                        <span className="help-title-icon">

                            <BookIcon />

                        </span>


                        Help & Documentation


                    </h1>


                    <p className="help-subtitle">

                        Click on a topic to view the full guide.

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
                    CARDS
                ========================================= */}

                {!loading &&
                    !error && (

                        <div className="help-cards-grid">


                            {mergedSections.map(
                                (
                                    item,
                                    index
                                ) => (

                                    <div
                                        key={
                                            `${item.title}-${index}`
                                        }

                                        className="help-card-wrapper"

                                        onClick={() => {

                                            const routeType =
                                                ROUTE_BY_TITLE[
                                                item.title
                                                ];


                                            if (
                                                routeType
                                            ) {

                                                navigate(
                                                    `/help/${routeType}`
                                                );

                                            }
                                            else {

                                                setSelectedSection(
                                                    item
                                                );

                                            }

                                        }}
                                    >


                                        <InfoCard
                                            index={
                                                index
                                            }

                                            icon={
                                                item.icon
                                            }

                                            title={
                                                item.title
                                            }

                                            description={
                                                item.description
                                            }
                                        />


                                    </div>

                                )
                            )}


                        </div>

                    )}


            </div>


            {/* =============================================
                STATIC SECTION MODAL
            ============================================= */}

            {selectedSection && (

                <div
                    className="help-modal-overlay"

                    onClick={() =>
                        setSelectedSection(
                            null
                        )
                    }
                >


                    <div
                        className={
                            `help-modal ${selectedSection.title === "Roles & Permissions"
                                ? "help-role-modal"
                                : ""
                            }`
                        }

                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        <div className="help-modal-header">


                            <span className="help-modal-icon">

                                {selectedSection.icon}

                            </span>


                            <h2 className="help-modal-title">

                                {selectedSection.title}

                            </h2>


                            <button
                                type="button"

                                className="help-modal-close-btn"

                                onClick={() =>
                                    setSelectedSection(
                                        null
                                    )
                                }
                            >

                                <BackIcon />

                            </button>


                        </div>


                        <div className="help-documentation-body">

                            {selectedSection.details}

                        </div>


                    </div>


                </div>

            )}


        </>

    );

}