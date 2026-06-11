class Tokenizer {
    // Define token types as static properties of the Tokenizer class
    // Each token type is associated with a specific regular expression pattern or a set of characters
    static TokenType = {
        arithmeticOperator:{
            "+" : "PLUS",
            "-" : "MINUS",
            "*" : "MULTIPLY",
            "/" : "DIVIDE",
            "%" : "MODULO",
            "^" : "POWER"
        },
        logicalOperator:{
            "&" : "AND",
            "|" : "OR",
            "!" : "NOT"
        },
        comparisonOperator:{
            "==" : "EQUAL",
            "!=" : "NOT_EQUAL",
            "<" : "LESS_THAN",
            ">" : "GREATER_THAN",
            "<=" : "LESS_EQUAL",
            ">=" : "GREATER_EQUAL"
        },
        assignmentOperator:{
            "=" : "ASSIGN"
        },
        intNumber:{
            "/^\d+$/" : "INTEGER" 
        },
        floatNumber:{
            "/^\d+\.\d+$/" : "FLOAT"
        }, 
        identifier:{
            "/^[a-zA-Z][a-zA-Z0-9_-]*$/" : "IDENTIFIER"
        },
        constant:{
            "true" : "TRUE",
            "false" : "FALSE"
        },
        literal:{
            "/^\".*\"$/" : "LITERAL" 
        },
        punctuation:{
            "(" : "LEFT_PAREN",
            ")" : "RIGHT_PAREN",
            "{" : "LEFT_BRACE",
            "}" : "RIGHT_BRACE",
            "," : "COMMA",
            "." : "DOT"
        }, 
        keyword:{
            "if" : "IF",
            "else" : "ELSE",
            "while" : "WHILE",
            "ifelse" : "IFELSE",
            "leaveloop" : "LEAVELOOP",
            "skip" : "SKIP",
            "input" : "INPUT",
            "output" : "OUTPUT"
        },
        specialCharacter:{
            "#" : "HASH"
        }
    }
    // Regular expressions for different token types
    static RegEx = {
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

    }
    static replaceWithSpace(Input) {
        let result = "";
        for (let i = 0; i < Input.length; i++) {
            let bool1 = Input[i].match(Tokenizer.RegEx.arithmeticOperatorRegex);
            let bool2 = Input[i].match(Tokenizer.RegEx.logicalOperatorRegex);
            let bool3 = Input[i].match(Tokenizer.RegEx.comparisonOperatorRegex);
            let bool4 = Input[i].match(Tokenizer.RegEx.assignmentOperatorRegex);
            let bool5 = Input[i].match(Tokenizer.RegEx.punctuationRegex);
            if (bool1 || bool2 || bool3 || bool4 || bool5) {
                if (i == 0 && Input[1] != " ") {
                    result = result + Input[i] + " ";
                }
                else if (i == Input.length - 1 && Input.length - 2 != " ") {
                    result = result + " " + Input[i];
                }
                else {
                    if (Input[i - 1] != " " && Input[i + 1] != " ")
                        result = result + " " + Input[i] + " ";
                    else if (Input[i - 1] != " " && Input[i + 1] == " ")
                        result = result + " " + Input[i];
                    else if (Input[i - 1] == " " && Input[i + 1] != " ")
                        result = result + Input[i] + " ";
                    else
                        result = result + Input[i];
                }
            }
            else {
                result = result + Input[i];
            }
        }
        return result;
    }

    // Method to tokenize the input string
    // This method takes an input string, splits it into words, and classifies each word based on the defined regular expressions

    static tokenize(input) {
        input = this.replaceWithSpace(input);
        let lines = input.split("\n");
        let tokens = [];
        let lineNumber = 1;
        tokens[lineNumber] = [];
        for (let line of lines) {
            let words = line.split(/(?<=^[^"]*|"[^"]*")\s+(?=[^"]*$|(?:(?:[^"]*"[^"]*")*[^"]*$))/), word;
            words = words.filter(word => word !== ""); // Remove empty strings from the array
            for (word of words) {
                if (Tokenizer.RegEx.intNumberRegex.test(word)) {
                    tokens[lineNumber].push("integer");
                }
                else if (Tokenizer.RegEx.floatNumberRegex.test(word)) {
                    tokens[lineNumber].push("float");
                }
                else if (Tokenizer.RegEx.constantRegex.test(word)) {
                    tokens[lineNumber].push("constant");
                }
                else if (Tokenizer.RegEx.specialCharacterRegex.test(word)) {
                    tokens[lineNumber].push("special character");
                }
                else if (Tokenizer.RegEx.keywordRegex.test(word)) {
                    tokens[lineNumber].push("keyword");
                }
                else if (Tokenizer.RegEx.literalRegex.test(word)) {
                    tokens[lineNumber].push("literal");
                }
                else if (Tokenizer.RegEx.arithmeticOperatorRegex.test(word)) {
                    tokens[lineNumber].push("operator");
                }
                else if (Tokenizer.RegEx.logicalOperatorRegex.test(word)) {
                    tokens[lineNumber].push("logical operator");
                }
                else if (Tokenizer.RegEx.comparisonOperatorRegex.test(word)) {
                    tokens[lineNumber].push("comparison operator");
                }
                else if (Tokenizer.RegEx.assignmentOperatorRegex.test(word)) {
                    tokens[lineNumber].push("assignment operator");
                }
                else if (Tokenizer.RegEx.identifierRegex.test(word)) {
                    tokens[lineNumber].push("identifier");
                }
                else if (Tokenizer.RegEx.punctuationRegex.test(word)) {
                    tokens[lineNumber].push("punctuation");
                }
                else {
                    tokens[lineNumber].push("unknown");
                }
            }
            lineNumber++;
            tokens[lineNumber] = [];
        }
        //console.log(tokens);
        console.log(input);
        return tokens;
    }
}

export default Tokenizer;