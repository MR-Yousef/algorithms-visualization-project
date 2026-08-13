import { FlowNodeBase } from "./FlowNodeBase";

/**
 * React Flow component for the program start node.
 * It has no incoming handle because execution begins here.
 * Execution leaves through the bottom handle.
 */
export function StartNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["source-bottom"]}
            className="flow-node--start"
        />
    );
}
/**
 * React Flow component for the program end node.
 * It has no outgoing handle because execution ends here.
 * Execution enters through the top handle.
 */
export function EndNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top"]}
            className="flow-node--end"
        />
    );
}
/**
 * React Flow component for assignment statements.
 * Execution enters from the top and continues
 * through the bottom.
 */
export function AssignmentNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top", "source-bottom"]}
            className="flow-node--assignment"
        />
    );
}
/**
 * React Flow component for input statements.
 *
 * Execution enters from the top and continues
 * through the bottom after reading the input value.
 */
export function InputNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top", "source-bottom"]}
            className="flow-node--input"
        />
    );
}
/**
 * React Flow component for output statements.
 * Execution enters from the top and continues
 * through the bottom after displaying the value.
 */
export function OutputNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top", "source-bottom"]}
            className="flow-node--output"
        />
    );
}
/**
 * React Flow component for if decision nodes.
 *
 * Execution enters from the top.
 * The true branch leaves from the right.
 * The false branch leaves from the left.
 */
export function IfNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top", "source-left", "source-right"]}
            className="flow-node--if"
        />
    );
}
/**
 * React Flow component for while decision nodes.
 *
 * Execution enters from the top.
 * The true branch leaves from the right toward the loop body.
 * The false branch leaves from the bottom toward the exit junction.
 * A returning back edge enters from the right.
 */
/**
 * React Flow component for while decision nodes.
 *
 * Execution enters from the top.
 * The true branch leaves from the bottom toward the loop body.
 * The false branch leaves from the left toward the exit junction.
 * A returning back edge enters from the right.
 */
export function WhileNode({ data, selected, isConnectable }) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={["target-top", "target-right", "source-left", "source-bottom"]}
            className="flow-node--while"
        />
    );
}
/**
 * React Flow component for junction nodes.
 *
 * Incoming execution paths merge through the top handle,
 * then execution continues through the bottom handle.
 *
 * Junction nodes are rendered without a text label.
 */
export function JunctionNode({
    data,
    selected,
    isConnectable
}) {
    return (
        <FlowNodeBase
            data={data}
            selected={selected}
            isConnectable={isConnectable}
            handles={[
                "target-top",

                // Normal flow continues down.
                "source-bottom",

                // When this junction is the end of a WHILE body,
                // the loop return can leave directly to the RIGHT.
                "source-right"
            ]}
            className="flow-node--junction"
        >
            <span
                className="flow-node__junction-dot"
                aria-hidden="true"
            />
        </FlowNodeBase>
    );
}