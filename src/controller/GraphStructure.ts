/**
 * This file defines how the Graph, and its Nodes and Edges,
 * are stored in memory.
 */

export interface GraphStructure {
  // The rendered representation of the graph is made up of
  // an array of GraphNodes and an array of GraphEdges.
  nodes: GraphNode[];
  edges: GraphEdge[]
};

export interface GraphNode {
  // Note the id of a Node is stored as a string.
  // This is for convenience with JavaScript's quirk of converting any
  // object keys into strings, even if it is given numbers.
  id: string;
  label: string;
  x: number;  // Horizontal position
  y: number;  // Vertical position
};

export interface GraphEdge {
  // Non-overlapping, i.e. we only record an edge from Node 1 to Node 2,
  // but not Node 2 to Node 1. This is to prevent drawing two overlapping
  // lines in the canvas.
  start: string;  // Start node id
  end: string;    // End node id
  weight: number;
};
