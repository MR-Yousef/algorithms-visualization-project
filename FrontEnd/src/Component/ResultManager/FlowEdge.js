import { FlowNode } from "./FlowNode";
export class FlowEdge {
    static id = 1;
    /**
     * a class to represent an edge in the flowchart
     * @param {number} source The node's ID that the edge is coming from 
     * @param {number} target The node's ID that the edge is going to
     * @param {string} label the label of the edge, will be "Yes","No" or "" 
     */
    constructor(source, target, label) {
        this.id = FlowEdge.id++;
        this.source = source;
        this.target = target;
        this.label = label;
    }
    /**
     * 
     */
    static reset() {
        FlowEdge.id = 1;
    }
    /**
     * returns the node that has the given id
     * @param {number} nodeId
     * @returns {FlowNode|undefined}
     */
    getNodeById(nodeId) {
        return this.nodes.find((node) => node.id == nodeId);
    }
    /**
     * returns all outgoing edges from a node
     * @param {number} nodeId the id of the node to get outgoing edges from
     * @returns {FlowEdge[]} the outgoing edges from the node with the given id
     */
    getOutgoingEdges(nodeId) {
        return this.edges.filter((edge) => edge.source == nodeId);
    }
    /**
     * returns all incoming edges to a node
     * @param {number} nodeId the id of the node to get incoming edges to
     * @returns {FlowEdge[]} the incoming edges to the node with the given id
     */
    getIncomingEdges(nodeId) {
        return this.edges.filter((edge) => edge.target == nodeId);
    }
    /**
     * returns all child nodes directly connected to the given node
     * @param {number} nodeId the node's ID to get Its children from
     * @returns {FlowNode[]} the child nodes directly connected to the node with the given id
     */
    getChildren(nodeId) {
        let children = this.getOutgoingEdges(nodeId).map((edge) => this.getNodeById(edge.target));
        return children;
    }
    /**
     * returns the parent nodes directly connected to the given node
     * @param {number} nodeId the node's ID to get Its parents from
     * @returns {FlowNode[]} the parent nodes directly connected to the node with the given id
     */
    getParents(nodeId) {
        return this.getIncomingEdges(nodeId)
            .map((edge) => this.getNodeById(edge.source));
    }
    


}