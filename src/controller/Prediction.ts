import { AdjacencyList } from '../model/WeightedGraph';
import { GraphNode } from './GraphStructure';

export class Prediction {
  predictionInput: GraphNode[] = [];
  predictionCost: number = 0;
  currentPredSelection?: GraphNode;
  predSelectionNeighbours: GraphNode[] = [];

  constructor() {}

  updatePrediction = (nodes: GraphNode[], adjacencyList: AdjacencyList): void => {
    this.predictionCost = this.calculatePredictionCost(adjacencyList, this.predictionInput);

    this.ui.graph.removeHighlightfromAllNodes();

    this.currentPredSelection = this.predictionInput[this.predictionInput.length - 1];
    document.querySelector(`[data-node-id='${this.currentPredSelection.id}']`) !.classList.add('current-node');
    document.querySelector(`[data-node-id='${this.algoEnd !.id}']`) !.classList.add('special-node');

    this.predSelectionNeighbours = [];
    const neighbourIds = Object.keys(adjacencyList[this.currentPredSelection.id]);
    neighbourIds.forEach(id => {
      const node = nodes.filter(node => id === node.id)[0];
      this.predSelectionNeighbours.push(node);
    });

    this.predSelectionNeighbours.forEach((node) => {
      document.querySelector(`[data-node-id='${node.id}']`) !.classList.add('neighbour-node');
    });

    let predStr = '';
    this.predictionInput.forEach(node => {
      predStr += `<p>(#${node.id}) ${node.label}</p>`;
    });

    this.ui.setTextDescription(`
      <h5>From ${this.algoStart !.label} to ${this.algoEnd !.label}</h5>
      <p class="strong">Predict the shortest path:</p>
      <p>Compare your human intuition to the algorithm's result!</p><br />
      <p>Click on a <span class="strong neighbour-node">neighbouring node</span> to add to your predicted path.</p>
      <p>Click on the <span class="strong current-node">source node</span> to remove it from your predicted path.</p>
      <p>Click on the <span class="strong">run button</span> again to run the algorithm.</p><br />
      <p class="strong">Selected path (cost = ${this.predictionCost}):</p>
    ` + predStr);
  }

  calculatePredictionCost = (adjacencyList: AdjacencyList, predictionInput: GraphNode[]): number => {
    let predictionCost = 0;
    for (let i = 1; i < predictionInput.length; i++) {
      const prevId = predictionInput[i-1].id;
      const nextId = predictionInput[i].id;
      predictionCost += adjacencyList[prevId][nextId];
    }
    return predictionCost;
  }
}
