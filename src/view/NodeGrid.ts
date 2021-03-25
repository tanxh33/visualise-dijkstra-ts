import { uiConfig } from "./UiConfig";

export class NodeGrid {
  /** 
   * The NodeGrid is a set of SVG circles used to 
   */
  config = uiConfig;

  createGrid = (canvas: SVGElement, gridClickHandler: { (e: Event): void }): void => {
    if (!canvas) return;

    const svgns = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(svgns, 'g');
    group.id = 'grid-group';
    group.addEventListener('click', gridClickHandler);

    for (let i = 0; i < this.config.gridRows; i++) {  // rows
      for (let j = 0; j < this.config.gridCols; j++) {  // cols
        const [x, y] = this.getGridPos(i, j);

        const circle = document.createElementNS(svgns, 'circle');
        circle.setAttributeNS(null, 'cx', String(x));
        circle.setAttributeNS(null, 'cy', String(y));
        circle.setAttributeNS(null, 'r', String(this.config.gridCircleRadius));
        circle.classList.add('grid-circle');
        circle.dataset.gridX = String(j);
        circle.dataset.gridY = String(i);

        group.appendChild(circle);
      }
    }

    canvas.insertBefore(group, canvas.childNodes[0]);
  }

  getGridPos = (row: number, col: number): [number, number] => {
    // Pass in zero-indexed x/y grid position
    const x = (col+1) * this.config.canvasWidth / (this.config.gridCols + 1);
    const y = (row+1) * this.config.canvasHeight / (this.config.gridRows + 1);
    return [x, y];
  }

  toggleGrid = (show: boolean): void => {
    const gridGroup = document.getElementById('grid-group') !;
    if (show) {
      gridGroup.style.display = 'block';
    } else {
      gridGroup.style.display = 'none'; 
    }
  }
}
