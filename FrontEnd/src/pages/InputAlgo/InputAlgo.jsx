import "./InputAlgo.css";
import { FlowchartBuilder } from "../../Component/ResultManager/FlowchartBuilder";
import CodeEditor from "../../Component/CodeEditor/CodeEditor"
import Header from "../../Component/Header/Header";
import Background from "../../Component/Background/Background";
import { useState } from "react";
//import { useNavigate } from "react-router-dom";
import {TextFormater} from "../../Compiler/TextFormater"
import { Tokenizer } from "../../Compiler/Tokenizer";
import { Parser } from "../../Compiler/Parser";
// temp imports for testing 
import {LayoutTreeBuilder} from "../../Component/ResultManager/LayoutTreeBuilder"


function InputAlgo() {
    // code & compiler variables
    const [code, setCode] = useState("");
    const [statistics,setStatistics]=useState({
        loops : 0 ,
        conditions: 0,
        variables : 0 
    });
    const [ast,setAst] =useState()
    

    //buttons and tabs variables
    const [activeTab, setActiveTab] = useState("none");
    const [readyToGenerateFlowChart, setReadyToGenerateFlowChart] = useState(false);
    const [readyToCompile, setReadyToCompile] = useState(false);
    const [readyToFormat, setReadyToformat] = useState(false)

    // input state variables
    const stateColors={
        green :"rgb(0, 255, 8)",
        yellow:"rgb(255, 255, 0)",
        red:"rgba(255, 0, 0, 1)",
        gray:"gray"
    }
    const [inputState, setInputState] = useState("welcome");
    const [inputStateDescription, setInputStateDescription] = useState("welcome to Algorithms input page")

    // compiler variables   
    const[isCompilling,setIsCompilling] = useState(false)
    
    // navigate variables
    //const navigate = useNavigate();

    function changeStatusColor(color) {
        document.documentElement.style.setProperty("--status-color", `${color}`)
        setStatistics({loops:0,conditions:0,variables:0})
    }
    
    // buttons clicks handling 
    // format button
    function handlFormatButtonClicking() {
        if(!readyToFormat)
            return;
        console.clear();
        changeStatusColor(stateColors.green)
        setReadyToCompile(true);
        setInputState("Ready for compilling?");
        setInputStateDescription("You can start compilling now")
        console.log( "code is : \n",code);
        TextFormater.setText(code)
        TextFormater.format();
        setCode(TextFormater.getFormatedText())
        TextFormater.reset();
        console.log("code formated successfully")
    }
    // generate flowchart button
    function handleGenerateButtonClick() {
        // console.log(inputState, inputStateDescription);
        if (!readyToGenerateFlowChart)
            return;
        console.clear();
        let tempGraph = new FlowchartBuilder() ;
        let tempFlowGraph =tempGraph.build(ast) 
        console.log("flow graph built successfully")
        let tempLayoutTree = new LayoutTreeBuilder()
        console.log(tempLayoutTree.build(tempFlowGraph))
        console.log("layout tree built successfully")

        changeStatusColor(stateColors.green)
        setInputState("Flow graph built successfully");
        setInputStateDescription("upcoming : result page")

        //navigate("/resaultPage");
    }
    // compile button
    function handleCompileButtonClick() {
        console.clear() ;
        if (!readyToCompile)
            return;
        //setIsCompilling(true);
        changeStatusColor(stateColors.yellow)
        setInputState("compiling....")
        setInputStateDescription("compilling the code , this should not take long")
        setIsCompilling(true);
        Tokenizer.tokenize(code);
        setIsCompilling(false)
        if(Tokenizer.hasErrors){
            setIsCompilling(false)
            changeStatusColor(stateColors.red)
            setInputState(Tokenizer.getLexicalError().getErrorType()+" error")
            setInputStateDescription(Tokenizer.getLexicalError().getErrorMesssage())
            return ;
        }
        else{
            changeStatusColor(stateColors.green)
            setInputState("Tokenized success")
            setInputStateDescription(`found ${Tokenizer.getTokensArray().length} tokens`)
            console.log(Tokenizer.getTokensArray())
        }
        changeStatusColor(stateColors.yellow)
        setInputState("Parsing....")
        setInputStateDescription("Parsing the code , this should not take long")
        let myParser = new Parser(Tokenizer.getTokensArray())
        myParser.parse();
        if(myParser.hasErrors){
            setIsCompilling(false)
            changeStatusColor(stateColors.red)
            setInputState(myParser.errors[0].getErrorType()+" error")
            setInputStateDescription(myParser.errors[0].getErrorMesssage())
            return ;
        }
        else{
            changeStatusColor(stateColors.green)
            setInputState("Compiled successfully")
            setInputStateDescription(`you can generate flowchart now`)
            console.log(myParser.programNode)
            setAst( myParser.programNode) ;
        }
        setIsCompilling(false)
        setReadyToGenerateFlowChart(true);
    }



    function handleTextAreaFocus() {
        changeStatusColor(stateColors.green)
        if (code == "") {
            setInputState("Ready to start ?")
            setInputStateDescription("you can start writting now ...")
        }
        else {
            setInputState("Ready to continue?")
            setInputStateDescription("you can continue editting now ...")
        }
    }

    function handleTextAreaChange(value) {
        setReadyToCompile(false);
        setReadyToGenerateFlowChart(false)
        
        setReadyToGenerateFlowChart(false)
        if (value == "") {
            changeStatusColor(stateColors.gray)
            setInputState("Empty code");
            setInputStateDescription("Text area is empty , no action can be done")
            setReadyToformat(false)
        } else {
            changeStatusColor(stateColors.green)
            setInputState("writting...");
            changeStatusColor(stateColors.yellow)
            setInputStateDescription("writting in the text editor")
            setReadyToformat(true);
        }
    }

    function handleTextAreaBlur(value) {
        if (value == "") {
            changeStatusColor(stateColors.gray)
            setReadyToCompile(false);
            setReadyToGenerateFlowChart(false)
            setInputState("Empty code");
            setInputStateDescription("Text area is empty , no action can be done")
        }
        else {
            if (readyToCompile) {
                changeStatusColor(stateColors.green)
                setInputState("Ready for compilling?");
                setInputStateDescription("You can start compilling now")
            }
            else if (readyToFormat) {
                changeStatusColor(stateColors.green)
                setInputState("Ready for formatting?");
                setInputStateDescription("You can start formatting now")
            }
        }
    }


    function handleTextTabClick() {
        setActiveTab("text");
        changeStatusColor(stateColors.green)
        setInputState("text input area");
        setInputStateDescription("enter you algorithm in the text area")
    }

    function handleUploadFileTabClick() {
        setActiveTab("upload");
        changeStatusColor(stateColors.green)
        setInputState("upload file area")
        setInputStateDescription("upload a file that contains the algorithm")
    }

    function handleBlocksTabClick() {
        setActiveTab("blocks");
        changeStatusColor(stateColors.green)
        setInputState("Blocks area");
        setInputStateDescription("hold & drop blocks to build your algorithm")
    }



    return (
        // main page
        <div className="algorithm-page">
            <div className={`prevent-clicking-screen-${isCompilling?"enabled":"disabled"}`}></div>
            <Header />
            <div className="page-container">
                {/* left container */}
                <div className="left-container">

                    {/* main area */}
                    <div className="main-editting-area">

                        {/* tabs bar */}
                        <div className="tabs-bar">
                            <div className="editor-tabs">
                                <button
                                    className={activeTab === "text" ? "tab active-tab" : "tab"}
                                    onClick={() => { handleTextTabClick() }}>Text Editor </button>
                                <button
                                    className={activeTab === "upload" ? "tab active-tab" : "tab"}
                                    onClick={() => { handleUploadFileTabClick() }}>File Upload</button>
                                <button
                                    className={activeTab === "blocks" ? "tab active-tab" : "tab"}
                                    onClick={() => { handleBlocksTabClick() }}>Block Editor</button>
                            </div>
                        </div>

                        {/* input area */}
                        <div className="input-container">
                            {activeTab === "text" && (
                                <CodeEditor
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
                                    <input type="file" />
                                </div>
                            )}
                            {activeTab === "blocks" && (
                                <div className="blocks-area">
                                    <h2>Block Editor</h2>
                                    <p>Drag and Drop blocks here. </p>
                                </div>
                            )}
                            {activeTab === "none" && (
                                <div className="default-input">
                                    <h2>Choose an input method from the tabs </h2>
                                    <h2>at the top to get started</h2>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="controls-area">
                    <div className="controls-area-header">Control Panel</div>
                    <div className="controls-container">
                        <div className="status-section">
                            <div className="status">Status </div>
                            <div className="input-state">{inputState}</div>
                            <div className="input-state-description">{inputStateDescription}</div>
                        </div>
                        <div className="buttons">
                            <button className={readyToFormat ? "format-text" : "inactive-button"}
                                onClick={()=>{handlFormatButtonClicking()}}>Format code</button>
                            <button className={readyToCompile ? "active-compile-button" : "inactive-button"}
                                onClick={() => { handleCompileButtonClick() }}
                            >Compile</button>
                            <button className={readyToGenerateFlowChart ? "generate-btn active-button" : "generate-btn"}
                                onClick={() => { handleGenerateButtonClick() }}
                            >Generate Flowchart</button>
                        </div>
                        <div className="last-control-section">
                            <div className="statistics">
                                <div className="statistics-header">Statistics :</div>
                                <div className="statistics-loops">loops <span>{statistics.loops}</span></div>
                                <div className="statistics-conditions">conditions <span>{statistics.conditions}</span> </div>
                                <div className="statistics-variables">variables <span>{statistics.variables}</span></div>
                            </div>
                            <div className="get-help">
                                <div className="get-help-header">Need help?</div>
                                <button className="help-button">Language Guide</button>
                                <button className="help-button">Input Methods</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Background noAnimation={true} />
        </div >

    );
}

export default InputAlgo;