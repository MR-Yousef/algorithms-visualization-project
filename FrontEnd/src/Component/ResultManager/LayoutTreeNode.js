/**
 * Represents one structural element inside the layout tree.
 * Supported types:
 * - sequence
 * - node
 * - if
 * - while
 */
export class LayoutTreeNode {
    /**
     * @param {"sequence"|"node"|"if"|"while"} type
     * @param {object} options
     * @param {number|null} options.flowNodeId
     * @param {LayoutTreeNode[]} options.children
     * @param {LayoutTreeNode|null} options.trueBranch
     * @param {LayoutTreeNode|null} options.falseBranch
     * @param {LayoutTreeNode|null} options.body
     * @param {number|null} options.junctionNodeId
     */
    constructor(type, { flowNodeId = null, children = [], trueBranch = null, falseBranch = null, body = null, junctionNodeId = null } = {}) {
        // Validate types for 
        const validTypes = new Set(["sequence", "node", "if", "while"]);
        // 
        if (!validTypes.has(type)) {
            throw new Error(
                `Cannot create layout tree node: invalid type ${type}.`
            );
        }
        // assign properties
        this.type = type;
        this.flowNodeId = flowNodeId;
        this.children = children;
        this.trueBranch = trueBranch;
        this.falseBranch = falseBranch;
        this.body = body;
        this.junctionNodeId = junctionNodeId;
        // set the calculated size of this layout subtree to zero initially
        this.width = 0;
        this.height = 0;
    }

    /**
     * Returns true when this node represents a sequence.
     * @returns {boolean}
     */
    isSequence() {
        return this.type === "sequence";
    }

    /**
     * Returns true when this node represents a single flow node.
     * @returns {boolean}
     */
    isNode() {
        return this.type === "node";
    }

    /**
     * Returns true when this node represents an if structure.
     * @returns {boolean}
     */
    isIf() {
        return this.type === "if";
    }

    /**
     * Returns true when this node represents a while structure.
     * @returns {boolean}
     */
    isWhile() {
        return this.type === "while";
    }

    /**
     * Sets the calculated size of this layout subtree.
     * @param {number} width
     * @param {number} height
     */
    setSize(width, height) {
        // validate that width and height are finite non-negative numbers
        if (!Number.isFinite(width) || !Number.isFinite(height) || width < 0 || height < 0)
            throw new Error("Layout tree size must contain non-negative finite numbers.");
        // assign the size
        this.width = width;
        this.height = height;
    }


}