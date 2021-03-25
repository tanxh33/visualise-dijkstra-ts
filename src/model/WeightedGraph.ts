// Code implemented with reference from:
// Article by Maiko Miyazaki:
//     Completed JavaScript Data Structure Course, and Here is What I Learned About Graph (+ Dijkstra Algorithm)
// Article link:
//     https://dev.to/maikomiyazaki/completed-javascript-data-structure-course-and-here-is-what-i-learned-about-graph-dijkstra-algorithm-57n8

export interface AdjacencyList {
  [key: string]: {
    [key: string]: number
  }
};

export class WeightedGraph {
    /**
   * Example graph: (node1)--5--(node2)--10--(node3)
   * {
   *   1: { 2: 5 },
   *   2: { 1: 5, 3: 10 },
   *   3: { 2: 10 }
   * }
   */

  adjacencyList: AdjacencyList;

  constructor() {
    this.adjacencyList = {};
  }

  // Note that JS object keys are always typecasted to strings,
  // even if numbers are passed in to be keys.
  addNode = (node: string): void => {
    if (!this.adjacencyList[node]) {
      this.adjacencyList[node] = {};
    }
  }

  addEdge = (node1: string, node2: string, weight: number): void => {
    if (!this.adjacencyList[node1]) { this.addNode(node1); }
    if (!this.adjacencyList[node2]) { this.addNode(node2); }

    this.adjacencyList[node1][node2] = weight;
    this.adjacencyList[node2][node1] = weight;
  }

  removeEdge = (node1: string, node2: string): void => {
    delete this.adjacencyList[node1][node2];
    delete this.adjacencyList[node2][node1];
    // this.adjacencyList[node1] = this.adjacencyList[node1].filter(node => node !== node2);
    // this.adjacencyList[node2] = this.adjacencyList[node2].filter(node => node !== node1);
  }

  removeNode = (node: string): void => {
    for (let i in this.adjacencyList[node]) {
      this.removeEdge(node, i);
    }
    // while (this.adjacencyList[node]) {
    //   const adjacentNode = this.adjacencyList[node].pop();
    //   this.removeEdge(node, adjacentNode);
    // }
    delete this.adjacencyList[node];
  }

  printAdjList = (): void => {
    console.log(this.adjacencyList);
  }

  resetGraph = (): void => {
    this.adjacencyList = {};
  }
}
