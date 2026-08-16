import "./InputAlgo.css";

import CodeEditor
    from "../../Component/CodeEditor/CodeEditor";

import Header
    from "../../Component/Header/Header";

import Background
    from "../../Component/Background/Background";

import {
    useState,
    useEffect,
    useRef
} from "react";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import {
    TextFormater
} from "../../Compiler/TextFormater";

import {
    Tokenizer
} from "../../Compiler/Tokenizer";

import {
    Parser
} from "../../Compiler/Parser";

import {
    useAuth
} from "../../hooks/useAuth";


/* ============================================================
   NORMALIZE ALGORITHM CODE

   This fixes saved / published code that may contain:

   - Windows line endings: \r\n
   - Old Mac line endings: \r
   - Unicode line separators
   - Non-breaking spaces
   - Zero-width invisible characters
   - BOM characters

   These characters can look normal inside the editor but cause
   a lexical error inside Tokenizer.
============================================================ */

function normalizeAlgorithmCode(
    value
) {

    return String(
        value ?? ""
    )

        /* Windows / old Mac line endings */

        .replace(
            /\r\n?/g,
            "\n"
        )

        /* Unicode line / paragraph separators */

        .replace(
            /[\u2028\u2029]/g,
            "\n"
        )

        /* Unicode spaces -> normal space */

        .replace(
            /[\u00A0\u2000-\u200A\u202F\u205F\u3000]/g,
            " "
        )

        /* Remove BOM / zero-width characters */

        .replace(
            /[\uFEFF\u200B-\u200D\u2060]/g,
            ""
        );

}


/* ============================================================
   INPUT ALGORITHM PAGE
============================================================ */

function InputAlgo() {

    const {
        isAuthenticated,
        loading
    } = useAuth();


    const navigate =
        useNavigate();


    const location =
        useLocation();


    /* ========================================================
       AUTH
    ======================================================== */

    useEffect(() => {

        if (
            !loading &&
            !isAuthenticated
        ) {

            navigate(
                "/login",
                {
                    replace: true
                }
            );

        }

    }, [
        isAuthenticated,
        loading,
        navigate
    ]);


    /* ========================================================
       CODE
    ======================================================== */

    const [
        code,
        setCode
    ] = useState(() => {

        try {

            return normalizeAlgorithmCode(
                localStorage.getItem(
                    "algoInputCode"
                ) ?? ""
            );

        }
        catch {

            return "";

        }

    });


    /* ========================================================
       SAVE CODE LOCALLY
    ======================================================== */

    useEffect(() => {

        try {

            localStorage.setItem(
                "algoInputCode",
                normalizeAlgorithmCode(
                    code
                )
            );

        }
        catch {

            // Ignore localStorage errors.

        }

    }, [
        code
    ]);


    /* ========================================================
       AST
    ======================================================== */

    const [
        ast,
        setAst
    ] = useState();


    /* ========================================================
       ACTIVE TAB
    ======================================================== */

    const [
        activeTab,
        setActiveTab
    ] = useState(
        "text"
    );


    /* ========================================================
       BUTTON STATES
    ======================================================== */

    const [
        readyToGenerateFlowChart,
        setReadyToGenerateFlowChart
    ] = useState(
        false
    );


    const [
        readyToCompile,
        setReadyToCompile
    ] = useState(
        false
    );


    const [
        readyToFormat,
        setReadyToformat
    ] = useState(
        false
    );


    /* ========================================================
       STATUS COLORS
    ======================================================== */

    const stateColors = {

        green:
            "rgb(0, 255, 8)",

        yellow:
            "rgb(255, 255, 0)",

        red:
            "rgba(255, 0, 0, 1)",

        gray:
            "gray"

    };


    /* ========================================================
       STATUS
    ======================================================== */

    const [
        inputState,
        setInputState
    ] = useState(
        "welcome"
    );


    const [
        inputStateDescription,
        setInputStateDescription
    ] = useState(
        "welcome to Algorithms input page"
    );


    const [
        isCompilling,
        setIsCompilling
    ] = useState(
        false
    );


    /* ========================================================
       EDITOR REF
    ======================================================== */

    const editorRef =
        useRef(null);


    /* ========================================================
       CHANGE STATUS COLOR
    ======================================================== */

    function changeStatusColor(
        color
    ) {

        document.documentElement
            .style
            .setProperty(
                "--status-color",
                color
            );

    }


    /* ========================================================
       FRONTEND STATISTICS
    ======================================================== */

    const lineCount =

        code.trim().length === 0
            ? 0
            : code
                .split(
                    "\n"
                )
                .length;


    const wordCount =

        code.trim().length === 0
            ? 0
            : code
                .trim()
                .split(
                    /\s+/
                )
                .length;


    /* ========================================================
       APPLY LOADED CODE
    ======================================================== */

    function applyLoadedCode(
        codeValue
    ) {

        const normalizedCode =
            normalizeAlgorithmCode(
                codeValue
            );


        /*
         * A newly loaded algorithm must not reuse
         * previous compile / flowchart state.
         */

        setReadyToCompile(
            false
        );


        setReadyToGenerateFlowChart(
            false
        );


        if (
            normalizedCode
                .trim()
                .length > 0
        ) {

            changeStatusColor(
                stateColors.green
            );


            setReadyToformat(
                true
            );


            setInputState(
                "Ready to continue?"
            );


            setInputStateDescription(
                "You can start formatting now"
            );

        }
        else {

            changeStatusColor(
                stateColors.gray
            );


            setReadyToformat(
                false
            );


            setInputState(
                "Empty code"
            );


            setInputStateDescription(
                "Text area is empty, no action can be done"
            );

        }


        return normalizedCode;

    }


    /* ========================================================
       CODE FROM SAVED / PUBLISHED ALGORITHM
    ======================================================== */

    useEffect(() => {

        const incomingCode =
            location.state?.code;


        /*
         * No algorithm was sent from another page.
         */

        if (
            typeof incomingCode !==
            "string"
        ) {

            return;

        }


        /*
         * IMPORTANT:
         *
         * Normalize code BEFORE putting it into CodeMirror.
         *
         * This is the main fix for:
         *
         * Saved code -> lexical error
         * Edit one space -> works
         */

        const normalizedCode =
            applyLoadedCode(
                incomingCode
            );


        setCode(
            normalizedCode
        );


        setActiveTab(
            "text"
        );


        /*
         * Save normalized code immediately.
         */

        try {

            localStorage.setItem(
                "algoInputCode",
                normalizedCode
            );

        }
        catch {

            // Ignore localStorage error.

        }


        /*
         * Clear React Router state so the same algorithm
         * is not loaded repeatedly.
         */

        navigate(
            ".",
            {
                replace: true,
                state: {}
            }
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        location.state?.code,
        navigate
    ]);


    /* ========================================================
       INITIAL LOCAL CODE
    ======================================================== */

    useEffect(() => {

        const normalizedCode =
            applyLoadedCode(
                code
            );


        if (
            normalizedCode !==
            code
        ) {

            setCode(
                normalizedCode
            );

        }

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, []);


    /* ========================================================
       TEXT TAB
    ======================================================== */

    function handleTextTabClick() {

        setActiveTab(
            "text"
        );


        if (
            code.trim()
        ) {

            changeStatusColor(
                stateColors.green
            );


            setInputState(
                "Ready to continue?"
            );


            setInputStateDescription(
                "You can continue editing now ..."
            );

        }
        else {

            changeStatusColor(
                stateColors.green
            );


            setInputState(
                "text input area"
            );


            setInputStateDescription(
                "enter your algorithm in the text area"
            );

        }

    }


    /* ========================================================
       UPLOAD TAB
    ======================================================== */

    function handleUploadFileTabClick() {

        setActiveTab(
            "upload"
        );


        changeStatusColor(
            stateColors.green
        );


        setInputState(
            "upload file area"
        );


        setInputStateDescription(
            "upload a .txt file that contains the algorithm"
        );

    }


    /* ========================================================
       BLOCK TAB
       COMING SOON
    ======================================================== */

    function handleBlocksTabClick() {

        setActiveTab(
            "blocks"
        );


        changeStatusColor(
            stateColors.gray
        );


        setInputState(
            "Coming Soon"
        );


        setInputStateDescription(
            "Block Editor is not available yet"
        );

    }


    /* ========================================================
       FILE UPLOAD
       .TXT ONLY
    ======================================================== */

    function handleFileUpload(
        event
    ) {

        const file =
            event.target.files?.[0];


        if (!file) {

            return;

        }


        /* ----------------------------------------------------
           VERIFY EXTENSION
        ---------------------------------------------------- */

        const isTxtFile =
            file.name
                .toLowerCase()
                .endsWith(
                    ".txt"
                );


        if (!isTxtFile) {

            event.target.value =
                "";


            changeStatusColor(
                stateColors.red
            );


            setInputState(
                "Invalid file type"
            );


            setInputStateDescription(
                "Only .txt files are supported"
            );


            return;

        }


        /* ----------------------------------------------------
           READ TXT
        ---------------------------------------------------- */

        const reader =
            new FileReader();


        reader.onload =
            (
                loadEvent
            ) => {

                const content =
                    normalizeAlgorithmCode(
                        loadEvent
                            .target
                            ?.result ?? ""
                    );


                setCode(
                    content
                );


                setActiveTab(
                    "text"
                );


                applyLoadedCode(
                    content
                );


                setInputState(
                    "File loaded"
                );


                setInputStateDescription(
                    `Loaded "${file.name}" successfully.`
                );

            };


        reader.onerror =
            () => {

                changeStatusColor(
                    stateColors.red
                );


                setInputState(
                    "File read error"
                );


                setInputStateDescription(
                    "Could not read the file. Please try again."
                );

            };


        reader.readAsText(
            file
        );

    }


    /* ========================================================
       AUTO FOCUS
    ======================================================== */

    useEffect(() => {

        if (
            activeTab ===
            "text"
        ) {

            editorRef.current
                ?.view
                ?.focus();

        }

    }, [
        activeTab
    ]);


    /* ========================================================
       EMPTY TEXT TAB STATUS
    ======================================================== */

    useEffect(() => {

        if (
            activeTab !==
            "text"
        ) {

            return;

        }


        /*
         * Do not overwrite "Algorithm loaded" /
         * "File loaded" state when code already exists.
         */

        if (
            code.trim()
        ) {

            return;

        }


        changeStatusColor(
            stateColors.green
        );


        setInputState(
            "text input area"
        );


        setInputStateDescription(
            "enter your algorithm in the text area"
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps

    }, [
        activeTab
    ]);


    /* ========================================================
       TEXT EDITOR FOCUS
    ======================================================== */

    function handleTextAreaFocus() {

        changeStatusColor(
            stateColors.green
        );


        if (
            code.trim() ===
            ""
        ) {

            setInputState(
                "Ready to start ?"
            );


            setInputStateDescription(
                "you can start writing now ..."
            );

        }
        else {

            setInputState(
                "Ready to continue?"
            );


            setInputStateDescription(
                "you can continue editing now ..."
            );

        }

    }


    /* ========================================================
       CODE EDITOR SETTER

       CodeEditor receives this instead of the raw setCode.
       Any editor value is normalized before entering state.
    ======================================================== */

    function handleEditorSetCode(
        value
    ) {

        setCode(
            (
                previousCode
            ) => {

                const nextCode =

                    typeof value ===
                        "function"

                        ? value(
                            previousCode
                        )

                        : value;


                return normalizeAlgorithmCode(
                    nextCode
                );

            }
        );

    }


    /* ========================================================
       TEXT CHANGE
    ======================================================== */

    function handleTextAreaChange(
        value
    ) {

        const normalizedValue =
            normalizeAlgorithmCode(
                value
            );


        /*
         * Keep state normalized even if CodeEditor only calls
         * handlChange and does not call the setCode prop first.
         */

        setCode(
            normalizedValue
        );


        /*
         * Any change invalidates old compile results.
         */

        setReadyToCompile(
            false
        );


        setReadyToGenerateFlowChart(
            false
        );


        setReadyToformat(
            false
        );


        if (
            normalizedValue
                .trim() ===
            ""
        ) {

            changeStatusColor(
                stateColors.gray
            );


            setInputState(
                "Empty code"
            );


            setInputStateDescription(
                "Text area is empty, no action can be done"
            );

        }
        else {

            changeStatusColor(
                stateColors.yellow
            );


            setInputState(
                "writing..."
            );


            setInputStateDescription(
                "writing in the text editor"
            );


            setReadyToformat(
                true
            );

        }

    }


    /* ========================================================
       TEXT BLUR
    ======================================================== */

    function handleTextAreaBlur() {

        if (
            code.trim() ===
            ""
        ) {

            changeStatusColor(
                stateColors.gray
            );


            setReadyToCompile(
                false
            );


            setReadyToGenerateFlowChart(
                false
            );


            setInputState(
                "Empty code"
            );


            setInputStateDescription(
                "Text area is empty, no action can be done"
            );


            return;

        }


        if (
            readyToCompile
        ) {

            changeStatusColor(
                stateColors.green
            );


            setInputState(
                "Ready for compiling?"
            );


            setInputStateDescription(
                "You can start compiling now"
            );

        }
        else if (
            readyToFormat
        ) {

            changeStatusColor(
                stateColors.green
            );


            setInputState(
                "Ready for formatting?"
            );


            setInputStateDescription(
                "You can start formatting now"
            );

        }

    }


    /* ========================================================
       FORMAT
    ======================================================== */

    function handlFormatButtonClicking() {

        if (
            !readyToFormat
        ) {

            return;

        }


        console.clear();


        changeStatusColor(
            stateColors.green
        );


        setReadyToCompile(
            true
        );


        setReadyToGenerateFlowChart(
            false
        );


        setInputState(
            "Ready for compiling?"
        );


        setInputStateDescription(
            "You can start compiling now"
        );


        /*
         * Normalize BEFORE TextFormater.
         */

        const normalizedCode =
            normalizeAlgorithmCode(
                code
            );


        TextFormater.setText(
            normalizedCode
        );


        TextFormater.format();


        /*
         * Also normalize formatter output.
         */

        const formattedCode =
            normalizeAlgorithmCode(
                TextFormater
                    .getFormatedText()
            );


        setCode(
            formattedCode
        );


        TextFormater.reset();

    }


    /* ========================================================
       COMPILE
    ======================================================== */

    function handleCompileButtonClick() {

        if (
            !readyToCompile
        ) {

            return;

        }


        console.clear();


        changeStatusColor(
            stateColors.yellow
        );


        setInputState(
            "compiling...."
        );


        setInputStateDescription(
            "compiling the code, this should not take long"
        );


        setIsCompilling(
            true
        );


        /* ----------------------------------------------------
           FINAL NORMALIZATION BEFORE TOKENIZER

           Even if code entered through some unexpected path,
           Tokenizer will never receive CRLF, BOM, NBSP, or
           zero-width characters.
        ---------------------------------------------------- */

        const normalizedCode =
            normalizeAlgorithmCode(
                code
            );


        if (
            normalizedCode !==
            code
        ) {

            setCode(
                normalizedCode
            );

        }


        /* ----------------------------------------------------
           TOKENIZE
        ---------------------------------------------------- */

        Tokenizer.tokenize(
            normalizedCode
        );


        if (
            Tokenizer.hasErrors
        ) {

            setIsCompilling(
                false
            );


            setReadyToGenerateFlowChart(
                false
            );


            changeStatusColor(
                stateColors.red
            );


            setInputState(

                Tokenizer
                    .getLexicalError()
                    .getErrorType() +

                " error"

            );


            setInputStateDescription(

                Tokenizer
                    .getLexicalError()
                    .getErrorMesssage()

            );


            return;

        }


        /* ----------------------------------------------------
           TOKENIZED
        ---------------------------------------------------- */

        changeStatusColor(
            stateColors.green
        );


        setInputState(
            "Tokenized success"
        );


        setInputStateDescription(

            `found ${Tokenizer
                .getTokensArray()
                .length
            } tokens`

        );


        /* ----------------------------------------------------
           PARSE
        ---------------------------------------------------- */

        changeStatusColor(
            stateColors.yellow
        );


        setInputState(
            "Parsing...."
        );


        setInputStateDescription(
            "Parsing the code, this should not take long"
        );


        const myParser =
            new Parser(
                Tokenizer
                    .getTokensArray()
            );


        myParser.parse();


        if (
            myParser.hasErrors
        ) {

            setIsCompilling(
                false
            );


            setReadyToGenerateFlowChart(
                false
            );


            changeStatusColor(
                stateColors.red
            );


            setInputState(

                myParser
                    .errors[0]
                    .getErrorType() +

                " error"

            );


            setInputStateDescription(

                myParser
                    .errors[0]
                    .getErrorMesssage()

            );


            return;

        }


        /* ----------------------------------------------------
           SUCCESS
        ---------------------------------------------------- */

        changeStatusColor(
            stateColors.green
        );


        setInputState(
            "Compiled successfully"
        );


        setInputStateDescription(
            "you can generate flowchart now"
        );


        setAst(
            myParser.programNode
        );


        setIsCompilling(
            false
        );


        setReadyToGenerateFlowChart(
            true
        );

    }


    /* ========================================================
       GENERATE FLOWCHART
    ======================================================== */

    function handleGenerateButtonClick() {

        if (
            !readyToGenerateFlowChart
        ) {

            return;

        }


        console.clear();


        navigate(
            "/resultPage",
            {
                state: {
                    ast
                }
            }
        );

    }


    /* ========================================================
       AUTH LOADING
    ======================================================== */

    if (
        loading
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


    /* ========================================================
       PAGE
    ======================================================== */

    return (

        <div className="algorithm-page">


            {/* ==================================================
                PREVENT CLICK WHILE COMPILING
            ================================================== */}

            <div
                className={
                    `prevent-clicking-screen-${isCompilling
                        ? "enabled"
                        : "disabled"
                    }`
                }
            />


            <Header />


            <div className="page-container">


                {/* =================================================
                    LEFT AREA
                ================================================= */}

                <div className="left-container">


                    <div className="main-editting-area">


                        {/* =============================================
                            TABS
                        ============================================= */}

                        <div className="tabs-bar">


                            <div className="editor-tabs">


                                {/* TEXT */}

                                <button
                                    type="button"

                                    className={
                                        activeTab ===
                                            "text"

                                            ? "tab active-tab"

                                            : "tab"
                                    }

                                    onClick={
                                        handleTextTabClick
                                    }
                                >

                                    Text Editor

                                </button>


                                {/* FILE UPLOAD */}

                                <button
                                    type="button"

                                    className={
                                        activeTab ===
                                            "upload"

                                            ? "tab active-tab"

                                            : "tab"
                                    }

                                    onClick={
                                        handleUploadFileTabClick
                                    }
                                >

                                    File Upload

                                </button>


                                {/* BLOCK EDITOR */}

                                <button
                                    type="button"

                                    className={
                                        activeTab ===
                                            "blocks"

                                            ? "tab active-tab"

                                            : "tab"
                                    }

                                    onClick={
                                        handleBlocksTabClick
                                    }
                                >

                                    <span>
                                        Block Editor
                                    </span>

                                </button>


                            </div>


                        </div>


                        {/* =============================================
                            INPUT CONTAINER
                        ============================================= */}

                        <div className="input-container">


                            {/* =========================================
                                TEXT EDITOR
                            ========================================= */}

                            {
                                activeTab ===
                                "text" && (

                                    <CodeEditor

                                        ref={
                                            editorRef
                                        }

                                        code={
                                            code
                                        }

                                        setCode={
                                            handleEditorSetCode
                                        }

                                        handlFocus={
                                            handleTextAreaFocus
                                        }

                                        handlBlur={
                                            handleTextAreaBlur
                                        }

                                        handlChange={
                                            handleTextAreaChange
                                        }

                                    />

                                )
                            }


                            {/* =========================================
                                FILE UPLOAD
                            ========================================= */}

                            {
                                activeTab ===
                                "upload" && (

                                    <div className="upload-area">


                                        <h2>

                                            Upload Pseudo Code File

                                        </h2>


                                        <input
                                            type="file"

                                            accept=".txt"

                                            onChange={
                                                handleFileUpload
                                            }
                                        />


                                        <p className="upload-file-hint">

                                            Only .txt files are supported.

                                        </p>


                                    </div>

                                )
                            }


                            {/* =========================================
                                BLOCK EDITOR
                            ========================================= */}

                            {
                                activeTab ===
                                "blocks" && (

                                    <div className="blocks-area">


                                        <div className="blocks-coming-soon">

                                            COMING SOON

                                        </div>


                                        <h2>

                                            Block Editor

                                        </h2>


                                        <p>

                                            Drag & drop blocks will be available in a future update.

                                        </p>


                                    </div>

                                )
                            }


                        </div>


                    </div>


                </div>


                {/* =================================================
                    CONTROL PANEL
                ================================================= */}

                <div className="controls-area">


                    <div className="controls-area-header">

                        Control Panel

                    </div>


                    <div className="controls-container">


                        {/* =============================================
                            STATUS
                        ============================================= */}

                        <div className="status-section">


                            <div className="status">

                                Status

                            </div>


                            <div className="input-state">

                                {inputState}

                            </div>


                            <div className="input-state-description">

                                {inputStateDescription}

                            </div>


                        </div>


                        {/* =============================================
                            BUTTONS
                        ============================================= */}

                        <div className="buttons">


                            {/* FORMAT */}

                            <button
                                type="button"

                                className={
                                    readyToFormat

                                        ? "format-text"

                                        : "inactive-button"
                                }

                                onClick={
                                    handlFormatButtonClicking
                                }

                                disabled={
                                    !readyToFormat
                                }
                            >

                                Format code

                            </button>


                            {/* COMPILE */}

                            <button
                                type="button"

                                className={
                                    readyToCompile

                                        ? "active-compile-button"

                                        : "inactive-button"
                                }

                                onClick={
                                    handleCompileButtonClick
                                }

                                disabled={
                                    !readyToCompile
                                }
                            >

                                Compile

                            </button>


                            {/* GENERATE */}

                            <button
                                type="button"

                                className={
                                    readyToGenerateFlowChart

                                        ? "generate-btn active-button"

                                        : "inactive-button"
                                }

                                onClick={
                                    handleGenerateButtonClick
                                }

                                disabled={
                                    !readyToGenerateFlowChart
                                }
                            >

                                Generate Flowchart

                            </button>


                        </div>


                        {/* =============================================
                            BOTTOM CONTROL AREA
                        ============================================= */}

                        <div className="last-control-section">


                            {/* =========================================
                                STATISTICS
                            ========================================= */}

                            <div className="statistics">


                                <div className="statistics-header">

                                    Statistics :

                                </div>


                                {/* LINES */}

                                <div className="statistics-lines">


                                    <span>

                                        Lines

                                    </span>


                                    <span>

                                        {lineCount}

                                    </span>


                                </div>


                                {/* WORDS */}

                                <div className="statistics-words">


                                    <span>

                                        Words

                                    </span>


                                    <span>

                                        {wordCount}

                                    </span>


                                </div>


                            </div>


                            {/* =========================================
                                HELP
                            ========================================= */}

                            <div className="get-help">


                                <div className="get-help-header">

                                    Need help?

                                </div>


                                <button
                                    type="button"

                                    onClick={
                                        () =>
                                            navigate(
                                                "/help/language"
                                            )
                                    }

                                    className="help-button"
                                >

                                    Language Guide

                                </button>


                                <button
                                    type="button"

                                    onClick={
                                        () =>
                                            navigate(
                                                "/help/input"
                                            )
                                    }

                                    className="help-button"
                                >

                                    Input Methods

                                </button>


                            </div>


                        </div>


                    </div>


                </div>


            </div>


            <Background
                noAnimation={
                    true
                }
            />


        </div>

    );

}


export default InputAlgo;