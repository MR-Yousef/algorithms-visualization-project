import { FlowEdge } from "./FlowEdge";
import { FlowNode } from "./FlowNode";
// a class to represent a flow fragment, which is a part of a flow graph that has an entry node and an exit node
export class FlowFragment{
    /**
     * constructor for the flow fragment class
     * @param {FlowNode} entryNode 
     * @param {FlowNode} exitNode 
     * @param {[FlowNode]} nodes
     * @param {[FlowEdge]} edges
     */
    constructor(entryNode,exitNode,nodes=[],edges=[]){
        this.entryNode = entryNode;
        this.exitNode = exitNode;
        this.nodes=nodes
        this.edges=edges
    }
}