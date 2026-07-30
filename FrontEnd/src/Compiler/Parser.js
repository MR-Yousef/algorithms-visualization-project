import { Token } from "./Token";
import { Error } from "./Error";
import { ASTnode } from "./ASTNode";
export class Parser {
    /**
     * Creates a new instance of the Parser class.
     * @constructor
     * @param {[Token]} tokens - An array of Token objects to be parsed.
     */
    constructor(tokens) {
        this.tokens = [...tokens];
        this.position = 0;
        this.hasErrors = false;
        this.errors = [];
        this.programNode = new ASTnode("program", "start", [], undefined, 0, "start");
    }
    /**
     * Resets the parser's state, clearing the token list, resetting the position, and initializing a new program node.
     */
    reset() {
        this.position = 0;
        this.hasErrors = false;
        this.errors = [];
        this.programNode = new ASTnode("program", "start", [], undefined, 0, "start");
    }
    /**
        * Check if the parser has reached the end of the token list.
        * @param {void}
        * @returns {boolean} - True if the parser is at the end, false otherwise.   
     */
    isAtEnd() {
        if (this.position >= this.tokens.length)
            return true
        else
            return false
    }
    /**
     * Returns the current token without advancing the parser's position.
     * @param {void}
     * @returns {Token|undefined} - The current token if available, otherwise undefined.
     */
    peek() {
        if (!this.isAtEnd())
            return this.tokens[this.position];
        else {
            console.log("the tokens has end , there is no token to peek")
            return new Token("EndOfCode", "NULL", -1);
        }
    }
    /**
     * Advances the parser's position to the next token in the list.
     * @param {void}
     * @returns {void}
     */
    advance() {
        if (!this.isAtEnd())
            this.position++;
        else
            console.log("reached the end , can't move fowrard")
    }
    /**
     * Checks if the current token matches the expected type, 
     * @param {string} type - The expected type of the current token.
     * @returns {boolean} - True if the current token matches the expected type, false otherwise.   
    */
    match(type) {
        //console.log("the current token is : ", this.peek());
        if (this.peek().getType() == type)
            return true
        else
            return false
    }
    /**
     * Consumes the current token if it matches the expected type, advancing the parser's position.
     * thows a syntax error if the current token does not match the expected type.
     * @param {string} expectedType - The expected type of the current token.
     * @returns {boolean} - True if the current token was consumed, false otherwise.
    */
    consume(expectedType) {
        if (this.match(expectedType)) {
            this.advance();
            return true
        }
        else {
            this.errors.push(new Error("syntax", this.peek().getLineNumber(), `expexted ${expectedType} but found ${this.peek().getType()}`))
            this.hasErrors = true;
            return false;
        }
    }
    /**
     * a method to get the current line number of the token that is being parsed
     * @returns {number} - The line number of the current token, or the last token if at the end of the list.
     */
    getCurrentLineNumber() {
        if (this.peek().getType() != "EndOfCode") {
            console.log("end of code case ")
            console.log(this.peek())
            return this.peek().getLineNumber();
        }
        if (this.tokens.length > 0) {
            console.log("normal case")
            console.log(this.peek())
            return this.tokens[this.tokens.length - 1].getLineNumber();
        }
        return -1
    }
    /**
     * returns the first error if there is any error during parsing otherwise it will return undefined
     * @returns {Error | undefined}
     */
    getFirstError() {
        if (this.hasErrors)
            return this.errors[0];
        else
            return undefined ;
    }
    /**
     * Throws a syntax error if the current token does not match the expected type,
     * @param {string} expectedType - The expected type of the current token. 
     * @returns {undefined} - Always returns undefined after throwing the error.
     */
    throwUnexpectedTokenError(expectedType) {
        this.hasErrors = true;
        this.errors.push(new Error("syntax", this.getCurrentLineNumber(), `expected : ${expectedType} , found ${this.peek().getValue()} (${this.peek().getType()})`))
        return undefined;
    }
    /**
     * Parses the list of tokens and builds the Abstract Syntax Tree (AST) for the program.
     * @returns {ASTnode|Error[]} - The root AST node representing the program if parsing is successful,
     *                               or an array of Error objects if there are syntax errors.
     */
    parse() {
        this.reset();
        while (this.peek().getType() != "EndOfCode") {
            let statement = this.parseStatement();
            if (this.hasErrors) {
                return this.errors
            }
            else {
                this.programNode.addASTchild(statement);
            }
        }
        return this.programNode;
    }
    /**
     * Parses a single statement based on the current token and returns the corresponding AST node.
     * @returns {ASTnode|undefined} - The AST node representing the parsed statement, 
     *                                 or undefined if there is a syntax error.
     */
    parseStatement() {
        switch (this.peek().getType()) {
            case "IDENTIFIER":
                return this.parseAssignmentStatement(this.programNode);
            case "INPUT":
                return this.parseInputStatement();
            case "OUTPUT":
                return this.parseOutputStatement();
            case "IF":
                return this.parseIfStatement();
            case "WHILE":
                return this.parseWhileStatement();
            default:
                this.hasErrors = true;
                this.errors.push(new Error("syntax", this.peek().getLineNumber(), `There is no statement starts with ${this.peek().getValue()}`))
                return undefined;
        }
    }
    /**
     * Parses an assignment statement starting with an identifier and returns the corresponding AST node.
     * Its children are : child[0]: the identifier node, child[1]: the expression node
     */
    parseAssignmentStatement(parent) {
        let tempAssignmentStatementNode = new ASTnode("AssignmentStatement", "", [], parent, this.peek().getLineNumber(), "");
        // check if the current token is an identifier, if so , add it to the children of the assignment statement node and consume it
        let tempToken = this.peek();
        if (this.consume("IDENTIFIER"))
            tempAssignmentStatementNode.addTokenChild(tempToken)
        else
            return this.throwUnexpectedTokenError("IDENTIFIER");
        // check if the next token is an assignment operator, if so , add it to the assignment statement node and consume it
        tempToken = this.peek()
        if (this.consume("ASSIGN"))
            tempAssignmentStatementNode.value = tempToken.getValue()
        else
            return this.throwUnexpectedTokenError("ASSIGN");
        // check if the next tokens are an expression, if so , parse and them to the assignment statement node
        let tempExpression = this.parseExpression()
        if (this.hasErrors)
            return undefined;
        else
            tempAssignmentStatementNode.addASTchild(tempExpression);
        //
        return tempAssignmentStatementNode
    }
    /**
     * 
     */
    parseExpression() {
        return this.parseBooleanExpression()
    }
    /**
 * Parses a factor and returns the corresponding AST node.
 * Factor --> IDENTIFIER
 *          | INTEGER
 *          | FLOAT
 *          | LEFT_PAREN ArithmeticExpression RIGHT_PAREN
 * @returns {ASTnode|undefined}
 */
    parseFactor() {
        let tempExpression;
        let tempToken = this.peek();
        switch (tempToken.getType()) {
            // Factor --> IDENTIFIER
            case "IDENTIFIER":
                if (this.consume("IDENTIFIER"))
                    return new ASTnode(
                        tempToken.getType(),
                        tempToken.getValue(),
                        [],
                        undefined,
                        tempToken.getLineNumber(),
                        tempToken.getValue());
                else
                    return this.throwUnexpectedTokenError("IDENTIFIER");
            // Factor --> INTEGER
            case "INTEGER":
                if (this.consume("INTEGER"))
                    return new ASTnode(
                        tempToken.getType(),
                        tempToken.getValue(),
                        [],
                        undefined,
                        tempToken.getLineNumber(),
                        tempToken.getValue());
                else
                    return this.throwUnexpectedTokenError("INTEGER");
            // Factor --> FLOAT
            case "FLOAT":
                if (this.consume("FLOAT"))
                    return new ASTnode(
                        tempToken.getType(),
                        tempToken.getValue(),
                        [],
                        undefined,
                        tempToken.getLineNumber(),
                        tempToken.getValue());
                else
                    return this.throwUnexpectedTokenError("FLOAT");
            // Factor --> LEFT_PAREN ArithmeticExpression RIGHT_PAREN
            case "LEFT_PAREN":
                if (!this.consume("LEFT_PAREN"))
                    return this.throwUnexpectedTokenError("LEFT_PAREN");
                tempExpression = this.parseExpression();
                if (this.hasErrors)
                    return undefined;
                if (!this.consume("RIGHT_PAREN"))
                    return this.throwUnexpectedTokenError("RIGHT_PAREN");
                return tempExpression;
            // If none of the above cases match, throw an unexpected token error
            default:
                return this.throwUnexpectedTokenError(
                    "IDENTIFIER | INTEGER | FLOAT | LEFT_PAREN");
        }
    }
    /**
 * Parses a power expression and returns the corresponding AST node.
 * Power --> Factor
 *         | Factor POWER Power
 * @returns {ASTnode|undefined} - The AST node representing the parsed power expression,
 *                                or undefined if there is a syntax error.
 */
    parsePower() {
        let tempLeftFactor = this.parseFactor();
        if (this.hasErrors)
            return undefined;
        if (this.match("POWER")) {
            let tempToken = this.peek();
            if (!this.consume("POWER"))
                return this.throwUnexpectedTokenError("POWER");
            let tempRightPower = this.parsePower();
            if (this.hasErrors)
                return undefined;
            let tempPowerNode = new ASTnode(
                "ArithmeticOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                "");
            tempPowerNode.addASTchild(tempLeftFactor);
            tempPowerNode.addASTchild(tempRightPower);
            return tempPowerNode;
        }
        return tempLeftFactor;
    }
    /**
 * Parses a multiplicative expression and returns the corresponding AST node.
 * Multiplicative --> Power
 *                  | Multiplicative MULTIPLY Power
 *                  | Multiplicative DIVIDE Power
 *                  | Multiplicative MODULO Power
 * @returns {ASTnode|undefined}
 */
    parseMultiplicative() {
        let tempLeftPower = this.parsePower();
        if (this.hasErrors)
            return undefined;
        while (
            this.match("MULTIPLY") ||
            this.match("DIVIDE") ||
            this.match("MODULO")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            let tempRightPower = this.parsePower();
            if (this.hasErrors)
                return undefined;
            let tempMultiplicativeNode = new ASTnode(
                "ArithmeticOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                "");
            tempMultiplicativeNode.addASTchild(tempLeftPower);
            tempMultiplicativeNode.addASTchild(tempRightPower);
            tempLeftPower = tempMultiplicativeNode;
        }
        return tempLeftPower;
    }
    /**
 * Parses an additive expression and returns the corresponding AST node.
 * Additive --> Multiplicative
 *            | Additive PLUS Multiplicative
 *            | Additive MINUS Multiplicative
 * @returns {ASTnode|undefined}
 */
    parseAdditive() {
        let tempLeftMultiplicative = this.parseMultiplicative();
        if (this.hasErrors)
            return undefined;
        while (
            this.match("PLUS") ||
            this.match("MINUS")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            let tempRightMultiplicative = this.parseMultiplicative();
            if (this.hasErrors)
                return undefined;
            let tempAdditiveNode = new ASTnode(
                "ArithmeticOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                ""
            );
            tempAdditiveNode.addASTchild(tempLeftMultiplicative);
            tempAdditiveNode.addASTchild(tempRightMultiplicative);
            tempLeftMultiplicative = tempAdditiveNode;
        }
        return tempLeftMultiplicative;
    }
    /**
 * Parses an arithmetic expression and returns the corresponding AST node.
 * ArithmeticExpression --> Additive
 * @returns {ASTnode|undefined}
 */
    parseArithmeticExpression() {
        return this.parseAdditive();
    }
    /**
 * Parses a boolean expression and returns the corresponding AST node.
 * BooleanExpression --> LogicalOr
 * @returns {ASTnode|undefined}
 */
    parseBooleanExpression() {
        return this.parseLogicalOr();
    }
    /**
 * Parses a logical OR expression and returns the corresponding AST node.
 * LogicalOr --> LogicalAnd
 *             | LogicalOr OR LogicalAnd
 * @returns {ASTnode|undefined}
 */
    parseLogicalOr() {
        let tempLeftLogicalAnd = this.parseLogicalAnd();
        if (this.hasErrors)
            return undefined;
        while (this.match("OR")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            let tempRightLogicalAnd = this.parseLogicalAnd();
            if (this.hasErrors)
                return undefined;
            let tempLogicalOrNode = new ASTnode(
                "LogicalOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(), "");
            tempLogicalOrNode.addASTchild(tempLeftLogicalAnd);
            tempLogicalOrNode.addASTchild(tempRightLogicalAnd);
            tempLeftLogicalAnd = tempLogicalOrNode;
        }
        return tempLeftLogicalAnd;
    }
    /**
 * Parses a logical AND expression and returns the corresponding AST node.
 * LogicalAnd --> LogicalNot
 *              | LogicalAnd AND LogicalNot
 * @returns {ASTnode|undefined}
 */
    parseLogicalAnd() {
        let tempLeftLogicalNot = this.parseLogicalNot();
        if (this.hasErrors)
            return undefined;
        while (this.match("AND")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            let tempRightLogicalNot = this.parseLogicalNot();
            if (this.hasErrors)
                return undefined;
            let tempLogicalAndNode = new ASTnode(
                "LogicalOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(), "");
            tempLogicalAndNode.addASTchild(tempLeftLogicalNot);
            tempLogicalAndNode.addASTchild(tempRightLogicalNot);
            tempLeftLogicalNot = tempLogicalAndNode;
        }
        return tempLeftLogicalNot;
    }
    /**
 * Parses a logical NOT expression and returns the corresponding AST node.
 * LogicalNot --> Comparison
 *              | NOT LogicalNot
 * @returns {ASTnode|undefined}
 */
    parseLogicalNot() {
        if (this.match("NOT")) {
            let tempToken = this.peek();
            if (!this.consume("NOT"))
                return this.throwUnexpectedTokenError("NOT");
            let tempLogicalNot = this.parseLogicalNot();
            if (this.hasErrors)
                return undefined;
            let tempLogicalNotNode = new ASTnode(
                "LogicalOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                ""
            );
            tempLogicalNotNode.addASTchild(tempLogicalNot);
            return tempLogicalNotNode;
        }
        // if (this.match("LEFT_PAREN")) {
        //     if (!this.consume("LEFT_PAREN"))
        //         return this.throwUnexpectedTokenError("LEFT_PAREN");
        //     let tempBooleanExpression = this.parseBooleanExpression();
        //     if (this.hasErrors)
        //         return undefined;
        //     if (!this.consume("RIGHT_PAREN"))
        //         return this.throwUnexpectedTokenError("RIGHT_PAREN");
        //     return tempBooleanExpression;
        // }

        return this.parseComparison();
    }
    /**
     * Parses a comparison expression and returns the corresponding AST node.
     * Comparison --> Constant
     *              | ArithmeticExpression
     *              | ArithmeticExpression CompareOp ArithmeticExpression
     *              | LEFT_PAREN BooleanExpression RIGHT_PAREN
     * @returns {ASTnode|undefined}
     */
    parseComparison() {
        // comparison --> Constant
        if (this.match("TRUE") || this.match("FALSE")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            return new ASTnode(
                "Constant",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                tempToken.getValue());
        }
        // comparison --> LEFT_PAREN BooleanExpression RIGHT_PAREN
        // if (this.match("LEFT_PAREN")) {
        //     if (!this.consume("LEFT_PAREN"))
        //         return this.throwUnexpectedTokenError("LEFT_PAREN");
        //     let tempBooleanExpression = this.parseBooleanExpression();
        //     if (this.hasErrors)
        //         return undefined;
        //     if (!this.consume("RIGHT_PAREN"))
        //         return this.throwUnexpectedTokenError("RIGHT_PAREN");
        //     return tempBooleanExpression;
        // }
        // comparison --> ArithmeticExpression BooleanOperator ArithmeticExpression
        let tempLeftArithmeticExpression = this.parseArithmeticExpression();
        if (this.hasErrors)
            return undefined;
        if (
            this.match("EQUAL") ||
            this.match("NOT_EQUAL") ||
            this.match("LESS_THAN") ||
            this.match("GREATER_THAN") ||
            this.match("LESS_EQUAL") ||
            this.match("GREATER_EQUAL")) {
            let tempToken = this.peek();
            if (!this.consume(tempToken.getType()))
                return this.throwUnexpectedTokenError(tempToken.getType());
            let tempRightArithmeticExpression = this.parseArithmeticExpression();
            if (this.hasErrors)
                return undefined;
            let tempComparisonNode = new ASTnode(
                "ComparisonOperator",
                tempToken.getValue(),
                [],
                undefined,
                tempToken.getLineNumber(),
                "");
            tempComparisonNode.addASTchild(tempLeftArithmeticExpression);
            tempComparisonNode.addASTchild(tempRightArithmeticExpression);
            return tempComparisonNode;
        }
        return tempLeftArithmeticExpression;
    }
    /**
 * Parses an identifier list and returns the corresponding AST node.
 * IdentifierList --> IDENTIFIER
 *                  | IDENTIFIER COMMA IdentifierList
 * @returns {ASTnode|undefined}
 */
    parseIdentifierList() {
        let tempIdentifierListNode = new ASTnode(
            "IdentifierList",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        let tempToken = this.peek();
        if (this.consume("IDENTIFIER"))
            tempIdentifierListNode.addTokenChild(tempToken);
        else
            return this.throwUnexpectedTokenError("IDENTIFIER");
        while (this.match("COMMA")) {
            if (!this.consume("COMMA"))
                return this.throwUnexpectedTokenError("COMMA");
            tempToken = this.peek();
            if (this.consume("IDENTIFIER"))
                tempIdentifierListNode.addTokenChild(tempToken);
            else
                return this.throwUnexpectedTokenError("IDENTIFIER");
        }
        return tempIdentifierListNode;
    }
    /**
 * Parses an input statement and returns the corresponding AST node.
 * InputStatement --> INPUT IdentifierList
 * @returns {ASTnode|undefined}
 */
    parseInputStatement() {
        let tempInputStatementNode = new ASTnode(
            "InputStatement",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        let tempToken = this.peek();
        if (this.consume("INPUT"))
            tempInputStatementNode.value = tempToken.getValue();
        else
            return this.throwUnexpectedTokenError("INPUT");
        let tempIdentifierList = this.parseIdentifierList();
        if (this.hasErrors)
            return undefined;
        tempInputStatementNode.addASTchild(tempIdentifierList);
        return tempInputStatementNode;
    }
    /**
 * Parses an output item and returns the corresponding AST node.
 * OutputItem --> Expression
 *              | LITERAL
 * @returns {ASTnode|undefined}
 */
    parseOutputItem() {
        if (this.match("LITERAL")) {
            let tempToken = this.peek();
            if (this.consume("LITERAL"))
                return new ASTnode(
                    tempToken.getType(),
                    tempToken.getValue(),
                    [],
                    undefined,
                    tempToken.getLineNumber(),
                    tempToken.getValue());
            else
                return this.throwUnexpectedTokenError("LITERAL");
        }
        return this.parseExpression();
    }
    /**
 * Parses an output list and returns the corresponding AST node.
 * OutputList --> OutputItem
 *              | OutputItem COMMA OutputList
 * @returns {ASTnode|undefined}
 */
    parseOutputList() {
        let tempOutputListNode = new ASTnode(
            "OutputList",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        let tempOutputItem = this.parseOutputItem();
        if (this.hasErrors)
            return undefined;
        tempOutputListNode.addASTchild(tempOutputItem);
        while (this.match("COMMA")) {
            if (!this.consume("COMMA"))
                return this.throwUnexpectedTokenError("COMMA");
            tempOutputItem = this.parseOutputItem();
            if (this.hasErrors)
                return undefined;
            tempOutputListNode.addASTchild(tempOutputItem);
        }
        return tempOutputListNode;
    }
    /**
 * Parses an output statement and returns the corresponding AST node.
 * OutputStatement --> OUTPUT OutputList
 * @returns {ASTnode|undefined}
 */
    parseOutputStatement() {
        let tempOutputStatementNode = new ASTnode(
            "OutputStatement",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        let tempToken = this.peek();
        if (this.consume("OUTPUT"))
            tempOutputStatementNode.value = tempToken.getValue();
        else
            return this.throwUnexpectedTokenError("OUTPUT");
        let tempOutputList = this.parseOutputList();
        if (this.hasErrors)
            return undefined;
        tempOutputStatementNode.addASTchild(tempOutputList);
        return tempOutputStatementNode;
    }
    /**
 * Parses a block and returns the corresponding AST node.
 * Block --> LEFT_BRACE Statement* RIGHT_BRACE
 * @returns {ASTnode|undefined}
 */
    parseBlock() {
        let tempBlockNode = new ASTnode(
            "Block",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        if (!this.consume("LEFT_BRACE"))
            return this.throwUnexpectedTokenError("LEFT_BRACE");
        while (!this.match("RIGHT_BRACE")) {
            if (this.peek().getType() == "EndOfCode")
                return this.throwUnexpectedTokenError("RIGHT_BRACE");
            let tempStatement = this.parseStatement();
            if (this.hasErrors)
                return undefined;
            tempBlockNode.addASTchild(tempStatement);
        }
        if (!this.consume("RIGHT_BRACE"))
            return this.throwUnexpectedTokenError("RIGHT_BRACE");
        return tempBlockNode;
    }
    /**
 * Parses either a block or a single statement.
 * @returns {ASTnode|undefined}
 */
    parseBody() {
        if (this.match("LEFT_BRACE"))
            return this.parseBlock();
        return this.parseStatement();
    }
    /**
 * Parses an if statement and returns the corresponding AST node.
 * IfStatement --> IF BooleanExpression Body
 *               | ELSEIF BooleanExpression Body
 *               | IF BooleanExpression Body ELSE Body
 *               | IF BooleanExpression Body ELSEIF ...
 * @returns {ASTnode|undefined}
 */
    parseIfStatement() {
        let tempIfStatementNode = new ASTnode(
            "IfStatement",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        // Consume IF or ELSEIF
        let tempToken = this.peek();
        if (this.match("IF") || this.match("ELSEIF"))
            this.consume(tempToken.getType());
        else
            return this.throwUnexpectedTokenError("IF | ELSEIF");
        tempIfStatementNode.value = tempToken.getValue();
        // Parse condition
        let tempCondition = this.parseBooleanExpression();
        if (this.hasErrors)
            return undefined;
        tempIfStatementNode.addASTchild(tempCondition);
        // Parse then body
        let tempBody = this.parseBody();
        if (this.hasErrors)
            return undefined;
        tempIfStatementNode.addASTchild(tempBody);
        // Parse optional else / elseif
        if (this.match("ELSE")) {
            if (!this.consume("ELSE"))
                return this.throwUnexpectedTokenError("ELSE");
            let tempElseBody = this.parseBody();
            if (this.hasErrors)
                return undefined;
            tempIfStatementNode.addASTchild(tempElseBody);
        }
        else if (this.match("ELSEIF")) {
            let tempElseIf = this.parseIfStatement();
            if (this.hasErrors)
                return undefined;
            tempIfStatementNode.addASTchild(tempElseIf);
        }
        return tempIfStatementNode;
    }
    /**
     * Parses a while statement and returns the corresponding AST node.
     * WhileStatement --> WHILE BooleanExpression Body
     * @returns {ASTnode|undefined}
     */
    parseWhileStatement() {
        let tempWhileStatementNode = new ASTnode(
            "WhileStatement",
            "",
            [],
            undefined,
            this.peek().getLineNumber(),
            "");
        // let tempToken = this.peek();
        if (!this.consume("WHILE"))
            return this.throwUnexpectedTokenError("WHILE");
        let tempCondition = this.parseBooleanExpression();
        if (this.hasErrors)
            return undefined;
        tempWhileStatementNode.addASTchild(tempCondition);
        let tempBody = this.parseBody();
        if (this.hasErrors)
            return undefined;
        tempWhileStatementNode.addASTchild(tempBody);
        return tempWhileStatementNode;
    }
}