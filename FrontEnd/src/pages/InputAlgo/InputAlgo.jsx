import "./InputAlgo.css";
import CodeEditor from "../../Component/CodeEditor/CodeEditor";
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TextFormater } from "../../Compiler/TextFormater";
import { Tokenizer } from "../../Compiler/Tokenizer";
import { Parser } from "../../Compiler/Parser";
import { useAuth } from "../../hooks/useAuth";

function InputAlgo() {
    const { isAuthenticated, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            navigate("/login", { replace: true });
        }
    }, [isAuthenticated, loading, navigate]);

    // ── Restore code from localStorage on first mount ──
    const [code, setCode] = useState(() => {
        try {
            return localStorage.getItem("algoInputCode") ?? "";
        } catch {
            return "";
        }
    });

    // ── Save code to localStorage whenever it changes ──
    useEffect(() => {
        try {
            localStorage.setItem("algoInputCode", code);
        } catch {
            // ignore if storage is full
        }
    }, [code]);

    const [statistics, setStatistics] = useState({
        loops: 0,
        conditions: 0,
        variables: 0,
    });
    const [ast, setAst] = useState();

    const [activeTab, setActiveTab] = useState("text");
    const [readyToGenerateFlowChart, setReadyToGenerateFlowChart] = useState(false);
    const [readyToCompile, setReadyToCompile] = useState(false);
    const [readyToFormat, setReadyToformat] = useState(false);

    const stateColors = {
        green: "rgb(0, 255, 8)",
        yellow: "rgb(255, 255, 0)",
        red: "rgba(255, 0, 0, 1)",
        gray: "gray",
    };
    const [inputState, setInputState] = useState("welcome");
    const [inputStateDescription, setInputStateDescription] = useState(
        "welcome to Algorithms input page"
    );
    const [isCompilling, setIsCompilling] = useState(false);

    const editorRef = useRef(null);

    // Helper to update status color and reset statistics
    function changeStatusColor(color) {
        document.documentElement.style.setProperty("--status-color", `${color}`);
        setStatistics({ loops: 0, conditions: 0, variables: 0 });
    }

    // Apply ready state based on loaded code (non‑empty → ready to format)
    const applyLoadedCode = (codeValue) => {
        if (codeValue && codeValue.trim().length > 0) {
            changeStatusColor(stateColors.green);
            setReadyToformat(true);
            setInputState("Ready to continue?");
            setInputStateDescription("You can start formatting now");
        } else {
            changeStatusColor(stateColors.gray);
            setReadyToformat(false);
            setInputState("Empty code");
            setInputStateDescription("Text area is empty , no action can be done");
        }
    };

    // ── Accept code passed from another page (e.g. Run button) ──
    useEffect(() => {
        if (location.state?.code) {
            setCode(location.state.code);
            applyLoadedCode(location.state.code);
            // Clear the state so the code doesn't reappear after a refresh
            navigate(".", { replace: true, state: {} });
        }
    }, [location.state?.code, navigate]);

    // ── Apply initial code from localStorage on mount ──
    useEffect(() => {
        applyLoadedCode(code);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Tab switch handlers ──
    function handleTextTabClick() {
        setActiveTab("text");
        changeStatusColor(stateColors.green);
        setInputState("text input area");
        setInputStateDescription("enter your algorithm in the text area");
    }

    function handleUploadFileTabClick() {
        setActiveTab("upload");
        changeStatusColor(stateColors.green);
        setInputState("upload file area");
        setInputStateDescription("upload a file that contains the algorithm");
    }

    function handleBlocksTabClick() {
        setActiveTab("blocks");
        changeStatusColor(stateColors.green);
        setInputState("Blocks area");
        setInputStateDescription("hold & drop blocks to build your algorithm");
    }

    // ── File upload handler ──
    function handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            setCode(content);
            setActiveTab("text");
            applyLoadedCode(content);
            setInputState("File loaded");
            setInputStateDescription(`Loaded "${file.name}" successfully.`);
        };

        reader.onerror = () => {
            changeStatusColor(stateColors.red);
            setInputState("File read error");
            setInputStateDescription("Could not read the file. Please try again.");
        };

        reader.readAsText(file);
    }

    // ── Auto‑focus the text editor when the Text tab is active ──
    useEffect(() => {
        if (activeTab === "text" && editorRef.current) {
            editorRef.current.focus();
        }
    }, [activeTab]);

    // ── Initial setup on mount ──
    useEffect(() => {
        if (activeTab === "text") {
            changeStatusColor(stateColors.green);
            setInputState("text input area");
            setInputStateDescription("enter your algorithm in the text area");
        }
    }, []);

    // ── Text area interactions (called by CodeEditor) ──
    function handleTextAreaFocus() {
        changeStatusColor(stateColors.green);
        if (code === "") {
            setInputState("Ready to start ?");
            setInputStateDescription("you can start writing now ...");
        } else {
            setInputState("Ready to continue?");
            setInputStateDescription("you can continue editing now ...");
        }
    }

    function handleTextAreaChange(value) {
        setReadyToCompile(false);
        setReadyToGenerateFlowChart(false);
        setReadyToformat(false);

        if (value === "") {
            changeStatusColor(stateColors.gray);
            setInputState("Empty code");
            setInputStateDescription("Text area is empty , no action can be done");
        } else {
            changeStatusColor(stateColors.yellow);
            setInputState("writing...");
            setInputStateDescription("writing in the text editor");
            setReadyToformat(true);
        }
    }

    function handleTextAreaBlur(value) {
        if (value === "") {
            changeStatusColor(stateColors.gray);
            setReadyToCompile(false);
            setReadyToGenerateFlowChart(false);
            setInputState("Empty code");
            setInputStateDescription("Text area is empty , no action can be done");
        } else {
            if (readyToCompile) {
                changeStatusColor(stateColors.green);
                setInputState("Ready for compiling?");
                setInputStateDescription("You can start compiling now");
            } else if (readyToFormat) {
                changeStatusColor(stateColors.green);
                setInputState("Ready for formatting?");
                setInputStateDescription("You can start formatting now");
            }
        }
    }

    // ── Button actions (unchanged) ──
    function handlFormatButtonClicking() {
        if (!readyToFormat) return;
        console.clear();
        changeStatusColor(stateColors.green);
        setReadyToCompile(true);
        setInputState("Ready for compiling?");
        setInputStateDescription("You can start compiling now");
        TextFormater.setText(code);
        TextFormater.format();
        setCode(TextFormater.getFormatedText());
        TextFormater.reset();
    }

    function handleCompileButtonClick() {
        console.clear();
        if (!readyToCompile) return;
        changeStatusColor(stateColors.yellow);
        setInputState("compiling....");
        setInputStateDescription("compiling the code , this should not take long");
        setIsCompilling(true);
        Tokenizer.tokenize(code);
        setIsCompilling(false);

        if (Tokenizer.hasErrors) {
            changeStatusColor(stateColors.red);
            setInputState(Tokenizer.getLexicalError().getErrorType() + " error");
            setInputStateDescription(Tokenizer.getLexicalError().getErrorMesssage());
            return;
        }

        changeStatusColor(stateColors.green);
        setInputState("Tokenized success");
        setInputStateDescription(`found ${Tokenizer.getTokensArray().length} tokens`);

        changeStatusColor(stateColors.yellow);
        setInputState("Parsing....");
        setInputStateDescription("Parsing the code , this should not take long");
        const myParser = new Parser(Tokenizer.getTokensArray());
        myParser.parse();

        if (myParser.hasErrors) {
            setIsCompilling(false);
            changeStatusColor(stateColors.red);
            setInputState(myParser.errors[0].getErrorType() + " error");
            setInputStateDescription(myParser.errors[0].getErrorMesssage());
            return;
        }

        changeStatusColor(stateColors.green);
        setInputState("Compiled successfully");
        setInputStateDescription("you can generate flowchart now");
        setAst(myParser.programNode);
        setIsCompilling(false);
        setReadyToGenerateFlowChart(true);
    }

    function handleGenerateButtonClick() {
        if (!readyToGenerateFlowChart) return;
        console.clear();
        navigate("/resultPage", { state: { ast } });
    }

    if (loading) {
        return <div className="loading-container">Checking authentication...</div>;
    }
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="algorithm-page">
            <div
                className={`prevent-clicking-screen-${isCompilling ? "enabled" : "disabled"}`}
            ></div>
            <Header />
            <div className="page-container">
                {/* Left container */}
                <div className="left-container">
                    <div className="main-editting-area">
                        {/* Tabs bar */}
                        <div className="tabs-bar">
                            <div className="editor-tabs">
                                <button
                                    className={activeTab === "text" ? "tab active-tab" : "tab"}
                                    onClick={handleTextTabClick}
                                >
                                    Text Editor
                                </button>
                                <button
                                    className={activeTab === "upload" ? "tab active-tab" : "tab"}
                                    onClick={handleUploadFileTabClick}
                                >
                                    File Upload
                                </button>
                                <button
                                    className={activeTab === "blocks" ? "tab active-tab" : "tab"}
                                    onClick={handleBlocksTabClick}
                                >
                                    Block Editor
                                </button>
                            </div>
                        </div>

                        {/* Input area */}
                        <div className="input-container">
                            {activeTab === "text" && (
                                <CodeEditor
                                    ref={editorRef}
                                    code={code}
                                    setCode={setCode}
                                    handlFocus={handleTextAreaFocus}
                                    handlBlur={handleTextAreaBlur}
                                    handlChange={handleTextAreaChange}
                                />
                            )}
                            {activeTab === "upload" && (
                                <div className="upload-area">
                                    <h2>Upload Pseudo Code File</h2>
                                    <input
                                        type="file"
                                        accept=".txt,.py,.js,.java,.cpp,.c,.algo"
                                        onChange={handleFileUpload}
                                    />
                                </div>
                            )}
                            {activeTab === "blocks" && (
                                <div className="blocks-area">
                                    <h2>Block Editor</h2>
                                    <p>Drag and Drop blocks here.</p>
                                </div>
                            )}
                            {activeTab === "none" && (
                                <div className="default-input">
                                    <h2>Choose an input method from the tabs</h2>
                                    <h2>at the top to get started</h2>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Control Panel */}
                <div className="controls-area">
                    <div className="controls-area-header">Control Panel</div>
                    <div className="controls-container">
                        <div className="status-section">
                            <div className="status">Status</div>
                            <div className="input-state">{inputState}</div>
                            <div className="input-state-description">{inputStateDescription}</div>
                        </div>
                        <div className="buttons">
                            <button
                                className={readyToFormat ? "format-text" : "inactive-button"}
                                onClick={handlFormatButtonClicking}
                            >
                                Format code
                            </button>
                            <button
                                className={
                                    readyToCompile ? "active-compile-button" : "inactive-button"
                                }
                                onClick={handleCompileButtonClick}
                            >
                                Compile
                            </button>
                            <button
                                className={
                                    readyToGenerateFlowChart
                                        ? "generate-btn active-button"
                                        : "generate-btn"
                                }
                                onClick={handleGenerateButtonClick}
                            >
                                Generate Flowchart
                            </button>
                        </div>
                        <div className="last-control-section">
                            <div className="statistics">
                                <div className="statistics-header">Statistics :</div>
                                <div className="statistics-loops">
                                    loops <span>{statistics.loops}</span>
                                </div>
                                <div className="statistics-conditions">
                                    conditions <span>{statistics.conditions}</span>
                                </div>
                                <div className="statistics-variables">
                                    variables <span>{statistics.variables}</span>
                                </div>
                            </div>
                            <div className="get-help">
                                <div className="get-help-header">Need help?</div>
                                <button
                                    onClick={() => navigate("/help/language")}
                                    className="help-button"
                                >
                                    Language Guide
                                </button>
                                <button
                                    onClick={() => navigate("/help/input")}
                                    className="help-button"
                                >
                                    Input Methods
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Background noAnimation={true} />
        </div>
    );
}

export default InputAlgo;