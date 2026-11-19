import { LayoutTreeNode } from "./LayoutTreeNode";
import { FlowGraph } from "./FlowGraph";
import { FlowEdge } from "./FlowEdge";
// a builder class that constructs a layout tree from a flow graph
export class LayoutTreeBuilder {
    constructor() {
        this.flowGraph = null;
    }

    /**
     * Converts a valid FlowGraph into a layout tree.
     * @param {FlowGraph} flowGraph
     * @returns {LayoutTreeNode}
     */
    build(flowGraph) {
        // validate the flow graph is not null or undefined
        if (!flowGraph)
            throw new Error("Cannot build a layout tree from an undefined or null flow graph.");
        // validate the flow graph is valid
        const validationResult = flowGraph.validate();
        if (!validationResult.isValid)
            throw new Error(
                ["Cannot build a layout tree from an invalid flow graph:",
                    ...validationResult.errors.map(error => `- ${error}`)].join("\n"));
        // store the flow graph for l future use
        this.flowGraph = flowGraph;
        // find the start and end nodes of the flow graph
        const startNode = flowGraph.getStartNode();
        const endNode = flowGraph.getEndNode();
        // validate that the start and end nodes exist
        if (!startNode || !endNode)
            throw new Error("Cannot build the layout tree: start or end node is missing.");
        // build the layout tree starting from the start node
        const rootLayoutTree = this.buildSequence(startNode.id);
        // validate that the layout tree is valid and represents all flow graph nodes exactly once
        const validationTreeResult = this.validateLayoutTree(rootLayoutTree);
        if (!validationTreeResult.isValid) 
            throw new Error(["Failed to build a valid layout tree:",...validationResult.errors.map(error => `- ${error}`)].join("\n"));
        return rootLayoutTree;
    }

    /**
     * Creates a leaf layout block for one simple FlowNode.
     * A leaf block represents exactly one visible node from the FlowGraph.
     * @param {import("./FlowNode").FlowNode} flowNode
     * @returns {LayoutTreeNode}
     */
    createLeafNode(flowNode) {
        // validate the flow node is not null or undefined
        if (!flowNode)
            throw new Error("Cannot create a leaf layout node from an undefined or null flow node.");
        // validate the flow node type is one of the supported leaf types
        const validLeafTypes = new Set(["start", "end", "assignment", "input", "output"]);
        if (!validLeafTypes.has(flowNode.type))
            throw new Error(`Flow node ${flowNode.id} of type ${flowNode.type} cannot be represented as a leaf layout node.`);
        // create and return a new LayoutTreeNode of type "node" for this flow node
        return new LayoutTreeNode("node", { flowNodeId: flowNode.id });
    }

    /**
   * Returns the target FlowNode of an edge.
   * @param {FlowEdge} edge
   * @returns {FlowNode}
   */
    getTargetNode(edge) {
        // validate that the edge is not null or undefined
        if (!edge)
            throw new Error("Cannot get an edge target from an undefined or null edge.");
        // validate that the flow graph has been assigned
        if (!this.flowGraph)
            throw new Error("Cannot get an edge target before assigning a flow graph.");
        // getting the target node from the flow graph using the edge's target ID
        const targetNode = this.flowGraph.getNodeById(edge.target);
        // validate that the flow graph contains the target node of the edge
        if (!targetNode)
            throw new Error(`Cannot find target node ${edge.target} for edge ${edge.id}.`);
        // return the target node
        return targetNode;
    }

    /**
     * Returns the outgoing edges that advance through the program.
     * Back edges are excluded because they return to a while condition
     * and must not be followed while building the layout tree. 
     * @param {number} nodeId
     * @returns {FlowEdge[]}
     */
    getForwardOutgoingEdges(nodeId) {
        // validate the node ID is a valid integer
        if (!Number.isInteger(nodeId))
            throw new Error(`Cannot get forward edges: invalid node ID ${nodeId}.`);
        // validate that the flow graph has been assigned
        if (!this.flowGraph)
            throw new Error("Cannot get forward edges before assigning a flow graph.");
        // validate that the flow graph contains the specified node ID
        if (!this.flowGraph.hasNode(nodeId))
            throw new Error(`Cannot get forward edges: node ${nodeId} does not exist.`);
        // return the outgoing edges that are not back edges
        return this.flowGraph.getOutgoingEdges(nodeId).filter(edge => edge.role !== "back");
    }

    /**
     * Returns exactly one outgoing edge with the requested role.
     * This is used for structural edges such as:
     * - true
     * - false
     * - next
     *
     * @param {number} nodeId
     * @param {"next"|"true"|"false"} role
     * @returns {import("./FlowEdge").FlowEdge}
     */
    getRequiredOutgoingEdge(nodeId, role) {
        // validate the node ID is a valid integer
        if (!Number.isInteger(nodeId))
            throw new Error(`Cannot get an outgoing edge: invalid node ID ${nodeId}.`);
        // validate the role is one of the supported roles
        const validRoles = new Set(["next", "true", "false"]);
        if (!validRoles.has(role))
            throw new Error(`Cannot get an outgoing edge: unsupported role ${role}.`);
        // validate that the flow graph has been assigned
        if (!this.flowGraph)
            throw new Error("Cannot get an outgoing edge before assigning a flow graph.");
        // validate that the flow graph contains the specified node ID
        if (!this.flowGraph.hasNode(nodeId))
            throw new Error(`Cannot get an outgoing edge: node ${nodeId} does not exist.`);
        // get the outgoing edges with the specified role
        const matchingEdges = this.flowGraph.getOutgoingEdgesByRole(nodeId, role);
        // validate that there is exactly one matching edge
        if (matchingEdges.length !== 1)
            throw new Error(`Expected node ${nodeId} to have exactly one ${role} edge, but found ${matchingEdges.length}.`);
        // return the single matching edge
        return matchingEdges[0];
    }

    /**
     * Returns the optional outgoing edge with the requested role.
     * The function returns:
     * - the edge when exactly one matching edge exists
     * - null when no matching edge exists
     * More than one matching edge is considered invalid.
     * @param {number} nodeId
     * @param {"next"|"true"|"false"} role
     * @returns {import("./FlowEdge").FlowEdge|null}
     */
    getOptionalOutgoingEdge(nodeId, role) {
        // validate that the node ID is a valid integer
        if (!Number.isInteger(nodeId))
            throw new Error(`Cannot get an optional outgoing edge: invalid node ID ${nodeId}.`);
        // validate that the role is one of the supported roles
        const validRoles = new Set(["next", "true", "false"]);
        if (!validRoles.has(role))
            throw new Error(`Cannot get an optional outgoing edge: unsupported role ${role}.`);
        // validate that the flow graph has been assigned
        if (!this.flowGraph)
            throw new Error("Cannot get an optional outgoing edge before assigning a flow graph.");
        // validate that the flow graph contains the specified node ID
        if (!this.flowGraph.hasNode(nodeId))
            throw new Error(`Cannot get an optional outgoing edge: node ${nodeId} does not exist.`);
        // get the outgoing edges with the specified role
        const matchingEdges = this.flowGraph.getOutgoingEdgesByRole(nodeId, role);
        // validate that there is at most one matching edge
        if (matchingEdges.length > 1)
            throw new Error(`Expected node ${nodeId} to have at most one ${role} edge, but found ${matchingEdges.length}.`);
        // return the single matching edge or null if none exist
        return matchingEdges[0] ?? null;
    }

    /**
     * Calculates the shortest forward distance from a starting node
     * to every node reachable from it.
     * Back edges are ignored to avoid traversing loop cycles.
     * The starting node has distance 0.
     * @param {number} startNodeId
     * @returns {Map<number, number>}
     */
    getForwardDistances(startNodeId) {
        // validate that the start node ID is a valid integer
        if (!Number.isInteger(startNodeId))
            throw new Error(`Cannot calculate forward distances: invalid node ID ${startNodeId}.`);
        // validate that the flow graph has been assigned
        if (!this.flowGraph)
            throw new Error("Cannot calculate forward distances before assigning a flow graph.");
        // validate that the flow graph contains the specified start node ID
        if (!this.flowGraph.hasNode(startNodeId)) {
            throw new Error(
                `Cannot calculate forward distances: node ${startNodeId} does not exist.`
            );
        }
        // calculate the shortest forward distances using a breadth-first search (BFS) algorithm
        const distances = new Map();
        const queue = [startNodeId];
        let queueIndex = 0;
        // set the distance of the starting node to zero
        distances.set(startNodeId, 0);
        // perform BFS until all reachable nodes have been visited
        while (queueIndex < queue.length) {
            const currentNodeId = queue[queueIndex++];
            const currentDistance = distances.get(currentNodeId);
            // get the forward outgoing edges of the current node
            const forwardEdges = this.getForwardOutgoingEdges(currentNodeId);
            // for each forward edge, check if the target node has already been visited
            forwardEdges.forEach(edge => {
                const targetNodeId = edge.target;
                if (distances.has(targetNodeId))
                    return;
                // set the distance of the target node to one more than the current node's distance
                distances.set(targetNodeId, currentDistance + 1);
                // add the target node to the queue for further exploration
                queue.push(targetNodeId);
            });
        }
        return distances;
    }

    /**
     * Finds the junction node at which the true and false branches
     * of an if statement meet.
     * @param {import("./FlowNode").FlowNode} ifNode
     * @returns {import("./FlowNode").FlowNode}
     */
    findIfJunctionNode(ifNode) {
        // validate that the if node is not null or undefined
        if (!ifNode)
            throw new Error("Cannot find an if junction from an undefined or null node.");
        // validate that the if node is of type "if"
        if (ifNode.type !== "if")
            throw new Error(`Cannot find an if junction: node ${ifNode.id} is of type ${ifNode.type}.`);
        // get the true and false outgoing edges of the if node
        const trueEdge = this.getRequiredOutgoingEdge(ifNode.id, "true");
        const falseEdge = this.getRequiredOutgoingEdge(ifNode.id, "false");
        // get the starting nodes of the true and false branches
        const trueStartNode = this.getTargetNode(trueEdge);
        const falseStartNode = this.getTargetNode(falseEdge);
        // calculate the forward distances from the true and false starting nodes to all reachable nodes
        const trueDistances = this.getForwardDistances(trueStartNode.id);
        const falseDistances = this.getForwardDistances(falseStartNode.id);
        // find the common junction nodes that are reachable from both branches and select the optimal one based on distance criteria
        const candidates = [];
        // getting the cadidate junction nodes by iterating through the true distances and checking for common nodes in the false distances
        trueDistances.forEach((trueDistance, nodeId) => {
            // if the node is not reachable from the false branch, skip it
            if (!falseDistances.has(nodeId))
                return;
            // get the node from the flow graph using the node ID
            const node = this.flowGraph.getNodeById(nodeId);
            // validate that the node exists and is of type "junction"
            if (!node || node.type !== "junction")
                return;
            const falseDistance = falseDistances.get(nodeId);
            // add the candidate junction node along with its distance metrics to the candidates array
            candidates.push({
                node,
                maxDistance: Math.max(trueDistance, falseDistance),
                totalDistance: trueDistance + falseDistance
            });
        });
        // if no candidates were found, throw an error indicating that no common junction exists for the if node
        if (candidates.length === 0)
            throw new Error(`Cannot find a common junction for if node ${ifNode.id}.`);
        // sort the candidates based on the maximum distance AND total distance to select the optimal junction node
        candidates.sort((first, second) => {
            // compare the maximum distances of the two candidates
            if (first.maxDistance !== second.maxDistance) {
                return first.maxDistance - second.maxDistance;
            }
            // if the maximum distances are equal, compare the total distances of the two candidates
            if (first.totalDistance !== second.totalDistance) {
                return first.totalDistance - second.totalDistance;
            }
            // if both maximum and total distances are equal, compare the node IDs to ensure a consistent selection
            return first.node.id - second.node.id;
        });
        return candidates[0].node;
    }

    /**
     * Returns the junction node that represents the exit
     * of a while structure.
     * The false edge of a while node must point directly
     * to its exit junction.
     * @param {import("./FlowNode").FlowNode} whileNode
     * @returns {import("./FlowNode").FlowNode}
     */
    findWhileJunctionNode(whileNode) {
        // validate that the while node is not null or undefined
        if (!whileNode)
            throw new Error("Cannot find a while junction from an undefined or null node.");
        // validate that the while node is of type "while"
        if (whileNode.type !== "while")
            throw new Error(`Cannot find a while junction: node ${whileNode.id} is of type ${whileNode.type}.`);
        // get the false outgoing edge of the while node, which should lead to the junction node
        const falseEdge = this.getRequiredOutgoingEdge(whileNode.id, "false");
        // get the target node of the false edge, which should be the junction node
        const junctionNode = this.getTargetNode(falseEdge);
        // validate that the junction node is indeed of type "junction"
        if (junctionNode.type !== "junction") {
            throw new Error(
                `Expected the false edge of while node ${whileNode.id} ` +
                `to target a junction node, but found node ${junctionNode.id} ` +
                `of type ${junctionNode.type}.`
            );
        }
        return junctionNode;
    }

    /**
     * Returns the next node while building a sequence.
     * Normally, execution continues through a "next" edge.
     * When building a while body, its final node may return to the
     * while condition through a "back" edge. In that case, the stop
     * node is returned so the sequence builder can terminate correctly.
     *
     * @param {number} currentNodeId
     * @param {number|null} stopNodeId
     * @returns {import("./FlowNode").FlowNode|null}
     */
    getNextSequenceNode(currentNodeId, stopNodeId = null) {
        // validate that currentNodeId is a finite integer
        if (!Number.isInteger(currentNodeId))
            throw new Error(`Cannot get the next sequence node: invalid current node ID ${currentNodeId}.`);
        // validate that stopNodeId is either not null or a finite integer
        if (stopNodeId !== null && !Number.isInteger(stopNodeId))
            throw new Error(`Cannot get the next sequence node: invalid stop node ID ${stopNodeId}.`);
        // validate that the flow graph is assigned and contains the current node
        if (!this.flowGraph)
            throw new Error("Cannot get the next sequence node before assigning a flow graph.");
        // validate that the flow graph contains the current node and, if provided, the stop node
        if (!this.flowGraph.hasNode(currentNodeId))
            throw new Error(`Cannot get the next sequence node: node ${currentNodeId} does not exist.`);
        if (stopNodeId !== null && !this.flowGraph.hasNode(stopNodeId))
            throw new Error(`Cannot get the next sequence node: stop node ${stopNodeId} does not exist.`);
        // get the optional "next" outgoing edge from the current node
        const nextEdge = this.getOptionalOutgoingEdge(currentNodeId, "next");
        if (nextEdge)
            return this.getTargetNode(nextEdge);
        /*
         * A while body normally ends with:
         * body exit --back--> while condition
         * When that while condition is the requested stop node,
         * consider the stop node to be the next traversal point.
         */
        if (stopNodeId !== null) {
            const matchingBackEdges = this.flowGraph.getOutgoingEdgesByRole(currentNodeId, "back").filter(edge => edge.target === stopNodeId);
            if (matchingBackEdges.length > 1) {
                throw new Error(
                    `Expected node ${currentNodeId} to have at most one back edge ` +
                    `to stop node ${stopNodeId}, but found ${matchingBackEdges.length}.`);
            }
            if (matchingBackEdges.length === 1)
                return this.getTargetNode(matchingBackEdges[0]);
        }
        return null;
    }

    /**
     * Builds a sequence layout block starting from a FlowNode
     * and ending immediately before an optional stop node.
     * The stop node is not included in the resulting sequence.
     *
     * @param {number} startNodeId
     * @param {number|null} stopNodeId
     * @returns {LayoutTreeNode}
     */
    buildSequence(startNodeId, stopNodeId = null) {
        // validate that startNodeId is a finite integer
        if (!Number.isInteger(startNodeId))
            throw new Error(`Cannot build a sequence: invalid start node ID ${startNodeId}.`);
        // validate that stopNodeId is either not null or a finite integer
        if (stopNodeId !== null && !Number.isInteger(stopNodeId))
            throw new Error(`Cannot build a sequence: invalid stop node ID ${stopNodeId}.`);
        // validate that the flow graph is assigned and contains the start node
        if (!this.flowGraph)
            throw new Error("Cannot build a sequence before assigning a flow graph.");
        // validate that the flow graph contains the start node and, if provided, the stop node
        const startNode = this.flowGraph.getNodeById(startNodeId);
        if (!startNode)
            throw new Error(`Cannot build a sequence: start node ${startNodeId} does not exist.`);
        // validate that the flow graph contains the stop node if it is provided
        if (stopNodeId !== null && !this.flowGraph.hasNode(stopNodeId))
            throw new Error(`Cannot build a sequence: stop node ${stopNodeId} does not exist.`);
        // initialize the list of child layout nodes and a set to track visited nodes to detect cycles
        const children = [];
        const visited = new Set();
        let currentNode = startNode;
        // traverse the flow graph starting from the start node until reaching the stop node or the end of the sequence
        while (currentNode && currentNode.id !== stopNodeId) {
            if (visited.has(currentNode.id))
                throw new Error(`Cannot build a sequence: a cycle was detected at node ${currentNode.id}.`);
            // mark the current node as visited to prevent cycles in the sequence
            visited.add(currentNode.id);
            let layoutChild;
            let nextNode;
            // determine the type of the current node and build the corresponding layout tree node
            switch (currentNode.type) {
                case "start":
                case "end":
                case "assignment":
                case "input":
                case "output":
                    layoutChild = this.createLeafNode(currentNode);
                    nextNode = this.getNextSequenceNode(currentNode.id, stopNodeId);
                    break;
                case "if":
                    layoutChild = this.buildIfTreeNode(currentNode);
                    nextNode = this.getNextSequenceNode(layoutChild.junctionNodeId, stopNodeId);
                    break;
                case "while":
                    layoutChild = this.buildWhileTreeNode(currentNode);
                    nextNode = this.getNextSequenceNode(layoutChild.junctionNodeId, stopNodeId);
                    break;
                case "junction":
                    throw new Error(`Unexpected junction node ${currentNode.id} while building a sequence.`);
                default:
                    throw new Error(`Cannot build a sequence from node ${currentNode.id}: unsupported node type ${currentNode.type}.`);
            }
            // add the constructed layout child to the sequence's children and move to the next node in the sequence
            children.push(layoutChild);
            if (!nextNode) {
                if (stopNodeId !== null)
                    throw new Error(`Sequence starting at node ${startNodeId} ended before reaching stop node ${stopNodeId}.`);
                currentNode = null;
                break;
            }
            currentNode = nextNode;
        }
        if (stopNodeId !== null && (!currentNode || currentNode.id !== stopNodeId))
            throw new Error(`Sequence starting at node ${startNodeId} did not reach stop node ${stopNodeId}.`);
        return new LayoutTreeNode("sequence", { children });
    }

    /**
     * Builds a complete layout block for an if structure.
     * The resulting block contains:
     * - the if decision node
     * - the true branch
     * - the false branch
     * - the junction at which both branches meet
     *
     * @param {import("./FlowNode").FlowNode} ifNode
     * @returns {LayoutTreeNode}
     */
    buildIfTreeNode(ifNode) {
        // validate that the if node is not null or undefined
        if (!ifNode)
            throw new Error("Cannot build an if layout block from an undefined or null node.");
        // validate that the if node is of type "if"
        if (ifNode.type !== "if")
            throw new Error(`Cannot build an if layout block: node ${ifNode.id} ` + `is of type ${ifNode.type}.`);
        // get the true and false outgoing edges of the if node, which represent the branches of the if structure
        const trueEdge = this.getRequiredOutgoingEdge(ifNode.id, "true");
        const falseEdge = this.getRequiredOutgoingEdge(ifNode.id, "false");
        // get the starting nodes of the true and false branches by following the respective edges
        const trueStartNode = this.getTargetNode(trueEdge);
        const falseStartNode = this.getTargetNode(falseEdge);
        // find the junction node where both branches converge, which is necessary to complete the if structure in the layout tree
        const junctionNode = this.findIfJunctionNode(ifNode);
        // build the true and false branches of the if structure as sequences starting from their respective starting nodes and ending at the junction node
        const trueBranch = this.buildSequence(trueStartNode.id, junctionNode.id);
        const falseBranch = this.buildSequence(falseStartNode.id, junctionNode.id);
        return new LayoutTreeNode("if", { flowNodeId: ifNode.id, trueBranch, falseBranch, junctionNodeId: junctionNode.id });
    }

    /**
     * Builds a complete layout block for a while structure.
     * The resulting block contains:
     * - the while decision node
     * - the loop body
     * - the junction that represents the loop exit
     * @param {import("./FlowNode").FlowNode} whileNode
     * @returns {LayoutTreeNode}
     */
    buildWhileTreeNode(whileNode) {
        // validate that the while node is not null or undefined
        if (!whileNode)
            throw new Error("Cannot build a while layout block from an undefined or null node.");
        // validate that the while node is of type "while"
        if (whileNode.type !== "while")
            throw new Error(`Cannot build a while layout block: node ${whileNode.id} ` + `is of type ${whileNode.type}.`);
        // get the true outgoing edge of the while node, which represents the entry point to the loop body
        const trueEdge = this.getRequiredOutgoingEdge(whileNode.id, "true");
        const bodyStartNode = this.getTargetNode(trueEdge);
        const junctionNode = this.findWhileJunctionNode(whileNode);
        let body;
        /*
         * An empty while body is represented by a true self-edge:
         * while --true--> while
         */
        if (bodyStartNode.id === whileNode.id)
            body = new LayoutTreeNode("sequence", { children: [] });
        else
            body = this.buildSequence(bodyStartNode.id, whileNode.id);
        return new LayoutTreeNode("while", { flowNodeId: whileNode.id, body, junctionNodeId: junctionNode.id });
    }

    /**
     * Collects all FlowGraph node IDs represented inside
     * a layout tree block.
     *  will  be used to validate that all nodes are represented in the layout tree and appear exactly once.
     * @param {LayoutTreeNode} layoutTreeNode
     * @param {number[]} collectedIds
     * @returns {number[]}
     */
    collectRepresentedNodeIds(layoutTreeNode, collectedIds = []) {
        // validate that the layout tree node is not null or undefined
        if (!layoutTreeNode)
            throw new Error("Cannot collect represented node IDs from an undefined or null layout tree node.");
        // validate that the collected IDs array is not null or undefined
        switch (layoutTreeNode.type) {
            case "node":
                collectedIds.push(layoutTreeNode.flowNodeId);
                break;
            case "sequence":
                layoutTreeNode.children.forEach(child => { this.collectRepresentedNodeIds(child, collectedIds); });
                break;
            case "if":
                collectedIds.push(layoutTreeNode.flowNodeId, layoutTreeNode.junctionNodeId);
                this.collectRepresentedNodeIds(layoutTreeNode.trueBranch, collectedIds);
                this.collectRepresentedNodeIds(layoutTreeNode.falseBranch, collectedIds);
                break;
            case "while":
                collectedIds.push(layoutTreeNode.flowNodeId, layoutTreeNode.junctionNodeId);
                this.collectRepresentedNodeIds(layoutTreeNode.body, collectedIds);
                break;
            default:
                throw new Error(`Cannot collect represented node IDs: unsupported layout tree type ${layoutTreeNode.type}.`);
        }
        return collectedIds;
    }

    /**
     * Validates that the layout tree represents every FlowGraph node exactly once.
     * @param {LayoutTreeNode} rootLayoutTree
     * @returns {{isValid: boolean, errors: string[]}}
     */
    validateLayoutTree(rootLayoutTree) {
        // validate that the root layout tree node is not null or undefined
        if (!rootLayoutTree)
            return { isValid: false, errors: ["The layout tree root is undefined or null."] };
        // validate that the flow graph has been assigned before validating the layout tree
        if (!this.flowGraph)
            return { isValid: false, errors: ["Cannot validate the layout tree before assigning a flow graph."] };
        // initialize an array to collect validation errors
        const errors = [];
        const representedNodeIds = this.collectRepresentedNodeIds(rootLayoutTree);
        const representedIdCounts = new Map();
        representedNodeIds.forEach(nodeId => {
            const currentCount = representedIdCounts.get(nodeId) ?? 0;
            representedIdCounts.set(nodeId, currentCount + 1);
        });
        // Detect IDs represented more than once.
        representedIdCounts.forEach((count, nodeId) => {
            if (count > 1)
                errors.push(`Flow node ${nodeId} is represented ${count} times in the layout tree.`);
        });
        // Detect FlowGraph nodes missing from the layout tree.
        this.flowGraph.nodes.forEach(flowNode => {
            if (!representedIdCounts.has(flowNode.id))
                errors.push(`Flow node ${flowNode.id} of type ${flowNode.type} is missing from the layout tree.`);
        });
        // Detect IDs that do not exist in the FlowGraph.
        representedIdCounts.forEach((count, nodeId) => {
            if (!this.flowGraph.hasNode(nodeId))
                errors.push(`The layout tree references node ${nodeId}, which does not exist in the flow graph.`);
        });
        return { isValid: errors.length === 0, errors };
    }

}