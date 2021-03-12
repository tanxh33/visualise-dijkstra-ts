// Algorithm implemented with reference from:
// Article by Maiko Miyazaki:
//     Completed JavaScript Data Structure Course, and Here is What I Learned About Graph (+ Dijkstra Algorithm)
// Article link:
//     https://dev.to/maikomiyazaki/completed-javascript-data-structure-course-and-here-is-what-i-learned-about-graph-dijkstra-algorithm-57n8

import { AdjacencyList } from './WeightedGraph';
import { PriorityQueue } from './PriorityQueue';

interface State {
  /**
   * algoSteps.state.flag
   * 0: Initialised lists
   * 
   * 1: Top of while-loop
   *     Loop through neighbours
   *     2: Calculated cost to neighbour
   *         If better cost:
   *         3: Lists before update
   *         4: Updated lists
   *         Else:
   *         5: No update
   *     6: Solution found
   *     7: Push nodes to results array
   * 8: Return path solution
   * 9: No path solution found
   */

  flag: number;
  result?: string[];
  neighbour?: string;
  costToNeighbour?: number;
  bestCost?: number
};

export interface AlgoStep {
  // List 1 - Record vertices with numbers that represent total cost to start
  costFromStartTo: { [key: string]: number };
  // List 2 - tells you which node to check next
  checkList: PriorityQueue;
  // List 3 - Record vertices previously visited to find the vertex's current cost
  prevVisited: { [key: string]: string | null };

  current: string | null;
  state: State;
};

export class Dijkstra {
  costFromStartTo: { [key: string]: number } = {};
  checkList = new PriorityQueue();
  prevVisited: { [key: string]: string | null } = {};
  current: string | null = null;

  result: string[] = [];
  algoSteps: AlgoStep[] = [];

  constructor(
    public adjacencyList: AdjacencyList,
    public start: string,
    public finish: string
    ) {
    // Note that JavaScript processes object keys as strings even if they're given integers.
    // Thus start and finish arguments should be passed in as strings.
    this.initLists();
  }

  initLists = (): void => {
    // Initialise lists with Infinity and null values
    for (const node in this.adjacencyList) {
      if (node === this.start) {
        this.costFromStartTo[node] = 0;
        this.checkList.enqueue(node, 0);
      } else {
        this.costFromStartTo[node] = Infinity;
      }
      this.prevVisited[node] = null;
    };
    this.pushStateToSteps({ flag: 0 });
  }

  run = (): string[] => {
    while (this.checkList.values.length) {
      this.current = this.checkList.values[0].val;  // Read the value first to keep 'priority' in state

      this.pushStateToSteps({ flag: 1 });

      this.checkList.dequeue();  // Dequeue afterwards

      if (this.current === this.finish) {
        // Solution found
        this.pushStateToSteps({ flag: 6 });

        while (this.current && this.prevVisited[this.current]) {
          this.result.push(this.current);
          this.pushStateToSteps({ flag: 7, result: JSON.parse(JSON.stringify(this.result)) });
          this.current = this.prevVisited[this.current];
        }

        this.result.push(this.current !);
        this.pushStateToSteps({ flag: 7, result: JSON.parse(JSON.stringify(this.result)) });
        this.result = this.result.reverse();
        break;

      } else {
        for (const neighbour in this.adjacencyList[this.current]) {
          let costToNeighbour = this.costFromStartTo[this.current] + this.adjacencyList[this.current][neighbour];
          this.pushStateToSteps({ flag: 2, neighbour, costToNeighbour });

          if (costToNeighbour < this.costFromStartTo[neighbour]) {
            // Update list values for the current-neighbour node.
            this.pushStateToSteps({ flag: 3, neighbour, costToNeighbour });
            this.costFromStartTo[neighbour] = costToNeighbour;
            this.prevVisited[neighbour] = this.current;
            this.checkList.enqueue(neighbour, costToNeighbour);
            this.pushStateToSteps({ flag: 4, neighbour, costToNeighbour });
          } else {
            // Don't update list values
            this.pushStateToSteps({ flag: 5, neighbour, costToNeighbour });
          }
        };
      }  // end if-else
    }  // end-while

    if (this.result.length === 0) {
      this.pushStateToSteps({ flag: 9 });
    } else {
      this.pushStateToSteps({ flag: 8, bestCost: this.costFromStartTo[this.finish] });
    }

    return this.result;
  }

  pushStateToSteps = (state: State) => {
    this.algoSteps.push({
      costFromStartTo: JSON.parse(JSON.stringify(this.costFromStartTo)),
      checkList: JSON.parse(JSON.stringify(this.checkList)),
      prevVisited: JSON.parse(JSON.stringify(this.prevVisited)),
      current: this.current,
      state: state
    });
  }
}
