export interface GraphStructure {
  nodes: GraphNode[];
  edges: GraphEdge[]
};

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
};

export interface GraphEdge {
  start: string;
  end: string;
  weight: number;
};
