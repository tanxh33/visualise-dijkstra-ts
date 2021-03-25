import { GraphNode, GraphEdge } from '../controller/GraphStructure';
import { NodeGrid } from './NodeGrid';
import { uiConfig } from './UiConfig';

export class CanvasGraph {
  config = uiConfig;

  constructor(
    public canvas: SVGElement,
    public nodeGrid: NodeGrid
  ) {}

  // This function re-draws nodes and edges.
  // This is invoked whenever we make changes to the nodes and edges.
  drawGraph = (
    nodes: GraphNode[],
    edges: GraphEdge[],
    graphClickHandler: { (e: Event): void }
  ): void => {
    const svgns = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgns, 'g');
    group.id = 'graph-group';
    this.canvas.appendChild(group);
    // Is there another way to do this? The handler is defined in Controller.
    group.addEventListener('click', graphClickHandler);

    // Draw the edges, then the nodes
    edges.forEach(edge => {
      const startNode = nodes.filter(node => node.id === edge.start)[0];
      const endNode = nodes.filter(node => node.id === edge.end)[0];
      this.drawEdge(startNode, endNode, edge);
    });

    nodes.forEach(node => this.drawNode(node));
  }

  drawNode = (node: GraphNode): void => {
    const svgns = "http://www.w3.org/2000/svg";
    const nodeGroup = document.createElementNS(svgns, 'g');
    const circle = document.createElementNS(svgns, 'circle');
    const text = document.createElementNS(svgns, 'text');

    const { id, label, x, y } = node;
    const [x_pos, y_pos] = this.nodeGrid.getGridPos(y, x);

    circle.setAttributeNS(null, 'cx', String(x_pos));
    circle.setAttributeNS(null, 'cy', String(y_pos));
    circle.setAttributeNS(null, 'r', String(this.config.circleRadius));

    text.setAttributeNS(null, 'x', String(x_pos));
    text.setAttributeNS(null, 'y', String(y_pos + 6));
    text.setAttributeNS(null, 'text-anchor', 'middle');
    text.innerHTML = label;

    nodeGroup.classList.add('graph-node');
    nodeGroup.appendChild(circle);
    nodeGroup.appendChild(text);
    nodeGroup.dataset.nodeId = id;

    document.getElementById('graph-group') !.appendChild(nodeGroup);
  }

  drawEdge = (start: GraphNode, end: GraphNode, edge: GraphEdge) => {
    const svgns = "http://www.w3.org/2000/svg";
    const edgeGroup = document.createElementNS(svgns, 'g');
    const line = document.createElementNS(svgns, 'line');
    const text = document.createElementNS(svgns, 'text');

    const [x1, y1] = this.nodeGrid.getGridPos(start.y, start.x);
    const [x2, y2] = this.nodeGrid.getGridPos(end.y, end.x);
    const weight = edge.weight;

    line.setAttributeNS(null, 'x1', String(x1));
    line.setAttributeNS(null, 'y1', String(y1));
    line.setAttributeNS(null, 'x2', String(x2));
    line.setAttributeNS(null, 'y2', String(y2));

    // Draw text labels 5/13 = 38% the distance along the edge line:
    text.setAttributeNS(null, 'x', String((8*x1 + 5*x2) / 13));
    text.setAttributeNS(null, 'y', String((8*y1 + 5*y2) / 13 + 6));
    text.setAttributeNS(null, 'text-anchor', 'middle');
    text.innerHTML = String(weight);

    edgeGroup.classList.add('graph-edge');
    edgeGroup.appendChild(line);
    edgeGroup.appendChild(text);
    edgeGroup.dataset.startId = start.id;
    edgeGroup.dataset.endId = end.id;

    document.getElementById('graph-group') !.appendChild(edgeGroup);
  }
}
