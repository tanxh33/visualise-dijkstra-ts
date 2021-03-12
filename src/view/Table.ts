import { GraphNode } from '../controller/GraphStructure';
import { QueueItem } from '../model/PriorityQueue';
import { AlgoStep } from '../model/Dijkstra';
import { getLabelOfNodeFromId } from '../controller/utils';

export class Table {
  constructor(public tableElement: string) {}

  drawTable = (nodes: GraphNode[]): void => {
    // This is only for populating the table with the id and labels of nodes.
    const tbody = document.querySelector(this.tableElement + ' tbody') !;
    tbody.innerHTML = '';
    nodes.forEach(node => {
      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td>${node.id}</td>
        <td>${node.label}</td>
        <td></td>
        <td></td>
        <td></td>
      `;
      tbody.appendChild(tableRow);
    });
  }
  
  updateTable = (nodes: GraphNode[], step: AlgoStep, algoStart: GraphNode): void => {
    // Extract the required data from the dijkstra algo step:
    const { costFromStartTo, checkList, prevVisited, current, state } = step;
    const priorities: { [key: string]: QueueItem } = {};
    checkList.values.forEach(valPrio => priorities[valPrio.val] = valPrio);

    const tbody = document.querySelector(this.tableElement + ' tbody') !;
    tbody.innerHTML = '';
    nodes.forEach((node) => {
      const { id, label } = node;
      const cost = id === algoStart.id ? 0 : costFromStartTo[id] || Infinity;
      const priority = priorities[id] ? priorities[id].priority : '';
      const prevIdStr = prevVisited[id] ? `(#${prevVisited[id]})` : '';
      const prevLabel = prevVisited[id] ? getLabelOfNodeFromId(nodes, prevVisited[id] !) : '';

      const tableRow = document.createElement('tr');
      tableRow.innerHTML = `
        <td>${id}</td>
        <td>${label}</td>
        <td>${cost}</td>
        <td>${priority}</td>
        <td>${prevIdStr} ${prevLabel}</td>
      `;
      if (current === id) {
        tableRow.classList.add('current-node');
      }
      if (state.neighbour && state.neighbour === id) {
        tableRow.classList.add('neighbour-node');
      }
      tbody.appendChild(tableRow);
    });
  }
}
