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
     * builds a flowchart graph from the AST tree
     * @param {ASTnode} ast 
     * @returns {FlowGraph}
     */
    build(ast) {
        FlowNode.reset();
        FlowEdge.reset();
        this.flowGraph = new FlowGraph();
        let previousFragment = new FlowFragment(new FlowNode("start", "start"), new FlowNode("start", "start"));
        let currentFragment;
        this.flowGraph.addNode(previousFragment.exitNode)
        ast.children.forEach((child) => {
            currentFragment = this.buildStatement(child);
            this.flowGraph.addFragment(currentFragment);
            this.flowGraph.addEdge(new FlowEdge(previousFragment.exitNode.id, currentFragment.entryNode.id))
            previousFragment = currentFragment;
        })
        currentFragment = new FlowFragment(new FlowNode("end", "end"), new FlowNode("end", "end"))
        this.flowGraph.addNode(currentFragment.entryNode)
        this.flowGraph.addEdge(new FlowEdge(previousFragment.exitNode.id, currentFragment.entryNode.id))
        return this.flowGraph;
    }
    /**
     *  call the appropriate function to build the flow node based on the statement type
     * @param {ASTnode} statementNode the statement node to build the flow node from
     * @returns {FlowFragment|undefined} the flow node built from the statement node
     */
    buildStatement(statementNode) {
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
            default:
                return undefined
        }
    }
    /**
     * builds an assignment flow fragment for an assignment statement
     * @param {ASTnode} statementNode 
     * @returns {FlowFragment}
     */
    buildAssignment(statementNode) {
        let tempNode = new FlowNode("assignment", statementNode.sourceText);
        return new FlowFragment(tempNode, tempNode, [tempNode], []);
    }
    /**
     * builds an input flow fragment for an output statement
     * @param {ASTnode} statementNode 
     * @returns {FlowFragment}
     */
    buildInput(statementNode) {
        let tempNode = new FlowNode("input", statementNode.sourceText)
        return new FlowFragment(tempNode, tempNode, [tempNode], []);
    }
    /**
     * builds an output flow fragment for an output statement
     * @param {ASTnode} statementNode 
     * @returns {FlowFragment}
     */
    buildOutput(statementNode) {
        let tempNode = new FlowNode("output", statementNode.sourceText)
        return new FlowFragment(tempNode, tempNode, [tempNode], []);
    }
    /**
 * builds a flow fragment for a block statement
 * @param {ASTnode} blockNode
 * @returns {FlowFragment}
 */
    buildBlock(blockNode) {
        // empty block
        if (blockNode.children.length == 0) {
            let tempEmptyNode = new FlowNode("empty", "empty");
            return new FlowFragment(
                tempEmptyNode,
                tempEmptyNode,
                [tempEmptyNode],
                []);
        }
        let tempFirstFragment = this.buildStatement(blockNode.children[0]);
        let tempPreviousFragment = tempFirstFragment;
        for (let i = 1; i < blockNode.children.length; i++) {
            let tempCurrentFragment = this.buildStatement(blockNode.children[i]);
            tempFirstFragment.nodes.push(...tempCurrentFragment.nodes);
            tempFirstFragment.edges.push(...tempCurrentFragment.edges);
            tempFirstFragment.edges.push(
                new FlowEdge(
                    tempPreviousFragment.exitNode.id,
                    tempCurrentFragment.entryNode.id
                )
            );
            tempPreviousFragment = tempCurrentFragment;
        }
        tempFirstFragment.exitNode = tempPreviousFragment.exitNode;
        return tempFirstFragment;
    }
    /**
     * builds a flow fragment for a body node
     * Body can be a Block or a single Statement
     * @param {ASTnode} bodyNode
     * @returns {FlowFragment}
    */
    buildBody(bodyNode) {
        if (bodyNode.nodeType == "Block")
            return this.buildBlock(bodyNode);
        return this.buildStatement(bodyNode);
    }
    /**
     * Builds a flow fragment for an if statement.
     * @param {ASTnode} statementNode
     * @returns {FlowFragment}
     */
    buildIf(statementNode) {
        // Create the decision and merge nodes.
        let decisionNode = new FlowNode("decision", statementNode.children[0].sourceText);
        let mergeNode = new FlowNode("merge", "");
        // Build the then fragment.
        let thenFragment = this.buildBody(statementNode.children[1]);
        // Build the else fragment if it exists.
        // Otherwise create an empty fragment.
        let elseFragment;
        if (statementNode.children.length == 3) {
            elseFragment = this.buildBody(statementNode.children[2]);
        }
        else {
            let emptyNode = new FlowNode("empty", "");
            elseFragment = new FlowFragment(emptyNode, emptyNode, [emptyNode], []);
        }
        // Create the resulting fragment.
        let tempFragment = new FlowFragment(decisionNode, mergeNode, [], []);
        // Add all nodes.
        tempFragment.nodes.push(decisionNode, ...(thenFragment.nodes), ...(elseFragment.nodes), mergeNode);
        // Add internal edges.
        tempFragment.edges.push(...(thenFragment.edges), ...(elseFragment.edges));
        // Decision -> Then
        tempFragment.edges.push(new FlowEdge(decisionNode.id, thenFragment.entryNode.id, "Yes"));
        // Decision -> Else
        tempFragment.edges.push(new FlowEdge(decisionNode.id, elseFragment.entryNode.id, "No"));
        // Then -> Merge
        tempFragment.edges.push(new FlowEdge(thenFragment.exitNode.id, mergeNode.id));
        // Else -> Merge
        tempFragment.edges.push(new FlowEdge(elseFragment.exitNode.id, mergeNode.id));
        return tempFragment;
    }
    /**
 * Builds a flow fragment for a while statement.
 * @param {ASTnode} statementNode
 * @returns {FlowFragment}
 */
    buildWhile(statementNode) {
        // Create the decision and merge nodes.
        let decisionNode = new FlowNode("decision", statementNode.children[0].sourceText);
        let mergeNode = new FlowNode("merge", "");
        // Build the loop body.
        let bodyFragment = this.buildBody(statementNode.children[1]);
        // Create the resulting fragment.
        let tempFragment = new FlowFragment(decisionNode, mergeNode, [], []);
        // Add all nodes.
        tempFragment.nodes.push(decisionNode, ...bodyFragment.nodes, mergeNode);
        // Add internal edges.
        tempFragment.edges.push(...bodyFragment.edges);
        // Decision -> Body (Yes)
        tempFragment.edges.push(new FlowEdge(decisionNode.id, bodyFragment.entryNode.id, "Yes"));
        // Decision -> Merge (No)
        tempFragment.edges.push(new FlowEdge(decisionNode.id, mergeNode.id, "No"));
        // Body -> Decision
        tempFragment.edges.push(new FlowEdge(bodyFragment.exitNode.id, decisionNode.id));
        return tempFragment;
    }
}