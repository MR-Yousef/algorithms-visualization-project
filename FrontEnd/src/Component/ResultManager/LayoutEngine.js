//a class responsible for assigning positions to flow graph nodes
export class LayoutEngine {
    /**
     * a class constructor to initialize the layout engine
     */
    constructor() {
        this.visited = new Set();
        this.xGap = 250;
        this.yGap = 150;
    }
    /**
     * applies layout to the given flow graph
     * @param {FlowGraph} flowGraph
     * @returns {FlowGraph}
     */
    applyLayout(flowGraph) {
        this.visited.clear();

        let startNode = flowGraph.nodes.find((node) => node.type == "start");

        if (!startNode)
            return flowGraph;

        this.layoutNode(flowGraph, startNode, 0, 0);

        return flowGraph;
    }

    /**
     * recursively assigns position to a node and its children
     * @param {FlowGraph} flowGraph
     * @param {FlowNode} node
     * @param {number} x
     * @param {number} y
     */
    layoutNode(flowGraph, node, x, y) {
        if (this.visited.has(node.id))
            return;

        this.visited.add(node.id);

        node.position = {
            x: x,
            y: y
        };

        let children = flowGraph.getChildren(node.id);

        children.forEach((child, index) => {
            this.layoutNode(
                flowGraph,
                child,
                x + index * this.xGap,
                y + this.yGap
            );
        });
    }
}