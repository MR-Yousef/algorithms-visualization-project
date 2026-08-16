import {
    StreamLanguage,
    HighlightStyle
} from "@codemirror/language";

import {
    tags
} from "@lezer/highlight";


export const CodeEditorHighlighter =
    StreamLanguage.define({

        token(stream) {


            /* =============================================
               SPACE
            ============================================= */

            if (
                stream.eatSpace()
            ) {

                return null;

            }


            /* =============================================
               KEYWORDS

               elseif is now included.
            ============================================= */

            if (
                stream.match(
                    /^(if|else|elseif|while|input|output|leaveloop|skip)\b/
                )
            ) {

                return "keyword";

            }


            /* =============================================
               BOOLEAN CONSTANTS
            ============================================= */

            if (
                stream.match(
                    /^(true|false)\b/
                )
            ) {

                return "bool";

            }


            /* =============================================
               WORD LOGICAL OPERATORS
            ============================================= */

            if (
                stream.match(
                    /^(and|or)\b/
                )
            ) {

                return "operator";

            }


            /* =============================================
               NUMBERS
            ============================================= */

            if (
                stream.match(
                    /^\d+(\.\d+)?/
                )
            ) {

                return "number";

            }


            /* =============================================
               VALID STRING

               ONLY:
               "hello"

               Single quotes are NOT valid.
            ============================================= */

            if (
                stream.match(
                    /^"([^"\\]|\\.)*"/
                )
            ) {

                return "string";

            }


            /* =============================================
               OPERATORS

               Added:
               %
               ^
               &
               |
            ============================================= */

            if (
                stream.match(
                    /^[+\-*/%^=<>!&|]+/
                )
            ) {

                return "operator";

            }


            /* =============================================
               BRACKETS
            ============================================= */

            if (
                stream.match(
                    /^[()[\]{}]/
                )
            ) {

                return "bracket";

            }


            /* =============================================
               VARIABLES
            ============================================= */

            if (
                stream.match(
                    /^[a-zA-Z_][a-zA-Z0-9_]*/
                )
            ) {

                return "variable";

            }


            /* =============================================
               COMMA
            ============================================= */

            if (
                stream.match(",")
            ) {

                return "punctuation";

            }


            /*
             * Unknown character.
             */

            stream.next();

            return null;

        }

    });


/* =========================================================
   COLORS
========================================================= */

export const CodeEditorHighlightColors =
    HighlightStyle.define([


        /* if / elseif / else / while / input / output */

        {
            tag:
                tags.keyword,

            color:
                "#19b0ff"
        },


        /* Variables */

        {
            tag:
                tags.variableName,

            color:
                "#ffffff"
        },


        /* Numbers */

        {
            tag:
                tags.number,

            color:
                "#f7c948"
        },


        /* true / false */

        {
            tag:
                tags.bool,

            color:
                "#c084fc"
        },


        /* "string" */

        {
            tag:
                tags.string,

            color:
                "#4ade80"
        },


        /* + - * / % ^ and or etc. */

        {
            tag:
                tags.operator,

            color:
                "#ff8a65"
        },


        /* () [] {} */

        {
            tag:
                tags.bracket,

            color:
                "#8994a0"
        },


        /* , */

        {
            tag:
                tags.punctuation,

            color:
                "#b8c7d8"
        },


        /* Invalid token such as 'hello' */

        {
            tag:
                tags.invalid,

            color:
                "#ff4d4d",

            textDecoration:
                "underline wavy #ff4d4d"
        }

    ]);