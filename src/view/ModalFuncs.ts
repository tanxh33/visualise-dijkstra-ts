export const initModal = (selector: string, options={}): void => {
  M.Modal.init((document.querySelector(selector) !), options);
};

export const openModal = (selector: string): void => {
  M.Modal.getInstance(document.querySelector(selector) !).open();
};

export const closeModal = (selector: string): void => {
  M.Modal.getInstance(document.querySelector(selector) !).close();
};
