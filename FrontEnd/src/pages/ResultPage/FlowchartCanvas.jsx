import { Background, Controls, ReactFlow } from "@xyflow/react";
import { reactFlowNodeTypes } from "./ReactFlowNodeTypes";
import "@xyflow/react/dist/style.css";
import "./FlowchartCanvas.css"

/**
 * Displays an already-built flowchart using React Flow.
 * The graph is generated from source code, so users may
 * navigate and select it, but may not move nodes or create
 * connections manually.
 *
 * @param {{ nodes?: Array<object>, edges?: Array<object>}} props
 */
export function FlowchartCanvas({ nodes = [], edges = [] }) {
    // validate nodes and edges props to ensure they are arrays, as React Flow expects arrays for these props
    if (!Array.isArray(nodes))
        throw new Error("FlowchartCanvas requires nodes to be an array.");
    if (!Array.isArray(edges))
        throw new Error("FlowchartCanvas requires edges to be an array.");
    return (
        <div className="flowchart-canvas">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={reactFlowNodeTypes}
                nodesDraggable={false}
                nodesConnectable={false}
                fitView>
                <Background />
                <Controls showInteractive={false} />
            </ReactFlow>
        </div>
    );
}