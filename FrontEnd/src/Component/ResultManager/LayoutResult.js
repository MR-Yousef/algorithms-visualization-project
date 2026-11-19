/*
 * Stores the result produced by the layout engine.
 * The logical FlowGraph remains unchanged. All visual positions
 * and calculated diagram bounds are stored here.
 */
export class LayoutResult {
    constructor() {
        /**
         * Maps each flow node ID to its calculated position.
         * @type {Map<number, {x: number, y: number}>}
         */
        this.positions = new Map();
        /**
         * The total bounds occupied by the diagram.
         *
         * @type {{
         *   minX: number,
         *   minY: number,
         *   maxX: number,
         *   maxY: number,
         *   width: number,
         *   height: number
         * }}
         */
        this.bounds = {
            minX: 0,
            minY: 0,
            maxX: 0,
            maxY: 0,
            width: 0,
            height: 0
        };
    }

    /**
     * Stores the position of a flow node.
     * @param {number} nodeId
     * @param {number} x
     * @param {number} y
     */
    setPosition(nodeId, x, y) {
        if (!Number.isInteger(nodeId)) 
            throw new Error(`Cannot set a layout position: invalid node ID ${nodeId}.`);
        if (!Number.isFinite(x) || !Number.isFinite(y)) 
            throw new Error(`Cannot set the position of node ${nodeId}: coordinates must be finite numbers.`);
        this.positions.set(nodeId, { x, y });
    }

    /**
     * Returns the position of a flow node.
     * @param {number} nodeId
     * @returns {{x: number, y: number}|undefined}
     */
    getPosition(nodeId) {
        return this.positions.get(nodeId);
    }

    /**
     * Checks whether a position exists for a node.
     * @param {number} nodeId
     * @returns {boolean}
     */
    hasPosition(nodeId) {
        return this.positions.has(nodeId);
    }

    /**
     * Sets the total bounds occupied by the diagram.
     * @param {{
     *   minX: number,
     *   minY: number,
     *   maxX: number,
     *   maxY: number
     * }} bounds
     */
    setBounds({ minX, minY, maxX, maxY }) {
        const values = [minX, minY, maxX, maxY];
        // Check that all values are finite numbers 
        if (!values.every(Number.isFinite)) 
            throw new Error("Cannot set layout bounds: all values must be finite numbers.");
        // Check that max values are not smaller than min values
        if (maxX < minX || maxY < minY) 
            throw new Error("Cannot set layout bounds: maximum values must not be smaller than minimum values.");
        // Store the bounds
        this.bounds = {
            minX,
            minY,
            maxX,
            maxY,
            width: maxX - minX,
            height: maxY - minY
        };
    }

    /**
     * Returns the total bounds occupied by the diagram.
     * @returns {{
     *   minX: number,
     *   minY: number,
     *   maxX: number,
     *   maxY: number,
     *   width: number,
     *   height: number
     * }}
     */
    getBounds() {
        return { ...this.bounds };
    }

    /**
     * Returns the number of positioned nodes.
     * @returns {number}
     */
    getPositionCount() {
        return this.positions.size;
    }
}