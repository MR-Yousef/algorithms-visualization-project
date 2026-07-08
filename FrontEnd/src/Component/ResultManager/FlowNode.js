import {ASTnode} from "../../Compiler/ASTNode"
/*
    node types : start , end , input , output , assignment 
 */
export class FlowNode{
    static id = 1;
    /**
     * a class to represent a node in the flowchart
     * @param {string} type the type of the node, can be "start", "end", "assginment", "decision" 
     * @param {string} label the label of the node, can be any string
     * @param {ASTnode} astNode the reference to the ASTnode that this node represents
     */
    constructor(type,label,astNode){
        this.id = FlowNode.id++;
        this.type = type;
        this.label = label;
        this.astNode = astNode;
        this.position = {x:0,y:0};
    }
    /**
     * resets the static id counter for the FlowNode class
     */
    static reset(){
        FlowNode.id = 0 ;
    }
}