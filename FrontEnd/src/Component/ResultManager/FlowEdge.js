export class FlowEdge {
    static id = 1;
    /**
     * Represents a logical edge in the flow graph.
     * @param {number} source
     * @param {number} target
     * @param {"next"|"true"|"false"|"back"} role
     * @param {string} label
     */
    constructor(source, target, role="next",label="") {
        this.id = FlowEdge.id++;
        this.source = source;
        this.target = target;
        this.label = label;
        this.role = role;
    }
    /**
     * Resets the edge ID counter.
     */
    static reset() {
        FlowEdge.id = 1;
    }
}