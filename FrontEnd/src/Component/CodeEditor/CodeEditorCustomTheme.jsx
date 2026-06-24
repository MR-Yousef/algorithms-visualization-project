import { EditorView } from "@codemirror/view";

export const customTheme = EditorView.theme({
    "&": {
        backgroundColor: "#071423",
        color: "#ffffff",
        fontSize: "22px",

    },
    ".cm-content": {
        caretColor: "#19b0ff",
    },
    ".cm-cursor": {
        borderLeftColor: "#19b0ff",
    },
    ".cm-gutters": {
        backgroundColor: "#08111d",
        color: "#6e89a7",
        border: "none",
    },
    ".cm-activeLine": {
        backgroundColor: "transparent",
    },
    ".cm-activeLineGutter": {
        backgroundColor: "#10233d",
    },
    "&.cm-focused .cm-selectionBackground": {
        backgroundColor: "rgba(25,176,255,0.25)"
    },

    ".cm-selectionBackground": {
        backgroundColor: "rgba(25,176,255,0.25) !important"
    }

});