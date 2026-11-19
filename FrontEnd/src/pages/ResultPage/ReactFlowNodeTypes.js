import { StartNode, EndNode, AssignmentNode, InputNode, OutputNode, IfNode, WhileNode, JunctionNode } from "./ReactFlowNodes";
/**
 * Maps internal FlowNode types to their
 * corresponding React Flow components.
 * The keys must remain synchronized with:
 * - FlowNode.type
 * - ReactFlowAdapter.adaptNode()
 */
export const reactFlowNodeTypes = {
    start: StartNode,
    end: EndNode,
    assignment: AssignmentNode,
    input: InputNode,
    output: OutputNode,
    if: IfNode,
    while: WhileNode,
    junction: JunctionNode
};