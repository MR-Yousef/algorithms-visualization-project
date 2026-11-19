import { FlowNode } from "./FlowNode";
import { FlowEdge } from "./FlowEdge";
/*
 * Represents a temporary fragment of the flow graph.
 * A fragment has:
 * - one entry node
 * - one exit node
 * - a collection of nodes
 * - a collection of edges
 * Empty fragments are allowed and use null for both
 * entryNode and exitNode.
 */
export class FlowFragment {
    /**
     * @param {FlowNode|null} entryNode
     * @param {FlowNode|null} exitNode
     * @param {FlowNode[]} nodes
     * @param {FlowEdge[]} edges
     */
    constructor(entryNode = null,exitNode = null,nodes = [],edges = []) {
        this.entryNode = entryNode;
        this.exitNode = exitNode;
        this.nodes = nodes;
        this.edges = edges;
    }
    /**
     * Returns true when the fragment contains no nodes.
     * @returns {boolean}
     */
    isEmpty() {
        return this.nodes.length === 0;
    }
    /**
     * Creates an empty flow fragment.
     * @returns {FlowFragment}
     */
    static empty() {
        return new FlowFragment();
    }
}