import { Error } from "./Error"
import { Token } from "./Token"
import { RegEx } from "./RegEx"
import { TextFormater as formater } from "./TextFormater"
// This class is responsible for tokenizing the input text into different types of tokens .
// Tokenization is based on predefined regular expressions.
export class Tokenizer {
    // attributes
    static formatedText = "";
    static lineNumber = 0;
    static splitText = [];
    static tokensArray = [];
    static isSplit = false;
    static isTokenized = false;
    static hasErrors = false;
    static lexicalError = new Error();
    // methods 
    static setFormatedText(text) {
        Tokenizer.formatedText = text;
    }
    static getFormatedText() {
        return Tokenizer.formatedText;
    }
    static setSplitText(splitText) {
        Tokenizer.splitText = splitText;
    }
    static getSplitText() {
        return Tokenizer.splitText;
    }
    static setLineNumber(lineNumber) {
        Tokenizer.lineNumber = lineNumber;
    }
    static getLineNumber() {
        return Tokenizer.lineNumber;
    }
    static increaseLineNumber() {
        Tokenizer.lineNumber++;
    }
    static spiltFormatedText() {
        Tokenizer.splitText = Tokenizer.formatedText.split("\n");
        Tokenizer.isSplit = true;
    }
    static spiltFormatedLine(line) {
        let inString = false;
        let words = [];
        let tempWord = ""
        let letter ;
        for (let i = 0 ;i < line.length;i++) {
            letter = line[i];
            if (!inString) {
                if (letter == " ") {
                    words.push(tempWord);
                    tempWord = "";
                }
                else if (letter == "\"") {
                    words.push(tempWord);
                    tempWord = "\"";
                    inString = true ;
                }
                else {
                    tempWord += letter;
                }
            }
            else {
                if (letter == "\"") {
                    tempWord += "\"";
                    words.push(tempWord);
                    tempWord = "";
                    inString = false;
                }
                else {
                    tempWord += letter;
                }
            }
        }
        words.push(tempWord)
        return words ;
    }


    static getTokensArray() {
        return Tokenizer.tokensArray;
    }
    static getLexicalError() {
        return Tokenizer.lexicalError
    }
    static reset() {
        Tokenizer.formatedText = "";
        Tokenizer.lineNumber = 0;
        Tokenizer.splitText = [];
        Tokenizer.tokensArray = [];
        Tokenizer.Error = new Error();
        Tokenizer.isSplit = false;
        Tokenizer.isTokenized = false;
        Tokenizer.hasErrors = false;
    }
    static throwError(tokenValue) {
        Tokenizer.hasErrors = true;
        Tokenizer.lexicalError = new Error("lexical", Tokenizer.getLineNumber(), `unkown token : ${tokenValue}`)
    };

    // the main function of this class is to tokenize the input text into different types of tokens 
    static tokenize(text) {
        Tokenizer.reset();
        let splitLine = []
        // text formating before starting tokenizing  
        formater.reset();
        formater.setText(text);
        formater.format();
        Tokenizer.setFormatedText(formater.getFormatedText());
        formater.reset();
        Tokenizer.spiltFormatedText()
        Tokenizer.tokensArray = [];
        for (let line of this.splitText) {
            if (Tokenizer.hasErrors)
                return;
            Tokenizer.increaseLineNumber();
            splitLine = Tokenizer.spiltFormatedLine(line).filter((t)=>{return t!=""})
            console.log("line", Tokenizer.getLineNumber(), ":", splitLine)
            for (let word of splitLine) {
                if (RegEx.getType(word) == "unknown") {
                    console.log(word, "is from unknown type")
                    Tokenizer.throwError(word);
                    return;
                }
                else {
                    console.log(word, " is from type : ", RegEx.getType(word))
                    Tokenizer.tokensArray.push(new Token(RegEx.getType(word), word, Tokenizer.getLineNumber()));
                }
            }
        }
        Tokenizer.isTokenized = true;
    }


}