import { DEFAULT_NODE_SIZES } from "./LayoutEngine";

/**
 * Converts the internal flowchart representation into nodes and edges
 * accepted by React Flow.
 *
 * The adapter keeps the logical graph unchanged. It only selects handles,
 * labels and routing offsets for rendering.
 */
export class ReactFlowAdapter {
    /**
     * @param {{
     *   edgeType?: string,
     *   nodeSizes?: Record<string, {width: number, height: number}>,
     *   loopEdgeBaseOffset?: number,
     *   loopEdgeLaneGap?: number
     * }} options
     */
    constructor(options = {}) {
        const loopEdgeBaseOffset =
            options.loopEdgeBaseOffset ?? 70;

        const loopEdgeLaneGap =
            options.loopEdgeLaneGap ?? 70;

        if (
            !Number.isFinite(loopEdgeBaseOffset) ||
            loopEdgeBaseOffset < 0
        ) {
            throw new Error(
                "loopEdgeBaseOffset must be a non-negative finite number."
            );
        }

        if (
            !Number.isFinite(loopEdgeLaneGap) ||
            loopEdgeLaneGap < 0
        ) {
            throw new Error(
                "loopEdgeLaneGap must be a non-negative finite number."
            );
        }

        this.options = {
            edgeType:
                options.edgeType ??
                "smoothstep",

            nodeSizes: {
                ...DEFAULT_NODE_SIZES,
                ...(options.nodeSizes ?? {})
            },

            loopEdgeBaseOffset,
            loopEdgeLaneGap
        };
    }

    /**
     * Converts a complete FlowGraph and LayoutResult
     * into React Flow data.
     *
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @returns {{
     *   nodes: Array<object>,
     *   edges: Array<object>
     * }}
     */
    adapt(
        flowGraph,
        layoutResult
    ) {
        if (
            !flowGraph ||
            !Array.isArray(flowGraph.nodes) ||
            !Array.isArray(flowGraph.edges)
        ) {
            throw new Error(
                "Cannot adapt an invalid flow graph."
            );
        }

        if (
            !layoutResult ||
            typeof layoutResult.getPosition !== "function"
        ) {
            throw new Error(
                "Cannot adapt a flow graph without a valid layout result."
            );
        }

        /*
         * IMPORTANT:
         *
         * Calculate nesting from the logical graph,
         * not from X/Y coordinates.
         *
         * A WHILE inside an IF branch may be horizontally
         * shifted, but it is still structurally nested.
         */
        const loopLaneOffsets =
            this.buildLoopLaneOffsets(
                flowGraph
            );

        const nodes =
            flowGraph.nodes.map(
                flowNode =>
                    this.adaptNode(
                        flowNode,
                        layoutResult
                    )
            );

        const edges =
            flowGraph.edges.map(
                flowEdge =>
                    this.adaptEdge(
                        flowEdge,
                        flowGraph,
                        loopLaneOffsets
                    )
            );

        return {
            nodes,
            edges
        };
    }

    /**
     * Converts one internal FlowNode
     * into a React Flow node.
     */
    adaptNode(
        flowNode,
        layoutResult
    ) {
        if (!flowNode) {
            throw new Error(
                "Cannot adapt an undefined or null flow node."
            );
        }

        if (
            !layoutResult ||
            typeof layoutResult.getPosition !== "function"
        ) {
            throw new Error(
                "Cannot adapt a flow node without a valid layout result."
            );
        }

        const position =
            layoutResult.getPosition(
                flowNode.id
            );

        if (!position) {
            throw new Error(
                `Cannot adapt flow node ${flowNode.id}: ` +
                "no layout position was found."
            );
        }

        if (
            !Number.isFinite(position.x) ||
            !Number.isFinite(position.y)
        ) {
            throw new Error(
                `Cannot adapt flow node ${flowNode.id}: ` +
                "its layout position is invalid."
            );
        }

        const nodeSize =
            this.options.nodeSizes[
            flowNode.type
            ];

        if (
            !nodeSize ||
            !Number.isFinite(nodeSize.width) ||
            !Number.isFinite(nodeSize.height) ||
            nodeSize.width <= 0 ||
            nodeSize.height <= 0
        ) {
            throw new Error(
                `Cannot adapt flow node ${flowNode.id}: ` +
                `no valid size was configured for node type ${flowNode.type}.`
            );
        }

        return {
            id:
                String(flowNode.id),

            type:
                flowNode.type,

            position: {
                x: position.x,
                y: position.y
            },

            style: {
                width:
                    nodeSize.width,

                height:
                    nodeSize.height
            },

            data: {
                flowNodeId:
                    flowNode.id,

                flowNodeType:
                    flowNode.type,

                label:
                    flowNode.label,

                condition:
                    flowNode.condition,

                input:
                    flowNode.input,

                output:
                    flowNode.output,

                astNode:
                    flowNode.astNode
            }
        };
    }

    /**
     * Collects all nodes that structurally belong
     * to one WHILE body.
     *
     * Back edges are ignored.
     *
     * This means:
     *
     * while A {
     *     if (...) {
     *         while B {
     *             ...
     *         }
     *     }
     * }
     *
     * correctly detects B as nested inside A,
     * even if B is positioned far to the side.
     */
    collectWhileBodyNodeIds(
        flowGraph,
        whileNode
    ) {
        const trueEdges =
            flowGraph.getOutgoingEdgesByRole(
                whileNode.id,
                "true"
            );

        if (trueEdges.length !== 1) {
            return new Set();
        }

        const bodyStartId =
            trueEdges[0].target;

        /*
         * Empty while:
         *
         * while --true--> while
         */
        if (
            bodyStartId ===
            whileNode.id
        ) {
            return new Set();
        }

        const visited =
            new Set();

        const stack = [
            bodyStartId
        ];

        while (
            stack.length > 0
        ) {
            const currentId =
                stack.pop();

            if (
                currentId ===
                whileNode.id ||
                visited.has(
                    currentId
                )
            ) {
                continue;
            }

            visited.add(
                currentId
            );

            const outgoingEdges =
                flowGraph.getOutgoingEdges(
                    currentId
                );

            outgoingEdges.forEach(
                edge => {
                    /*
                     * Never follow a loop return.
                     *
                     * Otherwise an inner WHILE would
                     * climb back into its condition and
                     * nesting detection would become cyclic.
                     */
                    if (
                        edge.role ===
                        "back"
                    ) {
                        return;
                    }

                    if (
                        edge.target ===
                        whileNode.id
                    ) {
                        return;
                    }

                    if (
                        !visited.has(
                            edge.target
                        )
                    ) {
                        stack.push(
                            edge.target
                        );
                    }
                }
            );
        }

        return visited;
    }

    /**
     * Calculates a clean routing lane
     * for every WHILE.
     *
     * innermost:
     *
     *     34
     *
     * parent:
     *
     *     60
     *
     * grandparent:
     *
     *     86
     *
     * Sibling loops do not unnecessarily
     * push each other farther out.
     */
    buildLoopLaneOffsets(
        flowGraph
    ) {
        if (
            !flowGraph ||
            !Array.isArray(flowGraph.nodes)
        ) {
            throw new Error(
                "Cannot build loop routing lanes from an invalid flow graph."
            );
        }

        const whileNodes =
            flowGraph.nodes.filter(
                node =>
                    node.type ===
                    "while"
            );

        const whileById =
            new Map(
                whileNodes.map(
                    node => [
                        node.id,
                        node
                    ]
                )
            );

        /*
         * while ID ->
         * all nested WHILE IDs.
         */
        const bodyWhileIds =
            new Map();

        whileNodes.forEach(
            whileNode => {
                const bodyNodeIds =
                    this.collectWhileBodyNodeIds(
                        flowGraph,
                        whileNode
                    );

                const nestedWhileIds =
                    new Set();

                bodyNodeIds.forEach(
                    nodeId => {
                        if (
                            whileById.has(
                                nodeId
                            )
                        ) {
                            nestedWhileIds.add(
                                nodeId
                            );
                        }
                    }
                );

                bodyWhileIds.set(
                    whileNode.id,
                    nestedWhileIds
                );
            }
        );

        /*
         * Calculate maximum nested WHILE depth.
         *
         * We use maximum DEPTH,
         * not the total number of WHILEs.
         *
         * This is important:
         *
         * while A {
         *     while B {}
         *     while C {}
         * }
         *
         * A only needs one outer lane,
         * not two extra lanes.
         */
        const depthCache =
            new Map();

        const resolving =
            new Set();

        const getNestedDepth =
            whileNodeId => {
                if (
                    depthCache.has(
                        whileNodeId
                    )
                ) {
                    return depthCache.get(
                        whileNodeId
                    );
                }

                /*
                 * Defensive cycle protection.
                 */
                if (
                    resolving.has(
                        whileNodeId
                    )
                ) {
                    return 0;
                }

                resolving.add(
                    whileNodeId
                );

                let maximumDepth =
                    0;

                const nestedIds =
                    bodyWhileIds.get(
                        whileNodeId
                    ) ??
                    new Set();

                nestedIds.forEach(
                    nestedWhileId => {
                        if (
                            nestedWhileId ===
                            whileNodeId
                        ) {
                            return;
                        }

                        maximumDepth =
                            Math.max(
                                maximumDepth,

                                1 +
                                getNestedDepth(
                                    nestedWhileId
                                )
                            );
                    }
                );

                resolving.delete(
                    whileNodeId
                );

                depthCache.set(
                    whileNodeId,
                    maximumDepth
                );

                return maximumDepth;
            };

        const laneOffsets =
            new Map();

        whileNodes.forEach(
            whileNode => {
                const nestedDepth =
                    getNestedDepth(
                        whileNode.id
                    );

                const offset =
                    this.options
                        .loopEdgeBaseOffset +
                    nestedDepth *
                    this.options
                        .loopEdgeLaneGap;

                laneOffsets.set(
                    whileNode.id,
                    offset
                );
            }
        );

        return laneOffsets;
    }

    /**
     * Routing options for WHILE edges.
     *
     * LEFT:
     * NO
     *
     * RIGHT:
     * RETURN
     *
     * CENTER:
     * YES
     */
    getLoopEdgePathOptions(
        flowEdge,
        sourceNode,
        targetNode,
        loopLaneOffsets
    ) {
        if (
            this.options.edgeType !==
            "smoothstep"
        ) {
            return null;
        }

        /*
         * WHILE YES.
         *
         * Body is directly below WHILE,
         * therefore keep it straight.
         */
        if (
            flowEdge.role === "true" &&
            sourceNode.type === "while" &&
            sourceNode.id !==
            targetNode.id
        ) {
            return {
                offset: 0,
                borderRadius: 0
            };
        }

        /*
         * WHILE NO.
         *
         * Always use the LEFT lane.
         */
        if (
            flowEdge.role === "false" &&
            sourceNode.type === "while"
        ) {
            return {
                offset:
                    loopLaneOffsets.get(
                        sourceNode.id
                    ) ??
                    this.options
                        .loopEdgeBaseOffset,

                borderRadius:
                    6
            };
        }

        /*
         * WHILE RETURN.
         *
         * Use a slightly wider RIGHT lane
         * than the corresponding NO lane.
         */
        if (
            flowEdge.role === "back" &&
            targetNode.type === "while"
        ) {
            return {
                offset:
                    (
                        loopLaneOffsets.get(
                            targetNode.id
                        ) ??
                        this.options
                            .loopEdgeBaseOffset
                    ) +
                    12,

                borderRadius:
                    6
            };
        }

        /*
         * Empty WHILE.
         */
        if (
            flowEdge.role === "true" &&
            sourceNode.type === "while" &&
            sourceNode.id ===
            targetNode.id
        ) {
            return {
                offset:
                    (
                        loopLaneOffsets.get(
                            sourceNode.id
                        ) ??
                        this.options
                            .loopEdgeBaseOffset
                    ) +
                    12,

                borderRadius:
                    6
            };
        }

        return null;
    }

    /**
     * Determines the React Flow handles.
     *
     * WHILE:
     *
     * YES:
     *     bottom
     *
     * NO:
     *     left
     *
     * RETURN:
     *     right
     */
    getEdgeHandles(
        flowEdge,
        sourceNode,
        targetNode
    ) {
        if (!flowEdge) {
            throw new Error(
                "Cannot determine handles for an undefined or null flow edge."
            );
        }

        if (!sourceNode) {
            throw new Error(
                `Cannot determine handles for flow edge ${flowEdge.id}: ` +
                "its source node is missing."
            );
        }

        if (!targetNode) {
            throw new Error(
                `Cannot determine handles for flow edge ${flowEdge.id}: ` +
                "its target node is missing."
            );
        }

        switch (
        flowEdge.role
        ) {
            /*
             * Normal sequential flow.
             */
            case "next":
                return {
                    sourceHandle:
                        "source-bottom",

                    targetHandle:
                        "target-top"
                };

            /*
             * YES / TRUE.
             */
            case "true":
                if (
                    sourceNode.type ===
                    "if"
                ) {
                    return {
                        sourceHandle:
                            "source-right",

                        targetHandle:
                            "target-top"
                    };
                }

                if (
                    sourceNode.type ===
                    "while"
                ) {
                    return {
                        /*
                         * WHILE YES goes DOWN.
                         */
                        sourceHandle:
                            "source-bottom",

                        /*
                         * Empty WHILE returns
                         * to its right side.
                         */
                        targetHandle:
                            sourceNode.id ===
                                targetNode.id
                                ? "target-right"
                                : "target-top"
                    };
                }

                throw new Error(
                    `True edge ${flowEdge.id} must originate ` +
                    "from an if or while node."
                );

            /*
             * NO / FALSE.
             */
            case "false":
                if (
                    sourceNode.type ===
                    "if"
                ) {
                    return {
                        sourceHandle:
                            "source-left",

                        targetHandle:
                            "target-top"
                    };
                }

                if (
                    sourceNode.type ===
                    "while"
                ) {
                    return {
                        /*
                         * WHILE NO goes LEFT.
                         */
                        sourceHandle:
                            "source-left",

                        targetHandle:
                            "target-top"
                    };
                }

                throw new Error(
                    `False edge ${flowEdge.id} must originate ` +
                    "from an if or while node."
                );

            /*
             * WHILE loop return.
             */
            case "back":
                if (
                    targetNode.type !==
                    "while"
                ) {
                    throw new Error(
                        `Back edge ${flowEdge.id} must target a while node.`
                    );
                }

                return {
                    /*
                     * This is the important part.
                     *
                     * When a WHILE body ends with an IF
                     * or another WHILE, its exit node is
                     * a junction.
                     *
                     * Make that junction go DIRECTLY RIGHT,
                     * instead of going down first.
                     *
                     * Simple outputs/assignments can continue
                     * using their bottom handle.
                     */
                    sourceHandle:
                        sourceNode.type ===
                            "junction"
                            ? "source-right"
                            : "source-bottom",

                    /*
                     * Return always enters
                     * the WHILE from RIGHT.
                     */
                    targetHandle:
                        "target-right"
                };

            default:
                throw new Error(
                    `Cannot determine handles for flow edge ${flowEdge.id}: ` +
                    `unsupported edge role ${flowEdge.role}.`
                );
        }
    }

    /**
     * Converts one FlowEdge into
     * a React Flow edge.
     */
    adaptEdge(
        flowEdge,
        flowGraph,
        loopLaneOffsets =
            new Map()
    ) {
        if (!flowEdge) {
            throw new Error(
                "Cannot adapt an undefined or null flow edge."
            );
        }

        if (
            !flowGraph ||
            typeof flowGraph.getNodeById !==
            "function"
        ) {
            throw new Error(
                "Cannot adapt a flow edge without a valid flow graph."
            );
        }

        if (
            flowEdge.id === undefined ||
            flowEdge.id === null
        ) {
            throw new Error(
                "Cannot adapt a flow edge without an identifier."
            );
        }

        if (
            flowEdge.source ===
            undefined ||
            flowEdge.source ===
            null
        ) {
            throw new Error(
                `Cannot adapt flow edge ${flowEdge.id}: ` +
                "its source is missing."
            );
        }

        if (
            flowEdge.target ===
            undefined ||
            flowEdge.target ===
            null
        ) {
            throw new Error(
                `Cannot adapt flow edge ${flowEdge.id}: ` +
                "its target is missing."
            );
        }

        const sourceNode =
            flowGraph.getNodeById(
                flowEdge.source
            );

        const targetNode =
            flowGraph.getNodeById(
                flowEdge.target
            );

        if (!sourceNode) {
            throw new Error(
                `Cannot adapt flow edge ${flowEdge.id}: ` +
                `source node ${flowEdge.source} does not exist.`
            );
        }

        if (!targetNode) {
            throw new Error(
                `Cannot adapt flow edge ${flowEdge.id}: ` +
                `target node ${flowEdge.target} does not exist.`
            );
        }

        const {
            sourceHandle,
            targetHandle
        } =
            this.getEdgeHandles(
                flowEdge,
                sourceNode,
                targetNode
            );

        const reactFlowEdge = {
            id:
                String(flowEdge.id),

            source:
                String(
                    flowEdge.source
                ),

            target:
                String(
                    flowEdge.target
                ),

            type:
                this.options.edgeType,

            sourceHandle,
            targetHandle,

            data: {
                flowEdgeId:
                    flowEdge.id,

                role:
                    flowEdge.role,

                label:
                    flowEdge.label
            }
        };

        const loopPathOptions =
            this.getLoopEdgePathOptions(
                flowEdge,

                sourceNode,

                targetNode,

                loopLaneOffsets
            );

        if (
            loopPathOptions
        ) {
            reactFlowEdge.pathOptions =
                loopPathOptions;
        }

        /*
         * Labels.
         */
        if (
            typeof flowEdge.label ===
            "string" &&
            flowEdge.label
                .trim()
                .length > 0
        ) {
            const labelColors = {
                true:
                    "#15803d",

                false:
                    "#dc2626",

                back:
                    "#4f46e5"
            };

            reactFlowEdge.label =
                flowEdge.label;

            reactFlowEdge.labelStyle = {
                fill:
                    labelColors[
                    flowEdge.role
                    ] ??
                    "#334155",

                fontSize:
                    25,

                fontWeight:
                    700
            };

            reactFlowEdge.labelBgStyle = {
                fill:
                    "#ffffff",

                fillOpacity:
                    0.95,

                stroke:
                    labelColors[
                    flowEdge.role
                    ] ??
                    "transparent",

                strokeWidth:
                    1
            };

            reactFlowEdge.labelBgPadding =
                [
                    7,
                    4
                ];

            reactFlowEdge.labelBgBorderRadius =
                6;
        }

        return reactFlowEdge;
    }
}