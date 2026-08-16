import {
    Background,
    BaseEdge,
    Controls,
    EdgeLabelRenderer,
    Position,
    ReactFlow
} from "@xyflow/react";

import { reactFlowNodeTypes } from "./ReactFlowNodeTypes";

import "@xyflow/react/dist/style.css";
import "./FlowchartCanvas.css";


/* =========================================================
   CUSTOM YES / NO EDGE
   Keeps the label close to IF / WHILE
========================================================= */

function BranchEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    markerEnd,
    style,
    data
}) {

    const role = data?.role;

    let edgePath = "";

    let labelX = sourceX;
    let labelY = sourceY;


    /* =====================================================
       NO

       Outer NO paths automatically go farther left.

       Nested IF:
           NO ───┐
                 │

       Outer WHILE:
       NO ─────────────┐
                       │
    ===================================================== */

    if (role === "false") {

        const verticalDistance =
            Math.abs(targetY - sourceY);


        /*
         * Long branch = farther outside.
         * This keeps nested NO edges separated.
         */
        const extraLane =
            Math.min(
                170,
                verticalDistance * 0.16
            );


        const laneX =
            Math.min(sourceX, targetX)
            - 70
            - extraLane;


        /*
         * Final horizontal part stays
         * close to the destination.
         */
        const finalY =
            targetY - 30;


        edgePath = [
            `M ${sourceX} ${sourceY}`,
            `L ${laneX} ${sourceY}`,
            `L ${laneX} ${finalY}`,
            `L ${targetX} ${finalY}`,
            `L ${targetX} ${targetY}`
        ].join(" ");


        /* NO stays close to decision */

        labelX =
            sourceX - 48;

        labelY =
            sourceY - 18;
    }


    /* =====================================================
       LOOP RETURN

       Body
        |
        └───────────────┐   RETURN
                        |
                        ↑ WHILE

       Always use the RIGHT side.

       This keeps RETURN away from NO.
    ===================================================== */

    else if (role === "back") {

        const verticalDistance =
            Math.abs(sourceY - targetY);


        const extraLane =
            Math.min(
                130,
                verticalDistance * 0.10
            );


        const laneX =
            Math.max(sourceX, targetX)
            + 90
            + extraLane;


        /*
         * Keep return horizontal line
         * above the final NO exit line.
         */
        const returnY =
            sourceY + 28;


        edgePath = [
            `M ${sourceX} ${sourceY}`,
            `L ${sourceX} ${returnY}`,
            `L ${laneX} ${returnY}`,
            `L ${laneX} ${targetY}`,
            `L ${targetX} ${targetY}`
        ].join(" ");
    }


    /* =====================================================
       IF -> YES

       RIGHT then DOWN only.

       IF ─────────────┐
                       │
                       ↓
                     target
    ===================================================== */

    else if (
        role === "true" &&
        sourcePosition === Position.Right
    ) {

        edgePath = [
            `M ${sourceX} ${sourceY}`,
            `L ${targetX} ${sourceY}`,
            `L ${targetX} ${targetY}`
        ].join(" ");


        labelX =
            sourceX + 48;

        labelY =
            sourceY - 18;
    }


    /* =====================================================
       WHILE -> YES

             WHILE
               |
           YES |
               |
               ↓
    ===================================================== */

    else if (
        role === "true" &&
        sourcePosition === Position.Bottom
    ) {

        /*
         * Usually target is directly below.
         */
        if (
            Math.abs(sourceX - targetX) <= 5
        ) {

            edgePath = [
                `M ${sourceX} ${sourceY}`,
                `L ${targetX} ${targetY}`
            ].join(" ");
        }

        else {

            const turnY =
                sourceY + 45;


            edgePath = [
                `M ${sourceX} ${sourceY}`,
                `L ${sourceX} ${turnY}`,
                `L ${targetX} ${turnY}`,
                `L ${targetX} ${targetY}`
            ].join(" ");
        }


        labelX =
            sourceX + 35;

        labelY =
            sourceY + 38;
    }


    /* =====================================================
       NORMAL / MERGE EDGE

       Keep it tidy:

       node
        |
        |
        └────────┐
                 |
                 ↓

       Maximum 3 turns.
    ===================================================== */

    else {

        /*
         * Same X = straight vertical.
         */
        if (
            Math.abs(sourceX - targetX) <= 5
        ) {

            edgePath = [
                `M ${sourceX} ${sourceY}`,
                `L ${targetX} ${targetY}`
            ].join(" ");
        }

        /*
         * Otherwise use one clean
         * horizontal middle lane.
         */
        else {

            const middleY =
                sourceY +
                (
                    targetY - sourceY
                ) / 2;


            edgePath = [
                `M ${sourceX} ${sourceY}`,
                `L ${sourceX} ${middleY}`,
                `L ${targetX} ${middleY}`,
                `L ${targetX} ${targetY}`
            ].join(" ");
        }
    }


    const label =
        role === "true"
            ? "YES"
            : role === "false"
                ? "NO"
                : "";


    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                markerEnd={markerEnd}
                style={style}
            />


            {label && (

                <EdgeLabelRenderer>

                    <div
                        className={
                            `flow-branch-label ` +
                            `flow-branch-label--${role}`
                        }
                        style={{
                            transform:
                                `translate(-50%, -50%) ` +
                                `translate(${labelX}px, ${labelY}px)`
                        }}
                    >
                        {label}
                    </div>

                </EdgeLabelRenderer>

            )}
        </>
    );
}

const reactFlowEdgeTypes = {
    branch: BranchEdge
};


/* =========================================================
   FLOWCHART
========================================================= */

export function FlowchartCanvas({
    nodes = [],
    edges = []
}) {

    if (!Array.isArray(nodes)) {

        throw new Error(
            "FlowchartCanvas requires nodes to be an array."
        );
    }


    if (!Array.isArray(edges)) {

        throw new Error(
            "FlowchartCanvas requires edges to be an array."
        );
    }


    return (

        <div className="flowchart-canvas">

            <ReactFlow
                nodes={nodes}
                edges={edges}

                nodeTypes={reactFlowNodeTypes}
                edgeTypes={reactFlowEdgeTypes}

                nodesDraggable={false}
                nodesConnectable={false}

                fitView
            >

                <Background />

                <Controls
                    showInteractive={false}
                />

            </ReactFlow>

        </div>
    );
}