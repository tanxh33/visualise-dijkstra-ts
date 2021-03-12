export class TextDescription {
  textElement: HTMLElement;

  constructor(selector: string) {
    this.textElement = document.querySelector(selector) !;
  }

  setTextDescription = (html=''): void => {
    // Change the heading above the graph-table.
    this.textElement.innerHTML = html;
  }
}
