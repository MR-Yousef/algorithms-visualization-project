// The RegEx class provides regular expressions for different token types .
// Provides methods to check the type of a given value based on these regular expressions.
export class RegEx {
    // Regular expressions for different token types
    static regEx = {
        // Regular expression for integer numbers (e.g., 123)
        intNumberRegex: /^\d+$/,
        // Regular expression for floating-point numbers (e.g., 123.45)
        floatNumberRegex: /^\d+\.\d+$/,
        // Regular expression for identifiers (e.g., variable names)
        identifierRegex: /^[a-zA-Z][a-zA-Z0-9_-]*$/,
        // Regular expression for arithmetic operators (e.g., +, -, *, /, %, ^)
        arithmeticOperatorRegex: /^[+\-*/%^]$/,
        // Regular expression for logical operators (e.g., &, |, !)
        logicalOperatorRegex: /^(&|\||!)$/,
        // Regular expression for comparison operators (e.g., ==, !=, <, >, <=, >=)
        comparisonOperatorRegex: /^(==|!=|<|>|<=|>=)$/,
        // Regular expression for assignment operator (e.g., =)
        assignmentOperatorRegex: /^=$/,
        // Regular expression for constants (e.g., true, false)
        constantRegex: /^(true|false)$/,
        // Regular expression for literals (e.g., "Hello") with double quotes
        literalRegex: /^".*"$/,
        // Regular expression for punctuation (e.g., (, ) ,{, }, ,)
        punctuationRegex: /^[(){}.,]$/,
        // Regular expression for Keywords (e.g., if, else, while, ifelse , while, leaveloop,skip,input,output)
        keywordRegex: /^(if|else|while|ifelse|leaveloop|skip|input|output)$/,
        // Regular expression for special characters (e.g., #)
        specialCharacterRegex: /^#$/,
    };
    // Method to check if a value matches a specific token type using the corresponding regular expression
    static checkType(value , type) {
        return value.match(RegEx.regEx[type])? true : false ;
    }
    // Method to determine the type of a given value by checking it against all defined regex types
    static getType(value){
        for (let type in Object.keys(RegEx.regEx)) 
            if(type.test(value))
                return type ;
        return "unknown";
    }
}