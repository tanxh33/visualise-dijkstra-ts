import { CanvasGraph } from './CanvasGraph';
import { NodeGrid } from './NodeGrid';
import { TextDescription } from './TextDescription';
import { Table } from './Table';
import { GraphUtil } from './GraphUtil';
import { ButtonHandler } from './ButtonHandler';
import { uiConfig } from './UiConfig';
import { initModal, openModal } from './ModalUtil';

import { GraphStructure, GraphNode, GraphEdge } from '../controller/GraphStructure';
import { APP_STATES } from '../controller/AppStates';
import { AlgoStep } from '../model/Dijkstra';

export class UICtrl {
  selectors: { [key: string ]: string };
  canvas: SVGElement;
  canvasGraph: CanvasGraph;
  nodeGrid: NodeGrid;
  table: Table;
  graphUtil: GraphUtil;
  textDescription: TextDescription;
  btnHandler: ButtonHandler;

  config = uiConfig;

  addNodeX: number | null = null;
  addNodeY: number | null = null;
  addEdgeStart: string | null = null;
  addEdgeEnd: string | null = null;

  constructor() {
    // Define relevant element selector strings here to reduce copy/paste
    this.selectors = {
      addNodeBtn: '#add-node-btn',
      addNodeModal: '#add-node-modal',
      addNodeLabel: '#add-node-label',
      addNodeSubmitBtn: '#add-node-submit-btn',
      addEdgeBtn: '#add-edge-btn',
      addEdgeModal: '#add-edge-modal',
      addEdgeWeightInput: '#add-edge-weight',
      addEdgeSubmitBtn: '#add-edge-submit-btn',
      deleteBtn: '#delete-btn',

      runBtn: '#run-btn',
      runStartBtn: '#run-start-btn',
      runAlgoModal: '#run-algo-modal',
      runAlgoGuess: '#run-algo-guess',
      predictTipsModal: '#predict-tips-modal',
      dontShowTipsAgain: '#dont-show-tips-again',
      prevBtn: '#prev-btn',
      nextBtn: '#next-btn',
      skipBtn: '#skip-btn',
      stopBtn: '#stop-btn',
      autorunSlider: '#autorun-slider',

      refreshBtn: '#refresh-btn',
      loadExBtn: '#load-ex-btn',
      infoBtn: '#info-btn',
      infoModal: '#info-modal',

      textDescription: '#text-description',
      graphTable: '#graph-table'
    };

    this.canvas = document.querySelector('#canvas') !;

    // Instantiate imported classes
    this.config = uiConfig;
    this.nodeGrid = new NodeGrid();
    this.canvasGraph = new CanvasGraph(this.canvas, this.nodeGrid);
    this.table = new Table(this.selectors.graphTable);
    this.graphUtil = new GraphUtil();
    this.textDescription = new TextDescription(this.selectors.textDescription);
    this.btnHandler = new ButtonHandler(this.selectors.runBtn);
  }

  // Invoked in Controller.ts on DOM load
  init = (): void => {
    // Initialise MaterialCSS component instances
    M.Tooltip.init(document.querySelectorAll('.tooltipped'), {
      inDuration: 250,
      outDuration: 150,
      transitionMovement: 3
    });

    initModal(this.selectors.addNodeModal);
    initModal(this.selectors.addEdgeModal, { onCloseEnd: this.deselectEdge });
    initModal(this.selectors.runAlgoModal);
    initModal(this.selectors.predictTipsModal);
    initModal(this.selectors.infoModal);

    this.createGrid();
    this.toggleGrid(false);
    console.log('UI initialised.');
  }

  drawGraph = (
    nodes: GraphNode[],
    edges: GraphEdge[],
    graphClickHandler: { (e: Event): void }
  ): void => {
    this.canvasGraph.drawGraph(nodes, edges, graphClickHandler);
  }

  createGrid = (): void => {
    this.nodeGrid.createGrid(this.canvas, this.gridClickHandler);
  }

  toggleGrid = (show: boolean): void => {
    this.nodeGrid.toggleGrid(show);
  }

  setTextDescription = (html=''): void => {
    this.textDescription.setTextDescription(html);
  }

  drawTable = (nodes: GraphNode[]): void => {
    this.table.drawTable(nodes);
  }

  updateTable = (nodes: GraphNode[], step: AlgoStep, algoStart: GraphNode): void => {
    this.table.updateTable(nodes, step, algoStart);
  }

  updateGraph = (graph: GraphStructure, step: AlgoStep): void => {
    this.graphUtil.updateGraph(graph, step);
  }

  updateGraphLast = (result: GraphNode[]): void => {
    this.graphUtil.updateGraphLast(result);
  }

  darkenButton = (button: Element | string): void => {
    this.btnHandler.darkenButton(button);
  }

  resetButton = (button: Element | string): void => {
    this.btnHandler.resetButton(button);
  }

  toggleButton = (btnElement: HTMLElement, enable: boolean): void => {
    this.btnHandler.toggleButton(btnElement, enable);
  }

  toggleRunBtn = (mode: ('play' | 'pause')): void => {
    this.btnHandler.toggleRunBtn(mode);
  }

  toggleButtonSet1 = (enable: boolean): void => {
    // Non-algo running functions
    this.btnHandler.toggleButtons([
      document.querySelector(this.selectors.addNodeBtn) !,
      document.querySelector(this.selectors.addEdgeBtn) !,
      document.querySelector(this.selectors.deleteBtn) !,
      document.querySelector(this.selectors.refreshBtn) !,
      document.querySelector(this.selectors.loadExBtn) !,
      document.querySelector(this.selectors.infoBtn) !
    ], enable);
  }

  toggleButtonSet2 = (enable: boolean): void => {
    // Algo running buttons except play button
    this.btnHandler.toggleButtons([
      document.querySelector(this.selectors.prevBtn) !,
      document.querySelector(this.selectors.nextBtn) !,
      document.querySelector(this.selectors.skipBtn) !,
      document.querySelector(this.selectors.stopBtn) !
    ], enable);
  }

  toggleButtonSet3 = (enable: boolean): void => {
    // Play button and skip button, disabled for the "last step"
    this.btnHandler.toggleButtons([
      document.querySelector(this.selectors.runBtn) !,
      document.querySelector(this.selectors.skipBtn) !,
    ], enable);
  }

  lightenDrawButtons = (): void => {
    (document.querySelector(this.selectors.addNodeBtn) !).classList.remove('darken-3');
    (document.querySelector(this.selectors.addEdgeBtn) !).classList.remove('darken-3');
    (document.querySelector(this.selectors.deleteBtn) !).classList.remove('darken-3');
  }

  toast = (options={}): void => {
    M.toast(options);
  }

  resetAll = (appState: string): void => {
    this.resetCanvas(appState);
    this.lightenDrawButtons();
    this.resetValues();

    this.createGrid();
    if (appState !== APP_STATES.NODE_EDIT) {
      this.toggleGrid(false);
    }
  }

  resetCanvas = (appState: string): void => {
    if (!this.canvas) return;
    this.canvas.innerHTML = '';
    this.createGrid();
    if (appState !== APP_STATES.NODE_EDIT) {
      this.toggleGrid(false);
    }
  }

  resetValues = (): void => {
    this.addEdgeStart = null;
    this.addEdgeEnd = null;
    this.addNodeX = null;
    this.addNodeY = null;
  }

  deselectEdge = (): void => {
    const startNode = document.querySelector(`[data-node-id='${this.addEdgeStart}']`) !;
    const endNode = document.querySelector(`[data-node-id='${this.addEdgeEnd}']`) !;
    startNode.classList.remove('focus');
    endNode.classList.remove('focus');
    this.resetValues();
  }

  // Handle add-node state. This function is called only from the add-node grid.
  gridClickHandler = (e: Event): void => {
    const clickTarget = e.target as HTMLElement;
    if (clickTarget.classList.contains('grid-circle')) {
      this.addNodeX = parseInt(clickTarget.dataset.gridX !);
      this.addNodeY = parseInt(clickTarget.dataset.gridY !);

      openModal(this.selectors.addNodeModal);
      (document.querySelector(this.selectors.addNodeLabel) as HTMLElement).focus();
      // Remaining code occurs at addNodeSubmitHandler()
    }
  };
}
