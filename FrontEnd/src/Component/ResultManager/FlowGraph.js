import { FlowNode } from "./FlowNode"
import { FlowEdge } from "./FlowEdge";
export class FlowGraph{
    /**
     * a class to represent a flowchart graph, which contains nodes and edges
     */
    constructor(){
        this.nodes=[]
        this.edges=[]
    }
    /**
     * adds a node to the graph
     * @param {FlowNode} tempNode 
     */
    addNode(tempNode){
        this.nodes.push(tempNode);
    }
    /**
     * adds an edge to the graph
     * @param {FlowEdge} tempEdge 
     */
    addEdge(tempEdge){
        this.edges.push(tempEdge)
    }

}