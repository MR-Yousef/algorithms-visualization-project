import { FlowNodeHandles } from "./FlowNodeHandles";
import "./FlowNode.css";
/**
 * Shared visual container for custom flowchart nodes.
 *
 * React Flow applies the configured width and height to the
 * outer node wrapper. This component fills that wrapper.
 *
 * @param {{
 *   data?: {
 *     label?: string
 *   },
 *   handles?: string[],
 *   selected?: boolean,
 *   isConnectable?: boolean,
 *   className?: string,
 *   children?: import("react").ReactNode
 * }} props
 */
export function FlowNodeBase({ data, handles = [], selected = false, isConnectable = false, className = "", children }) {
    // validate handles prop to ensure it is an array, as this component expects an array of handle types
    if (!Array.isArray(handles))
        throw new Error("FlowNodeBase requires handles to be an array.");
    // assign a default label if data.label is not a string
    const label = typeof data?.label === "string" ? data.label : "";
    const classNames = ["flow-node", className, selected ? "flow-node--selected" : ""].filter(Boolean).join(" ");
    // return the node structure with handles and content
    return (
        <div className={classNames} aria-label={label || undefined}>
            <FlowNodeHandles handles={handles} isConnectable={isConnectable} />
            <div className="flow-node__content"> 
                {children ?? (<span className="flow-node__label">{label}</span>)}
            </div>
        </div>
    );
}