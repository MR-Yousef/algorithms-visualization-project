import { FlowchartBuilder } from "./FlowchartBuilder";
import { LayoutTreeBuilder } from "./LayoutTreeBuilder";
import { LayoutEngine } from "./LayoutEngine";
import { ReactFlowAdapter } from "./ReactFlowAdapter";

/**
 * Manages all flowchart stages that run after compilation.
 * Input:
 * - an already compiled AST
 * Output:
 * - React Flow nodes and edges
 * - intermediate representations
 */
export class ResultManager {
    /**
     * Builds the complete flowchart result from an AST.
     *
     * @param {import("../../Compiler/ASTNode").ASTnode} ast
     * @returns {{
     *   flowGraph: import("./FlowGraph").FlowGraph,
     *   layoutTree: import("./LayoutTreeNode").LayoutTreeNode,
     *   layoutResult: import("./LayoutResult").LayoutResult,
     *   nodes: Array<object>,
     *   edges: Array<object>
     * }}
     */
    build(ast) {
        // validate that the AST is provided, as the flowchart cannot be built without it
        if (!ast)
            throw new Error("Cannot build a result from an undefined or null AST.");
        // declare the builders and engines needed for the flowchart construction
        const flowchartBuilder = new FlowchartBuilder();
        const layoutTreeBuilder = new LayoutTreeBuilder();
        const layoutEngine = new LayoutEngine();
        const reactFlowAdapter = new ReactFlowAdapter();
        // declare the intermediate representations and final React Flow nodes and edges
        const flowGraph = flowchartBuilder.build(ast);
        const layoutTree = layoutTreeBuilder.build(flowGraph);
        const layoutResult = layoutEngine.layout(layoutTree, flowGraph);
        const { nodes, edges } = reactFlowAdapter.adapt(flowGraph, layoutResult);
        // return all the intermediate representations and final React Flow nodes and edges
        return {flowGraph,layoutTree,layoutResult,nodes,edges};
    }
}