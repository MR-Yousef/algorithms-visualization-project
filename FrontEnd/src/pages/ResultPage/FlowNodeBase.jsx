import { FlowNodeHandles } from "./FlowNodeHandles";
import "./FlowNode.css";

/**
 * Shared visual container for custom flowchart nodes.
 */
export function FlowNodeBase({
    data,
    handles = [],
    selected = false,
    isConnectable = false,
    className = "",
    children
}) {
    if (!Array.isArray(handles)) {
        throw new Error(
            "FlowNodeBase requires handles to be an array."
        );
    }

    const label =
        typeof data?.label === "string"
            ? data.label
            : "";
    const assignment =
        typeof data?.assignment === "string"
            ? data.assignment.trim()
            : "";

    const condition =
        typeof data?.condition === "string"
            ? data.condition.trim()
            : "";

    const input =
        typeof data?.input === "string"
            ? data.input.trim()
            : "";

    const output =
        typeof data?.output === "string"
            ? data.output.trim()
            : "";

    /*
     * Decide what the hover popup should show.
     *
     * IF / WHILE -> condition
     * INPUT      -> input values
     * OUTPUT     -> output values
     */
    let tooltipTitle = "";
    let tooltipValue = "";

    if (assignment) {

        tooltipTitle = "Assignment";

        tooltipValue = assignment;

    }
    else if (condition) {

        tooltipTitle = "Condition";

        tooltipValue = condition;

    }
    else if (input) {

        tooltipTitle = "Input";

        tooltipValue = input;

    }
    else if (output) {

        tooltipTitle = "Output";

        tooltipValue = output;
    }

    const hasTooltip =
        Boolean(tooltipValue);

    const tooltipId =
        hasTooltip &&
            data?.flowNodeId !== undefined
            ? `flow-node-tooltip-${data.flowNodeId}`
            : undefined;

    const classNames = [
        "flow-node",
        className,
        selected
            ? "flow-node--selected"
            : ""
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div
            className={classNames}
            aria-label={label || undefined}
            aria-describedby={tooltipId}
            tabIndex={hasTooltip ? 0 : undefined}
        >
            <FlowNodeHandles
                handles={handles}
                isConnectable={isConnectable}
            />

            <div className="flow-node__content">
                {children ?? (
                    <span className="flow-node__label">
                        {label}
                    </span>
                )}
            </div>

            {hasTooltip && (
                <div
                    id={tooltipId}
                    className="flow-node__tooltip"
                    role="tooltip"
                >
                    <span className="flow-node__tooltip-title">
                        {tooltipTitle}
                    </span>

                    <code className="flow-node__tooltip-value">
                        {tooltipValue}
                    </code>
                </div>
            )}
        </div>
    );
}