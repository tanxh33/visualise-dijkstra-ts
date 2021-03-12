import { GraphNode, GraphEdge } from './GraphStructure';

export const getLabelOfNodeFromId = (nodes: GraphNode[], id: string): string => {
  return nodes.filter(node => node.id === id)[0].label;
};

export const preventNonNumberKeydown = (e: KeyboardEvent) => {
  const allowedChars = '0123456789';

  const contains = (stringValue: string, charValue: string) => {
    return stringValue.indexOf(charValue) > -1;
  }

  let invalidKey =
    e.key.length === 1 && !contains(allowedChars, e.key) ||
    e.key === '.' && contains((e.target as HTMLInputElement).value, '.');

  invalidKey && e.preventDefault();
};

export const checkIfNodeExists = (nodes: GraphNode[], label: string): boolean => {
  const currentNodes = [...nodes.map(node => node.label)];
  for (let i = 0; i < currentNodes.length; i++) {
    if (label === currentNodes[i]) {
      return true;
    }
  }
  return false;
};

export const checkIfEdgeExists = (edges: GraphEdge[], start: string, end: string): boolean => {
  // Check that an edge with same start and end doesn't already exist in the currentGraph.
  let exists = false;
  for (let i = 0; i < edges.length; i++) {
    const edge = edges[i];
    if (
      (start === edge.start && end === edge.end) ||
      (start === edge.end && end === edge.start)
    ) {
      // [TODO] Here we exit if it exists, but maybe instead just update the weight value.
      // console.log('edge alr exists');
      exists = true;
    }
    if (exists) break;
  }
  // console.log('edge doesnt exist');
  return exists;
};
