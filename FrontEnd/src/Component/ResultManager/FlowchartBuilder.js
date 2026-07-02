import { FlowGraph } from "./FlowGraph";
import { FlowNode } from "./FlowNode";
import {ASTnode} from"../../Compiler/ASTNode"
import { FlowEdge } from "./FlowEdge";
export class FlowchartBuilder{
    /**
     * a class to build a flowchart graph from the AST tree
     */
    constructor(){
        this.flowGraph = new FlowGraph(); 
    }
    /**
     * builds a flowchart graph from the AST tree
     * @param {ASTnode} ast 
     */
    build(ast){
        this.flowGraph = new FlowGraph();
        let type,label;
        let previousNode = new FlowNode("start","start")
        let tempNode ;
        this.flowGraph.addNode(previousNode)
        ast.children.forEach((child)=>{
            label = child.sourceText;
            switch (child.nodeType){
                case "AssignmentStatement" :
                    type="assignment";
                    break;
                case "InputStatement" :
                    type = "input"
                    break ;
                case "OutputStatement" :
                    type = "output";
                    break ;
            }
            tempNode = new FlowNode(type,label)
            this.flowGraph.addNode(tempNode)
            this.flowGraph.addEdge(new FlowEdge(previousNode.id,tempNode.id))
            previousNode = tempNode ;
        })
        tempNode = new FlowNode("end","end")
        this.flowGraph.addNode(tempNode)
        this.flowGraph.addEdge(new FlowEdge(previousNode.id,tempNode.id))
    return this.flowGraph ;
    }

}