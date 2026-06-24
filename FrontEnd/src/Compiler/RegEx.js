// The RegEx class provides regular expressions for different token types .

import { Tokenizer } from "./Tokenizer";

// Provides methods to check the type of a given value based on these regular expressions.
export class RegEx {
    // Regular expressions for different token types
    static regEx = {
        // Regular expression for floating-point numbers (e.g., 123.45)
        floatNumber: /^\d+\.\d+$/,
        // Regular expression for integer numbers (e.g., 123)
        intNumber: /^\d+$/,
        // Regular expression for arithmetic operators (e.g., +, -, *, /, %, ^)
        arithmeticOperator: /^[+\-*/%^]$/,
        // Regular expression for logical operators (e.g., &, |, !)
        logicalOperator: /^(&|\||!)$/,
        // Regular expression for comparison operators (e.g., ==, !=, <, >, <=, >=)
        comparisonOperator: /^(==|!=|<|>|<=|>=)$/,
        // Regular expression for assignment operator (e.g., =)
        assignmentOperator: /^=$/,
        // Regular expression for constants (e.g., true, false)
        constant: /^(true|false)$/,
        // Regular expression for literals (e.g., "Hello") with double quotes
        literal: /^".*"$/,
        // Regular expression for punctuation (e.g., (, ) ,{, }, ,)
        punctuation: /^[(){},]$/,
        // Regular expression for Keywords (e.g., if, else, while, ifelse , while, leaveloop,skip,input,output)
        keyword: /^(if|else|while|ifelse|leaveloop|skip|input|output)$/,
        // Regular expression for special characters (e.g., #)
        specialCharacter: /^#$/,
        // Regular expression for identifiers (e.g., variable names)
        identifier: /^[a-zA-Z][a-zA-Z0-9_-]*$/
    };
    static TokenValues = {
        arithmeticOperator: {
            "+": "PLUS",
            "-": "MINUS",
            "*": "MULTIPLY",
            "/": "DIVIDE",
            "%": "MODULO",
            "^": "POWER"
        },
        logicalOperator: {
            "&": "AND",
            "|": "OR",
            "!": "NOT"
        },
        comparisonOperator: {
            "==": "EQUAL",
            "!=": "NOT_EQUAL",
            "<": "LESS_THAN",
            ">": "GREATER_THAN",
            "<=": "LESS_EQUAL",
            ">=": "GREATER_EQUAL"
        },
        assignmentOperator: {
            "=": "ASSIGN"
        },
        intNumber: "INTEGER",
        floatNumber: "FLOAT",
        identifier: "IDENTIFIER",
        literal: "LITERAL",
        constant: {
            "true": "TRUE",
            "false": "FALSE"
        },
        punctuation: {
            "(": "LEFT_PAREN",
            ")": "RIGHT_PAREN",
            "{": "LEFT_BRACE",
            "}": "RIGHT_BRACE",
            ",": "COMMA",
            ".": "DOT"
        },
        keyword: {
            "if": "IF",
            "else": "ELSE",
            "while": "WHILE",
            "ifelse": "IFELSE",
            "leaveloop": "LEAVELOOP",
            "skip": "SKIP",
            "input": "INPUT",
            "output": "OUTPUT"
        },
        specialCharacter: {
            "#": "HASH"
        }
    }

    // Method to check if a value matches a specific token type using the corresponding regular expression
    /**
     * 
     * @param {string} value  The value that will be tested by RegEx
     * @param {string} type  The RegEx type that will test the value 
     * @returns {boolean}  True if the value matches the passed RegEx type , false  otherwise....
     */
    static checkType(value, type) {
        let tempRegEx = this.regEx[type];
        if (!this.regEx)
            return false;
        return tempRegEx.test(value);
    }

    // Method to determine the type of a given value by checking it against all defined regex types
    /**
     * @param {string} value The value that will be tested by RegEx
     * @returns {string} The first RegEx type that value matches It . example : INTEGER , PLUS ,.....
     */
    static getType(value) {
        let tempRegex =RegEx.regEx; 
        for(let type of Object.keys(tempRegex))
            if(tempRegex[type].test(value)){
                if(typeof(RegEx.TokenValues[type])=="object")
                    return RegEx.TokenValues[type][value]
                else 
                    return RegEx.TokenValues[type]
            }
        
        return "unknown"
    }
}
