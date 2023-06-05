import {createElement} from '../render.js';

const createListEvent = () => (
  '<ul class="trip-events__list"></ul>'
);

export default class ListEvent {
  getTemplate() {
    return createListEvent();
  }

  getElement() {
    if (!this.element) {
      this.element = createElement(this.getTemplate());
    }

    return this.element;
  }

  removeElement() {
    this.element = null;
  }
}