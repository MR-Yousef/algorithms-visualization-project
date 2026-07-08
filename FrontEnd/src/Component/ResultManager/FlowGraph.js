import { FlowNode } from "./FlowNode"
import { FlowEdge } from "./FlowEdge";
import { FlowFragment } from "./FlowFragment";
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
    /**
     * adds a flow fragment to the graph, which contains nodes and edges
     * @param {FlowFragment} fragment 
     */
    addFragment(fragment){
        fragment.nodes.forEach((node)=>{
            this.addNode(node);
        })
        fragment.edges.forEach((edge)=>{
            this.addEdge(edge) ;
        })
    }

}