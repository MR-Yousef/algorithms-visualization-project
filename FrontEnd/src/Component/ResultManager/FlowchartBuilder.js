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
     * Builds a complete flow graph from the AST root.
     * @param {ASTnode} ast
     * @returns {FlowGraph}
     */
    build(ast) {
        if (!ast || !Array.isArray(ast.children))
            throw new Error("Cannot build the flow graph: invalid AST root.");
        // Reset the FlowNode and FlowEdge static counters to ensure unique IDs for each new flow graph.
        FlowNode.reset();
        FlowEdge.reset();
        // Initialize a new FlowGraph instance to build the flowchart.
        this.flowGraph = new FlowGraph();
        // Create the start and end nodes for the flowchart.
        const startNode = new FlowNode("start", "Start");
        const endNode = new FlowNode("end", "End");
        // Add the start node to the flow graph and set it as the previous exit node
        this.flowGraph.addNode(startNode);
        let previousExitNode = startNode;
        // Iterate through each statement in the AST and build the corresponding flow fragments.
        ast.children.forEach(statementNode => {
            const currentFragment = this.buildStatement(statementNode);
            this.flowGraph.addFragment(currentFragment);
            this.flowGraph.addEdge(new FlowEdge(previousExitNode.id, currentFragment.entryNode.id, "next"));
            previousExitNode = currentFragment.exitNode;
        });
        // Add the end node to the flow graph and connect it to the last exit node.
        this.flowGraph.addNode(endNode);
        this.flowGraph.addEdge(new FlowEdge(previousExitNode.id,endNode.id,"next"));
        // Validate the constructed flow graph to ensure it is well-formed and adheres to the expected structure.
        const validationResult = this.flowGraph.validate();
        // If the flow graph is not valid, throw an error with the validation errors.
        if (!validationResult.isValid) 
            throw new Error(["Failed to build a valid flow graph:",...validationResult.errors.map(error => `- ${error}`)].join("\n"));
        // Return the constructed flow graph.
        return this.flowGraph;
    }

    /**
     * Builds the appropriate flow fragment for a statement node.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildStatement(statementNode) {
        // Check if the statement node is defined and not 
        if (!statementNode)
            throw new Error("Cannot build a flow fragment from an undefined or null statement.");
        // Determine the type of statement and call the corresponding build method.
        switch (statementNode.nodeType) {
            case "AssignmentStatement":
                return this.buildAssignment(statementNode);
            case "InputStatement":
                return this.buildInput(statementNode);
            case "OutputStatement":
                return this.buildOutput(statementNode);
            case "IfStatement":
                return this.buildIf(statementNode);
            case "WhileStatement":
                return this.buildWhile(statementNode);
            // default case to handle unsupported statement types.
            default:
                throw new Error(`Unsupported statement type: ${statementNode.nodeType}.`);
        }
    }

    /**
     * Builds an assignment flow fragment.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildAssignment(statementNode) {
        const assignmentNode = new FlowNode("assignment", statementNode.sourceText, statementNode);
        return new FlowFragment(assignmentNode, assignmentNode, [assignmentNode], []);
    }

    /**
     * Builds an input flow fragment.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildInput(statementNode) {
        const inputNode = new FlowNode("input", statementNode.sourceText, statementNode);
        return new FlowFragment(inputNode, inputNode, [inputNode], []);
    }

    /**
     * Builds an output flow fragment.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildOutput(statementNode) {
        const outputNode = new FlowNode("output", statementNode.sourceText, statementNode);
        return new FlowFragment(outputNode, outputNode, [outputNode], []);
    }

    /**
     * Builds a flow fragment for a block statement.
     * @param {ASTnode} blockNode
     * @returns {FlowFragment}
     */
    buildBlock(blockNode) {
        // Check if the block node is valid and has children.
        if (!blockNode || !Array.isArray(blockNode.children))
            throw new Error("Cannot build a block fragment: invalid block node.");
        // If the block has no children, return an empty flow fragment.
        if (blockNode.children.length === 0) {
            return FlowFragment.empty();
        }
        // Initialize arrays to hold the nodes and edges of the block fragment.
        const blockNodes = [];
        const blockEdges = [];
        // Initialize variables to track the entry and exit nodes of the block fragment.
        let entryNode = null;
        let previousExitNode = null;
        // Iterate through each statement in the block and build the corresponding flow fragments.
        blockNode.children.forEach(statementNode => {
            const currentFragment = this.buildStatement(statementNode);
            // If the current fragment is empty, skip to the next statement.
            if (currentFragment.isEmpty())
                return;
            // If the entry node has not been set yet, set it to the entry node of the current fragment.
            if (!entryNode)
                entryNode = currentFragment.entryNode;
            // Add the nodes and edges of the current fragment to the block fragment.
            blockNodes.push(...currentFragment.nodes);
            blockEdges.push(...currentFragment.edges);
            // If there is a previous exit node, create an edge from it to the entry node of the current fragment.
            if (previousExitNode)
                blockEdges.push(new FlowEdge(previousExitNode.id, currentFragment.entryNode.id, "next"));
            // Update the previous exit node to be the exit node of the current fragment.
            previousExitNode = currentFragment.exitNode;
        });
        // If no entry or exit nodes were set, return an empty flow fragment.
        if (!entryNode || !previousExitNode)
            return FlowFragment.empty();
        // Create and return a new FlowFragment with the collected nodes and edges.
        return new FlowFragment(entryNode, previousExitNode, blockNodes, blockEdges);
    }

    /**
     * Builds a flow fragment for a statement body.
     * A body may be:
     * - a Block
     * - a single statement
     * @param {ASTnode} bodyNode
     * @returns {FlowFragment}
     */
    buildBody(bodyNode) {
        // Check if the body node is defined and not null.
        if (!bodyNode)
            throw new Error("Cannot build a body fragment from an undefined or null node.");
        // Determine if the body node is a block or a single statement and call the corresponding build method.
        if (bodyNode.nodeType === "Block")
            return this.buildBlock(bodyNode);
        else
            return this.buildStatement(bodyNode);
    }

    /**
     * Builds a flow fragment for an if statement.
     * AST structure:
     * children[0] = condition
     * children[1] = then body
     * children[2] = optional else body
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildIf(statementNode) {
        // Validate the if statement node and its children.
        if (!statementNode || !Array.isArray(statementNode.children) || statementNode.children.length < 2)
            throw new Error("Cannot build an if fragment: invalid if statement node.");
        // Extract the condition, then body, and optional else body from the statement node.
        const conditionNode = statementNode.children[0];
        const thenBodyNode = statementNode.children[1];
        const elseBodyNode = statementNode.children[2] ?? null;
        // Create the decision node for the if statement.
        const decisionNode = new FlowNode("if", conditionNode.sourceText, statementNode);
        // Create a junction node to merge the branches of the if statement.
        const junctionNode = new FlowNode("junction", "", null);
        // Build the flow fragments for the then and else bodies.
        const thenFragment = this.buildBody(thenBodyNode);
        // If the else body exists, build its flow fragment; otherwise, create an empty fragment.
        const elseFragment = elseBodyNode ? this.buildBody(elseBodyNode) : FlowFragment.empty();
        // Combine the nodes from the decision node, then fragment, else fragment, and junction node into a single array.
        const nodes = [decisionNode, ...thenFragment.nodes, ...elseFragment.nodes, junctionNode];
        // Combine the edges from the then fragment and else fragment into a single array.
        const edges = [...thenFragment.edges, ...elseFragment.edges];

        // True branch.
        // If the then fragment is empty, create an edge directly from the decision node to the junction node with a "true" label.
        if (thenFragment.isEmpty())
            edges.push(new FlowEdge(decisionNode.id, junctionNode.id, "true", "Yes"));
        // If the then fragment is not empty, create an edge from the decision node to the entry node of the then fragment with a "true" label 
        // After that, and another edge from the exit node of the then fragment to the junction node.
        else {
            edges.push(new FlowEdge(decisionNode.id, thenFragment.entryNode.id, "true", "Yes"));
            edges.push(new FlowEdge(thenFragment.exitNode.id, junctionNode.id, "next"));
        }
        // False branch.
        // If the else fragment is empty, create an edge directly from the decision node to the junction node with a "false" label.
        if (elseFragment.isEmpty())
            edges.push(new FlowEdge(decisionNode.id, junctionNode.id, "false", "No"));
        // If the else fragment is not empty, create an edge from the decision node to the entry node of the else fragment with a "false" label
        else {
            edges.push(new FlowEdge(decisionNode.id, elseFragment.entryNode.id, "false", "No"));
            edges.push(new FlowEdge(elseFragment.exitNode.id, junctionNode.id, "next"));
        }
        // Return a new FlowFragment representing the entire if statement
        // (with the decision node as the entry point and the junction node as the exit point.)
        return new FlowFragment(decisionNode, junctionNode, nodes, edges);
    }

    /**
     * Builds a flow fragment for a while statement.
     * AST structure:
     * children[0] = condition
     * children[1] = body
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildWhile(statementNode) {
        // Validate the while statement node and its children.
        if (!statementNode || !Array.isArray(statementNode.children) || statementNode.children.length < 2)
            throw new Error("Cannot build a while fragment: invalid while statement node.");
        // Extract the condition and body nodes from the statement node.
        const conditionNode = statementNode.children[0];
        const bodyNode = statementNode.children[1];
        // Create the decision node for the while statement, which evaluates the loop condition.
        const decisionNode = new FlowNode("while", conditionNode.sourceText, statementNode);
        // Create a junction node to represent the exit point of the loop after the body has been executed.
        const junctionNode = new FlowNode("junction", "", null);
        // Build the flow fragment for the loop body using the buildBody method.
        const bodyFragment = this.buildBody(bodyNode);
        // Combine the nodes from the decision node, body fragment, and junction node into a single array.
        const nodes = [decisionNode, ...bodyFragment.nodes, junctionNode];
        // Combine the edges from the body fragment into a single array.
        const edges = [...bodyFragment.edges];

        // True branch enters the loop body.
        // If the body fragment is empty, create an edge from the decision node back to itself with a "true" label.
        if (bodyFragment.isEmpty())
            edges.push(new FlowEdge(decisionNode.id, decisionNode.id, "true", "Yes"));
        // If the body fragment is not empty, create an edge from the decision node to the entry node of the body fragment with a "true" label,
        else {
            edges.push(new FlowEdge(decisionNode.id, bodyFragment.entryNode.id, "true", "Yes"));
            edges.push(new FlowEdge(bodyFragment.exitNode.id, decisionNode.id, "back"));
        }
        // False branch exits the loop.
        // If the body fragment is empty, create an edge from the decision node to the junction node with a "false" label.
        edges.push(new FlowEdge(decisionNode.id, junctionNode.id, "false", "No"));
        // Return a new FlowFragment representing the entire while statement
        return new FlowFragment(decisionNode, junctionNode, nodes, edges);
    }
}