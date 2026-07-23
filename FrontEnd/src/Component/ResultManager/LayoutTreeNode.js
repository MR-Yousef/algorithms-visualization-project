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
        this.axisX = 0;
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
     * Stores the calculated geometry of this layout block.
     * axisX represents the horizontal main-flow axis,
     * measured from the left edge of the block.
     *
     * @param {number} width
     * @param {number} height
     * @param {number} axisX
     */
    setGeometry(width, height, axisX) {
        // validate that width , hight and axisX aree finite numbers
        if (!Number.isFinite(width) ||!Number.isFinite(height) ||!Number.isFinite(axisX)) 
            throw new Error("Layout tree geometry must contain finite numbers.");
        //  validate that width and height are non-negative
        if (width < 0 || height < 0) 
            throw new Error("Layout tree width and height must be non-negative.");
        // validate that axisX is within the bounds of the block width
        if (axisX < 0 || axisX > width)
            throw new Error(`Layout tree axisX must be between 0 and the block width ${width}.`);
        this.width = width;
        this.height = height;
        this.axisX = axisX;
    }


}