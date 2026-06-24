// This file defines the Token class, which represents a token in the source code being compiled.
export class Token {
    //the attributes of the token
    // type: the type of the token (e.g., keyword, identifier, operator, etc.)
    // value: the actual value of the token (e.g., the specific keyword, identifier name, operator symbol, etc.)
    // lineNumber: the line number in the source code where the token was found (useful for error reporting)    
    // constructor to initialize the token with its type, value, and line number
    constructor(type = "unkown", value = "noValue", lineNumber = -1) {
        this.type = type;
        this.value = value;
        this.lineNumber = lineNumber;
    }

    // setters to update the attributes of the token
    /**
     * 
     * @param {string} type The token's type / example : PLUS , INTEGER , .....
     */
    setType(type = "unkown") {
        this.type = type;
    }

    /**
     * 
     * @param {string} value The token's value / Example : + , 5 , .... 
     */
    setValue(value = "noValue") {
        this.value = value;
    }

    /**
     * 
     * @param {number} lineNumber The line number that token is at .
     */
    setLineNumber(lineNumber = -1) {
        this.lineNumber = lineNumber;
    }

    // getters to retrieve the attributes of the token
    /**
     * 
     * @returns The token's type / example : PLUS , INTEGER , .....
     */
    getType() {
        return this.type;
    }

    /**
     * 
     * @returns The token's value / Example : + , 5 , .... 
     */
    getValue() {
        return this.value;
    }

    /**
     * 
     * @returns The line number that token is at .
     */

    getLineNumber() {
        return this.lineNumber;
    }
}