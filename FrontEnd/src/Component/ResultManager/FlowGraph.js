import { FlowNode } from "./FlowNode";
import { FlowEdge } from "./FlowEdge";
import { FlowFragment } from "./FlowFragment";
export class FlowGraph {
    constructor() {
        this.nodes = [];
        this.edges = [];
    }

    /**
     * Adds a node to the graph.
     * @param {FlowNode} node
     */
    addNode(node) {
        if (!node) {
            throw new Error("Cannot add an undefined or null node.");
        }
        if (this.hasNode(node.id)) {
            throw new Error(`A node with ID ${node.id} already exists.`);
        }
        this.nodes.push(node);
    }

    /**
     * Adds an edge to the graph.
     * Both source and target nodes must already exist.
     * @param {FlowEdge} edge
     */
    addEdge(edge) {
        if (!edge) {
            throw new Error("Cannot add an undefined or null edge.");
        }
        const duplicateEdge = this.edges.some(
            currentEdge => currentEdge.id === edge.id);
        if (duplicateEdge) {
            throw new Error(`An edge with ID ${edge.id} already exists.`);
        }
        if (!this.hasNode(edge.source)) {
            throw new Error(
                `Cannot add edge ${edge.id}: source node ${edge.source} does not exist.`
            );
        }
        if (!this.hasNode(edge.target)) {
            throw new Error(
                `Cannot add edge ${edge.id}: target node ${edge.target} does not exist.`
            );
        }
        this.edges.push(edge);
    }

    /**
     * Adds all nodes and edges from a fragment.
     * Nodes are added before edges so that edge references can be validated.
     * @param {FlowFragment} fragment
     */
    addFragment(fragment) {
        if (!fragment) {
            throw new Error("Cannot add an undefined or null fragment.");
        }
        fragment.nodes.forEach(node => {
            this.addNode(node);
        });
        fragment.edges.forEach(edge => {
            this.addEdge(edge);
        });
    }

    /**
     * Checks whether a node exists.
     * @param {number} nodeId
     * @returns {boolean}
     */
    hasNode(nodeId) {
        return this.nodes.some(node => node.id === nodeId);
    }

    /**
     * Returns a node by ID.
     * @param {number} nodeId
     * @returns {FlowNode|undefined}
     */
    getNodeById(nodeId) {
        return this.nodes.find(node => node.id === nodeId);
    }

    /**
     * Returns the start node.
     * @returns {FlowNode|undefined}
     */
    getStartNode() {
        return this.nodes.find(node => node.type === "start");
    }

    /**
     * Returns the end node.
     * @returns {FlowNode|undefined}
     */
    getEndNode() {
        return this.nodes.find(node => node.type === "end");
    }

    /**
     * Returns all outgoing edges from a node.
     * @param {number} nodeId
     * @returns {FlowEdge[]}
     */
    getOutgoingEdges(nodeId) {
        return this.edges.filter(edge => edge.source === nodeId);
    }

    /**
     * Returns all incoming edges to a node.
     * @param {number} nodeId
     * @returns {FlowEdge[]}
     */
    getIncomingEdges(nodeId) {
        return this.edges.filter(edge => edge.target === nodeId);
    }

    /**
     * Returns all outgoing edges with the given role.
     * @param {number} nodeId
     * @param {"next"|"true"|"false"|"back"} role
     * @returns {FlowEdge[]}
     */
    getOutgoingEdgesByRole(nodeId, role) {
        return this.getOutgoingEdges(nodeId)
            .filter(edge => edge.role === role);
    }

    /**
     * Returns the first outgoing edge with the given role.
     * @param {number} nodeId
     * @param {"next"|"true"|"false"|"back"} role
     * @returns {FlowEdge|undefined}
     */
    getOutgoingEdgeByRole(nodeId, role) {
        return this.getOutgoingEdges(nodeId)
            .find(edge => edge.role === role);
    }

    /**
     * Returns directly connected child nodes.
     * @param {number} nodeId
     * @returns {FlowNode[]}
     */
    getChildren(nodeId) {
        return this.getOutgoingEdges(nodeId)
            .map(edge => this.getNodeById(edge.target))
            .filter(node => node !== undefined);
    }

    /**
     * Returns directly connected parent nodes.
     * @param {number} nodeId
     * @returns {import("./FlowNode").FlowNode[]}
     */
    getParents(nodeId) {
        return this.getIncomingEdges(nodeId)
            .map(edge => this.getNodeById(edge.source))
            .filter(node => node !== undefined);
    }

    /**
     *Validates the structural integrity of the graph.
     *
     * @returns {{ isValid: boolean, errors: string[] }}
     */
    validate() {
        // array to hold validation errors
        const errors = [];
        // Set of valid node types for validation
        const validNodeTypes = new Set([
            "start",
            "end",
            "assignment",
            "input",
            "output",
            "if",
            "while",
            "junction"
        ]);
        // Set of valid edge roles for validation
        const validEdgeRoles = new Set([
            "next",
            "true",
            "false",
            "back"
        ]);
        // Validate node IDs and node types.
        const nodeIds = new Set();
        this.nodes.forEach(node => {
            // validate node ID uniqueness
            if (nodeIds.has(node.id)) {
                errors.push(`Duplicate node ID: ${node.id}.`);
            } else {
                nodeIds.add(node.id);
            }
            // validate node type
            if (!validNodeTypes.has(node.type)) {
                errors.push(
                    `Node ${node.id} has an invalid type: ${node.type}.`
                );
            }
        });
        // Validate edge IDs, roles, sources, and targets.
        const edgeIds = new Set();
        this.edges.forEach(edge => {
            // validate edge ID uniqueness
            if (edgeIds.has(edge.id)) {
                errors.push(`Duplicate edge ID: ${edge.id}.`);
            } else {
                edgeIds.add(edge.id);
            }
            // validate edge role
            if (!validEdgeRoles.has(edge.role)) {
                errors.push(
                    `Edge ${edge.id} has an invalid role: ${edge.role}.`
                );
            }
            // validate edge source and target nodes exist
            if (!this.hasNode(edge.source)) {
                errors.push(
                    `Edge ${edge.id} references missing source node ${edge.source}.`
                );
            }
            // validate edge target nodes exist
            if (!this.hasNode(edge.target)) {
                errors.push(
                    `Edge ${edge.id} references missing target node ${edge.target}.`
                );
            }
        });
        // validate that the graph must contain exactly one start node.
        const startNodes = this.nodes.filter(
            node => node.type === "start"
        );
        if (startNodes.length !== 1) {
            errors.push(
                `Expected exactly one start node, but found ${startNodes.length}.`
            );
        }
        //validate that the graph must contain exactly one end node.
        const endNodes = this.nodes.filter(
            node => node.type === "end"
        );
        if (endNodes.length !== 1) {
            errors.push(
                `Expected exactly one end node, but found ${endNodes.length}.`
            );
        }
        // Validate that the start node has no incoming edges and the end node has no outgoing edges.
        const startNode = startNodes[0];
        const endNode = endNodes[0];
        // Start must not have incoming edges.
        if (startNode &&this.getIncomingEdges(startNode.id).length > 0) {
            errors.push("The start node must not have incoming edges.");
        }
        // End must not have outgoing edges.
        if (endNode &&this.getOutgoingEdges(endNode.id).length > 0) {
            errors.push("The end node must not have outgoing edges.");
        }
        // Validate decision nodes.
        this.nodes.forEach(node => {
            if (node.type !== "if" && node.type !== "while") {
                return;
            }
            // count the number of outgoing edges with the role "true" 
            const trueEdges = this.getOutgoingEdgesByRole(
                node.id,
                "true"
            );
            // count the number of outgoing edges with the role "false"
            const falseEdges = this.getOutgoingEdgesByRole(
                node.id,
                "false"
            );
            // Check that decision nodes have exactly one true  outgoing edge.
            if (trueEdges.length !== 1) {
                errors.push(`Decision node ${node.id} must have exactly one true edge.`);
            }
            // Check that decision nodes have exactly one false outgoing edge.
            if (falseEdges.length !== 1) {
                errors.push(`Decision node ${node.id} must have exactly one false edge.`);
            }
        });
        // Only while nodes may receive back edges.
        this.edges.filter(edge => edge.role === "back").forEach(edge => {
                const targetNode = this.getNodeById(edge.target);
                // Check that the target node of a back edge is a while node.
                if (!targetNode || targetNode.type !== "while") {
                    errors.push(`Back edge ${edge.id} must target a while node.`);
                }
            });
        // Validate reachability from the start node.
        if (startNode) {
            const visited = new Set();
            const stack = [startNode.id];
            // Use depth-first search (DFS) to traverse the graph and mark reachable nodes.
            while (stack.length > 0) {
                const currentNodeId = stack.pop();
                if (visited.has(currentNodeId)) {
                    continue;
                }
                visited.add(currentNodeId);
                this.getOutgoingEdges(currentNodeId).forEach(edge => {
                        if (!visited.has(edge.target)) {
                            stack.push(edge.target);
                        }
                    });
            }
            // Check that all nodes are reachable from the start node.
            this.nodes.forEach(node => {
                if (!visited.has(node.id)) {
                    errors.push(
                        `Node ${node.id} is not reachable from the start node.`
                    );
                }
            });
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}
