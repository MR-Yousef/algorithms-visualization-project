import { Token } from "./Token";

/*
    - general notes about ASTnodes :
    1)- There is two main types of nodes :
        a- Grammar Dispatcher : 
            A node that is responsible for dispatching the grammar rules to the correct handler based on the current token. 
            It has children nodes that represent the different grammar rules that can be applied.
        b- AST Builder :
            A node that is responsible for building the AST based on the grammar rules that have been applied.
            It returns the AST node that represents the current grammar rule.
    2)- The main node in the AST is "program node"
    3)- 
*/
export class ASTnode{
    /**
     * Creates a new instance of the ASTnode class.
     * @param {string} nodeType - The type of the AST node (e.g., "Expression", "Statement").
     * @param {string} value - The value associated with the AST node (e.g., variable name, literal value).
     * @param {[ASTnode]} children - An array of child ASTnode instances representing the children of this node.
     * @param {ASTnode} parent - The parent ASTnode instance representing the parent of this node.
     * @param {number} lineNumber - The line number in the source code where this AST node was created.
     * @param {string} sourceText - The source code text associated with this AST node.
    */
    constructor(nodeType,value,children,parent,lineNumber,sourceText){
        this.nodeType = nodeType;
        this.value = value;
        this.children = children;
        this.parent = parent;
        this.lineNumber = lineNumber;
        this.sourceText=sourceText
    }
    /**
     * Adds a child token to the current node's children array.
     * @param {Token} childToken - The child token to be added to the current node's children. 
     */
    addTokenChild(childToken){
        this.children.push(new ASTnode(childToken.getType(),childToken.getValue(),[],this,childToken.getLineNumber()))
    }
    /**
     * Adds a child ASTnode to the current node's children array.
     * @param {ASTnode} ASTchildNode 
     */
    addASTchild(ASTchildNode){
        ASTchildNode.parent = this ;
        this.children.push(ASTchildNode);
    }
    
}