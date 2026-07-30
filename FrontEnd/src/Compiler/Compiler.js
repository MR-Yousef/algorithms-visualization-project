import { Tokenizer } from "./Tokenizer";
import { Parser } from "./Parser";
import { ASTnode } from "./ASTNode";
import { Error } from "./Error";
// Compiler class is responsible for compiling the code by tokenizing and parsing it.
export class Compiler{
    /**
     * Compiles the given code by tokenizing and parsing it.
     * @param {String} code 
     * @returns {ASTnode | Error}
     */
    static compile(code){
        Tokenizer.reset() ;
        Tokenizer.tokenize(code) ;
        if(Tokenizer.hasErrors)
            return Tokenizer.getLexicalError() ;
        let myParser = new Parser(Tokenizer.getTokensArray())
        let tempAST = myParser.parse();
        if(myParser.hasErrors)
            return myParser.getFirstError();
        return tempAST ;
    }

}