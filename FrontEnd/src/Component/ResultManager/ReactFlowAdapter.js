import { DEFAULT_NODE_SIZES } from "./LayoutEngine"
/**
 * Converts the internal flowchart representation into
 * nodes and edges accepted by React Flow.
 * Input:
 * - FlowGraph: logical nodes and edges
 * - LayoutResult: calculated node positions
 * Output:
 * - React Flow nodes
 * - React Flow edges
 *
 * This adapter must not mutate either input object.
 */
export class ReactFlowAdapter {
    /**
     * @param {{
     * edgeType?: string,
     * nodeSizes?: Record < string ,{ width : number , height : number}>
     * }} options
     */
    constructor(options = {}) {
        this.options = {
            edgeType: options.edgeType ?? "smoothstep",
            nodeSizes: {
                ...DEFAULT_NODE_SIZES,
                ...(options.nodeSizes ?? {})
            }
        };
    }

    /**
     * Converts a complete FlowGraph and LayoutResult into
     * the nodes and edges expected by React Flow.
     *
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @returns {{
     *   nodes: Array<object>,
     *   edges: Array<object>
     * }}
     */
    adapt(flowGraph, layoutResult) {

        // validate inputs
        if (!flowGraph || !Array.isArray(flowGraph.nodes) || !Array.isArray(flowGraph.edges))
            throw new Error("Cannot adapt an invalid flow graph.");
        if (!layoutResult || typeof layoutResult.getPosition !== "function")
            throw new Error("Cannot adapt a flow graph without a valid layout result.");
        // Adapt all nodes and edges
        const nodes = flowGraph.nodes.map(flowNode => this.adaptNode(flowNode, layoutResult));
        const edges = flowGraph.edges.map(flowEdge => this.adaptEdge(flowEdge, flowGraph));
        return { nodes, edges };
    }

    /**
     * Converts one internal FlowNode into a React Flow node.
     * @param {import("./FlowNode").FlowNode} flowNode
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @returns {{
     *   id: string,
     *   type: string,
     *   position: {x: number, y: number},
     *   style: {
     *      width: nodeSize.width,
     *     height: nodeSize.heigh
     *   },
     *   data: {
     *     flowNodeId: number,
     *     flowNodeType: string,
     *     label: string,
     *     astNode: unknown
     *   }
     * }}
     */
    adaptNode(flowNode, layoutResult) {
        // Validate inputs
        if (!flowNode)
            throw new Error("Cannot adapt an undefined or null flow node.");
        if (!layoutResult || typeof layoutResult.getPosition !== "function")
            throw new Error("Cannot adapt a flow node without a valid layout result.");
        // Get the node's position from the layout result and validate it
        const position = layoutResult.getPosition(flowNode.id);
        if (!position)
            throw new Error(`Cannot adapt flow node ${flowNode.id}: no layout position was found.`);
        if (!Number.isFinite(position.x) || !Number.isFinite(position.y))
            throw new Error(`Cannot adapt flow node ${flowNode.id}: its layout position is invalid.`);
        const nodeSize = this.options.nodeSizes[flowNode.type];
        // validate that the node size is defined and has positive dimensions
        if (!nodeSize || !Number.isFinite(nodeSize.width) || !Number.isFinite(nodeSize.height) || nodeSize.width <= 0 || nodeSize.height <= 0)
            throw new Error(`Cannot adapt flow node ${flowNode.id}: ` + `no valid size was configured for node type ${flowNode.type}.`);
        return {
            /*
             * React Flow expects node identifiers to be strings.
             */
            id: String(flowNode.id),
            /*
             * This will correspond to a key in the React Flow
             * nodeTypes object:
             * start, end, assignment, input, output,
             * if, while, junction
             */
            type: flowNode.type,
            position: { x: position.x, y: position.y },
            /*
            * The rendered dimensions must match the dimensions
            * used by LayoutEngine during measurement.
            */
            style: {
                width: nodeSize.width,
                height: nodeSize.height
            },
            data: {
                /*
                 * Preserve the original internal numeric identifier.
                 */
                flowNodeId: flowNode.id,
                flowNodeType: flowNode.type,
                label: flowNode.label,
                /*
                 * Preserve the AST reference for future interactions,
                 * such as selecting the related source statement.
                 */
                astNode: flowNode.astNode
            }
        };
    }

    /**
     * Determines the React Flow handle identifiers used by an edge.
     * Handle identifiers must match the IDs that will later be
     * declared by the custom React Flow node components.
     *
     * @param {import("./FlowEdge").FlowEdge} flowEdge
     * @param {import("./FlowNode").FlowNode} sourceNode
     * @param {import("./FlowNode").FlowNode} targetNode
     * @returns {{
     *   sourceHandle: string,
     *   targetHandle: string
     * }}
     */
    getEdgeHandles(flowEdge, sourceNode, targetNode) {
        // Validate inputs
        if (!flowEdge)
            throw new Error("Cannot determine handles for an undefined or null flow edge.");
        if (!sourceNode)
            throw new Error(`Cannot determine handles for flow edge ${flowEdge.id}: ` + "its source node is missing.");
        if (!targetNode)
            throw new Error(`Cannot determine handles for flow edge ${flowEdge.id}: ` + "its target node is missing.");
        // Determine the handles based on the edge role and the types of its source and target nodes
        switch (flowEdge.role) {
            /*
             * Ordinary sequential execution moves downward.
             */
            case "next":
                return {
                    sourceHandle: "source-bottom",
                    targetHandle: "target-top"
                };
            /*
             * True branches leave decision nodes from the right.
             * A true self-edge represents an empty while body.
             * In that case both ends use the right side so React Flow
             * can render it as a loop around the decision node.
             */
            case "true":
                if (sourceNode.type === "if")
                    return { sourceHandle: "source-right", targetHandle: "target-top" };
                if (sourceNode.type === "while") {
                    /*
                     * The loop body is below the while node.
                     * An empty while body is represented by a self-edge.
                     * It leaves from the bottom and returns from the right.
                     */
                    return {
                        sourceHandle: "source-bottom",
                        targetHandle: sourceNode.id === targetNode.id ? "target-right" : "target-top"
                    };
                }

                throw new Error(
                    `True edge ${flowEdge.id} must originate from an if or while node.`
                );
            /*
             * False branches of if nodes move to the left.
             * False branches of while nodes represent loop exit,
             * so they continue downward toward the junction.
             */
            case "false":
                if (sourceNode.type === "if")
                    return {
                        sourceHandle: "source-left",
                        targetHandle: "target-top"
                    };
                if (sourceNode.type === "while") {
                    return {
                        sourceHandle: "source-left",
                        targetHandle: "target-top"
                    };
                }
                throw new Error(`False edge ${flowEdge.id} must originate from an if or while node.`);
            /*
             * A back edge returns from the loop body to the while
             * decision node.
             */
            case "back":
                if (targetNode.type !== "while")
                    throw new Error(`Back edge ${flowEdge.id} must target a while node.`);
                return {
                    sourceHandle: "source-bottom",
                    targetHandle: "target-right"
                };
            // default: no handles are defined for other edge roles, which may be added in the future
            default:
                throw new Error(`Cannot determine handles for flow edge ${flowEdge.id}: ` + `unsupported edge role ${flowEdge.role}.`);
        }
    }

    /**
     * Converts one internal FlowEdge into a React Flow edge.
     * Handle selection is intentionally not performed here yet.
     * It will be added based on the edge role and the types
     * of its source and target nodes.
     *
     * @param {import("./FlowEdge").FlowEdge} flowEdge
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @returns {{
     *   id: string,
     *   source: string,
     *   target: string,
     *   type: string,
     *   label?: string,
     *   data: {
     *     flowEdgeId: number,
     *     role: string,
     *     label: string
     *   }
     * }}
     */
    adaptEdge(flowEdge, flowGraph) {
        // Validate inputs
        if (!flowEdge)
            throw new Error("Cannot adapt an undefined or null flow edge.");
        if (!flowGraph || typeof flowGraph.getNodeById !== "function")
            throw new Error("Cannot adapt a flow edge without a valid flow graph.");
        if (flowEdge.id === undefined || flowEdge.id === null)
            throw new Error("Cannot adapt a flow edge without an identifier.");
        if (flowEdge.source === undefined || flowEdge.source === null)
            throw new Error(`Cannot adapt flow edge ${flowEdge.id}: its source is missing.`);
        if (flowEdge.target === undefined || flowEdge.target === null)
            throw new Error(`Cannot adapt flow edge ${flowEdge.id}: its target is missing.`);
        // Check that the source and target nodes exist in the flow graph
        const sourceNode = flowGraph.getNodeById(flowEdge.source);
        if (!sourceNode)
            throw new Error(`Cannot adapt flow edge ${flowEdge.id}: ` + `source node ${flowEdge.source} does not exist.`);
        const targetNode = flowGraph.getNodeById(flowEdge.target);
        if (!targetNode)
            throw new Error(`Cannot adapt flow edge ${flowEdge.id}: ` + `target node ${flowEdge.target} does not exist.`);
        // Determine the React Flow handle identifiers for this edge
        const { sourceHandle, targetHandle } = this.getEdgeHandles(flowEdge, sourceNode, targetNode);
        // create the React Flow edge object
        const reactFlowEdge = {
            /*
             * React Flow expects identifiers to be strings.
             */
            id: String(flowEdge.id),
            source: String(flowEdge.source),
            target: String(flowEdge.target),
            type: this.options.edgeType,
            sourceHandle,
            targetHandle,
            data: {
                flowEdgeId: flowEdge.id,
                role: flowEdge.role,
                label: flowEdge.label
            }
        };
        /*
         * Avoid adding an empty visible label to ordinary edges.
         */
        if (typeof flowEdge.label === "string" && flowEdge.label.trim().length > 0) {
            const labelColors = { true: "#15803d", false: "#dc2626", back: "#4f46e5" };
            reactFlowEdge.label = flowEdge.label;
            reactFlowEdge.labelStyle = {
                fill: labelColors[flowEdge.role] ?? "#334155",
                fontSize: 13,
                fontWeight: 700
            };
            reactFlowEdge.labelBgStyle = {
                fill: "#ffffff",
                fillOpacity: 0.95,
                stroke: labelColors[flowEdge.role] ?? "transparent",
                strokeWidth: 1
            };
            reactFlowEdge.labelBgPadding = [7, 4];
            reactFlowEdge.labelBgBorderRadius = 6;
        }
        return reactFlowEdge;
    }
}