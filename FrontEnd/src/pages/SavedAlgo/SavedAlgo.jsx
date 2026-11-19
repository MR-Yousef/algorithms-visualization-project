import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import Background
    from "../../Component/Background/Background";

import Header
    from "../../Component/Header/Header";

import {
    SearchIcon,
    CodeIcon,
    CloseIcon,
    StarIcon,
    DeleteIcon,
    WarningIcon
} from "../../assets/Icons/Icon";

import {
    ENDPOINTS
} from "../../config/api.config";

import {
    useAuth
} from "../../hooks/useAuth";

import {
    apiRequest,
    unwrapData
} from "../../services/api.service";

import "./SavedAlgo.css";


/* =========================================================
   TABS
========================================================= */

const TAB_PUBLISHED =
    "published";

const TAB_MY =
    "my";


/* =========================================================
   FIND ARRAY INSIDE API RESPONSE

   Supports:

   [...]
   { data: [...] }
   { results: [...] }
   { data: { results: [...] } }
   { data: { saved_algorithms: [...] } }
   { saved_algorithms: [...] }
========================================================= */

function findFirstArray(
    value,
    depth = 0
) {

    if (
        depth > 8
    ) {

        return [];

    }


    if (
        Array.isArray(value)
    ) {

        return value;

    }


    if (
        !value ||
        typeof value !== "object"
    ) {

        return [];

    }


    const preferredKeys = [

        "saved_algorithms",
        "saved",
        "my_algorithms",
        "algorithms",
        "results",
        "items",
        "records",
        "data"

    ];


    /* =====================================================
       CHECK COMMON KEYS FIRST
    ===================================================== */

    for (
        const key
        of preferredKeys
    ) {

        if (
            !(key in value)
        ) {

            continue;

        }


        const child =
            value[key];


        if (
            Array.isArray(child)
        ) {

            return child;

        }


        if (
            child &&
            typeof child === "object"
        ) {

            const found =
                findFirstArray(
                    child,
                    depth + 1
                );


            if (
                found.length > 0
            ) {

                return found;

            }

        }

    }


    /* =====================================================
       FALLBACK
    ===================================================== */

    for (
        const child
        of Object.values(value)
    ) {

        if (
            child &&
            typeof child === "object"
        ) {

            const found =
                findFirstArray(
                    child,
                    depth + 1
                );


            if (
                found.length > 0
            ) {

                return found;

            }

        }

    }


    return [];

}


/* =========================================================
   CHECK IF OBJECT IS ACTUALLY AN ALGORITHM

   IMPORTANT:
   A SavedAlgorithm relation may also have an "id".

   We only consider it a real algorithm if it has algorithm
   fields such as title/code/description.
========================================================= */

function isAlgorithmObject(
    value
) {

    return (

        value &&

        typeof value ===
        "object" &&

        !Array.isArray(value) &&

        (
            value.title !== undefined ||
            value.code !== undefined ||
            value.description !== undefined ||
            value.topic_name !== undefined ||
            value.topics !== undefined
        )

    );

}


/* =========================================================
   NORMALIZE ALGORITHM OBJECT
========================================================= */

function normalizeAlgorithm(
    item
) {

    if (!item) {

        return null;

    }


    /* =============================================
       DIRECT ALGORITHM
    ============================================= */

    if (
        isAlgorithmObject(
            item
        )
    ) {

        return item;

    }


    /* =============================================
       NESTED ALGORITHM
    ============================================= */

    const possibleObjects = [

        item.algorithm,

        item.algorithm_data,

        item.algorithm_details,

        item.saved_algorithm,

        item.algorithm_info

    ];


    for (
        const candidate
        of possibleObjects
    ) {

        if (
            isAlgorithmObject(
                candidate
            )
        ) {

            return candidate;

        }

    }


    /* =============================================
       FLAT SERIALIZER

       Example:

       {
           algorithm_id: 5,
           algorithm_title: "...",
           algorithm_code: "..."
       }
    ============================================= */

    if (
        item.algorithm_id !==
        undefined
    ) {

        if (
            item.algorithm_title !==
            undefined ||
            item.algorithm_code !==
            undefined ||
            item.algorithm_description !==
            undefined
        ) {

            return {

                id:
                    item.algorithm_id,

                title:

                    item.algorithm_title ??

                    item.title ??

                    "Untitled",

                description:

                    item.algorithm_description ??

                    item.description ??

                    "",

                code:

                    item.algorithm_code ??

                    item.code ??

                    "",

                topic_name:

                    item.algorithm_topic_name ??

                    item.topic_name,

                topic_names:

                    item.algorithm_topic_names ??

                    item.topic_names,

                owner_username:

                    item.algorithm_owner_username ??

                    item.owner_username,

                created_at:

                    item.algorithm_created_at ??

                    item.created_at

            };

        }

    }


    return null;

}


/* =========================================================
   GET PUBLISHED ALGORITHM ID FROM SAVED RELATION

   IMPORTANT:

   PRIORITY:
   algorithm
   algorithm_id
   algorithm.id

   NOT saved relation id.
========================================================= */

function getSavedAlgorithmId(
    savedRow
) {

    if (
        savedRow === null ||
        savedRow === undefined
    ) {

        return null;

    }


    /* =============================================
       API MAY RETURN IDs DIRECTLY

       [
           4,
           7,
           9
       ]
    ============================================= */

    if (
        typeof savedRow ===
        "number" ||
        typeof savedRow ===
        "string"
    ) {

        return savedRow;

    }


    /* =============================================
       {
           algorithm: 7
       }
    ============================================= */

    if (
        typeof savedRow.algorithm ===
        "number" ||
        typeof savedRow.algorithm ===
        "string"
    ) {

        return savedRow.algorithm;

    }


    /* =============================================
       {
           algorithm: {
               id: 7
           }
       }
    ============================================= */

    if (
        savedRow.algorithm?.id !==
        undefined
    ) {

        return savedRow
            .algorithm
            .id;

    }


    /* =============================================
       {
           algorithm_id: 7
       }
    ============================================= */

    if (
        savedRow.algorithm_id !==
        undefined
    ) {

        return savedRow
            .algorithm_id;

    }


    if (
        savedRow.algorithm_data?.id !==
        undefined
    ) {

        return savedRow
            .algorithm_data
            .id;

    }


    if (
        savedRow.algorithm_details?.id !==
        undefined
    ) {

        return savedRow
            .algorithm_details
            .id;

    }


    /*
     * Only use row.id if the row itself
     * is clearly an algorithm object.
     */

    if (
        isAlgorithmObject(
            savedRow
        ) &&
        savedRow.id !==
        undefined
    ) {

        return savedRow.id;

    }


    return null;

}


/* =========================================================
   TOPICS
========================================================= */

function getTopicNames(
    algorithm
) {

    /* =====================================================
       CASE 1
       Backend returns:

       topic_names: [
           "General",
           "Sorting"
       ]
    ===================================================== */

    if (
        Array.isArray(
            algorithm?.topic_names
        )
    ) {

        return algorithm
            .topic_names
            .filter(Boolean);

    }


    /* =====================================================
       CASE 2
       Backend returns:

       topics: [
           {
               id: 1,
               name: "General"
           },
           {
               id: 2,
               name: "Sorting"
           }
       ]
    ===================================================== */

    if (
        Array.isArray(
            algorithm?.topics
        )
    ) {

        return algorithm
            .topics
            .map(
                (
                    topic
                ) => {

                    /* -----------------------------------------
                       Topic already comes as string
                    ----------------------------------------- */

                    if (
                        typeof topic ===
                        "string"
                    ) {

                        return topic;

                    }


                    /* -----------------------------------------
                       Topic comes as object
                    ----------------------------------------- */

                    return (

                        topic?.name ??

                        topic?.title ??

                        topic?.topic_name ??

                        null

                    );

                }
            )
            .filter(Boolean);

    }


    /* =====================================================
       CASE 3
       Backend returns only one topic
    ===================================================== */

    const singleTopic =

        algorithm?.topic_name ??

        algorithm?.topic?.name ??

        algorithm?.topic?.title ??

        null;


    return singleTopic
        ? [singleTopic]
        : [];

}

/* =========================================================
   AUTHOR
========================================================= */

function getAuthorName(
    algorithm
) {

    return (

        algorithm?.owner_username ??

        algorithm?.author_username ??

        algorithm?.created_by_username ??

        algorithm?.owner?.username ??

        algorithm?.author?.username ??

        algorithm?.created_by?.username ??

        algorithm?.user?.username ??

        "Unknown"

    );

}


/* =========================================================
   UNIQUE ALGORITHMS
========================================================= */

function uniqueAlgorithms(
    algorithms
) {

    const result =
        [];


    const ids =
        new Set();


    algorithms.forEach(
        (
            algorithm
        ) => {

            if (!algorithm) {

                return;

            }


            const key =

                algorithm.id !==
                    undefined
                    ? String(
                        algorithm.id
                    )
                    : `${algorithm.title}-${algorithm.code}`;


            if (
                ids.has(key)
            ) {

                return;

            }


            ids.add(key);

            result.push(
                algorithm
            );

        }
    );


    return result;

}


/* =========================================================
   PAGE
========================================================= */

export default function SavedAlgo() {

    const navigate =
        useNavigate();


    const {
        isAuthenticated,
        loading:
        authLoading
    } = useAuth();


    /* =====================================================
       TAB
    ===================================================== */

    const [
        activeTab,
        setActiveTab
    ] = useState(
        TAB_PUBLISHED
    );


    /* =====================================================
       DATA
    ===================================================== */

    const [
        algorithms,
        setAlgorithms
    ] = useState([]);


    const [
        searchTerm,
        setSearchTerm
    ] = useState("");


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        error,
        setError
    ] = useState("");


    /* =====================================================
       SELECTED ALGORITHM
    ===================================================== */

    const [
        selectedAlgo,
        setSelectedAlgo
    ] = useState(null);


    const [
        detailLoading,
        setDetailLoading
    ] = useState(false);


    /* =====================================================
       ACTION STATES
    ===================================================== */

    const [
        runningId,
        setRunningId
    ] = useState(null);


    const [
        removingId,
        setRemovingId
    ] = useState(null);


    const [
        actionError,
        setActionError
    ] = useState("");


    /* =====================================================
       CONFIRM POPUP

       {
           algorithm,
           type: "unsave" | "delete"
       }
    ===================================================== */

    const [
        confirmTarget,
        setConfirmTarget
    ] = useState(null);


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
       RESOLVE SAVED PUBLISHED

       /saved/ may return SavedAlgorithm rows:

       {
           id: 50,        <-- saved relation ID
           user: 3,
           algorithm: 8  <-- real algorithm ID
       }

       We must load algorithm 8.
    ===================================================== */

    const resolveSavedPublished =
        async (
            rows
        ) => {

            const result =
                await Promise.all(

                    rows.map(
                        async (
                            row
                        ) => {

                            /* =================================
                               API ALREADY RETURNED FULL ALGORITHM
                            ================================= */

                            const direct =
                                normalizeAlgorithm(
                                    row
                                );


                            if (
                                direct &&
                                direct.title !==
                                undefined &&
                                direct.code !==
                                undefined
                            ) {

                                return direct;

                            }


                            /* =================================
                               GET REAL ALGORITHM ID
                            ================================= */

                            const algorithmId =
                                getSavedAlgorithmId(
                                    row
                                );


                            console.log(
                                "Saved row:",
                                row
                            );


                            console.log(
                                "Resolved published algorithm ID:",
                                algorithmId
                            );


                            if (
                                algorithmId ===
                                null ||
                                algorithmId ===
                                undefined
                            ) {

                                return direct;

                            }


                            /* =================================
                               LOAD ALGORITHM DETAIL
                            ================================= */

                            try {

                                const detailPayload =
                                    await apiRequest(

                                        ENDPOINTS
                                            .ALGORITHM_DETAIL(
                                                algorithmId
                                            )

                                    );


                                console.log(
                                    `Algorithm ${algorithmId} detail:`,
                                    detailPayload
                                );


                                const detail =
                                    unwrapData(
                                        detailPayload
                                    );


                                return (

                                    normalizeAlgorithm(
                                        detail
                                    ) ??

                                    detail ??

                                    direct

                                );

                            }
                            catch (
                            detailError
                            ) {

                                console.error(
                                    `Failed to load algorithm ${algorithmId}:`,
                                    detailError
                                );


                                return direct;

                            }

                        }
                    )

                );


            return uniqueAlgorithms(
                result.filter(Boolean)
            );

        };


    /* =====================================================
       LOAD TAB
    ===================================================== */

    useEffect(() => {

        if (
            !isAuthenticated
        ) {

            return;

        }


        let cancelled =
            false;


        const loadAlgorithms =
            async () => {

                setLoading(
                    true
                );


                setError(
                    ""
                );


                setActionError(
                    ""
                );


                setSelectedAlgo(
                    null
                );


                try {

                    /* =====================================
                       SAVED PUBLISHED
                    ===================================== */

                    if (
                        activeTab ===
                        TAB_PUBLISHED
                    ) {

                        const payload =
                            await apiRequest(
                                ENDPOINTS.SAVED
                            );


                        console.log(
                            "========== SAVED API =========="
                        );


                        console.log(
                            "Full /saved/ response:",
                            payload
                        );


                        const rows =
                            findFirstArray(
                                payload
                            );


                        console.log(
                            "Saved rows:",
                            rows
                        );


                        const resolved =
                            await resolveSavedPublished(
                                rows
                            );


                        console.log(
                            "Resolved saved published algorithms:",
                            resolved
                        );


                        if (
                            !cancelled
                        ) {

                            setAlgorithms(
                                resolved
                            );

                        }


                        return;

                    }


                    /* =====================================
                       MY ALGORITHMS
                    ===================================== */

                    const payload =
                        await apiRequest(
                            ENDPOINTS.MY_ALGORITHMS
                        );


                    console.log(
                        "MY ALGORITHMS RESPONSE:",
                        payload
                    );


                    const rows =
                        findFirstArray(
                            payload
                        );


                    const normalized =
                        rows
                            .map(
                                (
                                    item
                                ) =>

                                    normalizeAlgorithm(
                                        item
                                    ) ??

                                    item
                            )
                            .filter(Boolean);


                    if (
                        !cancelled
                    ) {

                        setAlgorithms(
                            uniqueAlgorithms(
                                normalized
                            )
                        );

                    }

                }
                catch (
                requestError
                ) {

                    console.error(
                        "Saved Algorithms error:",
                        requestError
                    );


                    if (
                        !cancelled
                    ) {

                        setAlgorithms(
                            []
                        );


                        setError(
                            requestError.message
                        );

                    }

                }
                finally {

                    if (
                        !cancelled
                    ) {

                        setLoading(
                            false
                        );

                    }

                }

            };


        loadAlgorithms();


        return () => {

            cancelled =
                true;

        };

    }, [
        isAuthenticated,
        activeTab
    ]);


    /* =====================================================
       SEARCH
    ===================================================== */

    const filtered =
        useMemo(
            () => {

                const query =
                    searchTerm
                        .trim()
                        .toLowerCase();


                if (!query) {

                    return algorithms;

                }


                return algorithms
                    .filter(
                        (
                            algorithm
                        ) => {

                            const title =
                                String(
                                    algorithm.title ??
                                    ""
                                )
                                    .toLowerCase();


                            const description =
                                String(
                                    algorithm.description ??
                                    ""
                                )
                                    .toLowerCase();


                            const topics =
                                getTopicNames(
                                    algorithm
                                );


                            return (

                                title.includes(
                                    query
                                ) ||

                                description.includes(
                                    query
                                ) ||

                                topics.some(
                                    (
                                        topic
                                    ) =>
                                        topic
                                            .toLowerCase()
                                            .includes(
                                                query
                                            )
                                )

                            );

                        }
                    );

            },
            [
                algorithms,
                searchTerm
            ]
        );


    /* =====================================================
       OPEN ALGORITHM
    ===================================================== */

    const openAlgorithm =
        async (
            algorithm
        ) => {

            setSelectedAlgo(
                algorithm
            );


            setActionError(
                ""
            );


            if (
                !algorithm?.id
            ) {

                return;

            }


            setDetailLoading(
                true
            );


            try {

                const payload =
                    await apiRequest(

                        ENDPOINTS
                            .ALGORITHM_DETAIL(
                                algorithm.id
                            )

                    );


                const detail =
                    unwrapData(
                        payload
                    );


                const normalized =
                    normalizeAlgorithm(
                        detail
                    );


                if (
                    normalized
                ) {

                    setSelectedAlgo(
                        normalized
                    );

                }

            }
            catch (
            requestError
            ) {

                console.error(
                    "Could not load algorithm detail:",
                    requestError
                );

            }
            finally {

                setDetailLoading(
                    false
                );

            }

        };


    /* =====================================================
       RUN
    ===================================================== */

    const handleRun = async (algorithm) => {

        if (!algorithm) {
            return;
        }


        setRunningId(
            algorithm.id
        );


        setActionError(
            ""
        );


        try {

            /* =============================================
               GET CODE
            ============================================= */

            const algorithmCode =
                String(
                    algorithm.code ?? ""
                );


            if (!algorithmCode.trim()) {

                throw new Error(
                    "This algorithm does not contain any code."
                );

            }


            /* =============================================
               SAVED PUBLISHED
    
               Published algorithms can use the execute API.
               This records the execution for statistics.
            ============================================= */

            if (
                activeTab ===
                TAB_PUBLISHED
            ) {

                await apiRequest(

                    ENDPOINTS
                        .EXECUTE_ALGORITHM(
                            algorithm.id
                        ),

                    {
                        method:
                            "POST"
                    }

                );

            }


            /* =============================================
               MY ALGORITHMS
    
               DO NOT CALL /execute/
    
               My Algorithms are DRAFT.
               Backend execute endpoint only accepts PUBLISHED.
            ============================================= */


            /* =============================================
               SAVE CODE
    
               This makes sure InputAlgo gets the exact code.
            ============================================= */

            localStorage.setItem(
                "algoInputCode",
                algorithmCode
            );


            /* =============================================
               GO TO INPUT ALGO
            ============================================= */

            navigate(
                "/InputAlgo",
                {
                    state: {

                        code:
                            algorithmCode,

                        algorithmId:
                            algorithm.id,

                        source:
                            activeTab

                    }
                }
            );

        }
        catch (requestError) {

            console.error(
                "Run algorithm error:",
                requestError
            );


            setActionError(
                requestError.message ||
                "Failed to open algorithm."
            );

        }
        finally {

            setRunningId(
                null
            );

        }

    };

    /* =====================================================
       OPEN CONFIRM POPUP
    ===================================================== */

    const askToRemove =
        (
            algorithm
        ) => {

            setConfirmTarget({

                algorithm,

                type:

                    activeTab ===
                        TAB_PUBLISHED
                        ? "unsave"
                        : "delete"

            });

        };


    /* =====================================================
       CONFIRM REMOVE
    ===================================================== */

    const confirmRemove =
        async () => {

            if (
                !confirmTarget
                    ?.algorithm
                    ?.id
            ) {

                return;

            }


            const algorithm =
                confirmTarget.algorithm;


            setRemovingId(
                algorithm.id
            );


            setActionError(
                ""
            );


            try {

                /* =====================================
                   SAVED PUBLISHED
                   UNSAVE ONLY
                ===================================== */

                if (
                    confirmTarget.type ===
                    "unsave"
                ) {

                    await apiRequest(

                        ENDPOINTS
                            .UNSAVE_ALGORITHM(
                                algorithm.id
                            ),

                        {
                            method:
                                "DELETE"
                        }

                    );

                }


                /* =====================================
                   MY ALGORITHM
                   DELETE PERMANENTLY
                ===================================== */

                else {

                    await apiRequest(

                        ENDPOINTS
                            .DELETE_MY_ALGORITHM(
                                algorithm.id
                            ),

                        {
                            method:
                                "DELETE"
                        }

                    );

                }


                /* =====================================
                   REMOVE FROM UI
                ===================================== */

                setAlgorithms(
                    (
                        previous
                    ) =>

                        previous.filter(
                            (
                                item
                            ) =>

                                String(
                                    item.id
                                ) !==
                                String(
                                    algorithm.id
                                )
                        )
                );


                if (
                    String(
                        selectedAlgo?.id
                    ) ===
                    String(
                        algorithm.id
                    )
                ) {

                    setSelectedAlgo(
                        null
                    );

                }


                setConfirmTarget(
                    null
                );

            }
            catch (
            requestError
            ) {

                setActionError(
                    requestError.message
                );


                setConfirmTarget(
                    null
                );

            }
            finally {

                setRemovingId(
                    null
                );

            }

        };


    /* =====================================================
       AUTH LOADING
    ===================================================== */

    if (
        authLoading
    ) {

        return (

            <div className="loading-container">

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

        <div className="saved-algorithms-page">


            <Background />


            <Header />


            <main className="saved-algorithms-main">


                {/* =========================================
                    HEADER
                ========================================= */}

                <div className="saved-algorithms-header">


                    <h1 className="page-title">

                        <StarIcon />

                        Saved Algorithms

                    </h1>


                    <div className="search-wrapper">


                        <input
                            type="text"

                            className="search-input"

                            placeholder={
                                activeTab ===
                                    TAB_PUBLISHED
                                    ? "Search saved published algorithms..."
                                    : "Search my algorithms..."
                            }

                            value={
                                searchTerm
                            }

                            onChange={
                                (
                                    event
                                ) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                            }
                        />


                        <span className="search-icon">

                            <SearchIcon />

                        </span>


                    </div>


                </div>


                {/* =========================================
                    TABS
                ========================================= */}

                <div className="saved-tabs">


                    <button
                        type="button"

                        className={
                            `saved-tab ${activeTab ===
                                TAB_PUBLISHED
                                ? "saved-tab--active"
                                : ""
                            }`
                        }

                        onClick={() => {

                            setActiveTab(
                                TAB_PUBLISHED
                            );

                            setSearchTerm(
                                ""
                            );

                        }}
                    >

                        Saved Published

                    </button>


                    <button
                        type="button"

                        className={
                            `saved-tab ${activeTab ===
                                TAB_MY
                                ? "saved-tab--active"
                                : ""
                            }`
                        }

                        onClick={() => {

                            setActiveTab(
                                TAB_MY
                            );

                            setSearchTerm(
                                ""
                            );

                        }}
                    >

                        My Algorithms

                    </button>


                </div>


                <p className="saved-tab-description">

                    {activeTab ===
                        TAB_PUBLISHED
                        ? "Algorithms you saved from Published Algorithms."
                        : "Algorithms you created and saved yourself."
                    }

                </p>


                {/* =========================================
                    MESSAGES
                ========================================= */}

                {loading && (

                    <div className="loading-container">

                        Loading algorithms...

                    </div>

                )}


                {error && (

                    <div className="error-msg">

                        {error}

                    </div>

                )}


                {actionError && (

                    <div className="error-msg">

                        {actionError}

                    </div>

                )}


                {/* =========================================
                    ALGORITHM GRID
                ========================================= */}

                {!loading && (

                    <div className="saved-algorithms-grid">


                        {filtered.map(
                            (
                                algorithm
                            ) => (

                                <div
                                    key={
                                        algorithm.id
                                    }

                                    className="saved-algo-card"

                                    onClick={() =>
                                        openAlgorithm(
                                            algorithm
                                        )
                                    }
                                >


                                    <div className="saved-algo-card-content">


                                        <div className="saved-algo-icon">

                                            <CodeIcon />

                                        </div>


                                        <h3 className="saved-algo-title">

                                            {algorithm.title ||
                                                "Untitled"
                                            }

                                        </h3>


                                        <p className="saved-algo-desc">

                                            {algorithm.description
                                                ? algorithm.description.length >
                                                    90
                                                    ? `${algorithm.description.slice(
                                                        0,
                                                        90
                                                    )}...`
                                                    : algorithm.description
                                                : "No description"
                                            }

                                        </p>


                                        <div className="saved-topic-list">


                                            {getTopicNames(algorithm).map((topicName) => (

                                                <span
                                                    key={topicName}
                                                    className="saved-algo-topic-badge"
                                                >
                                                    {topicName}
                                                </span>

                                            ))}


                                        </div>


                                        <div className="saved-algo-footer">


                                            <span className="saved-algo-owner">

                                                {activeTab ===
                                                    TAB_PUBLISHED
                                                    ? `By ${getAuthorName(
                                                        algorithm
                                                    )}`
                                                    : "My Algorithm"
                                                }

                                            </span>


                                        </div>


                                    </div>


                                    {/* =================================
                                        REMOVE ICON
                                    ================================= */}

                                    <button
                                        type="button"

                                        className="unsave-btn"

                                        onClick={
                                            (
                                                event
                                            ) => {

                                                event
                                                    .stopPropagation();


                                                askToRemove(
                                                    algorithm
                                                );

                                            }
                                        }

                                        disabled={
                                            removingId ===
                                            algorithm.id
                                        }

                                        title={
                                            activeTab ===
                                                TAB_PUBLISHED
                                                ? "Unsave"
                                                : "Delete"
                                        }
                                    >

                                        {activeTab ===
                                            TAB_PUBLISHED
                                            ? (
                                                <CloseIcon />
                                            )
                                            : (
                                                <DeleteIcon />
                                            )
                                        }

                                    </button>


                                </div>

                            )
                        )}


                        {filtered.length ===
                            0 && (

                                <p className="no-results">

                                    {activeTab ===
                                        TAB_PUBLISHED
                                        ? "No saved published algorithms found."
                                        : "You have not created any algorithms yet."
                                    }

                                </p>

                            )}


                    </div>

                )}


            </main>


            {/* =====================================================
                ALGORITHM DETAIL POPUP
            ===================================================== */}

            {selectedAlgo && (

                <div
                    className="modal-overlay"

                    onClick={() =>
                        setSelectedAlgo(
                            null
                        )
                    }
                >


                    <div
                        className="modal-content algo-modal"

                        onClick={
                            (
                                event
                            ) =>
                                event
                                    .stopPropagation()
                        }
                    >


                        <div className="modal-header">


                            <h2 className="modal-title">

                                {selectedAlgo.title ||
                                    "Untitled"
                                }

                            </h2>


                            <button
                                type="button"

                                className="modal-close-btn"

                                onClick={() =>
                                    setSelectedAlgo(
                                        null
                                    )
                                }
                            >

                                <CloseIcon />

                            </button>


                        </div>


                        <div className="modal-body">


                            {detailLoading && (

                                <p>

                                    Loading details...

                                </p>

                            )}


                            <div className="algo-meta">


                                <span>

                                    <strong>
                                        Author:
                                    </strong>{" "}

                                    {getAuthorName(
                                        selectedAlgo
                                    )}

                                </span>


                                <span>

                                    <strong>
                                        Topic:
                                    </strong>{" "}

                                    {getTopicNames(
                                        selectedAlgo
                                    )
                                        .join(", ") ||
                                        "General"
                                    }

                                </span>


                                {selectedAlgo
                                    .created_at && (

                                        <span>

                                            <strong>
                                                Created:
                                            </strong>{" "}

                                            {new Date(
                                                selectedAlgo
                                                    .created_at
                                            )
                                                .toLocaleDateString()
                                            }

                                        </span>

                                    )}


                            </div>


                            <h3>

                                Description

                            </h3>


                            <p>

                                {selectedAlgo
                                    .description ||
                                    "No description provided."
                                }

                            </p>


                            <h3>

                                Code

                            </h3>


                            <div className="code-block">

                                <pre>
                                    <code>
                                        {selectedAlgo.code ||
                                            "// No code available"
                                        }
                                    </code>
                                </pre>

                            </div>


                            <div className="saved-modal-actions">


                                <button
                                    type="button"

                                    className="saved-run-btn"

                                    onClick={() =>
                                        handleRun(
                                            selectedAlgo
                                        )
                                    }

                                    disabled={
                                        runningId ===
                                        selectedAlgo.id ||
                                        !selectedAlgo.code
                                    }
                                >

                                    <CodeIcon />

                                    {runningId ===
                                        selectedAlgo.id
                                        ? "Opening..."
                                        : "Run Code"
                                    }

                                </button>


                                <button
                                    type="button"

                                    className="saved-remove-btn"

                                    onClick={() =>
                                        askToRemove(
                                            selectedAlgo
                                        )
                                    }

                                    disabled={
                                        removingId ===
                                        selectedAlgo.id
                                    }
                                >

                                    {activeTab ===
                                        TAB_PUBLISHED
                                        ? (
                                            <>
                                                <CloseIcon />

                                                Unsave
                                            </>
                                        )
                                        : (
                                            <>
                                                <DeleteIcon />

                                                Delete
                                            </>
                                        )
                                    }

                                </button>


                            </div>


                        </div>


                    </div>


                </div>

            )}


            {/* =====================================================
                CONFIRM REMOVE POPUP
            ===================================================== */}

            {confirmTarget && (

                <div
                    className="saved-confirm-overlay"

                    onClick={() => {

                        if (
                            !removingId
                        ) {

                            setConfirmTarget(
                                null
                            );

                        }

                    }}
                >


                    <div
                        className="saved-confirm-modal"

                        onClick={
                            (
                                event
                            ) =>
                                event
                                    .stopPropagation()
                        }
                    >


                        <div className="saved-confirm-icon">

                            <WarningIcon />

                        </div>


                        <h2>

                            {confirmTarget.type ===
                                "unsave"
                                ? "Unsave Algorithm?"
                                : "Delete Algorithm?"
                            }

                        </h2>


                        <p>

                            {confirmTarget.type ===
                                "unsave"
                                ? (
                                    <>
                                        Are you sure you want to remove{" "}
                                        <strong>
                                            {confirmTarget.algorithm.title ||
                                                "this algorithm"
                                            }
                                        </strong>{" "}
                                        from your saved published algorithms?
                                    </>
                                )
                                : (
                                    <>
                                        Are you sure you want to permanently delete{" "}
                                        <strong>
                                            {confirmTarget.algorithm.title ||
                                                "this algorithm"
                                            }
                                        </strong>?
                                        <br />
                                        This action cannot be undone.
                                    </>
                                )
                            }

                        </p>


                        <div className="saved-confirm-actions">


                            <button
                                type="button"

                                className="saved-confirm-cancel"

                                onClick={() =>
                                    setConfirmTarget(
                                        null
                                    )
                                }

                                disabled={
                                    !!removingId
                                }
                            >

                                Cancel

                            </button>


                            <button
                                type="button"

                                className="saved-confirm-delete"

                                onClick={
                                    confirmRemove
                                }

                                disabled={
                                    !!removingId
                                }
                            >

                                {removingId
                                    ? (
                                        confirmTarget.type ===
                                            "unsave"
                                            ? "Removing..."
                                            : "Deleting..."
                                    )
                                    : (
                                        confirmTarget.type ===
                                            "unsave"
                                            ? "Yes, Unsave"
                                            : "Yes, Delete"
                                    )
                                }

                            </button>


                        </div>


                    </div>


                </div>

            )}


        </div>

    );

}