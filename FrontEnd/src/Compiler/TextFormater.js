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
            let bool1 = RegEx.checkType(text[i], "arithmeticOperator");
            let bool2 = RegEx.checkType(text[i], "logicalOperator");
            let bool3 = RegEx.checkType(text[i], "comparisonOperator");
            let bool4 = RegEx.checkType(text[i], "assignmentOperator");
            let bool5 = RegEx.checkType(text[i], "punctuation");
            if (bool1 || bool2 || bool3 || bool4 || bool5) {
                if (i != text.length - 1 && text[i + 1] == "="){
                    tempFormatedText += " " + text[i] +"= "
                    i++ ;
                }
                else if (i < text.length)
                    tempFormatedText+= " "+text[i]+" ";
            } else if (i != text.length - 1 && text[i]=='\\') {
                if ( text[i + 1] == "n") {
                    tempFormatedText += "\n";
                    i += 1;
                }
                else  
                    tempFormatedText+="\\";
            }
            else {
                tempFormatedText += text[i];
            }

        }
        tempFormatedText = tempFormatedText.replace(/ {2,}/g, " ").trim();
        
        TextFormater.formatedText = tempFormatedText;
        TextFormater.isFormated = true;
        
    }
    // this method :
    //  resets the text formater to its default state by setting the text to "defaultText",
    //  clearing the formatedText
    //  and setting isFormated to false.
    static reset() {
        TextFormater.text = "";
        TextFormater.formatedText = "";
        TextFormater.isFormated = false;
    }
}
