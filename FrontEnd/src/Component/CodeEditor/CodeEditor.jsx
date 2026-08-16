import "./CodeEditor.css"
import CodeMirror from "@uiw/react-codemirror";
import { customTheme } from "./CodeEditorCustomTheme"
import { syntaxHighlighting } from "@codemirror/language";
import { CodeEditorHighlighter, CodeEditorHighlightColors } from "./CodeEditorHighlighter";

function CodeEditor({ code, handlChange, handlFocus, handlBlur, setCode }) {
    return (
        <CodeMirror
            value={code}
            theme={customTheme}
            basicSetup={true}
            onFocus={(value) => { handlFocus(value) }}
            onChange={(value) => { setCode(value); handlChange(value) }}
            onBlur={(value) => { handlBlur(value) }}
            extensions={[CodeEditorHighlighter, syntaxHighlighting(CodeEditorHighlightColors)]}
            height="100% !important"
        />
    );
}

export default CodeEditor;