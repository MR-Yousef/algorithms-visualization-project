import { ASTnode } from "../../Compiler/ASTNode"

/*
    Node types:
    start
    end
    assignment
    input
    output
    if
    while
    junction
*/
export class FlowNode {
    static id = 1;

    /**
     * a class to represent a node in the flowchart
     * @param {string} type the type of the node
     * @param {string} label the label of the node
     * @param {ASTnode|null} astNode the reference to the ASTnode that this node represents
     * @param {{condition?: string, input?: string, output?: string}} details extra display data
     */
    constructor(type, label, astNode = null, details = {}) {
        this.id = FlowNode.id++;
        this.type = type;
        this.label = label;
        this.astNode = astNode;

        this.condition =
            typeof details.condition === "string"
                ? details.condition
                : null;

        this.input =
            typeof details.input === "string"
                ? details.input
                : null;

        this.output =
            typeof details.output === "string"
                ? details.output
                : null;
    }

    /**
     * resets the static id counter for the FlowNode class
     */
    static reset() {
        FlowNode.id = 1;
    }
}