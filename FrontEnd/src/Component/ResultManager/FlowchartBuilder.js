import { FlowGraph } from "./FlowGraph";
import { FlowNode } from "./FlowNode";
import { ASTnode } from "../../Compiler/ASTNode"
import { FlowEdge } from "./FlowEdge";
import { FlowFragment } from "./FlowFragment";

export class FlowchartBuilder {

    /**
     * a class to build a flowchart graph from the AST tree
     */
    constructor() {
        this.flowGraph = new FlowGraph();
    }

    /**
     * Returns the precedence of an expression AST node.
     * Higher numbers bind more tightly.
     *
     * @param {ASTnode} node
     * @returns {number}
     */
    getExpressionPrecedence(node) {
        if (!node)
            return 100;

        const operator = String(node.value ?? "").toLowerCase();

        if (node.nodeType === "LogicalOperator") {
            if (operator === "|" || operator === "or")
                return 1;

            if (operator === "&" || operator === "and")
                return 2;

            return 3;
        }

        if (node.nodeType === "ComparisonOperator")
            return 4;

        if (node.nodeType === "ArithmeticOperator") {
            if (operator === "+" || operator === "-")
                return 5;

            if (
                operator === "*" ||
                operator === "/" ||
                operator === "%"
            )
                return 6;

            if (operator === "^" || operator === "**")
                return 7;
        }

        return 100;
    }

    /**
     * Convert AST expression back to readable text.
     *
     * This is important because compound AST expressions may
     * have an empty sourceText.
     *
     * @param {ASTnode} node
     * @param {number} parentPrecedence
     * @returns {string}
     */
    formatAstText(node, parentPrecedence = 0) {
        if (!node)
            return "";

        const children =
            Array.isArray(node.children)
                ? node.children
                : [];

        /*
         * INPUT x, y, z
         * OUTPUT x, y + 5, "hello"
         */
        if (
            node.nodeType === "IdentifierList" ||
            node.nodeType === "OutputList"
        ) {
            return children
                .map(child => this.formatAstText(child))
                .filter(Boolean)
                .join(", ");
        }

        const isOperatorNode =
            node.nodeType === "ArithmeticOperator" ||
            node.nodeType === "ComparisonOperator" ||
            node.nodeType === "LogicalOperator";

        /*
         * Reconstruct:
         *
         * x + 5
         * x > y
         * x > 5 & y < 10
         * NOT (x == 5)
         */
        if (isOperatorNode && children.length > 0) {

            const operator =
                String(node.value ?? "");

            const precedence =
                this.getExpressionPrecedence(node);

            /*
             * Unary operators such as NOT / !
             */
            if (children.length === 1) {

                const child =
                    children[0];

                let childText =
                    this.formatAstText(child);

                if (
                    Array.isArray(child?.children) &&
                    child.children.length > 0
                ) {
                    childText = `(${childText})`;
                }

                const separator =
                    /^[A-Za-z]+$/.test(operator)
                        ? " "
                        : "";

                const text =
                    `${operator}${separator}${childText}`;

                return precedence < parentPrecedence
                    ? `(${text})`
                    : text;
            }

            const isRightAssociative =
                node.nodeType === "ArithmeticOperator" &&
                (
                    operator === "^" ||
                    operator === "**"
                );

            const leftParentPrecedence =
                isRightAssociative
                    ? precedence + 1
                    : precedence;

            const rightParentPrecedence =
                isRightAssociative
                    ? precedence
                    : precedence + 1;

            const leftText =
                this.formatAstText(
                    children[0],
                    leftParentPrecedence
                );

            const rightText =
                this.formatAstText(
                    children[1],
                    rightParentPrecedence
                );

            const text =
                `${leftText} ${operator} ${rightText}`;

            return precedence < parentPrecedence
                ? `(${text})`
                : text;
        }

        /*
         * Simple identifiers, numbers, strings, booleans, etc.
         */
        if (
            typeof node.sourceText === "string" &&
            node.sourceText.trim()
        ) {
            return node.sourceText.trim();
        }

        if (
            node.value !== undefined &&
            node.value !== null
        ) {
            return String(node.value);
        }

        /*
         * Generic fallback.
         */
        return children
            .map(child => this.formatAstText(child))
            .filter(Boolean)
            .join(" ");
    }

    /**
     * Builds a complete flow graph from the AST root.
     * @param {ASTnode} ast
     * @returns {FlowGraph}
     */
    build(ast) {

        if (!ast || !Array.isArray(ast.children))
            throw new Error(
                "Cannot build the flow graph: invalid AST root."
            );

        FlowNode.reset();
        FlowEdge.reset();

        this.flowGraph =
            new FlowGraph();

        const startNode =
            new FlowNode(
                "start",
                "Start"
            );

        const endNode =
            new FlowNode(
                "end",
                "End"
            );

        this.flowGraph.addNode(
            startNode
        );

        let previousExitNode =
            startNode;

        ast.children.forEach(statementNode => {

            const currentFragment =
                this.buildStatement(
                    statementNode
                );

            this.flowGraph.addFragment(
                currentFragment
            );

            this.flowGraph.addEdge(
                new FlowEdge(
                    previousExitNode.id,
                    currentFragment.entryNode.id,
                    "next"
                )
            );

            previousExitNode =
                currentFragment.exitNode;
        });

        this.flowGraph.addNode(
            endNode
        );

        this.flowGraph.addEdge(
            new FlowEdge(
                previousExitNode.id,
                endNode.id,
                "next"
            )
        );

        const validationResult =
            this.flowGraph.validate();

        if (!validationResult.isValid) {
            throw new Error(
                [
                    "Failed to build a valid flow graph:",
                    ...validationResult.errors.map(
                        error => `- ${error}`
                    )
                ].join("\n")
            );
        }

        return this.flowGraph;
    }

    /**
     * Builds the appropriate flow fragment for a statement node.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildStatement(statementNode) {

        if (!statementNode)
            throw new Error(
                "Cannot build a flow fragment from an undefined or null statement."
            );

        switch (statementNode.nodeType) {

            case "AssignmentStatement":
                return this.buildAssignment(
                    statementNode
                );

            case "InputStatement":
                return this.buildInput(
                    statementNode
                );

            case "OutputStatement":
                return this.buildOutput(
                    statementNode
                );

            case "IfStatement":
                return this.buildIf(
                    statementNode
                );

            case "WhileStatement":
                return this.buildWhile(
                    statementNode
                );

            default:
                throw new Error(
                    `Unsupported statement type: ${statementNode.nodeType}.`
                );
        }
    }

    /**
     * Assignment
     *
     * Example:
     * x = a + b
     */
    buildAssignment(statementNode) {

        const identifier =
            this.formatAstText(
                statementNode.children?.[0]
            );

        const expression =
            this.formatAstText(
                statementNode.children?.[1]
            );

        const operator =
            statementNode.value || "=";

        const label =
            [
                identifier,
                operator,
                expression
            ]
                .filter(Boolean)
                .join(" ");

        const assignmentNode =
            new FlowNode(
                "assignment",
                label,
                statementNode
            );

        return new FlowFragment(
            assignmentNode,
            assignmentNode,
            [assignmentNode],
            []
        );
    }

    /**
     * Input
     *
     * Example:
     * Input x
     * Input x, y
     */
    buildInput(statementNode) {
        const input =
            this.formatAstText(
                statementNode.children?.[0]
            );

        const label =
            input
                ? `Input`
                : "Input";

        const inputNode =
            new FlowNode(
                "input",
                label,
                statementNode,
                {
                    input
                }
            );

        return new FlowFragment(
            inputNode,
            inputNode,
            [inputNode],
            []
        );
    }

    /**
     * Output
     *
     * Example:
     * Output x
     * Output x + 5
     * Output "hello", x
     */
    buildOutput(statementNode) {
        const output =
            this.formatAstText(
                statementNode.children?.[0]
            );

        const outputNode =
            new FlowNode(
                "output",
                "Output",
                statementNode,
                {
                    output
                }
            );

        return new FlowFragment(
            outputNode,
            outputNode,
            [outputNode],
            []
        );
    }

    /**
     * Builds a flow fragment for a block statement.
     */
    buildBlock(blockNode) {

        if (
            !blockNode ||
            !Array.isArray(blockNode.children)
        ) {
            throw new Error(
                "Cannot build a block fragment: invalid block node."
            );
        }

        if (
            blockNode.children.length === 0
        ) {
            return FlowFragment.empty();
        }

        const blockNodes =
            [];

        const blockEdges =
            [];

        let entryNode =
            null;

        let previousExitNode =
            null;

        blockNode.children.forEach(
            statementNode => {

                const currentFragment =
                    this.buildStatement(
                        statementNode
                    );

                if (
                    currentFragment.isEmpty()
                )
                    return;

                if (!entryNode)
                    entryNode =
                        currentFragment.entryNode;

                blockNodes.push(
                    ...currentFragment.nodes
                );

                blockEdges.push(
                    ...currentFragment.edges
                );

                if (previousExitNode) {

                    blockEdges.push(
                        new FlowEdge(
                            previousExitNode.id,
                            currentFragment.entryNode.id,
                            "next"
                        )
                    );
                }

                previousExitNode =
                    currentFragment.exitNode;
            }
        );

        if (
            !entryNode ||
            !previousExitNode
        ) {
            return FlowFragment.empty();
        }

        return new FlowFragment(
            entryNode,
            previousExitNode,
            blockNodes,
            blockEdges
        );
    }

    /**
     * Builds a body.
     */
    buildBody(bodyNode) {

        if (!bodyNode)
            throw new Error(
                "Cannot build a body fragment from an undefined or null node."
            );

        if (
            bodyNode.nodeType === "Block"
        ) {
            return this.buildBlock(
                bodyNode
            );
        }

        return this.buildStatement(
            bodyNode
        );
    }

    /**
     * IF
     *
     * The visible node only says:
     *
     * IF
     *
     * The complete condition is saved in:
     *
     * node.condition
     *
     * and later sent to:
     *
     * ReactFlow data.condition
     */
    buildIf(statementNode) {

        if (
            !statementNode ||
            !Array.isArray(statementNode.children) ||
            statementNode.children.length < 2
        ) {
            throw new Error(
                "Cannot build an if fragment: invalid if statement node."
            );
        }

        const conditionNode =
            statementNode.children[0];

        const thenBodyNode =
            statementNode.children[1];

        const elseBodyNode =
            statementNode.children[2] ?? null;

        /*
         * Get full readable condition from AST.
         *
         * Example:
         *
         * x + 5 > y & z != 10
         */
        const condition =
            this.formatAstText(
                conditionNode
            );

        /*
         * IMPORTANT:
         *
         * label = "If"
         *
         * condition contains the big condition separately.
         */
        const decisionNode =
            new FlowNode(
                "if",
                "If",
                statementNode,
                {
                    condition
                }
            );

        const junctionNode =
            new FlowNode(
                "junction",
                "",
                null
            );

        const thenFragment =
            this.buildBody(
                thenBodyNode
            );

        const elseFragment =
            elseBodyNode
                ? this.buildBody(
                    elseBodyNode
                )
                : FlowFragment.empty();

        const nodes = [
            decisionNode,
            ...thenFragment.nodes,
            ...elseFragment.nodes,
            junctionNode
        ];

        const edges = [
            ...thenFragment.edges,
            ...elseFragment.edges
        ];

        /*
         * TRUE branch
         */
        if (
            thenFragment.isEmpty()
        ) {
            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    junctionNode.id,
                    "true",
                    "Yes"
                )
            );
        }
        else {

            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    thenFragment.entryNode.id,
                    "true",
                    "Yes"
                )
            );

            edges.push(
                new FlowEdge(
                    thenFragment.exitNode.id,
                    junctionNode.id,
                    "next"
                )
            );
        }

        /*
         * FALSE branch
         */
        if (
            elseFragment.isEmpty()
        ) {
            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    junctionNode.id,
                    "false",
                    "No"
                )
            );
        }
        else {

            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    elseFragment.entryNode.id,
                    "false",
                    "No"
                )
            );

            edges.push(
                new FlowEdge(
                    elseFragment.exitNode.id,
                    junctionNode.id,
                    "next"
                )
            );
        }

        return new FlowFragment(
            decisionNode,
            junctionNode,
            nodes,
            edges
        );
    }

    /**
     * WHILE
     *
     * Visible node:
     *
     * While
     *
     * Hover:
     *
     * full condition
     */
    buildWhile(statementNode) {

        if (
            !statementNode ||
            !Array.isArray(statementNode.children) ||
            statementNode.children.length < 2
        ) {
            throw new Error(
                "Cannot build a while fragment: invalid while statement node."
            );
        }

        const conditionNode =
            statementNode.children[0];

        const bodyNode =
            statementNode.children[1];

        const condition =
            this.formatAstText(
                conditionNode
            );

        const decisionNode =
            new FlowNode(
                "while",
                "While",
                statementNode,
                {
                    condition
                }
            );

        const junctionNode =
            new FlowNode(
                "junction",
                "",
                null
            );

        const bodyFragment =
            this.buildBody(
                bodyNode
            );

        const nodes = [
            decisionNode,
            ...bodyFragment.nodes,
            junctionNode
        ];

        const edges = [
            ...bodyFragment.edges
        ];

        /*
         * YES -> loop body
         */
        if (
            bodyFragment.isEmpty()
        ) {
            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    decisionNode.id,
                    "true",
                    "Yes"
                )
            );
        }
        else {

            edges.push(
                new FlowEdge(
                    decisionNode.id,
                    bodyFragment.entryNode.id,
                    "true",
                    "Yes"
                )
            );

            edges.push(
                new FlowEdge(
                    bodyFragment.exitNode.id,
                    decisionNode.id,
                    "back"
                )
            );
        }

        /*
         * NO -> exit while
         */
        edges.push(
            new FlowEdge(
                decisionNode.id,
                junctionNode.id,
                "false",
                "No"
            )
        );

        return new FlowFragment(
            decisionNode,
            junctionNode,
            nodes,
            edges
        );
    }
}