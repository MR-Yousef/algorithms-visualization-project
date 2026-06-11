import { RegEx } from "./RegEx";
// This class is responsible for formatting the text by adding spaces around operators and punctuation marks.
export class TextFormater {
    // attributes
    static text = "defaultText";
    static formatedText = "";
    static isFormated = false;
    // text setter
    static setText(text = "empty text") {
        TextFormater.text = text;
        TextFormater.isFormated = false;
    }
    // getter for formated text
    static getFormatedText() {
        return TextFormater.formatedText;
    }
    // function to add spaces around operators and punctuation marks in the input text
    // The function iterates through each character in the input text .
    // checks if it matches any of the defined operator or punctuation patterns.
    static format() {
        let tempFormatedText = "";
        let text = TextFormater.text;
        for (let i = 0; i < text.length; i++) {
            let bool1 = text[i].match(RegEx.arithmeticOperatorRegex);
            let bool2 = text[i].match(RegEx.logicalOperatorRegex);
            let bool3 = text[i].match(RegEx.comparisonOperatorRegex);
            let bool4 = text[i].match(RegEx.assignmentOperatorRegex);
            let bool5 = text[i].match(RegEx.punctuationRegex);
            if (bool1 || bool2 || bool3 || bool4 || bool5) {
                if (i == 0 && text[1] != " ") {
                    tempFormatedText = tempFormatedText + tempFormatedText[i] + " ";
                } else if (i == text.length - 1 && text.length - 2 != " ") {
                    tempFormatedText = tempFormatedText + " " + text[i];
                } else {
                    if (text[i - 1] != " " && text[i + 1] != " ")
                        tempFormatedText = tempFormatedText + " " + text[i] + " ";
                    else if (text[i - 1] != " " && text[i + 1] == " ")
                        tempFormatedText = tempFormatedText + " " + text[i];
                    else if (text[i - 1] == " " && text[i + 1] != " ")
                        tempFormatedText = tempFormatedText + text[i] + " ";
                    else tempFormatedText = tempFormatedText + text[i];
                }
            } else {
                tempFormatedText = tempFormatedText + text[i];
            }
        }
        TextFormater.formatedText = tempFormatedText;
        TextFormater.isFormated = true;
    }
    // this method :
    //  resets the text formater to its default state by setting the text to "defaultText",
    //  clearing the formatedText
    //  and setting isFormated to false.
    static reset() {
        TextFormater.text = "defaultText";
        TextFormater.formatedText = "";
        TextFormater.isFormated = false;
    }
}
