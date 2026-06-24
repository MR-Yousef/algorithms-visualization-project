import { StreamLanguage } from "@codemirror/language";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

export const CodeEditorHighlighter = StreamLanguage.define({
    // context statisttics
    
    token(stream) {
        if (stream.eatSpace()) return null;
        if (
            stream.match(/^(if|else|while|input|output|skip|leaveloop)\b/)) {
            return "keyword";
        }
        if (stream.match(/^\d+(\.\d+)?/)) {
            return "number";
        }
        if (stream.match(/^"([^"]*)"/) || stream.match(/^'([^']*)'/)) {
            return "string";
        }
        if (stream.match(/^[+\-*/=<>!]+/)) {
            return "operator";
        }
        if (stream.match(/^[( ) [ \] {}]/)) {
            return "bracket";
        }
        if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
            return "variable";
        }
        if(stream.match(","))
            return"punctuation";
        stream.next();
        return null;
    }

});


// export const CodeEditorHighlighter = StreamLanguage.define({
//     token(stream) {
//         if (stream.match(/^(if|else|while|input|output|skip|leaveloop)\b/)) 
//             return "keyword";
//         if(stream.match(/^[a-zA-Z][a-zA-Z0-9_-]*\b/))
//             return "variableName";
//         if(stream.match(/^\d+(\.\d+)?\b/))
//             return "number" ;
//         if(stream.match(/^".*"\b/))
//             return "string";
//         if(stream.match(/^(\+|-|=)\b/))
//             return  "operator"
//         stream.next();
//         return null;
//     }
// });

// export const CodeEditorHighlighter = StreamLanguage.define({
//     token(stream) {
//         if(RegEx.checkType(stream,"keyword"))
//                     return "keyword";
//         stream.next();
//         return null;
//     }
// });

export const CodeEditorHighlightColors = HighlightStyle.define([
    {
        tag: tags.keyword,
        color: "#19b0ff"
    },
    {
        tag: tags.variableName,
        color: "#ffffff"
    },
    {
        tag: tags.number,
        color: "#f7c948"
    },
    {
        tag: tags.string,
        color: "#4ade80 "
    },
    {
        tag: tags.operator,
        color: "#ff8a65"
    },
    {
        tag:tags.bracket ,
        color:"#8994a0ff"
    },
    {
        tag :tags.punctuation,
        color:"#b8c7d8"
    },
    {
        tag:tags.invalid,
        color:"red"
    }
]);