import { FlowNode } from "./FlowNode";
export class FlowEdge{
    static id = 1 ;
    /**
     * a class to represent an edge in the flowchart
     * @param {number} source The node's ID that the edge is coming from 
     * @param {number} target The node's ID that the edge is going to
     * @param {string} label the label of the edge, will be "Yes","No" or "" 
     */
    constructor(source,target,label){
        this.id = FlowEdge.id++;
        this.source = source;
        this.target = target;
        this.label = label;
    }
}