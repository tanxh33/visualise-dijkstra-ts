import { GraphStructure, GraphNode } from './GraphStructure';
import { APP_STATES } from './AppStates';
import { EXAMPLE_GRAPHS } from './GraphExamples';

import { WeightedGraph } from '../model/WeightedGraph';
import { Dijkstra } from '../model/Dijkstra';
import { UICtrl } from '../view/UiCtrl';

import { preventNonNumberKeydown, getLabelOfNodeFromId, checkIfNodeExists, checkIfEdgeExists } from './utils';
import { openModal, closeModal } from '../view/ModalUtil';

class Controller {
  /**
   * Contains a lot of event handling functions.
   * Interacts with View and Model components.
   * Could use refactoring
   */

  // Current state information
  currentGraph: GraphStructure = { nodes: [], edges: [] };
  currentState: string = APP_STATES.NONE;

  // A counter to track which step is being shown while in running mode
  stepCounter: number = 0;
  stepMax: number = 0;

  // Graph implemented with an adjacency list
  weightedGraph: WeightedGraph = new WeightedGraph();

  // Dijkstra's algorithm, the result, and starting and ending points for initialisation
  dijkstras?: Dijkstra;
  processedResult: GraphNode[] = [];
  algoStart: GraphNode | null = null;
  algoEnd: GraphNode | null = null;

  // Prediction-mode related
  predictionMode: boolean = false;
  showTips: boolean = true;
  predictionInput: GraphNode[] = [];
  currentPredSelection?: GraphNode;
  predSelectionNeighbours: GraphNode[] = [];
  predictionCost: number = 0;

  // Autorun-related
  autorunInstance?: number;
  autorunInterval: number = 500;

  // Index of the last example graph retrieved
  exampleGraphIdx: number = 0;

  ui: UICtrl = new UICtrl();
  initText: string = `
    <h5>Visualising Dijkstra's Algorithm</h5>
    <p>This is a tool for learners to understand Dijkstra's shortest path algorithm.</p><br />
    <h6>How to Use</h6>
    <p>- <span class="strong">Make your own graph</span> by adding nodes and edges with the buttons on the top left.</p>
    <p>- <span class="strong">Run the algorithm</span> to find the least-cost path between two nodes.</p>
    <p>- <span class="strong">Watch and learn</span> as the algorithm finds the solution step-by-step.</p>
    <p>- <span class="strong">Adjust the step or speed</span> with the control buttons.</p>
    <p>- Try out some pre-made graphs with the <span class="strong">'Load Example'</span> button.</p><br />  
    <h6>About</h6>
    <p>Dijkstra's algorithm finds the least-cost (shortest) path between two given nodes in a graph, which can represent road networks or computer network architectures.</p><br />
    <p>
      This tool does not support directed graphs, although the algorithm works on both directed and undirected graphs. The generic algorithm does not work on negative weight values.
      <a href="https://en.wikipedia.org/wiki/Dijkstra%27s_algorithm" target="_blank">Wikipedia</a>
    </p><br />
  `;

  constructor() {
    document.addEventListener('DOMContentLoaded', () => {
      this.ui.init();
      this.init();
    });

    this.loadEventListeners();

    console.log('App initialised.');
  }

  // Called on DOM load
  loadEventListeners = (): void => {
    document.querySelector(this.ui.selectors.addNodeBtn) !.addEventListener('click', this.addNodeHandler);
    document.querySelector(this.ui.selectors.addNodeSubmitBtn) !.addEventListener('click', this.addNodeSubmitHandler);
    document.querySelector(this.ui.selectors.addEdgeBtn) !.addEventListener('click', this.addEdgeHandler);
    document.querySelector(this.ui.selectors.addEdgeSubmitBtn) !.addEventListener('click', this.addEdgeSubmitHandler);
    document.querySelector(this.ui.selectors.deleteBtn) !.addEventListener('click', this.deleteButtonHandler);

    document.querySelector(this.ui.selectors.runBtn) !.addEventListener('click', this.runBtnHandler);
    document.querySelector(this.ui.selectors.runStartBtn) !.addEventListener('click', this.initAlgorithm);
    document.querySelector(this.ui.selectors.prevBtn) !.addEventListener('click', this.previousBtnHandler);
    document.querySelector(this.ui.selectors.nextBtn) !.addEventListener('click', this.nextBtnHandler);
    document.querySelector(this.ui.selectors.skipBtn) !.addEventListener('click', this.skipAlgorithm);
    document.querySelector(this.ui.selectors.stopBtn) !.addEventListener('click', this.stopRunning);

    document.querySelector(this.ui.selectors.refreshBtn) !.addEventListener('click', this.refresh);
    document.querySelector(this.ui.selectors.loadExBtn) !.addEventListener('click', this.loadExampleGraph);

    document.querySelector(this.ui.selectors.autorunSlider) !.addEventListener('input', (e: Event) =>
      this.resetAutorun((e.target as HTMLInputElement).value)
    );
    document.querySelector(this.ui.selectors.dontShowTipsAgain) !.addEventListener('change', (e: Event) =>
      this.showTips = !(e.target as HTMLInputElement).checked
    );

    // Press 'enter' to submit within modals
    document.querySelector(this.ui.selectors.addNodeModal) !.addEventListener(
      'keydown', (e: KeyboardEventInit) => { if (e.key === 'Enter') this.addNodeSubmitHandler(); }
    );
    document.querySelector(this.ui.selectors.addEdgeModal) !.addEventListener(
      'keydown', (e: KeyboardEventInit) => { if (e.key === 'Enter') this.addEdgeSubmitHandler(); }
    );
    document.querySelector(this.ui.selectors.runAlgoModal) !.addEventListener(
      'keydown', (e: KeyboardEventInit) => { if (e.key === 'Enter') this.initAlgorithm(); }
    );

    // Prevent entering non-numbers into number field
    (<HTMLInputElement>document.querySelector(this.ui.selectors.addEdgeWeightInput)).addEventListener('keydown', preventNonNumberKeydown);

    window.addEventListener('keydown', this.globalKeyDown);
  }

  // Called on DOM load and from refresh()
  init = (): void => {
    this.currentState = APP_STATES.NONE;
    this.currentGraph = { nodes: [], edges: [] };
    this.weightedGraph.resetGraph();
    this.enableEdgeBtnLogic();
    this.enableDeleteBtnLogic();
    this.enableRunBtnLogic();
    this.ui.resetAll(this.currentState);
    this.ui.toggleButtonSet2(false);
    this.ui.drawTable([]);
    this.ui.setTextDescription(this.initText);
    this.resetAutorun((document.querySelector(this.ui.selectors.autorunSlider) as HTMLInputElement).value);
    this.showTips = !(document.querySelector(this.ui.selectors.dontShowTipsAgain) as HTMLInputElement).checked;
  }

  // Used for resetting the graph and the UI
  refresh = (): void => {
    // Basically init() but with an extra toast message
    this.ui.toast({ html: `Graph cleared`, displayLength: 1000 });
    this.init();
  }

  drawGraphAndTable = (): void => {
    this.ui.resetCanvas(this.currentState);
    this.ui.drawGraph(this.currentGraph.nodes, this.currentGraph.edges, this.graphClickHandler);
    this.ui.drawTable(this.currentGraph.nodes);
  }

  loadExampleGraph = (): void => {
    this.currentState = APP_STATES.NONE;

    // We don't want the same graph as last time, so we RNG a new index
    let randomGraphIdx = this.exampleGraphIdx;
    while (randomGraphIdx === this.exampleGraphIdx) {
      randomGraphIdx = Math.floor(Math.random() * EXAMPLE_GRAPHS.length);
    }
    this.exampleGraphIdx = randomGraphIdx;  // Update variable
    this.currentGraph = JSON.parse(JSON.stringify(EXAMPLE_GRAPHS[randomGraphIdx]));  // Deep copy

    const { nodes, edges } = this.currentGraph;

    // Reset then add to the Weighted Graph data structure:
    this.weightedGraph.resetGraph();
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i].id;
      this.weightedGraph.addNode(node);
    }
    for (let i = 0; i < edges.length; i++) {
      const {start, end, weight} = edges[i];
      this.weightedGraph.addEdge(start, end, weight);
    }

    // Reset UI, then draw to UI:
    this.ui.resetAll(this.currentState);
    this.enableDeleteBtnLogic();
    this.enableEdgeBtnLogic();
    this.enableRunBtnLogic();

    this.drawGraphAndTable();
    this.ui.setTextDescription(this.initText);
    this.ui.toast({ html: `Graph loaded`, displayLength: 1000 });
  }

  // -------------------
  // Add node funcs
  // -------------------
  addNodeHandler = (): void => {
    this.ui.lightenDrawButtons();
    // Turn on add node mode
    if (this.currentState !== APP_STATES.NODE_EDIT) {
      this.currentState = APP_STATES.NODE_EDIT;
      this.ui.toggleGrid(true);
      this.ui.darkenButton(this.ui.selectors.addNodeBtn);
      this.ui.toast({ html: `Add node mode`, displayLength: 1000 });
    } else {
      // Turn off add node mode
      this.currentState = APP_STATES.NONE;
      this.ui.toggleGrid(false);
    }
  }

  addNodeSubmitHandler = (): void => {
    // Get the node label string and perform basic error checking.
    const labelInput = document.querySelector(this.ui.selectors.addNodeLabel) as HTMLInputElement;
    const label = labelInput.value.trim();
    if (label === '') return;
    if (checkIfNodeExists(this.currentGraph.nodes, label)) return;

    // Reset input fields
    labelInput.value = '';
    M.updateTextFields();
    closeModal(this.ui.selectors.addNodeModal);

    // Actually add the node
    this.addNode(this.ui.addNodeX !, this.ui.addNodeY !, label);
    this.ui.addNodeX = null;
    this.ui.addNodeY = null;
  }

  addNode = (x: number, y: number, label: string): void => {
    // Get the highest of the ids in the currentGraph, then add 1 (very hacky)
    const id = String(
      Math.max(...this.currentGraph.nodes.map(node => parseInt(node.id)), -1) + 1
    );

    const newNode = {id, label, x, y};

    // Add to currentGraph
    this.currentGraph.nodes.push(newNode);

    // Add to data structure
    this.weightedGraph.addNode(id);

    // Redraw UI
    this.drawGraphAndTable();

    // Reset button appearance
    this.enableDeleteBtnLogic();
    this.enableEdgeBtnLogic();
    this.enableRunBtnLogic();
  }

  // -------------------
  // Add edge funcs
  // -------------------
  addEdgeHandler = (): void => {
    this.ui.lightenDrawButtons();
    this.ui.toggleGrid(false);  // Get rid of "add node" grid in case it's there
    this.ui.resetValues();
    if (this.currentState !== APP_STATES.EDGE_EDIT) {
      // Turn on "add edge" mode. graphClickHandler will check this state.
      this.currentState = APP_STATES.EDGE_EDIT;
      this.ui.darkenButton(this.ui.selectors.addEdgeBtn);
      this.ui.toast({ html: `Add edge mode`, displayLength: 1000 });
    } else {
      // Turn off "add edge" mode
      this.currentState = APP_STATES.NONE;
    }
  }

  addEdgeSubmitHandler = (): void => {
    const weightInput = document.getElementById('add-edge-weight') as HTMLInputElement;
    const weight = parseInt(weightInput.value);
    if (!weight || weight <= 0) {
      return;
    }
    weightInput.value = '1';
    M.updateTextFields();

    closeModal(this.ui.selectors.addEdgeModal);

    this.addEdge(this.ui.addEdgeStart !, this.ui.addEdgeEnd !, weight);
  }

  addEdge = (start: string, end: string, weight: number): void => {
    // Add to currentGraph
    const newEdge = {start, end, weight};
    this.currentGraph.edges.push(newEdge);

    // Add to data structure
    this.weightedGraph.addEdge(start, end, weight);

    // Redraw UI
    this.drawGraphAndTable();
  }

  // -------------------
  // Delete object funcs
  // -------------------
  deleteButtonHandler = (): void => {
    this.ui.lightenDrawButtons();
    this.ui.toggleGrid(false);
    this.ui.resetValues();

    if (this.currentState !== APP_STATES.DELETE_OBJ) {
      // Turn on "delete object" mode.
      this.currentState = APP_STATES.DELETE_OBJ;
      this.ui.darkenButton(this.ui.selectors.deleteBtn);
      this.ui.toast({ html: `Delete mode`, displayLength: 1000 });
    } else {
      // Turn off "delete object" mode.
      this.currentState = APP_STATES.NONE;
      this.ui.toggleGrid(false);
    }
  }

  deleteNode = (id: string): void => {
    // Deleting a Node also removes all the Edges connected to it.
    this.currentGraph.edges = this.currentGraph.edges.filter((edge) =>
      edge.start !== id && edge.end !== id
    );
    this.currentGraph.nodes = this.currentGraph.nodes.filter((node) =>
      node.id !== id
    );

    // Remove Node from data structure
    this.weightedGraph.removeNode(id);

    // Redraw UI
    this.drawGraphAndTable();

    this.enableEdgeBtnLogic();
    this.enableDeleteBtnLogic();
    this.enableRunBtnLogic();
  }

  deleteEdge = (start: string, end: string): void => {
    // Remove Edge from the app Graph
    this.currentGraph.edges = this.currentGraph.edges.filter((edge) =>
      !(edge.start === start && edge.end === end) &&
      !(edge.end === start && edge.start === end)
    );

    // Remove Edge from data structure
    this.weightedGraph.removeEdge(start, end);

    // Redraw UI
    this.drawGraphAndTable();
  }

  // -------------------
  // Algo init funcs
  // -------------------
  runBtnHandler = (): void => {
    if (this.algoIsRunning() && this.stepCounter === this.stepMax) {
      return;
    }
    if (this.currentState === APP_STATES.RUNNING) {
      this.stopAutorun();
      return;
    }
    if (this.currentState === APP_STATES.PAUSED) {
      this.startAutorun();
      return;
    }
    if (this.currentState === APP_STATES.PREDICTING) {
      this.calculatePredictionCost();
      this.processAlgorithm();
      return;
    }

    // Open run-algo-modal.
    // Select start and end nodes for the algorithm.
    this.ui.lightenDrawButtons();
    this.ui.toggleGrid(false);
    this.ui.resetValues();
    this.populateSelects();
    openModal(this.ui.selectors.runAlgoModal);
  }

  previousBtnHandler = (): void => {
    this.stopAutorun();
    this.previousStep()
  }

  nextBtnHandler = (): void => {
    this.stopAutorun();
    this.nextStep()
  }

  populateSelects = (): void => {
    const selects = document.querySelectorAll('select');

    selects.forEach(select => {
      while (select.options.length > 1) {
        select.options.remove(1);
      }

      for (let i = 0; i < this.currentGraph.nodes.length; i++) {
        const option = document.createElement("option");
        // option.value = this.currentGraph.nodes[i].id;s
        option.text = this.currentGraph.nodes[i].label;
        select.options.add(option);
      }
    });

    M.FormSelect.init(selects, { classes: 'mb-3' });
    document.querySelector(this.ui.selectors.runAlgoModal + ' .helper-text') !.classList.add('hidden');
  }

  initAlgorithm = (): void => {
    // Get start and end values from selects
    const startInstance = M.FormSelect.getInstance(document.getElementById('algo-start') !);
    const endInstance = M.FormSelect.getInstance(document.getElementById('algo-end') !);
    const startLabel = startInstance.input.value;
    const endLabel = endInstance.input.value;

    if (startLabel === endLabel) {
      // Show error message
      document.querySelector(this.ui.selectors.runAlgoModal + ' .helper-text') !.classList.remove('hidden');
      return;
    }

    // Set global state to the start and end nodes' IDs
    this.algoStart = this.currentGraph.nodes.filter(node => node.label === startLabel)[0];
    this.algoEnd = this.currentGraph.nodes.filter(node => node.label === endLabel)[0];
    if (!this.algoStart) return;
    if (!this.algoEnd) return;
    // console.log(`run: start=${this.algoStart.id}, end=${this.algoEnd.id}`);

    closeModal(this.ui.selectors.runAlgoModal);

    // Handle prediction mode if we need to, otherwise process algorithm
    this.predictionMode = (document.querySelector(this.ui.selectors.runAlgoGuess) as HTMLInputElement).checked;
    if (this.predictionMode) {
      this.currentState = APP_STATES.PREDICTING;
      if (this.showTips) {
        openModal(this.ui.selectors.predictTipsModal);
      }
      this.getUserPrediction();
    } else {
      this.processAlgorithm();
    }
  }

  // -------------------
  // Algo running funcs
  // -------------------
  processAlgorithm = (): void => {
    this.currentState = APP_STATES.RUNNING;
    this.ui.toggleRunBtn('pause');
    this.ui.toggleButtonSet1(false);
    this.ui.toggleButtonSet2(true);

    // Disable other buttons
    this.drawGraphAndTable();
    this.ui.setTextDescription();

    // Instantiate Dijkstra
    this.dijkstras = new Dijkstra(
      this.weightedGraph.adjacencyList,
      this.algoStart !.id,
      this.algoEnd !.id
    );

    // Run Dijkstra, obtain solution.
    // Dijkstra.result is the final result.
    // Dijkstra.algoSteps contains intermediate steps.
    this.processedResult = this.dijkstras.run().map((item) => {
      return this.currentGraph.nodes.filter(node => node.id === item)[0];
    });

    this.stepCounter = 0;
    this.stepMax = this.dijkstras.algoSteps.length - 1;
    this.updateStep();
    this.startAutorun();
  }

  algoStateToTextDesc = (): string => {
    // Output different HTML strings based on which state.flag is provided
    const { costFromStartTo, current, state } = this.dijkstras !.algoSteps[this.stepCounter];
    const currentLabel = current ? getLabelOfNodeFromId(this.currentGraph.nodes, current) : null;
    let outStr = '';

    // In this switch statement, these states do not involve a neighbouring node.
    switch (state.flag) {
      case 0:  // Initialise
        return `
          <p>Initialised lists.</p>
          <p>Costs for all nodes initialised as Infinity.</p>
        `;
      case 1:  // Consider the next "current" node in the priority queue
        return `
          <p>
            Evaluating the next node with lowest "priority" value:
            <span class="current-node">${currentLabel} (#${current})</span>
          </p>
        `;
      case 6:  // Found a solution!
        return `
          <p>
            Current node:
            <span class="current-node">${currentLabel}</span>
            = destination node, so we've found a solution!
          </p>
        `;
      case 7:  // Looping back through "prevVisted" until the starting point
        outStr = `
          <p>From the destination node, we go back to the starting node through the closest neighbours, and add them to a list.</p>
          <br />
          <p>
            Current node:
            <span class="current-node">${currentLabel}</span>
            (#${current})
          </p>
          <br />
          <p>Least-cost path result:</p>
        `;
        state.result!.forEach((nodeId) => {
          const nodeLabel = getLabelOfNodeFromId(this.currentGraph.nodes, nodeId)
          if (nodeId === current) {
            outStr += `<p>(#${nodeId}) <span class="current-node">${nodeLabel}</span></p>`;
          } else {
            outStr += `<p>(#${nodeId}) ${nodeLabel}</p>`;
          }
        });
        return outStr;
      case 8:  // Last step, show the solution for the least-cost path and predicted path if applicable
        outStr = `
          <p>Reverse the list, and we have the solution!</p>
          <br />
          <p class="strong">Least-cost path result (cost = ${state.bestCost}):</p>
        `;
        this.processedResult.forEach((node, i) => {
          let classname = '';
          if (i === 0) {
            classname = 'current-node';
          } else if (i === this.processedResult.length - 1) {
            classname = 'special-node';
          } else {
            classname = 'neighbour-node'
          }
          outStr += `<p>(#${node.id}) <span class="${classname}">${node.label}</span></p>`;
        });
        if (this.predictionMode) {
          outStr += `
            <br/>
            <p class="strong">Your predicted path (cost = ${this.predictionCost}):</p>
          `;
          this.predictionInput.forEach(node => {
            outStr += `<p>(#${node.id}) ${node.label}</p>`;
          });
        }
        return outStr;
      case 9:  // No result case
        return `
          <p>
            The algorithm has searched through all the neighbours connected by edges, but couldn't find any edges that connect to the destination.
          </p>
          <br />
          <p>
            We couldn't find a least-cost path because there is no path. Too bad...
          </p>
          `;
      default: break;
    }  // end-switch-1

    // We now need to consider the neighbouring node
    const neighbourLabel = state.neighbour ? getLabelOfNodeFromId(this.currentGraph.nodes, state.neighbour): null;
    // Boolean that solves a quirk when displaying the first iteration
    const isNeighbourSameAsStart = current === this.algoStart!.id;
    // Convert null entries back to Infinity, because JSONification messed it up
    const costFromStartToNeighbourNode =
      costFromStartTo[state.neighbour !] === null ?
      Infinity :
      costFromStartTo[state.neighbour !];

    // Base HTML string for the following switch statement
    outStr = `
      <p>Current node:
        <span class="current-node">${currentLabel} (#${current})</span>
      </p>
      <br />
      <p>Loop through the neighbouring nodes of the current node and evaluate their cost.</p>
      <br />
      <p>1. Neighbour node:
        <span class="neighbour-node">${neighbourLabel} (#${state.neighbour})</span>
      </p>
      <p>2. Cost from start (${this.algoStart!.label}) to 
        ${isNeighbourSameAsStart ? '' :
          `<span class="current-node">${currentLabel}</span> to`
        }
        <span class="neighbour-node">${neighbourLabel}</span>
        = ${state.costToNeighbour}
      </p>
      ${isNeighbourSameAsStart ? '' :
        `<p>
          3. Cost from start (${this.algoStart!.label}) to
          <span class="neighbour-node">${neighbourLabel}</span>
          = ${costFromStartToNeighbourNode}
          ${state.flag === 4 ? '<span class="neighbour-node">(updated)</span>' : ''}
        </p>`
      }
      <br />
    `;

    switch (state.flag) {
      case 2:  // Just show the base string
        break;
      case 3:  // Found a better path to the neighbour node
        outStr += `
          <p>
            Since ${state.costToNeighbour} < ${costFromStartToNeighbourNode}, we should update the information for
            <span class="neighbour-node">${neighbourLabel}</span>.
          </p>
          `;
        break;
      case 4:  // Updated lists with better path information
        outStr += `
          <p>
            Updated information for
            <span class="neighbour-node">${neighbourLabel}</span> in the table.
          </p>`;
        break;
      case 5:  // Didn't find a better path, don't update the lists
        outStr += `
          <p>
            Since ${state.costToNeighbour} is not < ${costFromStartToNeighbourNode}, we don't update the lists.
          </p>
        `;
        break;
      default: return 'Error with state.flag';
    }  // end-switch-2

    return outStr;
  }

  updateStep = (): void => {
    this.ui.setTextDescription(
      `<h5>From ${this.algoStart!.label} to ${this.algoEnd!.label}</h5>` +
      this.algoStateToTextDesc()
    );

    this.ui.updateTable(
      this.currentGraph.nodes,
      this.dijkstras !.algoSteps[this.stepCounter],
      this.algoStart!
    );

    if (this.stepCounter === this.stepMax) {
      // Special action for final step
      this.ui.updateGraphLast(this.processedResult);
      this.ui.toggleButtonSet3(false);
      this.stopAutorun();
    } else {
      this.ui.updateGraph(this.currentGraph, this.dijkstras !.algoSteps[this.stepCounter]);
      this.ui.toggleButtonSet3(true);
    }
  }

  previousStep = (): void => {
    if (!(this.algoIsRunning())) { return; }
    if (this.stepCounter <= 0) { return; }

    this.stepCounter--;
    this.updateStep();
  }

  nextStep = (): void => {
    if (!(this.algoIsRunning())) { return; }
    if (this.stepCounter >= this.stepMax) { return; }

    this.stepCounter++;
    this.updateStep();
  }

  skipAlgorithm = (): void => {
    if (!(this.algoIsRunning())) { return; }

    this.stopAutorun();
    this.stepCounter = this.stepMax;
    this.updateStep();
  }

  stopRunning = (): void => {
    if (!(this.algoIsRunning())) { return; }

    this.stopAutorun();
    this.currentState = APP_STATES.NONE;
    this.ui.toggleButtonSet3(true);
    this.ui.toggleButtonSet1(true);
    this.ui.toggleButtonSet2(false);
    this.algoStart = null;
    this.algoEnd = null;
  }

  // -------------------
  // Play/Pause funcs
  // -------------------
  startAutorun = (): void => {
    this.currentState = APP_STATES.RUNNING;
    this.autorunInstance = setInterval(this.nextStep, this.autorunInterval);
    this.ui.toggleRunBtn('pause');
  }

  stopAutorun = (): void => {
    clearInterval(this.autorunInstance);
    this.currentState = APP_STATES.PAUSED;
    this.ui.toggleRunBtn('play');
  }

  resetAutorun = (value: string): void => {
    // Adjust time interval between algorithm step updates.
    switch (value) {
      case '0': this.autorunInterval = 2000; break;
      case '1': this.autorunInterval = 1250; break;
      case '2': this.autorunInterval = 800; break;
      case '3': this.autorunInterval = 500; break;
      case '4': this.autorunInterval = 250; break;
      case '5': this.autorunInterval = 100; break;
      case '6': this.autorunInterval = 65; break;
      default: break;
    }

    if (this.currentState === APP_STATES.RUNNING) {
      clearInterval(this.autorunInstance);
      this.autorunInstance = setInterval(this.nextStep, this.autorunInterval);
    }
  }

  // -------------------
  // Algo prediction mode funcs
  // -------------------
  getUserPrediction = (): void => {
    // User will start running the algorithm by pressing run-btn again.
    this.ui.toggleButtonSet1(false);
    this.ui.graphUtil.removeHighlightfromAllEdges();
    this.ui.graphUtil.removeHighlightfromAllNodes();
    this.predictionInput = [];
    this.predictionInput.push(this.algoStart !);
    this.updatePrediction();
  }

  updatePrediction = (): void => {
    // Update predictionCost
    this.calculatePredictionCost();

    this.ui.graphUtil.removeHighlightfromAllNodes();

    // Highlight the current (selected) node and the destination node:
    this.currentPredSelection = this.predictionInput[this.predictionInput.length - 1];
    document.querySelector(`[data-node-id='${this.currentPredSelection.id}']`) !.classList.add('current-node');
    document.querySelector(`[data-node-id='${this.algoEnd !.id}']`) !.classList.add('special-node');

    // Get the neighbours of the currently selected node:
    this.predSelectionNeighbours = [];
    const neighbourIds = Object.keys(this.weightedGraph.adjacencyList[this.currentPredSelection.id]);
    neighbourIds.forEach(id => {
      const node = this.currentGraph.nodes.filter(node => id === node.id)[0];
      this.predSelectionNeighbours.push(node);
    });

    // Highlight the neighbours of the current (selected) node
    this.predSelectionNeighbours.forEach((node) => {
      document.querySelector(`[data-node-id='${node.id}']`) !.classList.add('neighbour-node');
    });

    this.setPredictionText();
  }

  calculatePredictionCost = (): void => {
    this.predictionCost = 0;
    for (let i = 1; i < this.predictionInput.length; i++) {
      const prevId = this.predictionInput[i-1].id;
      const nextId = this.predictionInput[i].id;
      this.predictionCost += this.weightedGraph.adjacencyList[prevId][nextId];
    }
  }

  // Show a custom text description for Prediction Mode
  setPredictionText = (): void => {
    let predStr = '';

    this.predictionInput.forEach(node => {
      predStr += `<p>(#${node.id}) ${node.label}</p>`;
    });

    this.ui.setTextDescription(`
      <h5>From ${this.algoStart !.label} to ${this.algoEnd !.label}</h5>
      <p class="strong">Predict the least-cost (shortest) path:</p>
      <p>Compare your human intuition to the algorithm's result!</p><br />
      <p>Click on a <span class="strong neighbour-node">neighbouring node</span> to add to your predicted path.</p>
      <p>Click on the <span class="strong current-node">source node</span> to remove it from your predicted path.</p>
      <p>Click on the <span class="strong">run button</span> again to run the algorithm.</p><br />
      <p class="strong">Selected path (cost = ${this.predictionCost}):</p>
    ` + predStr
    );
  }

  // Enable or disable these buttons based on certain conditions
  // (i.e. how many nodes in the graph)
  enableEdgeBtnLogic = (): void => {
    if (this.currentGraph.nodes.length >= 2) {
      this.ui.toggleButton(document.querySelector(this.ui.selectors.addEdgeBtn) !, true);
    } else {
      // if num_nodes is 0 or 1, we can't add an edge
      this.ui.toggleButton(document.querySelector(this.ui.selectors.addEdgeBtn) !, false);
    }
  }

  enableDeleteBtnLogic = (): void => {
    if (this.currentGraph.nodes.length >= 1) {
      this.ui.toggleButton(document.querySelector(this.ui.selectors.deleteBtn) !, true);
    } else {
      // if num_nodes is 0, get out of DELETE mode
      this.ui.toggleButton(document.querySelector(this.ui.selectors.deleteBtn) !, false);
      this.currentState = APP_STATES.NONE;
    }
  }

  enableRunBtnLogic = (): void => {
    if (this.currentGraph.nodes.length >= 2) {
      this.ui.toggleButton(document.querySelector(this.ui.selectors.runBtn) !, true);
    } else {
      this.ui.toggleButton(document.querySelector(this.ui.selectors.runBtn) !, false);
    }
  }

  // Long annoying conditional we keep using
  algoIsRunning = (): boolean => {
    return (
      this.currentState === APP_STATES.RUNNING ||
      this.currentState === APP_STATES.PAUSED
    );
  }

  // Left/right arrow key event handling
  globalKeyDown = (e: KeyboardEvent): void => {
    if (this.algoIsRunning()) {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previousBtnHandler();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.nextBtnHandler();
          break;
        default: break;
      } 
    }
  }

  // Handle add-edge and delete-object states.
  graphClickHandler = (e: Event): void => {

    // Get which element in the canvas was clicked.
    const getClickedObject = (e: Event): (HTMLElement | null) => {
      const clickTargetParent = (e.target as HTMLElement).parentNode as HTMLElement;
      if (clickTargetParent.classList.contains('graph-node') ||
          clickTargetParent.classList.contains('graph-edge')) {
        return clickTargetParent;
      } else {
        return null;
      }
    }  // end inner-func

    if (!(this.currentState === APP_STATES.EDGE_EDIT ||
          this.currentState === APP_STATES.DELETE_OBJ ||
          this.currentState === APP_STATES.PREDICTING)) {
      return;
    }

    const clickedObject = getClickedObject(e);
    if (!clickedObject) return;

    // Actions when app in add-edge state.
    if (this.currentState === APP_STATES.EDGE_EDIT) {
      // Exit if null or 'graph-edge'
      if (!clickedObject.classList.contains('graph-node')) {
        return;
      }

      // Highlight the selected node
      clickedObject.classList.add('focus');

      // Save node 1 id in edgeStart variable
      if (this.ui.addEdgeStart === null) {
        this.ui.addEdgeStart = clickedObject.dataset.nodeId !;
        return;
      }

      // Save node 2 in edgeEnd variable
      if (this.ui.addEdgeEnd === null) {
        this.ui.addEdgeEnd = clickedObject.dataset.nodeId !;

        // If n1 == n2, reset selection and return
        if (this.ui.addEdgeStart === this.ui.addEdgeEnd) {
          this.ui.deselectEdge();
          return;
        }
      }

      // If edge doesn't already exist, add edge to app data structure, and draw to UI.
      if (!checkIfEdgeExists(this.currentGraph.edges, this.ui.addEdgeStart, this.ui.addEdgeEnd)) {
        // Open modal:
        openModal(this.ui.selectors.addEdgeModal);
        const edgeWeightInput = document.querySelector(this.ui.selectors.addEdgeWeightInput) as HTMLInputElement;
        edgeWeightInput.focus();
        edgeWeightInput.select();
        // Weight value input and redrawing UI occurs at addEdgeSubmitHandler()
      } else {
        // Edge already exists; ignore and reset selections:
        this.ui.deselectEdge();
      }
      return;
    } // end if-edge-edit

    // Actions when app in delete-object state.
    if (this.currentState === APP_STATES.DELETE_OBJ) {
      if (clickedObject.classList.contains('graph-node')) {
        const nodeId = clickedObject.dataset.nodeId;
        this.deleteNode(nodeId!);
        return;
      }
      else if (clickedObject.classList.contains('graph-edge')) {
        const start = clickedObject.dataset.startId;
        const end = clickedObject.dataset.endId;
        this.deleteEdge(start!, end!);
        return;
      }
    }  // end if-delete-obj

    // Actions for selecting nodes in predicting state.
    if (this.currentState === APP_STATES.PREDICTING) {
      if (!clickedObject.classList.contains('graph-node')) {
        return;
      }

      const clickedNodeId = clickedObject.dataset.nodeId;

      if (clickedNodeId === this.currentPredSelection!.id && 
          clickedNodeId !== this.algoStart!.id) {
        // Remove node from the prediction list
        this.predictionInput.pop();
        this.updatePrediction();
        return;
      }

      this.predSelectionNeighbours.forEach(node => {
        if (clickedNodeId === node.id) {
          // Add node to the prediction list
          this.predictionInput.push(node);
          this.updatePrediction();
          return;
        }
      });
    }  // end if-predicting
  };
}

export { Controller };
