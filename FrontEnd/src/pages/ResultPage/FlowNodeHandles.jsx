import { Handle, Position } from "@xyflow/react";
/*
 * These identifiers must remain synchronized with
 * ReactFlowAdapter.getEdgeHandles().
 */
const HANDLE_DEFINITIONS = {
    "target-top": {
        type: "target",
        position: Position.Top
    },

    "target-right": {
        type: "target",
        position: Position.Right
    },

    "target-left": {
        type: "target",
        position: Position.Left
    },

    "source-bottom": {
        type: "source",
        position: Position.Bottom
    },

    "source-left": {
        type: "source",
        position: Position.Left
    },

    "source-right": {
        type: "source",
        position: Position.Right
    }
};

/**
 * Renders the React Flow handles required by a custom node.
 * @param {{handles: string[],isConnectable?: boolean}} props
 */
export function FlowNodeHandles({ handles, isConnectable = false }) {
    // Validate the handles prop to ensure it is an array of strings.
    if (!Array.isArray(handles))
        throw new Error("FlowNodeHandles requires an array of handle identifiers.");

    // return an array of Handle components based on the provided handle identifiers.
    return handles.map(handleId => {
        const definition = HANDLE_DEFINITIONS[handleId];

        // Check if the handleId is valid and defined in HANDLE_DEFINITIONS
        if (!definition)
            throw new Error(`Unsupported flow-node handle: ${handleId}.`);

        return (
            <Handle
                key={handleId}
                id={handleId}
                type={definition.type}
                position={definition.position}
                isConnectable={isConnectable}
                className={
                    `flow-node__handle ` +
                    `flow-node__handle--${handleId}`
                }
            />
        );
    });
}