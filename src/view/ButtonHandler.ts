export class ButtonHandler {
  constructor(public runBtn: string) {}

  darkenButton = (button: Element | string): void => {
    if (button instanceof Element) {
      button.classList.add('darken-3');
    } else {
      const element = document.querySelector(button) !;
      element.classList.add('darken-3');
    }
  }

  resetButton = (button: Element | string): void => {
    if (button instanceof Element) {
      button.classList.remove('darken-3');
    } else {
      const element = document.querySelector(button) !;
      element.classList.remove('darken-3');
    }
  }

  toggleButtons = (btnElements: HTMLElement[], enable: boolean): void => {
    if (enable) {
      btnElements.forEach((button) => {
        button.classList.remove('disabled');
      });
    } else {
      btnElements.forEach((button) => {
        button.classList.add('disabled');
      });
    }
  }

  toggleButton = (btnElement: HTMLElement, enable: boolean): void => {
    if (enable) {
      btnElement.classList.remove('disabled');
    } else {
      btnElement.classList.add('disabled');
    }
  }

  toggleRunBtn = (mode: ('play' | 'pause')): void => {
    const runBtn = document.querySelector(this.runBtn) !;

    if (mode === 'play') {
      runBtn.children[0].innerHTML = 'play_arrow';
      this.resetButton(runBtn);
    } else if (mode === 'pause') {
      runBtn.children[0].innerHTML = 'pause';
      this.darkenButton(runBtn);
    }
  }
}
