import { LayoutResult } from "./LayoutResult";
// deflault node sizes
export const DEFAULT_NODE_SIZES = {
    start: { width: 160, height: 60 },
    end: { width: 160, height: 60 },
    assignment: { width: 180, height: 70 },
    input: { width: 180, height: 70 },
    output: { width: 180, height: 70 },
    if: { width: 180, height: 100 },
    while: { width: 180, height: 100 },
    junction: { width: 20, height: 20 }
};
// default layout options
const DEFAULT_LAYOUT_OPTIONS = {

    nodeSizes:
        DEFAULT_NODE_SIZES,


    // Distance between normal nodes.
    sequenceGap:
        105,


    // More horizontal space between IF branches.
    // Important when IF contains WHILE
    // or WHILE contains IF.
    branchGap:
        220,


    // Distance between decision and branch/body.
    decisionBranchGap:
        110,


    // Space before branches reconnect.
    branchJunctionGap:
        220,


    // Outer diagram padding.
    padding:
        70
};
export class LayoutEngine {
    /**
     * @param {object} options
     * @param {object} options.nodeSizes
     * @param {number} options.sequenceGap
     * @param {number} options.branchGap
     * @param {number} options.decisionBranchGap
     * @param {number} options.branchJunctionGap
     * @param {number} options.loopBodyGap
     * @param {number} options.padding
     */
    constructor(options = {}) {
        this.options = this.createOptions(options);
    }

    /**
     * Executes the complete layout process.
     * The process consists of:
     * 1. Measuring every layout-tree block.
     * 2. Placing every visible FlowGraph node.
     * 3. Calculating the final diagram bounds.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} rootLayoutTree
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @returns {import("./LayoutResult").LayoutResult}
     */
    layout(rootLayoutTree, flowGraph) {
        // validate that the root layout tree and flow graph are defined
        if (!rootLayoutTree)
            throw new Error("Cannot layout an undefined or null layout tree.");
        if (!flowGraph)
            throw new Error("Cannot layout a tree without a flow graph.");
        /*
         * First pass:
         * calculate width, height, and axisX
         * for every layout-tree block.
         */
        this.measure(rootLayoutTree, flowGraph);
        /*
         * Second pass:
         * calculate node positions and diagram bounds.
         */
        return this.place(rootLayoutTree, flowGraph);
    }

    /**
     * Combines custom layout options with the default values.
     * Partial node-size overrides are supported.
     * @param {object} options
     * @returns {object}
     */
    createOptions(options) {
        // validate that options is an object
        if (options === null || typeof options !== "object" || Array.isArray(options))
            throw new Error("Layout options must be an object.");
        // setting default node sizes and merging with custom node sizes
        const customNodeSizes = options.nodeSizes ?? {};
        // validate that customNodeSizes is an object
        if (customNodeSizes === null || typeof customNodeSizes !== "object" || Array.isArray(customNodeSizes))
            throw new Error("Layout nodeSizes must be an object.");
        const nodeSizes = {};
        Object.entries(DEFAULT_NODE_SIZES).forEach(([nodeType, defaultSize]) => {
            const customSize = customNodeSizes[nodeType] ?? {};
            if (customSize === null || typeof customSize !== "object" || Array.isArray(customSize))
                throw new Error(`The size configuration for node type ${nodeType} must be an object.`);
            // merge default size with custom size, allowing partial overrides
            nodeSizes[nodeType] = {
                width: customSize.width ?? defaultSize.width,
                height: customSize.height ?? defaultSize.height
            };
        }
        );
        // merge the rest of the options with the defaults
        const mergedOptions = { ...DEFAULT_LAYOUT_OPTIONS, ...options, nodeSizes };
        this.validateOptions(mergedOptions);
        return mergedOptions;
    }

    /**
     * Validates all layout configuration values.
     * @param {object} options
     */
    validateOptions(options) {
        // validate that node sizes are finite positive numbers
        Object.entries(options.nodeSizes).forEach(
            ([nodeType, size]) => {
                // validate that size is an object with finite positive width and height
                if (!Number.isFinite(size.width) || size.width <= 0)
                    throw new Error(`The width of node type ${nodeType} must be a positive finite number.`);
                if (!Number.isFinite(size.height) || size.height <= 0)
                    throw new Error(`The height of node type ${nodeType} must be a positive finite number.`);
            });
        // validate that spacing options are finite non-negative numbers
        const spacingOptionNames = [
            "sequenceGap",
            "branchGap",
            "decisionBranchGap",
            "branchJunctionGap",
            "padding"
        ];
        spacingOptionNames.forEach(optionName => {
            const value = options[optionName];
            if (!Number.isFinite(value) || value < 0)
                throw new Error(`Layout option ${optionName} must be a non-negative finite number.`);
        });
    }

    /**
     * Returns a copy of the configured size for a FlowNode type.
     * @param {string} nodeType
     * @returns {{width: number, height: number}}
     */
    getNodeSize(nodeType) {
        const size = this.options.nodeSizes[nodeType];
        // validate that the node type is recognized and has a configured size
        if (!size)
            throw new Error(`No layout size is configured for node type ${nodeType}.`);
        return { width: size.width, height: size.height };
    }

    /**
     * Places all visible FlowGraph nodes using the geometry
     * calculated during the measurement pass.
     * This is the public entry point for the placement pass.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} rootLayoutTree
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @returns {LayoutResult}
     */
    place(rootLayoutTree, flowGraph) {
        // validate that the root layout tree and flow graph are defined
        if (!rootLayoutTree)
            throw new Error("Cannot place an undefined or null layout tree.");
        if (!flowGraph)
            throw new Error("Cannot place a layout tree without a flow graph.");
        // validate that the flow graph is valid before placing
        const graphValidation = flowGraph.validate();
        if (!graphValidation.isValid)
            throw new Error(["Cannot place a layout tree using an invalid flow graph:", ...graphValidation.errors.map(error => `- ${error}`)].join("\n"));
        /*
         * Placement depends on width, height, and axisX values
         * produced by the measurement pass.
         */
        const measurementValidation = this.validateMeasuredTree(rootLayoutTree);
        if (!measurementValidation.isValid)
            throw new Error(["Cannot place an unmeasured or invalid layout tree:", ...measurementValidation.errors.map(error => `- ${error}`)].join("\n"));
        // initialize a new LayoutResult to store the calculated positions and bounds
        const layoutResult = new LayoutResult();
        /*
         * Start the complete diagram after the configured padding.
         */
        this.placeTreeNode(rootLayoutTree, flowGraph, layoutResult, this.options.padding, this.options.padding);
        /*
         * Every FlowGraph node must receive exactly one position.
         */
        if (layoutResult.getPositionCount() !== flowGraph.nodes.length)
            throw new Error(`The placement pass positioned ` + `${layoutResult.getPositionCount()} of ` + `${flowGraph.nodes.length} flow nodes.`);
        /*
         * Calculate and store the final bounds after
         * all FlowGraph nodes have received positions.
         */
        this.calculateBounds(flowGraph, layoutResult);
        return layoutResult;
    }

    /**
     * Calculates the outer bounds occupied by all positioned
     * FlowGraph nodes.
     * Node dimensions are included in the calculation, then the
     * configured padding is added around the complete diagram.
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @returns {{
     *   minX: number,
     *   minY: number,
     *   maxX: number,
     *   maxY: number,
     *   width: number,
     *   height: number
     * }}
     */
    calculateBounds(flowGraph, layoutResult) {
        // validate that the flow graph and layout result are defined
        if (!flowGraph)
            throw new Error("Cannot calculate layout bounds without a flow graph.");
        if (!layoutResult || typeof layoutResult.getPosition !== "function" || typeof layoutResult.setBounds !== "function")
            throw new Error("Cannot calculate layout bounds without a valid layout result.");
        // if the flow graph has no nodes, return a zero-sized bounds object
        if (!Array.isArray(flowGraph.nodes) || flowGraph.nodes.length === 0) {
            layoutResult.setBounds({ minX: 0, minY: 0, maxX: 0, maxY: 0 });
            return layoutResult.getBounds();
        }
        // initialize variables to track the minimum and maximum coordinates of all positioned nodes
        let minimumX = Infinity;
        let minimumY = Infinity;
        let maximumX = -Infinity;
        let maximumY = -Infinity;
        flowGraph.nodes.forEach(flowNode => {
            const position = layoutResult.getPosition(flowNode.id);
            // validate that the position exists and has finite coordinates
            if (!position)
                throw new Error(`Cannot calculate layout bounds: flow node ${flowNode.id} has no position.`);
            if (!Number.isFinite(position.x) || !Number.isFinite(position.y))
                throw new Error(`Cannot calculate layout bounds: flow node ${flowNode.id} has invalid coordinates.`);
            // get the configured size for the flow node type
            const nodeSize = this.getNodeSize(flowNode.type);
            // calculate the minimum and maximum coordinates of the node's bounding box
            const nodeMinimumX = position.x;
            const nodeMinimumY = position.y;
            const nodeMaximumX = position.x + nodeSize.width;
            const nodeMaximumY = position.y + nodeSize.height;
            minimumX = Math.min(minimumX, nodeMinimumX);
            minimumY = Math.min(minimumY, nodeMinimumY);
            maximumX = Math.max(maximumX, nodeMaximumX);
            maximumY = Math.max(maximumY, nodeMaximumY);
        });
        // set the calculated bounds in the layout result, including the configured padding
        layoutResult.setBounds({
            minX: minimumX - this.options.padding,
            minY: minimumY - this.options.padding,
            maxX: maximumX + this.options.padding,
            maxY: maximumY + this.options.padding
        });
        // return the calculated bounds from the layout result
        return layoutResult.getBounds();
    }

    /**
     * Measures the complete layout tree from the leaves up to the root.
     * This is the public entry point for the measurement pass.
     * It calculates width, height, and axisX for every layout block.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} rootLayoutTree
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @returns {import("./LayoutTreeNode").LayoutTreeNode}
     */
    measure(rootLayoutTree, flowGraph) {
        // validate that the root layout tree and flow graph are defined
        if (!rootLayoutTree)
            throw new Error("Cannot measure an undefined or null layout tree.");
        // validate that the root layout tree is a LayoutTreeNode
        if (!flowGraph)
            throw new Error("Cannot measure a layout tree without a flow graph.");
        // validate that the flow graph is valid before measuring
        const validationResult = flowGraph.validate();
        // throwing an error if the flow graph is invalid, including all validation errors in the message
        if (!validationResult.isValid)
            throw new Error(["Cannot measure a layout tree using an invalid flow graph:", ...validationResult.errors.map(error => `- ${error}`)].join("\n"));
        // start the measurement pass from the root layout tree node
        this.measureTreeNode(rootLayoutTree, flowGraph);
        // measurement pass completed, now validate the measured tree for correctness
        const measurementValidation = this.validateMeasuredTree(rootLayoutTree);
        if (!measurementValidation.isValid)
            throw new Error(["The layout measurement pass produced an invalid measured tree:", ...measurementValidation.errors.map(error => `- ${error}`)].join("\n"));
        // validate that the root layout tree has valid geometry after measuring
        if (!Number.isFinite(rootLayoutTree.width) || !Number.isFinite(rootLayoutTree.height) || !Number.isFinite(rootLayoutTree.axisX))
            throw new Error("The layout measurement pass produced invalid root geometry.");
        return rootLayoutTree;
    }

    /**
     * Calculates the geometry of a leaf layout block.
     * A leaf layout block represents one visible FlowNode,
     * such as start, end, assignment, input, or output.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     */
    measureLeafNode(layoutTreeNode, flowGraph) {
        // validate that the layoutTreeNode is defined and is a leaf node
        if (!layoutTreeNode)
            throw new Error("Cannot measure an undefined or null layout tree node.");
        if (!layoutTreeNode.isNode())
            throw new Error(`Cannot measure layout tree node of type ${layoutTreeNode.type} ` + "as a leaf node.");
        // validate that the flowGraph is defined and contains the referenced flow node
        if (!flowGraph)
            throw new Error("Cannot measure a leaf layout node without a flow graph.");
        const flowNode = flowGraph.getNodeById(layoutTreeNode.flowNodeId);
        if (!flowNode)
            throw new Error(`Cannot measure leaf layout node: flow node ` + `${layoutTreeNode.flowNodeId} does not exist.`);
        // get the configured size for the flow node type and store it in the layout tree node
        const nodeSize = this.getNodeSize(flowNode.type);
        layoutTreeNode.setGeometry(nodeSize.width, nodeSize.height, nodeSize.width / 2);
    }

    /**
     * Measures a layout tree block according to its structural type.
     * This method acts as the central dispatcher for the measurement pass.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     */
    measureTreeNode(layoutTreeNode, flowGraph) {
        // validate that the layoutTreeNode and flowGraph are defined
        if (!layoutTreeNode)
            throw new Error("Cannot measure an undefined or null layout tree block.");
        // validate that the flowGraph is defined
        if (!flowGraph)
            throw new Error("Cannot measure a layout tree block without a flow graph.");
        // switch on the layout tree node type and call the appropriate measurement method
        switch (layoutTreeNode.type) {
            case "node":
                this.measureLeafNode(layoutTreeNode, flowGraph);
                break;
            case "sequence":
                this.measureSequence(layoutTreeNode, flowGraph);
                break;
            case "if":
                this.measureIfNode(layoutTreeNode, flowGraph);
                break;
            case "while":
                this.measureWhileNode(layoutTreeNode, flowGraph);
                break;
            default:
                throw new Error(`Cannot measure unsupported layout tree type: ${layoutTreeNode.type}.`);
        }
    }

    /**
     * Calculates the geometry of a sequence layout block.
     * All children are aligned around one shared execution axis
     * and arranged vertically from top to bottom.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} sequenceNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     */
    measureSequence(sequenceNode, flowGraph) {
        // validate that the sequenceNode is defined and is a sequence node
        if (!sequenceNode)
            throw new Error("Cannot measure an undefined or null sequence block.");
        if (!sequenceNode.isSequence())
            throw new Error(`Cannot measure layout tree node of type ${sequenceNode.type} ` + "as a sequence.");
        // validate that the flowGraph is defined
        if (!flowGraph)
            throw new Error("Cannot measure a sequence block without a flow graph.");
        // validate that the sequenceNode has a children array
        if (!Array.isArray(sequenceNode.children))
            throw new Error("Cannot measure a sequence block whose children are not an array.");
        /*
        An empty sequence occupies no space.
        This may represent:
        - an empty if branch
        - an empty while body
         */
        if (sequenceNode.children.length === 0) {
            sequenceNode.setGeometry(0, 0, 0);
            return;
        }
        // initialize variables to track the maximum left and right extents and total height of the sequence
        let maximumLeftExtent = 0;
        let maximumRightExtent = 0;
        let totalHeight = 0;
        // measure each child and update the maximum extents and total height
        sequenceNode.children.forEach((child, index) => {
            /*
             * Measure the child first because the sequence dimensions
             * depend on the dimensions of all its children.
             */
            this.measureTreeNode(child, flowGraph);
            const leftExtent = child.axisX;
            const rightExtent = child.width - child.axisX;
            maximumLeftExtent = Math.max(maximumLeftExtent, leftExtent);
            maximumRightExtent = Math.max(maximumRightExtent, rightExtent);
            totalHeight += child.height;
            /*
             * Add a vertical gap between children,
             * but not after the final child.
             */
            if (index < sequenceNode.children.length - 1)
                totalHeight += this.options.sequenceGap;
        });
        // setting the sequence node's geometry based on the calculated maximum extents and total height
        const sequenceWidth = maximumLeftExtent + maximumRightExtent;
        const sequenceAxisX = maximumLeftExtent;
        sequenceNode.setGeometry(sequenceWidth, totalHeight, sequenceAxisX);
    }

    /**
     * Measures a complete if layout block.
     * The block contains:
     * - the if decision node
     * - the false branch on the left
     * - the true branch on the right
     * - the junction below both branches
     * This method calculates only:
     * - width
     * - height
     * - axisX
     * It does not calculate final node positions.
     *
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     */
    measureIfNode(layoutTreeNode, flowGraph) {
        // validate that the flowGraph is defined
        if (!flowGraph)
            throw new Error("Cannot measure an if without a flow graph")
        // validate that the layoutTreeNode is defined and is an if node
        if (!layoutTreeNode)
            throw new Error("Cannot measure an undefined or null if layout node.");
        // validate that the layoutTreeNode is an if node
        if (!layoutTreeNode.isIf())
            throw new Error(`Cannot measure an if block from layout tree type ${layoutTreeNode.type}.`);
        // validate that both true and false branches are defined
        if (!layoutTreeNode.trueBranch || !layoutTreeNode.falseBranch)
            throw new Error("Cannot measure an if block without both true and false branch objects.");
        // validate that the flowNodeId and junctionNodeId are valid integers
        if (!Number.isInteger(layoutTreeNode.flowNodeId))
            throw new Error("Cannot measure an if block with an invalid flow node ID.");
        // validate that the junctionNodeId is a valid integer
        if (!Number.isInteger(layoutTreeNode.junctionNodeId))
            throw new Error("Cannot measure an if block with an invalid junction node ID.");
        /*
        Measure both branches first.
        Their width, height, and axisX values are required
        to calculate the geometry of the complete if block.
         */
        this.measureTreeNode(layoutTreeNode.falseBranch, flowGraph);
        this.measureTreeNode(layoutTreeNode.trueBranch, flowGraph);
        // define local variables for easier access to the branches and their sizes
        const falseBranch = layoutTreeNode.falseBranch;
        const trueBranch = layoutTreeNode.trueBranch;
        const decisionSize = this.getNodeSize("if");
        const junctionSize = this.getNodeSize("junction");
        /*
        Calculate how far every branch extends
        to the left and right of its own execution axis.
         */
        // false branch extents
        const falseLeftExtent = falseBranch.axisX;
        const falseRightExtent = falseBranch.width - falseBranch.axisX;
        // true branch extents
        const trueLeftExtent = trueBranch.axisX;
        const trueRightExtent = trueBranch.width - trueBranch.axisX;
        /*
        Distance between the execution axes of both branches.
        This guarantees that the right edge of the false branch
        and the left edge of the true branch are separated by
        exactly branchGap.
         */
        const branchAxisDistance = falseRightExtent + this.options.branchGap + trueLeftExtent;
        const halfBranchAxisDistance = branchAxisDistance / 2;
        /*
        Calculate how much space the complete if block requires
        on each side of its main execution axis.
         */
        const leftExtent = Math.max(decisionSize.width / 2, junctionSize.width / 2, halfBranchAxisDistance + falseLeftExtent);
        const rightExtent = Math.max(decisionSize.width / 2, junctionSize.width / 2, halfBranchAxisDistance + trueRightExtent);
        const branchesHeight = Math.max(falseBranch.height, trueBranch.height);
        const width = leftExtent + rightExtent;
        const height = decisionSize.height + this.options.decisionBranchGap + branchesHeight + this.options.branchJunctionGap + junctionSize.height;
        /*
        The main execution axis is measured from
        the left edge of the complete if block.
         */
        const axisX = leftExtent;
        layoutTreeNode.setGeometry(width, height, axisX);
    }

    /**
     * Measures a complete while layout block.
     * The block contains:
     * - the while decision node on the main execution axis
     * - the loop body on the right
     * - the exit junction below the decision
     * This method calculates only:
     * - width
     * - height
     * - axisX
     * It does not calculate final node positions.
     *
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     */
    measureWhileNode(layoutTreeNode, flowGraph) {
        if (!layoutTreeNode)
            throw new Error("Cannot measure an undefined or null while layout node.");

        if (!layoutTreeNode.isWhile())
            throw new Error(`Cannot measure a while block from layout tree type ${layoutTreeNode.type}.`);

        if (!flowGraph)
            throw new Error("Cannot measure a while block without a flow graph.");

        if (!layoutTreeNode.body)
            throw new Error("Cannot measure a while block without a body layout block.");

        if (!layoutTreeNode.body.isSequence())
            throw new Error("The body of a while layout block must be a sequence.");

        if (!Number.isInteger(layoutTreeNode.flowNodeId))
            throw new Error("Cannot measure a while block with an invalid flow node ID.");

        if (!Number.isInteger(layoutTreeNode.junctionNodeId))
            throw new Error("Cannot measure a while block with an invalid junction node ID.");

        const whileFlowNode = flowGraph.getNodeById(layoutTreeNode.flowNodeId);
        if (!whileFlowNode || whileFlowNode.type !== "while")
            throw new Error(`Flow node ${layoutTreeNode.flowNodeId} is not a valid while node.`);

        const junctionFlowNode = flowGraph.getNodeById(layoutTreeNode.junctionNodeId);
        if (!junctionFlowNode || junctionFlowNode.type !== "junction")
            throw new Error(`Flow node ${layoutTreeNode.junctionNodeId} is not a valid junction node.`);

        /*
         * Measure the loop body first because the final size of the while block
         * depends on the body's geometry.
         */
        this.measureTreeNode(layoutTreeNode.body, flowGraph);

        const body = layoutTreeNode.body;
        const decisionSize = this.getNodeSize("while");
        const junctionSize = this.getNodeSize("junction");

        /*
         * Keep the loop body centered under the while node.
         * This gives the YES edge a direct straight-down line.
         */
        const bodyLeftExtent = body.width > 0 ? body.axisX : 0;
        const bodyRightExtent = body.width > 0 ? body.width - body.axisX : 0;

        /*
         * Add a little extra side breathing room so the outer loop lines
         * do not sit too close to the body.
         */
        const sidePadding = 90;

        const leftExtent = Math.max(
            decisionSize.width / 2,
            junctionSize.width / 2,
            bodyLeftExtent
        ) + sidePadding;

        const rightExtent = Math.max(
            decisionSize.width / 2,
            junctionSize.width / 2,
            bodyRightExtent
        ) + sidePadding;

        const width = leftExtent + rightExtent;

        const height =
            decisionSize.height +
            this.options.decisionBranchGap +
            body.height +
            this.options.branchJunctionGap +
            junctionSize.height;

        const axisX = leftExtent;

        layoutTreeNode.setGeometry(width, height, axisX);
    }

    /**
     * Validates the geometry calculated for every block
     * inside a measured layout tree.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {string} path
     * @returns {{isValid: boolean, errors: string[]}}
     */
    validateMeasuredTree(layoutTreeNode, path = "root") {
        const errors = [];
        // validate that the layoutTreeNode is defined
        if (!layoutTreeNode)
            return { isValid: false, errors: [`Layout tree block at ${path} is undefined or null.`] };
        // validate that the layoutTreeNode has finite width, height, and axisX
        if (!Number.isFinite(layoutTreeNode.width) || layoutTreeNode.width < 0)
            errors.push(`Layout block at ${path} has an invalid width: ${layoutTreeNode.width}.`);
        if (!Number.isFinite(layoutTreeNode.height) || layoutTreeNode.height < 0)
            errors.push(`Layout block at ${path} has an invalid height: ${layoutTreeNode.height}.`);
        if (!Number.isFinite(layoutTreeNode.axisX) || layoutTreeNode.axisX < 0 || layoutTreeNode.axisX > layoutTreeNode.width)
            errors.push(`Layout block at ${path} has an invalid axisX: ${layoutTreeNode.axisX}.`);
        // validate the geometry of child blocks based on the type of the current layout block
        switch (layoutTreeNode.type) {
            // validate that leaf nodes have positive width and height
            case "node":
                if (layoutTreeNode.width <= 0 || layoutTreeNode.height <= 0)
                    errors.push(`Leaf layout block at ${path} must have positive width and height.`);
                break;
            // validate that sequence nodes have a valid children array and recursively validate each child
            case "sequence":
                if (!Array.isArray(layoutTreeNode.children)) {
                    errors.push(`Sequence block at ${path} does not contain a valid children array.`);
                    break;
                }
                layoutTreeNode.children.forEach((child, index) => {
                    const childValidation = this.validateMeasuredTree(child, `${path}.children[${index}]`);
                    errors.push(...childValidation.errors);
                });
                break;
            // validate that if nodes have both true and false branches and recursively validate each branch
            case "if": {
                // true branch validation
                if (!layoutTreeNode.trueBranch)
                    errors.push(`If block at ${path} is missing its true branch.`);
                else {
                    const trueValidation = this.validateMeasuredTree(layoutTreeNode.trueBranch, `${path}.trueBranch`);
                    errors.push(...trueValidation.errors);
                }
                // false branch validation
                if (!layoutTreeNode.falseBranch)
                    errors.push(`If block at ${path} is missing its false branch.`);
                else {
                    const falseValidation = this.validateMeasuredTree(layoutTreeNode.falseBranch, `${path}.falseBranch`);
                    errors.push(...falseValidation.errors);
                }
                break;
            }
            // validate that while nodes have a body and recursively validate the body
            case "while": {
                if (!layoutTreeNode.body)
                    errors.push(`While block at ${path} is missing its body.`);
                else {
                    const bodyValidation = this.validateMeasuredTree(layoutTreeNode.body, `${path}.body`);
                    errors.push(...bodyValidation.errors);
                }
                break;
            }
            // default case for unsupported layout block types
            default:
                errors.push(`Layout block at ${path} has an unsupported type: ${layoutTreeNode.type}.`);
        }
        // return the validation result, indicating whether the layout tree is valid and any errors found
        return { isValid: errors.length === 0, errors };
    }

    /**
     * Places one visible leaf node inside the layout result.
     * The supplied x and y coordinates represent the top-left
     * corner of the leaf layout block.
     * Because a leaf block represents exactly one FlowNode,
     * the node position is identical to the block position.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @param {number} x
     * @param {number} y
     */
    placeLeafNode(layoutTreeNode, flowGraph, layoutResult, x, y) {
        // validate that the layoutTreeNode is defined and is a leaf node
        if (!layoutTreeNode)
            throw new Error("Cannot place an undefined or null leaf layout node.");
        if (!layoutTreeNode.isNode())
            throw new Error(`Cannot place layout tree node of type ${layoutTreeNode.type} ` + "as a leaf node.");
        // validate that the flowGraph and layoutResult are defined
        if (!flowGraph)
            throw new Error("Cannot place a leaf node without a flow graph.");
        if (!layoutResult || typeof layoutResult.setPosition !== "function")
            throw new Error("Cannot place a leaf node without a valid layout result.");
        // validate that the x and y coordinates are finite numbers
        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("Leaf node coordinates must be finite numbers.");
        // validate that the flow node exists in the flow graph
        const flowNode = flowGraph.getNodeById(layoutTreeNode.flowNodeId);
        if (!flowNode)
            throw new Error(`Cannot place leaf layout node: flow node ` + `${layoutTreeNode.flowNodeId} does not exist.`);
        // validate that the layoutTreeNode has valid dimensions before placing it
        if (layoutTreeNode.width <= 0 || layoutTreeNode.height <= 0)
            throw new Error(`Cannot place flow node ${flowNode.id} before measuring its layout block.`);
        // validate that the flow node does not already have a position in the layout result
        if (layoutResult.hasPosition(flowNode.id))
            throw new Error(`Flow node ${flowNode.id} already has a layout position.`);
        // set the position of the flow node in the layout result using the provided x and y coordinates
        layoutResult.setPosition(flowNode.id, x, y);
    }

    /**
     * Places a layout tree block according to its structural type.
     * This method acts as the central dispatcher for the placement pass.
     * The x and y coordinates represent the top-left corner
     * of the complete layout block.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @param {number} x
     * @param {number} y
     */
    placeTreeNode(layoutTreeNode, flowGraph, layoutResult, x, y) {
        // validate that the layoutTreeNode, flowGraph, and layoutResult are defined
        if (!layoutTreeNode)
            throw new Error("Cannot place an undefined or null layout tree block.");
        if (!flowGraph)
            throw new Error("Cannot place a layout tree block without a flow graph.");
        if (!layoutResult || typeof layoutResult.setPosition !== "function")
            throw new Error("Cannot place a layout tree block without a valid layout result.");
        // validate that the x and y coordinates are finite numbers
        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("Layout block coordinates must be finite numbers.");
        if (!Number.isFinite(layoutTreeNode.width) || !Number.isFinite(layoutTreeNode.height) || !Number.isFinite(layoutTreeNode.axisX))
            throw new Error(`Cannot place layout tree block of type ${layoutTreeNode.type} ` + "because its geometry is invalid.");
        // choose the appropriate placement method based on the layout tree node type
        switch (layoutTreeNode.type) {
            case "node":
                this.placeLeafNode(layoutTreeNode, flowGraph, layoutResult, x, y);
                break;
            case "sequence":
                this.placeSequence(layoutTreeNode, flowGraph, layoutResult, x, y);
                break;
            case "if":
                this.placeIfNode(layoutTreeNode, flowGraph, layoutResult, x, y);
                break;
            case "while":
                this.placeWhileNode(layoutTreeNode, flowGraph, layoutResult, x, y);
                break;
            default:
                throw new Error(`Cannot place unsupported layout tree type: ${layoutTreeNode.type}.`);
        }
    }

    /**
     * Places all children of a sequence vertically around
     * one shared execution axis.
     * The supplied x and y coordinates represent the top-left
     * corner of the complete sequence block.
     * @param {import("./LayoutTreeNode").LayoutTreeNode} sequenceNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @param {number} x
     * @param {number} y
     */
    placeSequence(sequenceNode, flowGraph, layoutResult, x, y) {
        // validate that the sequenceNode is defined and is a sequence node
        if (!sequenceNode)
            throw new Error("Cannot place an undefined or null sequence block.");
        if (!sequenceNode.isSequence())
            throw new Error(`Cannot place layout tree node of type ${sequenceNode.type} ` + "as a sequence.");
        // validate that the flowGraph and layoutResult are defined
        if (!flowGraph)
            throw new Error("Cannot place a sequence block without a flow graph.");
        if (!layoutResult || typeof layoutResult.setPosition !== "function")
            throw new Error("Cannot place a sequence block without a valid layout result.");
        // validate that the x and y coordinates are finite numbers
        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("Sequence coordinates must be finite numbers.");
        // validate that the sequenceNode has a children array
        if (!Array.isArray(sequenceNode.children))
            throw new Error("Cannot place a sequence block whose children are not an array.");
        /*
         * An empty sequence represents an empty branch or loop body.
         * It contains no visible nodes, so no positions are produced.
         */
        if (sequenceNode.children.length === 0)
            return;
        const sequenceAxisX = x + sequenceNode.axisX;
        let currentY = y;
        sequenceNode.children.forEach(
            (child, index) => {
                /*
                 * Align the child's execution axis with
                 * the sequence's shared execution axis.
                 */
                const childX = sequenceAxisX - child.axisX;
                this.placeTreeNode(child, flowGraph, layoutResult, childX, currentY);
                currentY += child.height;
                /*
                 * Add vertical spacing between children,
                 * but not after the final child.
                 */
                if (index < sequenceNode.children.length - 1)
                    currentY += this.options.sequenceGap;
            });
    }

    /**
     * Places a complete if layout block.
     * The block contains:
     * - the decision node on the main execution axis
     * - the false branch on the left
     * - the true branch on the right
     * - the junction below both branches
     * The supplied x and y coordinates represent the top-left
     * corner of the complete if block.
     *
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @param {number} x
     * @param {number} y
     */
    placeIfNode(layoutTreeNode, flowGraph, layoutResult, x, y) {
        // validate that the layoutTreeNode is defined and is an if node
        if (!layoutTreeNode)
            throw new Error("Cannot place an undefined or null if layout node.");
        if (!layoutTreeNode.isIf())
            throw new Error(`Cannot place layout tree node of type ${layoutTreeNode.type} as an if block.`);
        // validate that the flowGraph and layoutResult are defined
        if (!flowGraph)
            throw new Error("Cannot place an if block without a flow graph.");
        if (!layoutResult || typeof layoutResult.setPosition !== "function")
            throw new Error("Cannot place an if block without a valid layout result.");
        // validate that the x and y coordinates are finite numbers
        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("If block coordinates must be finite numbers.");
        if (!layoutTreeNode.trueBranch || !layoutTreeNode.falseBranch)
            throw new Error("Cannot place an if block without both branches.");
        // validate that the flowNodeId and junctionNodeId are valid 
        const decisionNode = flowGraph.getNodeById(layoutTreeNode.flowNodeId);
        if (!decisionNode || decisionNode.type !== "if")
            throw new Error(`Flow node ${layoutTreeNode.flowNodeId} is not a valid if node.`);
        const junctionNode = flowGraph.getNodeById(layoutTreeNode.junctionNodeId);
        if (!junctionNode || junctionNode.type !== "junction")
            throw new Error(`Flow node ${layoutTreeNode.junctionNodeId} is not a valid junction node.`);
        // validate that neither the decision node nor the junction node already have a position in the layout result
        if (layoutResult.hasPosition(decisionNode.id))
            throw new Error(`If node ${decisionNode.id} already has a layout position.`);
        if (layoutResult.hasPosition(junctionNode.id))
            throw new Error(`Junction node ${junctionNode.id} already has a layout position.`);
        // get the configured sizes for the decision and junction nodes
        const decisionSize = this.getNodeSize("if");
        const junctionSize = this.getNodeSize("junction");
        // define local variables for easier access to the false and true branches
        const falseBranch = layoutTreeNode.falseBranch;
        const trueBranch = layoutTreeNode.trueBranch;
        /*
         * Calculate the absolute horizontal position of the
         * main execution axis inside the complete if block.
         */
        const mainAxisX = x + layoutTreeNode.axisX;
        /*
         * Place the decision node so its center lies
         * exactly on the main execution axis.
         */
        const decisionX = mainAxisX - decisionSize.width / 2;
        layoutResult.setPosition(decisionNode.id, decisionX, y);
        /*
         * Calculate the horizontal distance between the execution
         * axes of the false and true branches using the same formula
         * that was used during the measurement pass.
         */
        const falseRightExtent = falseBranch.width - falseBranch.axisX;
        const trueLeftExtent = trueBranch.axisX;
        const branchAxisDistance = falseRightExtent + this.options.branchGap + trueLeftExtent;
        // calculate the horizontal positions of the false and true branch axes
        const halfBranchAxisDistance = branchAxisDistance / 2;
        const falseBranchAxisX = mainAxisX - halfBranchAxisDistance;
        const trueBranchAxisX = mainAxisX + halfBranchAxisDistance;
        const branchesY = y + decisionSize.height + this.options.decisionBranchGap;
        /*
         * Place both branch blocks so their internal execution axes
         * match the calculated left and right branch axes.
         */
        const falseBranchX = falseBranchAxisX - falseBranch.axisX;
        const trueBranchX = trueBranchAxisX - trueBranch.axisX;
        this.placeTreeNode(falseBranch, flowGraph, layoutResult, falseBranchX, branchesY);
        this.placeTreeNode(trueBranch, flowGraph, layoutResult, trueBranchX, branchesY);
        /*
         * The junction is placed below the height of the longer branch,
         * centered on the main execution axis.
         */
        const branchesHeight = Math.max(falseBranch.height, trueBranch.height);
        const junctionX = mainAxisX - junctionSize.width / 2;
        const junctionY = branchesY + branchesHeight + this.options.branchJunctionGap;
        layoutResult.setPosition(junctionNode.id, junctionX, junctionY);
    }

    /**
     * Places a complete while layout block.
     * The block contains:
     * - the while decision node on the main execution axis
     * - the loop body on the right
     * - the exit junction below the decision
     * The supplied x and y coordinates represent the top-left
     * corner of the complete while block.
     *
     * @param {import("./LayoutTreeNode").LayoutTreeNode} layoutTreeNode
     * @param {import("./FlowGraph").FlowGraph} flowGraph
     * @param {import("./LayoutResult").LayoutResult} layoutResult
     * @param {number} x
     * @param {number} y
     */
    placeWhileNode(layoutTreeNode, flowGraph, layoutResult, x, y) {
        if (!layoutTreeNode)
            throw new Error("Cannot place an undefined or null while layout node.");

        if (!layoutTreeNode.isWhile())
            throw new Error(`Cannot place layout tree node of type ${layoutTreeNode.type} as a while block.`);

        if (!flowGraph)
            throw new Error("Cannot place a while block without a flow graph.");

        if (!layoutResult || typeof layoutResult.setPosition !== "function")
            throw new Error("Cannot place a while block without a valid layout result.");

        if (!Number.isFinite(x) || !Number.isFinite(y))
            throw new Error("While block coordinates must be finite numbers.");

        if (!layoutTreeNode.body)
            throw new Error("Cannot place a while block without a body.");

        if (!layoutTreeNode.body.isSequence())
            throw new Error("The body of a while layout block must be a sequence.");

        const whileNode = flowGraph.getNodeById(layoutTreeNode.flowNodeId);
        if (!whileNode || whileNode.type !== "while")
            throw new Error(`Flow node ${layoutTreeNode.flowNodeId} is not a valid while node.`);

        const junctionNode = flowGraph.getNodeById(layoutTreeNode.junctionNodeId);
        if (!junctionNode || junctionNode.type !== "junction")
            throw new Error(`Flow node ${layoutTreeNode.junctionNodeId} is not a valid junction node.`);

        if (layoutResult.hasPosition(whileNode.id))
            throw new Error(`While node ${whileNode.id} already has a layout position.`);

        if (layoutResult.hasPosition(junctionNode.id))
            throw new Error(`Junction node ${junctionNode.id} already has a layout position.`);

        const decisionSize = this.getNodeSize("while");
        const junctionSize = this.getNodeSize("junction");
        const body = layoutTreeNode.body;

        /*
         * Main vertical execution axis of the whole while block.
         */
        const mainAxisX = x + layoutTreeNode.axisX;

        /*
         * Place while diamond centered on the main axis.
         */
        const decisionX = mainAxisX - decisionSize.width / 2;
        layoutResult.setPosition(whileNode.id, decisionX, y);

        /*
         * Place loop body directly below the while node,
         * centered on the same axis.
         * This makes the YES edge go straight down.
         */
        const bodyX = mainAxisX - body.axisX;
        const bodyY = y + decisionSize.height + this.options.decisionBranchGap;
        this.placeTreeNode(body, flowGraph, layoutResult, bodyX, bodyY);

        /*
         * Place exit junction below the body, centered on the main axis.
         */
        const junctionX = mainAxisX - junctionSize.width / 2;
        const junctionY = bodyY + body.height + this.options.branchJunctionGap;
        layoutResult.setPosition(junctionNode.id, junctionX, junctionY);
    }
}