// This class contains utility functions for updating the appearance
// of nodes and edges in the canvas graph

import { GraphStructure, GraphNode } from '../controller/GraphStructure';
import { AlgoStep } from '../model/Dijkstra';

export class GraphUtil {
  /**
   * Contains functions for animating nodes and edges on the canvas
   * while Dijkstra's algorithm runs, and other utility functions
   */
  updateGraph = (graph: GraphStructure, step: AlgoStep): void => {
    const { nodes, edges } = graph;
    const { current, state } = step;

    this.removeHighlightfromAllNodes();
    this.removeHighlightfromAllEdges();

    // Highlight nodes
    nodes.forEach((node) => {
      const { id } = node;
      if (current === id) {
        const nodeElement = document.querySelector(`[data-node-id='${id}']`) !;
        nodeElement.classList.add('current-node');
      }
      if (state.neighbour && state.neighbour === id) {
        const nodeElement = document.querySelector(`[data-node-id='${id}']`) !;
        nodeElement.classList.add('neighbour-node');
      }
    });

    if (!state.neighbour) {
      return;
    }

    // Highlight edges
    edges.forEach((edge) => {
      const neighbourId = state.neighbour;
      const currentId = current;
      if (currentId === edge.start && neighbourId === edge.end) {
        this.addGraphEdgeHighlight(currentId, neighbourId);
      } else if (currentId === edge.end && neighbourId === edge.start) {
        this.addGraphEdgeHighlight(neighbourId, currentId);
      }
    });
  }

  updateGraphLast = (result: GraphNode[]): void => {
    this.removeHighlightfromAllNodes();
    this.removeHighlightfromAllEdges();

    // Highlight nodes
    result.forEach((node, index) => {
      const { id } = node;
      const nodeElement = document.querySelector(`[data-node-id='${id}']`) !;
      if (index === 0) {
        nodeElement.classList.add('current-node');
      } else if (index === result.length - 1) {
        nodeElement.classList.add('special-node');
      } else {
        nodeElement.classList.add('neighbour-node');
      }
    });

    // Highlight edges
    for (let i = 0; i < result.length - 1; i++) {
      const id1 = result[i].id;
      const id2 = result[i+1].id;

      this.addGraphEdgeHighlight(id1, id2);
      this.addGraphEdgeHighlight(id2, id1);
    }
  }

  addGraphEdgeHighlight = (start: string, end: string): void => {
    const edgeElement = document.querySelector(`[data-start-id='${start}'][data-end-id='${end}']`);
    if (edgeElement) {
      edgeElement.classList.add('connection');
    }
  }

  removeHighlightfromAllNodes = (): void => {
    const nodeElements = document.querySelectorAll('.graph-node');
    nodeElements.forEach((nodeElem) => {
      nodeElem.classList.remove('current-node');
      nodeElem.classList.remove('neighbour-node');
      nodeElem.classList.remove('special-node');
    });
  }

  removeHighlightfromAllEdges = (): void => {
    const edgeElements = document.querySelectorAll('.graph-edge');
    edgeElements.forEach((edgeElem) => {
      edgeElem.classList.remove('connection');
    });
  }
};